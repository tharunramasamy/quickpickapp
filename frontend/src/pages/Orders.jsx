import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/orders")
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch orders", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <Link to="/customer/home" className="p-2 rounded-full hover:bg-gray-100 transition">
                    <span className="text-xl">←</span>
                </Link>
                <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4 grayscale opacity-50">📦</div>
                        <h3 className="text-gray-600 font-bold text-lg">No orders yet</h3>
                        <Link to="/customer/home" className="mt-4 inline-block text-green-600 font-bold hover:underline">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.order_id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-400">#{order.order_id.slice(-6)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 mt-1">₹{order.total_amount}</h3>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                <div className="text-2xl">🛵</div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700">
                                        {order.status === 'DELIVERED' ? 'Delivered' : 'Arriving Soon'}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {order.status === 'DELIVERED' ? 'Your order has been delivered.' : 'Our partner is on the way.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
