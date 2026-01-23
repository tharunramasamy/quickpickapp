import "../styles/app.css";

export default function Hero() {
    return (
        <div className="hero">
            <div className="hero-left">
                <span className="badge">LIMITED TIME OFFER</span>
                <h1>
                    Summer <span>Mango</span> Festival
                </h1>
                <p>Get up to 40% OFF on farm-fresh organic mangoes.</p>
                <button className="cta">Shop Now →</button>
            </div>

            <div className="hero-right">
                <h2>QuickPass</h2>
                <p>Unlimited FREE deliveries</p>
                <p className="price">₹99 / month</p>
                <button className="join">Join Now</button>
            </div>
        </div>
    );
}