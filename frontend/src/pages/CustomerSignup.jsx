import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CustomerSignup() {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        first_name: "",
        last_name: "",
        email: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submit = async () => {
        setError("");
        try {
            await api.post("/api/signup", {
                ...formData,
                role: "CUSTOMER"
            });
            alert("Account created! Please login.");
            navigate("/customer/login");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Signup failed");
        }
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <input
                        name="first_name"
                        className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                    <input
                        name="last_name"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <input
                        name="email"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email (Optional)"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <input
                        name="phone"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <input
                        name="password"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <button
                    onClick={submit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                    Sign Up
                </button>

                <div className="mt-4 text-center">
                    <span className="text-gray-600 text-sm">Already have an account? </span>
                    <a href="/customer/login" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Login</a>
                </div>
            </div>
        </div>
    );
}
