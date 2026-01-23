import { useEffect, useState } from "react";
import "../styles/app.css";

interface Props {
    cartCount: number;
    onCartClick: () => void;
}

export default function Navbar({ cartCount, onCartClick }: Props) {
    const [location, setLocation] = useState("Detecting location...");
    const [manual, setManual] = useState(false);
    const [input, setInput] = useState("");

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation("Enter location");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                // DEMO location (replace with reverse geocoding later)
                setLocation("HSR Layout, Bengaluru");
            },
            () => {
                setLocation("Enter location");
            }
        );
    }, []);

    const saveManualLocation = () => {
        if (input.trim()) {
            setLocation(input);
            setManual(false);
        }
    };

    return (
        <div className="navbar">
            {/* LEFT */}
            <div className="nav-left">
                <div className="logo" onClick={() => (window.location.href = "/")}>
                    QP
                </div>

                <div onClick={() => setManual(true)} style={{ cursor: "pointer" }}>
                    <div className="delivery">Delivery in 8 mins</div>
                    <div className="location">{location}</div>
                </div>
            </div>

            {/* CENTER */}
            <div className="nav-center">
                <button className="nav-btn">Home</button>
                <button className="nav-btn">Categories</button>
                <button className="nav-btn">Offers</button>
                <button className="nav-btn">Orders</button>
                <button className="nav-btn">Help</button>
            </div>

            {/* SEARCH */}
            <input className="search" placeholder="Search groceries…" />

            {/* RIGHT */}
            <div className="nav-right">
                <button className="login" onClick={() => (window.location.href = "/login")}>
                    Logout
                </button>

                <div className="cart-pill" onClick={onCartClick}>
                    Cart · {cartCount}
                </div>
            </div>

            {/* MANUAL LOCATION INPUT */}
            {manual && (
                <div style={{ width: "100%", marginTop: 10 }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter delivery location"
                        className="search"
                    />
                    <button
                        className="login"
                        style={{ marginLeft: 10 }}
                        onClick={saveManualLocation}
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}