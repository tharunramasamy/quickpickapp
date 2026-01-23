import type { CartItem } from "../types";

interface Props {
    cart: CartItem[];
}

export default function Checkout({ cart }: Props) {
    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            {cart.map(item => (
                <div key={item.product.product_id} className="checkout-item">
                    <span>{item.product.product_name}</span>
                    <span>× {item.quantity}</span>
                    <span>₹{item.product.price * item.quantity}</span>
                </div>
            ))}

            <hr />

            <h2>Total: ₹{total}</h2>

            <button className="place-order">
                Place Order
            </button>
        </div>
    );
}