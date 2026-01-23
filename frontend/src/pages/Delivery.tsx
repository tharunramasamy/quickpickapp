import { useEffect, useState } from "react";

interface Order {
    order_id: number;
    customer_id: number;
    total_amount: number;
}

export default function Delivery() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const res = await fetch("http://localhost:8000/delivery/orders");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Delivery fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
            <h1 style={{ fontSize: 28 }}>🚴 Delivery Dashboard</h1>

            {loading && <p>Loading orders...</p>}

            {!loading && orders.length === 0 && (
                <p style={{ marginTop: 20 }}>No active delivery orders</p>
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
                    <p><b>Total:</b> ₹{order.total_amount}</p>

                    <button
                        style={{ marginRight: 10 }}
                        onClick={() =>
                            fetch(
                                `http://localhost:8000/delivery/orders/${order.order_id}/out`,
                                { method: "PUT" }
                            ).then(loadOrders)
                        }
                    >
                        Out for Delivery
                    </button>

                    <button
                        onClick={() =>
                            fetch(
                                `http://localhost:8000/delivery/orders/${order.order_id}/deliver`,
                                { method: "PUT" }
                            ).then(loadOrders)
                        }
                    >
                        Delivered
                    </button>
                </div>
            ))}
        </div>
    );
}
