import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

interface Order {
  order_id: number;
  customer_id: number;
  total_amount: number;
}

export default function Inventory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const res = await fetch(`${API_BASE_URL}/inventory/orders`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const markPicked = async (orderId: number) => {
    await fetch(
      `${API_BASE_URL}/inventory/orders/${orderId}/pick`,
      { method: "PUT" }
    );
    loadOrders();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🏪 Inventory Dashboard</h1>

      {loading && <p>Loading orders...</p>}

      {orders.map(order => (
        <div key={order.order_id}>
          <p>Order #{order.order_id}</p>
          <button onClick={() => markPicked(order.order_id)}>
            Mark Picked
          </button>
        </div>
      ))}
    </div>
  );
}