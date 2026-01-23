import { useEffect, useState } from "react";
import type { Product, CartItem } from "../types";

import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryBar from "../components/CategoryBar";
import CartDrawer from "../components/CartDrawer";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [activeCategory, setActiveCategory] = useState<string>("All");

    /* FETCH PRODUCTS */
    useEffect(() => {
        fetch("http://localhost:8000/products")
            .then((res) => res.json())
            .then((data: Product[]) => setProducts(data))
            .catch(console.error);
    }, []);

    /* UNIQUE CATEGORIES */
    const categories: string[] = [
        "All",
        ...Array.from(
            new Set(
                products
                    .map((p) => p.category)
                    .filter((c): c is string => Boolean(c))
            )
        ),
    ];

    /* FILTER PRODUCTS */
    const filteredProducts =
        activeCategory === "All"
            ? products
            : products.filter((p) => p.category === activeCategory);

    /* ADD TO CART (quantity-aware) */
    const addToCart = (product: Product): void => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.product.product_id === product.product_id
            );

            if (existing) {
                return prev.map((item) =>
                    item.product.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { product, quantity: 1 }];
        });
    };

    /* REMOVE FROM CART */
    const removeFromCart = (productId: number): void => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.product.product_id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    /* CHECKOUT → BACKEND */
    const checkout = async (): Promise<void> => {
        if (cart.length === 0) return;

        const payload = {
            customer_id: 1,
            payment_method: "COD",
            items: cart.map((item) => ({
                product_id: item.product.product_id,
                quantity: item.quantity,
            })),
        };

        try {
            const res = await fetch("http://localhost:8000/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();


            window.location.href = `/tracking/${data.order_id}`;

            setCart([]);
            setDrawerOpen(false);
        } catch (err) {
            alert("Order failed");
            console.error(err);
        }
    };

    return (
        <>
            <Navbar
                cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                onCartClick={() => setDrawerOpen(true)}
            />

            <Hero />

            <div className="container">
                <CategoryBar
                    categories={categories}
                    active={activeCategory}
                    onChange={setActiveCategory}
                />

                <div className="grid">
                    {filteredProducts.map((p) => (
                        <ProductCard
                            key={p.product_id}
                            product={p}
                            onAdd={() => addToCart(p)}
                        />
                    ))}
                </div>
            </div>

            <CartDrawer
                open={drawerOpen}
                cart={cart}
                onClose={() => setDrawerOpen(false)}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onCheckout={checkout}
            />
        </>
    );
}
