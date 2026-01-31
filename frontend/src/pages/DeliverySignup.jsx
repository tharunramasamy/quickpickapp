import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function DeliverySignup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: "", last_name: "", email: "", phone: "", password: "",
        city_id: ""
    });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch available locations/cities to let partner choose where they work
        api.get("/api/locations").then(res => setLocations(res.data));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.city_id) {
            alert("Please select a city");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                role: "DELIVERY_PARTNER",
                city_id: parseInt(formData.city_id)
            };

            await api.post("/api/signup", payload);
            alert("Registration Successful! Please login.");
            navigate("/delivery/login");
        } catch (err) {
            alert("Signup Failed: " + (err.response?.data?.detail || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Become a Partner</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="first_name" placeholder="First Name" onChange={handleChange} className="border p-2 rounded" required />
                        <input name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2 rounded" required />
                    </div>
                    <input name="phone" placeholder="Phone Number" onChange={handleChange} className="border p-2 rounded w-full" required />
                    <input name="email" type="email" placeholder="Email (Optional)" onChange={handleChange} className="border p-2 rounded w-full" />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded w-full" required />

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Your City</label>
                        <select
                            name="city_id"
                            onChange={handleChange}
                            className="w-full border p-2 rounded bg-white"
                            required
                        >
                            <option value="">-- Choose City --</option>
                            {/* Unique cities from locations list */}
                            {[...new Set(locations.map(l => l.city_id))].map(cityId => {
                                const loc = locations.find(l => l.city_id === cityId);
                                // Extract City Name from address if possible, or just show ID/Address
                                // Address format in DB: "Address, City"
                                const cityName = loc.address.split(',').pop().trim();
                                return (
                                    <option key={cityId} value={cityId}>
                                        {cityName} (ID: {cityId})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <button disabled={loading} className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition">
                        {loading ? "Registering..." : "Join Fleet"}
                    </button>
                </form>
                <p className="text-center mt-4 text-sm">
                    Already a partner? <a href="/delivery/login" className="text-orange-600 font-bold">Login</a>
                </p>
            </div>
        </div>
    );
}
