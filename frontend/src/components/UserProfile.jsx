import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function UserProfile({ onClose }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose}></div>

            {/* Popover */}
            <div className="absolute top-12 right-0 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">{user?.name || "My Account"}</h3>
                    <p className="text-xs text-gray-500">{user?.phone || user?.email || ""}</p>
                </div>
                <div className="flex flex-col p-2">
                    <button className="text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 rounded-lg transition" onClick={() => navigate("/customer/orders")}>
                        📦 My Orders
                    </button>
                    <button className="text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 rounded-lg transition" onClick={() => alert("Address feature coming soon!")}>
                        📍 Saved Addresses
                    </button>
                    <button className="text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 rounded-lg transition" onClick={() => alert("Wallet feature coming soon!")}>
                        💳 Wallet
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 rounded-lg transition">
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
