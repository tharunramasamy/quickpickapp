import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import InventoryDashboard from "./pages/InventoryDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import CustomerSignup from "./pages/CustomerSignup";
import InventorySignup from "./pages/InventorySignup";
import DeliverySignup from "./pages/DeliverySignup";
import OrderTracking from "./pages/OrderTracking";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Customer Routes */}
        <Route path="/customer/login" element={<Login role="CUSTOMER" />} />
        <Route path="/customer/signup" element={<CustomerSignup />} />
        <Route path="/customer/home" element={<Home />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/checkout" element={<Checkout />} />
        <Route path="/customer/orders" element={<Orders />} />
        <Route path="/customer/tracking" element={<OrderTracking />} />

        {/* Inventory Routes */}
        <Route path="/inventory/login" element={<Login role="INVENTORY_STAFF" />} />
        <Route path="/inventory/signup" element={<InventorySignup />} />
        <Route path="/inventory/dashboard" element={<InventoryDashboard />} />

        {/* Delivery Routes */}
        <Route path="/delivery/login" element={<Login role="DELIVERY_PARTNER" />} />
        <Route path="/delivery/signup" element={<DeliverySignup />} />
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

        <Route path="/cart" element={<Navigate to="/customer/cart" replace />} />

        {/* Default /home support for backward compatibility if needed, or redirect */}
        <Route path="/home" element={<Navigate to="/customer/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}