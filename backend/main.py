from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

from models import OrderCreate, LoginRequest
from db import get_connection
from realtime_service import send_order_update
from auth import create_token

from azure.messaging.webpubsubservice import WebPubSubServiceClient

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# AUTH / LOGIN
# ======================================================

@app.post("/login")
def login(data: LoginRequest):
    """
    Demo users (replace with DB later)
    """
    users = {
        "customer": {"password": "1234", "role": "CUSTOMER"},
        "inventory": {"password": "1234", "role": "INVENTORY"},
        "delivery": {"password": "1234", "role": "DELIVERY"},
    }

    user = users.get(data.username)

    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(data.username, user["role"])

    return {
        "access_token": token,
        "role": user["role"]
    }

# ======================================================
# PRODUCTS
# ======================================================

@app.get("/products")
def get_products():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT product_id, product_name, price,
               available_qty, category, image_url, description
        FROM products
    """)

    products = [{
        "product_id": r[0],
        "product_name": r[1],
        "price": r[2],
        "available_qty": r[3],
        "category": r[4],
        "image_url": r[5],
        "description": r[6]
    } for r in cur.fetchall()]

    conn.close()
    return products

# ======================================================
# PLACE ORDER
# ======================================================

@app.post("/orders")
def place_order(order: OrderCreate):
    conn = get_connection()
    cur = conn.cursor()

    total = 0

    # Validate stock
    for item in order.items:
        cur.execute(
            "SELECT price, available_qty FROM products WHERE product_id=?",
            item.product_id
        )
        row = cur.fetchone()

        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Product not found")

        price, qty = row
        if qty < item.quantity:
            conn.close()
            raise HTTPException(status_code=400, detail="Insufficient stock")

        total += price * item.quantity

    # Create order
    cur.execute("""
        INSERT INTO orders (customer_id, status, total_amount, payment_method)
        VALUES (?, 'PLACED', ?, ?)
    """, order.customer_id, total, order.payment_method)

    conn.commit()
    cur.execute("SELECT @@IDENTITY")
    order_id = int(cur.fetchone()[0])

    # Order items + inventory update
    for item in order.items:
        cur.execute(
            "INSERT INTO order_items VALUES (?, ?, ?)",
            order_id, item.product_id, item.quantity
        )
        cur.execute(
            "UPDATE products SET available_qty = available_qty - ? WHERE product_id = ?",
            item.quantity, item.product_id
        )

    # Delivery tracking
    cur.execute("""
        INSERT INTO delivery_tracking (order_id, status, last_updated)
        VALUES (?, 'ORDER_PLACED', GETDATE())
    """, order_id)

    conn.commit()
    conn.close()

    send_order_update(order_id, "ORDER_PLACED")

    return {"order_id": order_id, "total": total}

# ======================================================
# ORDER STATUS (CUSTOMER TRACKING)
# ======================================================

@app.get("/orders/{order_id}/status")
def order_status(order_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT status, last_updated
        FROM delivery_tracking
        WHERE order_id = ?
    """, order_id)

    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order_id,
        "status": row[0],
        "last_updated": row[1]
    }

# ======================================================
# INVENTORY (DARK STORE DASHBOARD)
# ======================================================

@app.get("/inventory/orders")
def inventory_orders():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT order_id, customer_id, total_amount, order_time
        FROM orders
        WHERE status = 'PLACED'
    """)

    orders = [{
        "order_id": r[0],
        "customer_id": r[1],
        "total_amount": r[2],
        "order_time": r[3]
    } for r in cur.fetchall()]

    conn.close()
    return orders

@app.put("/inventory/orders/{order_id}/pick")
def pick_inventory_order(order_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("UPDATE orders SET status='PICKED' WHERE order_id=?", order_id)
    cur.execute("""
        UPDATE delivery_tracking
        SET status='PICKED', last_updated=GETDATE()
        WHERE order_id=?
    """, order_id)

    conn.commit()
    conn.close()

    send_order_update(order_id, "PICKED")
    return {"message": "Order picked"}

# ======================================================
# DELIVERY DASHBOARD
# ======================================================

@app.get("/delivery/orders")
def get_delivery_orders():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT order_id, customer_id, total_amount, order_time
        FROM orders
        WHERE status IN ('PICKED', 'OUT_FOR_DELIVERY')
    """)

    orders = [{
        "order_id": r[0],
        "customer_id": r[1],
        "total_amount": r[2],
        "order_time": r[3]
    } for r in cur.fetchall()]

    conn.close()
    return orders

@app.put("/delivery/orders/{order_id}/out")
def out_for_delivery(order_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("UPDATE orders SET status='OUT_FOR_DELIVERY' WHERE order_id=?", order_id)
    cur.execute("""
        UPDATE delivery_tracking
        SET status='OUT_FOR_DELIVERY', last_updated=GETDATE()
        WHERE order_id=?
    """, order_id)

    conn.commit()
    conn.close()

    send_order_update(order_id, "OUT_FOR_DELIVERY")
    return {"message": "Out for delivery"}

@app.put("/delivery/orders/{order_id}/deliver")
def deliver_order(order_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("UPDATE orders SET status='DELIVERED' WHERE order_id=?", order_id)
    cur.execute("""
        UPDATE delivery_tracking
        SET status='DELIVERED', last_updated=GETDATE()
        WHERE order_id=?
    """, order_id)

    conn.commit()
    conn.close()

    send_order_update(order_id, "DELIVERED")
    return {"message": "Order delivered"}

# ======================================================
# REALTIME (AZURE WEB PUBSUB)
# ======================================================

@app.get("/realtime/negotiate")
def negotiate():
    client = WebPubSubServiceClient.from_connection_string(
        os.getenv("WEBPUBSUB_CONNECTION_STRING"),
        hub="orderhub"
    )
    token = client.get_client_access_token()
    return {"url": token["url"]}