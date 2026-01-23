import type { CartItem, Product } from "../types";
import "../styles/app.css";

interface Props {
    open: boolean;
    cart: CartItem[];
    onClose: () => void;
    onAdd: (product: Product) => void;
    onRemove: (productId: number) => void;
    onCheckout: () => void;
}

export default function CartDrawer({
    open,
    cart,
    onClose,
    onAdd,
    onRemove,
    onCheckout,
}: Props) {
    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return (
        <>
            {/* Overlay */}
            {open && <div className="cart-overlay" onClick={onClose} />}

            {/* Drawer */}
            <div className={`cart-drawer ${open ? "open" : ""}`}>
                {/* Header */}
                <div className="cart-header">
                    <h3>Your Cart</h3>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Empty state */}
                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <>
                        {/* Items */}
                        <div className="cart-items">
                            {cart.map(({ product, quantity }) => (
                                <div
                                    key={product.product_id}
                                    className="cart-item"
                                >
                                    <div className="item-info">
                                        <p className="item-name">
                                            {product.product_name}
                                        </p>
                                        <p className="item-price">
                                            ₹{product.price} × {quantity}
                                        </p>
                                    </div>

                                    <div className="qty-controls">
                                        <button
                                            onClick={() =>
                                                onRemove(product.product_id)
                                            }
                                        >
                                            −
                                        </button>
                                        <span>{quantity}</span>
                                        <button
                                            onClick={() => onAdd(product)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="cart-footer">
                            <div className="total">
                                <span>Total</span>
                                <strong>₹{total}</strong>
                            </div>

                            <button
                                className="checkout-btn"
                                onClick={onCheckout}
                            >
                                Checkout · ₹{total}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}