import hashlib
from datetime import datetime, timedelta
import os
import json

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from pydantic import ValidationError
import pyodbc
import jwt
from dotenv import load_dotenv

import models  # Assuming models.py is in the same directory

load_dotenv()

# ==================
# CONFIG & DATABASE
# ==================

DATABASE_CONFIG = {
    "server": os.getenv("DB_SERVER"),
    "database": os.getenv("DB_NAME"),
    "uid": os.getenv("DB_USER"),
    "pwd": os.getenv("DB_PASSWORD"),
}

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

def get_db_connection():
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={DATABASE_CONFIG['server']};"
        f"DATABASE={DATABASE_CONFIG['database']};"
        f"UID={DATABASE_CONFIG['uid']};"
        f"PWD={DATABASE_CONFIG['pwd']}"
    )
    return pyodbc.connect(conn_str)

# ==================
# APP SETUP
# ==================

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all origins for now, restrict in prod

# ==================
# UTILS
# ==================

@app.route("/api/locations", methods=['GET'])
def get_locations():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT location_id, city_id, address FROM inventory_locations")
        locations = []
        for row in cur.fetchall():
            locations.append({
                "location_id": row[0],
                "city_id": row[1],
                "address": row[2]
            })
        return jsonify(locations)
    finally:
        cur.close()
        conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_current_user():
    auth_header = request.headers.get('Authorization')
    # print(f"DEBUG: Auth Header: {auth_header}")
    if not auth_header:
        abort(401, description="Missing token")
    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        # print(f"DEBUG: Decoded Token User: {decoded.get('user_id')}")
        return decoded
    except Exception as e:
        print(f"DEBUG: Token Decode Error: {e}")
        abort(401, description="Invalid token")

# ==================
# AUTH
# ==================

@app.route("/")
def read_root():
    return jsonify({"message": "Welcome to QuickPick API (Flask)"})

