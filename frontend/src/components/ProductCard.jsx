import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
    const { cart, addToCart, removeFromCart } = useContext(CartContext);

    // Find if item is in cart
    const cartItem = cart.find((item) => item.product_id === product.product_id);
    const qty = cartItem ? cartItem.qty : 0;

    // Mock Delivery Time (Random 8-15 mins)
    const deliveryTime = Math.floor(Math.random() * (15 - 8 + 1) + 8);

    return (
        <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Image Area */}
            <div className="relative w-full h-40 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="text-5xl opacity-30">🛒</div>
                )}
                {/* Time Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 text-gray-700">
                    <span>⏱️</span> {deliveryTime} mins
                </div>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{product.category || "Grocery"}</p>
                </div>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1 group-hover:text-green-600 transition-colors">
                    {product.product_name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{product.unit || "1 unit"}</p>

                <div className="mt-auto flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>
                        <span className="text-lg font-extrabold text-gray-900">₹{product.price}</span>
                    </div>

                    {/* Add Button logic - Check Physical Stock first */
                        product.quantity_available <= 0 ? (
                            <div className="flex flex-col items-end">
                                <button
                                    disabled
                                    className="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-bold border border-gray-200 rounded-lg uppercase cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                            </div>
                        ) : qty === 0 ? (
                            <button
                                onClick={() => addToCart(product)}
                                className="px-5 py-2 bg-white text-green-600 text-xs font-bold border border-green-200 rounded-lg uppercase shadow-sm hover:bg-green-50 hover:border-green-500 transition-all active:scale-95"
                            >
                                ADD
                            </button>
                        ) : (
                            <div className="flex items-center bg-green-600 text-white rounded-lg h-9 shadow-md overflow-hidden">
                                <button
                                    onClick={() => removeFromCart(product.product_id)}
                                    className="px-3 h-full hover:bg-green-700 flex items-center justify-center transition"
                                >
                                    -
                                </button>
                                <span className="px-1 text-sm font-bold min-w-[20px] text-center">{qty}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="px-3 h-full hover:bg-green-700 flex items-center justify-center transition"
                                >
                                    +
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
