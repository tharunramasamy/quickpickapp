import { useEffect, useState } from "react";
import type { Product, CartItem } from "../types";
import { API_BASE_URL } from "../config";

import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryBar from "../components/CategoryBar";
import CartDrawer from "../components/CartDrawer";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // 🔹 FETCH PRODUCTS
  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map(p => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(p => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.product.product_id === product.product_id
      );
      if (existing) {
        return prev.map(item =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.product.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // 🔹 PLACE ORDER
  const checkout = async () => {
    const payload = {
      customer_id: 1,
      payment_method: "COD",
      items: cart.map(item => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
      })),
    };

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    window.location.href = `/tracking/${data.order_id}`;
  };

  return (
    <>
      <Navbar
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setDrawerOpen(true)}
      />

      <Hero />

      <CategoryBar
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <div className="grid">
        {filteredProducts.map(p => (
          <ProductCard key={p.product_id} product={p} onAdd={() => addToCart(p)} />
        ))}
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