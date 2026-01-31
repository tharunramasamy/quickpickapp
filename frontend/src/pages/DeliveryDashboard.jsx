import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        fetchOrders();
        checkStatus();
        const interval = setInterval(fetchOrders, 15000); // 15s updates
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        // Ideally fetch current status from a profile endpoint. 
        // For MVP, we'll just toggle blind or assume starts OFFLINE unless stored locally?
        // Let's rely on server state if possible, but for now we'll just implement the toggle action.
    };

    const toggleOnline = async () => {
        try {
            const res = await api.post('/api/delivery-partners/toggle');
            setIsOnline(res.data.status === 'AVAILABLE');
            alert(`You are now ${res.data.status}`);
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to toggle status");
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await api.put('/api/orders/status', { order_id: orderId, status: status });
            fetchOrders();
        } catch (err) {
            alert("Update failed: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-2xl">🛵</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Partner App</h1>
                            <button
                                onClick={toggleOnline}
                                className={`text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-full border transition ${isOnline ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                {isOnline ? 'ONLINE (Receiving Orders)' : 'OFFLINE'}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-50 text-orange-700 font-bold px-4 py-2 rounded-lg border border-orange-100 text-sm">
                            {user?.user_name || 'Rider'}
                        </div>
                        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">
                <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    YOUR TASKS <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-xs">{orders.length}</span>
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {orders.length === 0 && (
                        <div className="bg-white rounded-xl p-10 text-center text-gray-400">
                            <p className="text-4xl mb-4">💤</p>
                            <p>No active orders assigned.</p>
                            <p className="text-sm">Wait for inventory to assign you tasks.</p>
                        </div>
                    )}

                    {orders.map(order => (
                        <div key={order.order_id} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 transition hover:shadow-md ${order.status === 'DELIVERED' ? 'border-green-500 opacity-60' : 'border-blue-500'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">#{order.order_id}</h3>
                                    <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleTimeString()}</p>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">₹{order.total_amount}</span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">📍</span>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Delivery Address</p>
                                        <p className="text-gray-600 text-sm">{order.delivery_address || '123, Green Street, default address'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">👤</span>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Customer</p>
                                        <p className="text-gray-600 text-sm">+91 {order.customer_phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {order.status !== 'DELIVERED' && (
                                <div className="mt-4">
                                    {order.status === 'PACKED' || order.status === 'PLACED' ? (
                                        <button
                                            onClick={() => updateStatus(order.order_id, 'OUT_FOR_DELIVERY')}
                                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
                                        >
                                            📦 PICK UP ORDER
                                        </button>
                                    ) : order.status === 'OUT_FOR_DELIVERY' ? (
                                        <button
                                            onClick={() => updateStatus(order.order_id, 'DELIVERED')}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition flex justify-center items-center gap-2"
                                        >
                                            ✅ MARK DELIVERED
                                        </button>
                                    ) : null}
                                </div>
                            )}

                            {order.status === 'DELIVERED' && (
                                <div className="text-center font-bold text-green-600 bg-green-50 py-2 rounded-lg">
                                    COMPLETED
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default DeliveryDashboard;
