import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

interface Order {
  order_id: number;
  customer_id: number;
  total_amount: number;
  status: string;
}

export default function Delivery() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/delivery/orders`);
      if (!res.ok) throw new Error("Failed to load delivery orders");

      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const markOutForDelivery = async (orderId: number) => {
    await fetch(`${API_BASE_URL}/delivery/orders/${orderId}/out`, {
      method: "PUT",
    });
    loadOrders();
  };

  const markDelivered = async (orderId: number) => {
    await fetch(`${API_BASE_URL}/delivery/orders/${orderId}/delivered`, {
      method: "PUT",
    });
    loadOrders();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🚚 Delivery Dashboard</h1>

      {loading && <p>Loading delivery orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && orders.length === 0 && (
        <p>No orders assigned for delivery</p>
      )}

      {orders.map(order => (
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
          <p><b>Order:</b> #{order.order_id}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.total_amount}</p>

          <button onClick={() => markOutForDelivery(order.order_id)}>
            Out for Delivery
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => markDelivered(order.order_id)}
          >
            Delivered
          </button>
        </div>
      ))}
    </div>
  );
}