import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function InventorySignup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: "", last_name: "", email: "", phone: "", password: "",
        create_new_store: false,
        store_city: "",
        store_address: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                role: "INVENTORY_STAFF",
                // Send city_id if we had a selection, but for creating new store we rely on backed 
                // to generate/map it from store_city
                city_id: null
            };

            await api.post("/api/signup", payload);
            alert("Registration Successful! Please login.");
            navigate("/inventory/login");
        } catch (err) {
            alert("Signup Failed: " + (err.response?.data?.detail || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Inventory Staff Registration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="first_name" placeholder="First Name" onChange={handleChange} className="border p-2 rounded" required />
                        <input name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2 rounded" required />
                    </div>
                    <input name="phone" placeholder="Phone Number" onChange={handleChange} className="border p-2 rounded w-full" required />
                    <input name="email" type="email" placeholder="Email (Optional)" onChange={handleChange} className="border p-2 rounded w-full" />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded w-full" required />

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="flex items-center gap-2 mb-2 font-bold text-blue-900 cursor-pointer">
                            <input
                                type="checkbox"
                                name="create_new_store"
                                checked={formData.create_new_store}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />
                            Register New Store Location?
                        </label>

                        {formData.create_new_store && (
                            <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                                <input name="store_city" placeholder="City Name (e.g. Chennai)" onChange={handleChange} className="border p-2 rounded w-full text-sm" required />
                                <input name="store_address" placeholder="Store Address/Area" onChange={handleChange} className="border p-2 rounded w-full text-sm" required />
                                <p className="text-xs text-blue-600">This will create a new Active Store in the system.</p>
                            </div>
                        )}
                    </div>

                    <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>
                <p className="text-center mt-4 text-sm">
                    Already have an account? <a href="/inventory/login" className="text-blue-600 font-bold">Login</a>
                </p>
            </div>
        </div>
    );
}
