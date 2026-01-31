import { useState, useEffect } from "react";
import api from "../api/axios";

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Helper to determine active step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'PACKED': return 1;
      case 'OUT_FOR_DELIVERY': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: "Order Placed", icon: "📝" },
    { label: "Packed", icon: "📦" },
    { label: "Out for Delivery", icon: "🛵" },
    { label: "Delivered", icon: "🏠" },
  ];

  if (loading) return <div className="p-10 text-center animate-pulse">Checking status...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <header className="max-w-md mx-auto mb-6 flex items-center gap-2">
        <button onClick={() => window.location.href = '/customer/home'} className="p-2 bg-white rounded-full shadow-sm">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        {orders.length === 0 && (
          <div className="text-center py-10">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </div>
        )}

        {orders.map((order) => {
          const activeStep = getStepIndex(order.status);

          return (
            <div key={order.order_id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Order #{order.order_id}</p>
                  <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{order.total_amount}</p>
                  <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    {order.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative flex justify-between items-center mb-2">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                {/* Progress Bar Fill */}
                <div
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 transition-all duration-1000 ease-in-out"
                  style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => (
                  <div key={index} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${index <= activeStep
                          ? "bg-green-500 border-green-500 text-white shadow-green-200 shadow-lg scale-110"
                          : "bg-white border-gray-200 text-gray-300"
                        }`}
                    >
                      {index <= activeStep ? step.icon : index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                {steps.map((step, index) => (
                  <span key={index} className={`${index <= activeStep ? "text-green-600 font-bold" : ""}`}>
                    {step.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}