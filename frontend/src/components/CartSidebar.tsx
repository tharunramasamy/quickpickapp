import type { Product } from "../types";

interface Props {
    cart: Product[];
    onClose: () => void;
}

const CartSidebar = ({ cart, onClose }: Props) => {
    const total = cart.reduce((sum, p) => sum + p.price, 0);

    return (
        <div
            style={{
                position: "fixed",
                right: 0,
                top: 0,
                height: "100vh",
                width: "320px",
                background: "#fff",
                borderLeft: "1px solid #ddd",
                padding: "16px",
                boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
                zIndex: 1000,
            }}
        >
            <h3>🛒 Your Cart</h3>

            {cart.length === 0 && <p>No items added</p>}

            {cart.map((item, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                    {item.product_name} – ₹{item.price}
                </div>
            ))}

            <hr />
            <p><strong>Total: ₹{total}</strong></p>

            <button
                style={{ width: "100%", marginTop: "12px" }}
                onClick={onClose}
            >
                Close
            </button>
        </div>
    );
};

export default CartSidebar;