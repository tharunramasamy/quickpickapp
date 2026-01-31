import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const itemTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 15;
  const platformFee = 5;
  const grandTotal = itemTotal + deliveryFee + platformFee;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-lg font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6 text-sm text-center">Add some items from the home page to get started!</p>
        <Link to="/customer/home" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-green-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-xl font-bold">←</button>
        <h1 className="font-bold text-lg">My Cart ({cart.length} items)</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Cart Items */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          {cart.map(item => (
            <div key={item.product_id} className="flex justify-between items-center py-3 border-b last:border-0 border-gray-100">
              <div className="flex-1 pr-2">
                <h3 className="text-sm font-medium text-gray-800">{item.product_name}</h3>
                <p className="text-xs text-gray-500">{item.unit || '1 unit'}</p>
                <p className="font-bold text-gray-900 mt-1">₹{item.price * item.qty}</p>
              </div>
              {/* Qty Control */}
              <div className="flex items-center bg-green-50 border border-green-600 rounded-md h-8 text-xs font-bold text-green-700">
                <button onClick={() => removeFromCart(item.product_id)} className="px-3 h-full hover:bg-green-100">-</button>
                <span className="px-1">{item.qty}</span>
                <button onClick={() => addToCart(item)} className="px-3 h-full hover:bg-green-100">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-sm text-gray-800 mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span>₹{itemTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>
            <div className="border-t border-dashed mt-2 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>To Pay</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Address Mock */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">🏠</div>
            <div>
              <h4 className="font-bold text-sm text-gray-800">Home</h4>
              <p className="text-xs text-gray-500">123, Green Street, Delhi...</p>
            </div>
          </div>
          <button className="text-green-600 font-bold text-sm">CHANGE</button>
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-md mx-auto">
          <Link to="/customer/checkout" className="block w-full bg-green-600 text-white text-center py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg flex justify-between px-6 items-center">
            <div className="flex flex-col items-start text-xs font-normal">
              <span>TOTAL</span>
              <span className="font-bold text-lg">₹{grandTotal}</span>
            </div>
            <div className="flex items-center">
              Proceed to Pay <span>›</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}