@app.route("/api/login", methods=['POST'])
def login():
    try:
        req_data = models.LoginRequest(**request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check both email and phone for login flexibility if needed, but prompt said phone for customer
        # and schema has phone unique. The original code used phone.
        phone_val = req_data.phone if req_data.phone else ""
        if not phone_val and req_data.email:
             # Logic to handle email login if needed, but keeping simple for now
             pass

        password_hash = hash_password(req_data.password)

        # Login query needs to handle finding user by phone OR email
        cur.execute("""
            SELECT 
                u.user_id,
                u.phone,
                u.email,
                u.password_hash,
                u.role,
                u.is_active,
                u.city_id,
                up.first_name,
                up.last_name
            FROM users u
            LEFT JOIN user_profiles up ON u.user_id = up.user_id
            WHERE u.phone = ? OR u.email = ?
        """, (req_data.phone, req_data.email))

        row = cur.fetchone()

        if not row:
            return jsonify({"detail": "Invalid credentials"}), 401

        (user_id, phone, email, db_pass_hash, role, is_active, city_id, first_name, last_name) = row

        if not is_active:
            return jsonify({"detail": "User inactive"}), 403

        if password_hash != db_pass_hash:
             return jsonify({"detail": "Invalid credentials"}), 401

        token = jwt.encode(
            {
                "user_id": user_id,
                "role": role,
                "city_id": city_id,
                "exp": datetime.utcnow() + timedelta(days=7)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "token": token,
            "user_id": user_id,
            "role": role,
            "city_id": city_id,
            "email": email,
            "phone": phone,
            "first_name": first_name,
            "last_name": last_name,
            "name": f"{first_name} {last_name}".strip() or "User"
        })

    finally:
        cur.close()
        conn.close()

@app.route("/api/signup", methods=['POST'])
def signup():
    try:
        # We need to handle extra fields for Location creation that might not be in the strict SignupRequest model
        # Or update the model. Let's use request.get_json() directly for the extra logic
        data = request.get_json()
        req_data = models.SignupRequest(**data)
        
        # Extra fields for Inventory
        create_store = data.get('create_new_store', False)
        store_city = data.get('store_city')
        store_address = data.get('store_address')
        
    except ValidationError as e:
        return jsonify(e.errors()), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        user_id = f"USER_{int(datetime.utcnow().timestamp())}_{hashlib.md5(req_data.phone.encode()).hexdigest()[:4]}"
        password_hash = hash_password(req_data.password)
        
        assigned_city_id = req_data.city_id
        
        # LOGIC: Create New Location if requested
        if req_data.role == 'INVENTORY_STAFF' and create_store and store_city and store_address:
            # Generate a candidate City ID from hash if not provided
            if not assigned_city_id:
                # Use a deterministic hash for this city so we find it again if we restart
                assigned_city_id = int(hashlib.md5(store_city.encode()).hexdigest()[:4], 16) % 10000

            # ATTEMPT: Ensure City Exists
            city_created_or_found = False
            
            # ATTEMPT: Ensure City Exists
            city_created_or_found = False
            
            try:
                 # Check existence by Name - guessed 'city_name' based on error
                 cur.execute("SELECT city_id FROM cities WHERE city_name = ?", (store_city,))
                 row = cur.fetchone()
                 if row:
                     assigned_city_id = row[0]
                     city_created_or_found = True
                 else:
                     # City doesn't exist. create it.
                     # Method A: Try Explicit ID (preferred for our deterministic hash)
                     try:
                        cur.execute("INSERT INTO cities (city_id, city_name) VALUES (?, ?)", (assigned_city_id, store_city))
                        city_created_or_found = True
                     except pyodbc.Error:
                        # Method B: Maybe Identity Column? Try without ID.
                        try:
                            cur.execute("INSERT INTO cities (city_name) VALUES (?)", (store_city,))
                            cur.execute("SELECT @@IDENTITY")
                            row = cur.fetchone()
                            if row and row[0]: 
                                assigned_city_id = int(row[0])
                                city_created_or_found = True
                        except Exception as e:
                            # Both failed. 
                            raise Exception(f"Could not create city '{store_city}'. DB Error: {str(e)}")
            except Exception as e:
                 # Capture the city creation error to stop here
                 return jsonify({"detail": f"City Registration Failed: {str(e)}"}), 400

            if not city_created_or_found:
                 return jsonify({"detail": "City Registration Failed: Unknown Error"}), 400

            # ATTEMPT INSERT LOCATION
            # We know inventory_locations has IDENTITY column based on error 'IDENTITY_INSERT is set to OFF'.
            # So we MUST NOT provide location_id.
            # We also know location_name is REQUIRED.
            
            # Construct a location name
            loc_name = f"{store_city} - {store_address}"
            
            try:
                cur.execute("INSERT INTO inventory_locations (city_id, address, location_name) VALUES (?, ?, ?)",
                            (assigned_city_id, f"{store_address}, {store_city}", loc_name))
            except pyodbc.Error as e:
                # If this fails, it might be that assigned_city_id is still invalid (FK mismatch)
                # Ensure the city actually exists if the previous INSERT failed silently
                # Force insert city with IDENTITY if the table supports it?
                # Let's return the specific error
                 raise Exception(f"Location Insert Failed: {str(e)} (City ID: {assigned_city_id})")
            
            # Override the user's city_id to match this new store
            req_data.city_id = assigned_city_id
            
            # Override the user's city_id to match this new store
            req_data.city_id = assigned_city_id
            
        # Basic User Insert
        cur.execute("""
            INSERT INTO users (user_id, email, phone, password_hash, role, city_id, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (user_id, req_data.email, req_data.phone, password_hash, req_data.role, assigned_city_id))

        # Profile Insert
        cur.execute("""
            INSERT INTO user_profiles (user_id, first_name, last_name)
            VALUES (?, ?, ?)
        """, (user_id, req_data.first_name, req_data.last_name))
        
        # Role specific tables
        if req_data.role == "CUSTOMER":
            cur.execute("INSERT INTO customers (user_id) VALUES (?)", (user_id,))
        elif req_data.role == "DELIVERY_PARTNER":
             cur.execute("INSERT INTO delivery_partners (user_id, status) VALUES (?, 'INACTIVE')", (user_id,))

        conn.commit()
        return jsonify({"message": "User created successfully", "user_id": user_id, "city_id": assigned_city_id}), 201
    except pyodbc.IntegrityError as e:
        # Check if it's users table or something else
        err_msg = str(e)
        if "users" in err_msg and "PRIMARY KEY" in err_msg:
             return jsonify({"detail": "User ID collision. Try again."}), 400
        if "users" in err_msg and ("phone" in err_msg or "email" in err_msg):
             return jsonify({"detail": "User with this phone/email already exists"}), 400
        
        # If it's location related
        if "inventory_locations" in err_msg:
             return jsonify({"detail": "Location creation failed (Address/ID conflict). Try different details."}), 400

        # Fallback for other unique constraints or foreign keys
        return jsonify({"detail": f"Database Integrity Error: {err_msg}"}), 400
    except Exception as e:
        return jsonify({"detail": f"Error: {str(e)}"}), 500
    finally:
        cur.close()
        conn.close()

# ==================
# PRODUCTS
# ==================

@app.route("/api/products", methods=['GET'])
def get_products():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Fetch products with stock info. 
        # For simplicity, we aggregate stock across all locations or filter by ?location_id=
        location_id = request.args.get('location_id')
        
        query = """
            SELECT
                p.product_id,
                p.product_name,
                p.category_id,
                p.price,
                p.unit,
                p.description,
                p.image_url,
                ISNULL(SUM(i.quantity_available), 0) AS quantity_available
            FROM products p
            LEFT JOIN inventory_stock i ON p.product_id = i.product_id
        """
        
        params = []
        if location_id:
            query += " AND i.location_id = ?"
            params.append(location_id)
            
        query += """
            WHERE p.is_active = 1
            GROUP BY p.product_id, p.product_name, p.category_id, p.price, p.unit, p.description, p.image_url
            ORDER BY p.product_name
        """

        cur.execute(query, tuple(params))

        products = []
        for row in cur.fetchall():
            products.append({
                "product_id": row[0],
                "product_name": row[1],
                "category_id": row[2],
                "price": float(row[3]),
                "unit": row[4],
                "description": row[5],
                "image_url": row[6],
                "quantity_available": row[7],
                "is_out_of_stock": row[7] <= 0
            })

        return jsonify(products)

    finally:
        cur.close()
        conn.close()

@app.route("/api/inventory/update", methods=['PUT'])
def update_inventory():
    user = get_current_user()
    if user['role'] != 'INVENTORY_STAFF':
        return jsonify({"detail": "Unauthorized"}), 403
    
    try:
        req_data = models.UpdateInventoryRequest(**request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Determine location_id for this staff
        # For MVP, we assume user.city_id maps to a location or we find the location they manage.
        # But wait, INVENTORY_STAFF might manage a specific location_id. 
        # In `users` table we only store `city_id`.
        # We need a way to know WHICH location this staff is updating.
        # Let's assume 1-to-1 mapping for now or fetch the "primary" location for the city.
        # OR better: The UI should probably state which location it is.
        # But `InventoryDashboard` says `user?.city_id ? 'Active Store' : ...`
        # Let's find the location ID based on city_id.
        
        cur.execute("SELECT TOP 1 location_id FROM inventory_locations WHERE city_id = ?", (user['city_id'],))
        loc_row = cur.fetchone()
        if not loc_row:
             return jsonify({"detail": "No location found for this user"}), 404
        location_id = loc_row[0]
        
        # Check if record exists
        cur.execute("SELECT quantity_available FROM inventory_stock WHERE product_id = ? AND location_id = ?", 
                    (req_data.product_id, location_id))
        row = cur.fetchone()
        
        if not row:
            # Create record if not exists
            if req_data.action == 'REDUCE':
                 return jsonify({"detail": "Cannot reduce stock for new item"}), 400
            
            new_qty = req_data.quantity
            cur.execute("""
                INSERT INTO inventory_stock (location_id, product_id, quantity_available, quantity_reserved, reorder_level)
                VALUES (?, ?, ?, 0, 10)
            """, (location_id, req_data.product_id, new_qty))
        else:
            current_qty = row[0]
            new_qty = current_qty + req_data.quantity if req_data.action == 'ADD' else current_qty - req_data.quantity
            
            if new_qty < 0:
                return jsonify({"detail": "Insufficient stock"}), 400

            cur.execute("""
                UPDATE inventory_stock
                SET quantity_available = ?
                WHERE product_id = ? AND location_id = ?
            """, (new_qty, req_data.product_id, location_id))
            
        conn.commit()
        return jsonify({"message": "Stock updated", "new_quantity": new_qty})
        
    except Exception as e:
        conn.rollback()
        return jsonify({"detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route("/api/inventory/initialize", methods=['POST'])
def initialize_inventory():
    user = get_current_user()
    if user['role'] != 'INVENTORY_STAFF':
        return jsonify({"detail": "Unauthorized"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Find location
        cur.execute("SELECT TOP 1 location_id FROM inventory_locations WHERE city_id = ?", (user['city_id'],))
        loc_row = cur.fetchone()
        if not loc_row:
             return jsonify({"detail": "Location not found"}), 404
        location_id = loc_row[0]

        # Bulk insert missing products with 0 stock
        cur.execute("""
            INSERT INTO inventory_stock (location_id, product_id, quantity_available, quantity_reserved, reorder_level)
            SELECT ?, product_id, 0, 0, 10
            FROM products
            WHERE is_active = 1
            AND product_id NOT IN (
                SELECT product_id FROM inventory_stock WHERE location_id = ?
            )
        """, (location_id, location_id))
        
        conn.commit()
        return jsonify({"message": "Inventory Initialized"})
    except Exception as e:
        conn.rollback()
        return jsonify({"detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# ==================
# ORDERS
# ==================

@app.route("/api/orders/create", methods=['POST'])
def create_order():
    user = get_current_user() # Auth check
    
    try:
        req_data = models.CreateOrderRequest(**request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get Customer ID
        cur.execute("SELECT customer_id FROM customers WHERE user_id = ?", (user["user_id"],))
        customer = cur.fetchone()
        if not customer:
            return jsonify({"detail": "Customer profile not found"}), 400

        customer_id = customer[0]
        order_id = f"ORD_{int(datetime.utcnow().timestamp())}"
        
        # We need to determine which location to fulfill from. 
        # For now, using the city_id from request or finding nearest store.
        # Assuming request has logic or we pick first available store in city.
        # Simplified: The request should probably include location_id or we derive it.
        # The prompt says "inventory dark store... we have only tier 1 cities". 
        # Let's assume the frontend passes the chosen location or city.
        # Using a simple default location for the city if not passed is better logic for real app, 
        # but here we might need `location_id` in request. 
        # Check models.py: CreateOrderRequest has `city_id`.
        
        # Find a location in this city
        cur.execute("SELECT TOP 1 location_id FROM inventory_locations WHERE city_id = ?", (req_data.city_id,))
        loc_row = cur.fetchone()
        if not loc_row:
             return jsonify({"detail": "No service in this area"}), 400
        location_id = loc_row[0]

        total_amount = 0

        # Validate Stock & Calculate Total
        for item in req_data.items:
            # Check stock at specific location
            cur.execute("""
                SELECT quantity_available 
                FROM inventory_stock 
                WHERE product_id = ? AND location_id = ?
            """, (item.product_id, location_id))
            
            stock = cur.fetchone()
            if not stock or stock[0] < item.quantity:
                return jsonify({"detail": f"Insufficient stock for product {item.product_id}"}), 400
            
            total_amount += item.quantity * item.unit_price

        # Create Order
        cur.execute("""
            INSERT INTO orders (
                order_id, customer_id, location_id, total_amount, 
                delivery_address, delivery_latitude, delivery_longitude, customer_notes,
                status, payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PLACED', 'PENDING')
        """, (
            order_id, customer_id, location_id, total_amount,
            req_data.delivery_address, req_data.delivery_latitude, req_data.delivery_longitude, req_data.customer_notes
        ))

        # Insert Items & Update Inventory
        for item in req_data.items:
            cur.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
            """, (order_id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price))

            cur.execute("""
                UPDATE inventory_stock
                SET quantity_available = quantity_available - ?,
                    quantity_reserved = quantity_reserved + ?
                WHERE product_id = ? AND location_id = ?
            """, (item.quantity, item.quantity, item.product_id, location_id))

        conn.commit()
        return jsonify({"order_id": order_id, "total_amount": total_amount}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route("/api/orders", methods=['GET'])
def get_orders():
    user = get_current_user()
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Filter logic based on role
        if user['role'] == 'INVENTORY_STAFF':
            # Get orders for their location (mocking location by city_id logic or implicit)
            # For this demo, let's fetch orders for the user's city or location
            # Ideally user token has location_id. We'll use city_id.
            cur.execute("""
                SELECT 
                    o.order_id, o.customer_id, o.total_amount, o.status, o.created_at,
                    o.delivery_partner_id, u.phone as customer_phone
                FROM orders o
                JOIN inventory_locations l ON o.location_id = l.location_id
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN users u ON c.user_id = u.user_id
                WHERE l.city_id = ?
                ORDER BY o.created_at DESC
            """, (user['city_id'],))
            
        elif user['role'] == 'DELIVERY_PARTNER':
            # Get orders assigned to this partner
            # First get partner_id from user_id
            cur.execute("SELECT partner_id FROM delivery_partners WHERE user_id = ?", (user['user_id'],))
            partner = cur.fetchone()
            if not partner:
                return jsonify([])
            
            cur.execute("""
                SELECT 
                    o.order_id, o.customer_id, o.total_amount, o.status, o.created_at,
                    o.delivery_partner_id, u.phone as customer_phone, o.delivery_address
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN users u ON c.user_id = u.user_id
                WHERE o.delivery_partner_id = ?
                ORDER BY o.created_at DESC
            """, (partner[0],))
            
        else: # Customer
             cur.execute("SELECT customer_id FROM customers WHERE user_id = ?", (user['user_id'],))
             customer = cur.fetchone()
             if not customer: return jsonify([])
             
             cur.execute("""
                SELECT order_id, total_amount, status, created_at, delivery_partner_id 
                FROM orders WHERE customer_id = ? ORDER BY created_at DESC
             """, (customer[0],))

        orders = []
        columns = [column[0] for column in cur.description]
        for row in cur.fetchall():
            orders.append(dict(zip(columns, row)))

        return jsonify(orders)
    finally:
        cur.close()
        conn.close()

@app.route("/api/delivery-partners", methods=['GET'])
def get_delivery_partners():
    # List available delivery partners for a city
    user = get_current_user()
    if user['role'] != 'INVENTORY_STAFF':
        return jsonify({"detail": "Unauthorized"}), 403

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch partners who are 'AVAILABLE' in the same city (simplified: just all partners)
        cur.execute("""
            SELECT dp.partner_id, u.phone, dp.status, dp.vehicle_type
            FROM delivery_partners dp
            JOIN users u ON dp.user_id = u.user_id
            WHERE u.city_id = ?
        """, (user['city_id'],))
        
        partners = []
        for row in cur.fetchall():
            partners.append({
                "partner_id": row[0],
                "phone": row[1],
                "status": row[2],
                "vehicle_type": row[3]
            })
        return jsonify(partners)
    finally:
        cur.close()
        conn.close()

@app.route("/api/orders/assign", methods=['POST'])
def assign_order():
    user = get_current_user()
    if user['role'] != 'INVENTORY_STAFF':
        return jsonify({"detail": "Unauthorized"}), 403
    
    data = request.get_json()
    order_id = data.get('order_id')
    partner_id = data.get('partner_id')

    if not order_id or not partner_id:
        return jsonify({"detail": "Missing fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE orders SET delivery_partner_id = ?, status = 'PACKED' WHERE order_id = ?", (partner_id, order_id))
        cur.execute("UPDATE delivery_partners SET status = 'BUSY' WHERE partner_id = ?", (partner_id,))
        conn.commit()
        return jsonify({"message": "Assigned successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route("/api/orders/status", methods=['PUT'])
def update_order_status():
    user = get_current_user()
    data = request.get_json()
    order_id = data.get('order_id')
    new_status = data.get('status')

    if not order_id or not new_status:
         return jsonify({"detail": "Missing fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE orders SET status = ? WHERE order_id = ?", (new_status, order_id))
        
        # If delivered, free up the partner
        if new_status == 'DELIVERED':
            cur.execute("""
                UPDATE delivery_partners 
                SET status = 'AVAILABLE' 
                WHERE partner_id = (SELECT delivery_partner_id FROM orders WHERE order_id = ?)
            """, (order_id,))
            
        conn.commit()
        return jsonify({"message": "Status updated"})
    finally:
        cur.close()
        conn.close()

@app.route("/api/delivery-partners/toggle", methods=['POST'])
def toggle_partner_status():
    user = get_current_user()
    if user['role'] != 'DELIVERY_PARTNER':
        return jsonify({"detail": "Unauthorized"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get current status
        cur.execute("SELECT status FROM delivery_partners WHERE user_id = ?", (user['user_id'],))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Partner profile not found"}), 404
        
        current_status = row[0]
        # Toggle logic: If INACTIVE -> AVAILABLE. If AVAILABLE -> INACTIVE. If BUSY -> Warning?
        # User wants to go online/offline.
        
        new_status = 'AVAILABLE' if current_status == 'INACTIVE' else 'INACTIVE'
        
        if current_status == 'BUSY':
            return jsonify({"detail": "Cannot go offline while busy"}), 400

        cur.execute("UPDATE delivery_partners SET status = ? WHERE user_id = ?", (new_status, user['user_id']))
        conn.commit()
        return jsonify({"status": new_status})
    finally:
        cur.close()
        conn.close()

@app.route("/api/health")
def health():
    status = {"status": "ok", "db": "unknown"}
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        status["db"] = "connected"
        cur.close()
        conn.close()
    except Exception as e:
        status["db"] = "error"
        status["error"] = str(e)
    return jsonify(status)

@app.route("/api/debug/schema", methods=['GET'])
def debug_schema():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        details = {}
        for table in ['inventory_locations', 'cities', 'users']:
            try:
                cur.execute(f"SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'")
                details[table] = cur.fetchall()
            except:
                details[table] = "Table not found"
        return jsonify(details)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=8000)