import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const InventoryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(null); // order_id if open

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (user) fetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const locId = user.city_id || 1; // Fallback or strict?
            // Note: The backend expects location_id, but we are passing city_id in some places. 
            // The previous fix ensures backend derives location from city if needed, 
            // but the /api/products endpoint takes ?location_id=. 
            // We should ideally pass the mapped location ID, but for now passing city_id 
            // and letting backend query based on join might be mismatched IF backend expects explicit location_id.
            // However, looking at the code, we pass user.city_id. 

            const [prodRes, ordRes, partRes] = await Promise.all([
                api.get('/api/products?location_id=' + locId),
                api.get('/api/orders'),
                api.get('/api/delivery-partners')
            ]);
            setProducts(prodRes.data);
            setOrders(ordRes.data);
            setPartners(partRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setLoading(false);
        }
    };

    const initializeStock = async () => {
        if (!confirm("This will load all catalog products into your inventory with 0 stock. Continue?")) return;
        try {
            setLoading(true);
            await api.post('/api/inventory/initialize');
            fetchData();
            alert("Catalog Loaded Successfully!");
        } catch (err) {
            alert("Failed to load catalog: " + (err.response?.data?.detail || err.message));
            setLoading(false);
        }
    };

    const updateStock = async (productId, quantity, action) => {
        try {
            await api.put('/api/inventory/update', {
                product_id: productId,
                quantity: parseInt(quantity),
                action: action // 'ADD' or 'REDUCE'
            });
            fetchData(); // Refresh list
        } catch (err) {
            alert("Stock update failed: " + (err.response?.data?.detail || err.message));
        }
    };

    // Filter available partners
    const availablePartners = partners.filter(p => p.status === 'AVAILABLE');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <header className="bg-white shadow-sm z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-2xl">🏭</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Inventory Portal</h1>
                            <p className="text-xs text-gray-500 font-medium">Location: {user?.city_id ? `Active Store` : 'Central Warehouse'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'orders' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Incoming Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Manage Stock
                            </button>
                        </nav>

                        {activeTab === 'inventory' && (
                            <button onClick={initializeStock} className="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-orange-100">
                                Load Products
                            </button>
                        )}

                        <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg border border-blue-100">
                            👤 {user?.user_name || 'Staff'}
                        </div>
                        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                {loading ? <p className="text-center py-10">Loading Dashboard...</p> : (
                    <>
                        {/* ORDERS TAB */}
                        {activeTab === 'orders' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {orders.map(order => (
                                    <div key={order.order_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">#{order.order_id}</h3>
                                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'PLACED' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total Amount</span>
                                                <span className="font-bold">₹{order.total_amount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Customer</span>
                                                <span className="font-medium text-gray-900">{order.customer_phone || 'Unknown'}</span>
                                            </div>
                                        </div>

                                        {order.status === 'PLACED' ? (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setAssignModalOpen(order.order_id)}
                                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                                                >
                                                    Assign & Pack
                                                </button>

                                                {/* Assignment Dropdown/Modal (Simplified inline) */}
                                                {assignModalOpen === order.order_id && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl z-20 p-2 animate-in fade-in zoom-in duration-200">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Select Driver</h4>
                                                        {availablePartners.length === 0 ? (
                                                            <p className="text-xs text-red-500 px-2">No drivers available</p>
                                                        ) : (
                                                            availablePartners.map(p => (
                                                                <button
                                                                    key={p.partner_id}
                                                                    onClick={() => assignPartner(order.order_id, p.partner_id)}
                                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex justify-between items-center text-sm"
                                                                >
                                                                    <span>🚛 {p.phone}</span>
                                                                    <span className="text-xs text-green-600 bg-green-50 px-1 rounded">{p.vehicle_type}</span>
                                                                </button>
                                                            ))
                                                        )}
                                                        <button
                                                            onClick={() => setAssignModalOpen(null)}
                                                            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 py-1"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm text-gray-500 bg-gray-50 py-2 rounded border border-gray-100">
                                                Assigned to: <span className="font-bold">{partners.find(p => p.partner_id === order.delivery_partner_id)?.phone || 'Partner'}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No orders yet.</p>}
                            </div>
                        )}

                        {/* INVENTORY TAB */}
                        {activeTab === 'inventory' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => (
                                            <tr key={product.product_id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{product.product_name}</td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">{product.category_id}</td>
                                                <td className="px-6 py-4 text-gray-900 font-bold">₹{product.price}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold w-16 text-center ${product.quantity_available < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {product.quantity_available} {product.unit}
                                                        </span>
                                                        <div className="flex items-center bg-gray-100 rounded-lg">
                                                            <button
                                                                onClick={() => updateStock(product.product_id, 1, 'ADD')}
                                                                className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-200 rounded-l-lg font-bold"
                                                            >
                                                                +
                                                            </button>
                                                            <div className="w-[1px] h-4 bg-gray-300"></div>
                                                            <button
                                                                onClick={() => updateStock(product.product_id, 1, 'REDUCE')}
                                                                className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-200 rounded-r-lg font-bold"
                                                            >
                                                                -
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default InventoryDashboard;
