import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const role = params.get("role") || "customer";

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: role,
          password: "1234",
        }),
      });

      if (!res.ok) throw new Error("Invalid login");

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      if (data.role === "DELIVERY") navigate("/delivery");
      else if (data.role === "INVENTORY") navigate("/inventory");
      else navigate("/home");

    } catch (err) {
      alert("Invalid login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login as {role.toUpperCase()}</h1>

      <input
        placeholder="Phone / ID"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}