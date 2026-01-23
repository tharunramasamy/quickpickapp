import { useState } from "react";
import { API_BASE_URL } from "../config";

export default function Login() {
  const [phone, setPhone] = useState("");

  const handleLogin = async () => {
    let username = "customer";
    if (phone === "999") username = "delivery";
    if (phone === "888") username = "inventory";

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "1234" }),
    });

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);

    if (data.role === "DELIVERY") window.location.href = "/delivery";
    else if (data.role === "INVENTORY") window.location.href = "/inventory";
    else window.location.href = "/";
  };

  return (
    <>
      <input value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </>
  );
}