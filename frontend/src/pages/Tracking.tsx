import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/tracking.css";

interface TrackingResponse {
    order_id: number;
    status: string;
    last_updated: string;
}

export default function Tracking() {
    const { orderId } = useParams();
    const [orderIdInput, setOrderIdInput] = useState(orderId || "");
    const [data, setData] = useState<TrackingResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        if (!orderIdInput) return;

        try {
            setLoading(true);
            setError("");

            const res = await fetch(
                `http://localhost:8000/orders/${orderIdInput}/status`
            );

            const json = await res.json();

            if (json.error) {
                setError(json.error);
                setData(null);
            } else {
                setData(json);
            }
        } catch {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (!orderIdInput) return;

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [orderIdInput]);

    return (
        <div className="tracking-page">
            <h1>Track Your Order</h1>

            <div className="tracking-input">
                <input
                    placeholder="Enter Order ID"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                />
                <button onClick={fetchStatus}>Track</button>
            </div>

            {loading && <p>Loading status…</p>}
            {error && <p className="error">{error}</p>}

            {data && (
                <div className="tracking-card">
                    <p><b>Order ID:</b> {data.order_id}</p>
                    <p><b>Status:</b> {data.status}</p>
                    <p className="time">
                        Last Updated: {new Date(data.last_updated).toLocaleString()}
                    </p>

                    <div className="status-bar">
                        <StatusStep label="PLACED" active={data.status === "PLACED"} />
                        <StatusStep label="PICKED" active={data.status === "PICKED"} />
                        <StatusStep
                            label="OUT_FOR_DELIVERY"
                            active={data.status === "OUT_FOR_DELIVERY"}
                        />
                        <StatusStep label="DELIVERED" active={data.status === "DELIVERED"} />
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusStep({ label, active }: { label: string; active: boolean }) {
    return (
        <div className={`step ${active ? "active" : ""}`}>
            {label.replaceAll("_", " ")}
        </div>
    );
}