import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

export default function Login({ role = "CUSTOMER" }) {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getTitle = () => {
    switch (role) {
      case 'INVENTORY_STAFF': return 'Inventory Portal';
      case 'DELIVERY_PARTNER': return 'Delivery Driver';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case 'INVENTORY_STAFF': return 'Manage stock and locations';
      case 'DELIVERY_PARTNER': return 'Start your delivery shift';
      default: return 'Login to order groceries in minutes';
    }
  };

  // Dynamic Backgrounds for Roles
  const getBgClass = () => {
    switch (role) {
      case 'INVENTORY_STAFF': return 'bg-gradient-to-br from-blue-50 to-indigo-100';
      case 'DELIVERY_PARTNER': return 'bg-gradient-to-br from-orange-50 to-amber-100';
      default: return 'bg-gradient-to-br from-green-50 to-emerald-100';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("/api/login", {
        phone: phone,
        password: password,
      });

      const userData = res.data;

      // Role enforcement
      if (role && userData.role !== role) {
        setError(`Access Denied. This account is not a ${role.replace('_', ' ').toLowerCase()}.`);
        setIsLoading(false);
        return;
      }

      login(userData);

      // Redirect based on role
      if (userData.role === 'INVENTORY_STAFF') {
        navigate('/inventory/dashboard');
      } else if (userData.role === 'DELIVERY_PARTNER') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/customer/home');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid login credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${getBgClass()}`}>

      {/* Card Container - Laptop Optimized */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">

        {/* Left Side - Visual / Illustration */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between relative overflow-hidden bg-gray-900 text-white">
          <div className={`absolute inset-0 opacity-20 bg-cover bg-center ${role === 'CUSTOMER' ? 'bg-[url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80")]' : 'bg-gray-800'}`}></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">QuickPick</h3>
            <p className="text-gray-300 text-sm">Superfast delivery, right to your door.</p>
          </div>

          <div className="relative z-10 mt-10">
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">
              {role === 'CUSTOMER' ? 'Groceries in 10 minutes.' : 'Partner App'}
            </h1>
            <p className="text-gray-400">Experience the future of quick commerce.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{getTitle()}</h2>
            <p className="text-gray-500">{getSubtitle()}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${role === 'CUSTOMER' ? 'bg-green-600 hover:bg-green-700' : role === 'INVENTORY_STAFF' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying...
                </span>
              ) : "Login Securely"}
            </button>
          </form>

          {/* SIGNUP LINK */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500 mb-2">New here?</p>
            <a
              href={role === 'CUSTOMER' ? '/customer/signup' : role === 'INVENTORY_STAFF' ? '/inventory/signup' : '/delivery/signup'}
              className={`font-bold ${role === 'CUSTOMER' ? 'text-green-600' : role === 'INVENTORY_STAFF' ? 'text-blue-600' : 'text-orange-600'}`}
            >
              Create {role === 'DELIVERY_PARTNER' ? 'Partner' : role === 'INVENTORY_STAFF' ? 'Staff' : 'Customer'} Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}