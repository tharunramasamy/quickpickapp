import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState("123, Default Street, CA");
  const [isLoading, setIsLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    // Get selected location from Home page choice
    const selectedLocation = JSON.parse(localStorage.getItem("selected_location"));
    const cityId = selectedLocation ? selectedLocation.city_id : 1; // Default to 1 if missing for safety

    const payload = {
      items: cart.map(i => ({
        product_id: i.product_id,
        quantity: i.qty,
        unit_price: i.price,
        total_price: i.price * i.qty
      })),
      delivery_address: address,
      delivery_latitude: 12.9716, // Mock Blr
      delivery_longitude: 77.5946,
      city_id: cityId,
      customer_notes: "Leave at door"
    };

    try {
      const res = await api.post("/api/orders/create", payload);

      // Success
      clearCart();
      // create_order returns { order_id: ... }
      // We want to redirect to tracking
      // Assuming tracking page takes an ID or shows active orders
      navigate('/customer/tracking');
    } catch (err) {
      console.error(err);
      alert("Order Failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) return <div className="p-10 text-center">Cart is empty</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      <div className="bg-white p-4 rounded shadow-sm mb-4">
        <h3 className="font-bold mb-2">Delivery Address</h3>
        <textarea
          className="w-full border rounded p-2"
          rows="3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <h3 className="font-bold mb-2">Order Summary</h3>
        {cart.map(i => (
          <div key={i.product_id} className="flex justify-between py-1 border-b last:border-0 border-gray-100">
            <span>{i.product_name} x {i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-3 text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={placeOrder}
        disabled={isLoading}
        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-700 transition disabled:bg-gray-400"
      >
        {isLoading ? "Placing Order..." : `Pay ₹${total}`}
      </button>
    </div>
  );
}