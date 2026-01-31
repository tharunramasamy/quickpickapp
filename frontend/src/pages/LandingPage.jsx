import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        switch (role) {
            case 'customer':
                navigate('/customer/login');
                break;
            case 'inventory':
                navigate('/inventory/login');
                break;
            case 'delivery':
                navigate('/delivery/login');
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to QuickPick</h1>
            <p className="text-xl text-gray-600 mb-12">Select your role to continue</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                {/* Customer Card */}
                <div
                    onClick={() => handleRoleSelect('customer')}
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col items-center border-t-4 border-yellow-400"
                >
                    <div className="text-6xl mb-4">🛍️</div>
                    <h2 className="text-2xl font-bold mb-2">Customer</h2>
                    <p className="text-gray-500 text-center">Shop for daily essentials and get them delivered in minutes.</p>
                </div>

                {/* Inventory Card */}
                <div
                    onClick={() => handleRoleSelect('inventory')}
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col items-center border-t-4 border-blue-500"
                >
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold mb-2">Inventory</h2>
                    <p className="text-gray-500 text-center">Manage stock, locations, and prepare orders.</p>
                </div>

                {/* Delivery Card */}
                <div
                    onClick={() => handleRoleSelect('delivery')}
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col items-center border-t-4 border-green-500"
                >
                    <div className="text-6xl mb-4">🚚</div>
                    <h2 className="text-2xl font-bold mb-2">Delivery Partner</h2>
                    <p className="text-gray-500 text-center">View assigned orders and manage deliveries.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
