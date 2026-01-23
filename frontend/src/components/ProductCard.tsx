import type { Product } from "../types";
import "../styles/app.css";

interface Props {
    product: Product;
    onAdd: () => void;
}

export default function ProductCard({ product, onAdd }: Props) {
    return (
        <div className="card">
            <img
                src={product.image_url || "https://picsum.photos/300"}
                alt={product.product_name}
                onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/300";
                }}
            />

            <div className="card-body">
                <h3>{product.product_name}</h3>
                <p className="price">₹{product.price}</p>

                <button onClick={onAdd}>ADD</button>
            </div>
        </div>
    );
}