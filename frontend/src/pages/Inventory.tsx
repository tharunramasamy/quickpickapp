import { useEffect, useState } from "react";

interface Order {
    order_id: number;
    customer_id: number;
    total_amount: number;
    order_time: string;
}

export default function Inventory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const res = await fetch("http://localhost:8000/inventory/orders");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Inventory fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const markPicked = async (orderId: number) => {
        await fetch(
            `http://localhost:8000/inventory/orders/${orderId}/pick`,
            { method: "PUT" }
        );
        loadOrders();
    };

    return (
        <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
            <h1 style={{ fontSize: 28 }}>🏪 Inventory Dashboard</h1>
            <p style={{ color: "#555" }}>Orders waiting for picking</p>

            {loading && <p>Loading orders...</p>}

            {!loading && orders.length === 0 && (
                <p style={{ marginTop: 20 }}>No orders to pick</p>
            )}

            {orders.map((order) => (
                <div
                    key={order.order_id}
                    style={{
                        background: "white",
                        padding: 16,
                        marginTop: 16,
                        borderRadius: 8,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <p><b>Order ID:</b> {order.order_id}</p>
                    <p><b>Customer:</b> #{order.customer_id}</p>
                    <p><b>Total:</b> ₹{order.total_amount}</p>

                    <button
                        style={{
                            marginTop: 10,
                            padding: "8px 14px",
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                        onClick={() => markPicked(order.order_id)}
                    >
                        Mark as PICKED
                    </button>
                </div>
            ))}
        </div>
    );
}