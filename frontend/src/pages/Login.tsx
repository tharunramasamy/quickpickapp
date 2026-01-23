import { useState } from "react";
import "../styles/login.css";

export default function Login() {
    const [phone, setPhone] = useState("");

    const handleLogin = async () => {
        if (!phone) {
            alert("Please enter phone number");
            return;
        }

        // DEMO mapping (simple & clear)
        let username = "customer";
        if (phone === "999") username = "delivery";
        if (phone === "888") username = "inventory";

        try {
            const res = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password: "1234",
                }),
            });

            const data = await res.json();

            if (data.error) {
                alert("Login failed");
                return;
            }

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("role", data.role);

            // Redirect based on role
            if (data.role === "DELIVERY") {
                window.location.href = "/delivery";
            } else if (data.role === "INVENTORY") {
                window.location.href = "/inventory";
            } else {
                window.location.href = "/";
            }
        } catch {
            alert("Server error");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-left">
                    <h1>Login</h1>
                    <p>
                        Enter your phone number to continue
                    </p>
                </div>

                <div className="login-right">
                    <label>Phone Number</label>
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <button className="otp-btn" onClick={handleLogin}>
                        Login
                    </button>

                    <p className="terms">
                        Demo:
                        <br />• Any number → Customer
                        <br />• <b>999</b> → Delivery
                        <br />• <b>888</b> → Inventory
                    </p>
                </div>
            </div>
        </div>
    );
}