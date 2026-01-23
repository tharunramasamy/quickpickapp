import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tracking from "./pages/Tracking";
import Delivery from "./pages/Delivery";
import Inventory from "./pages/Inventory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Customer */}
        <Route path="/home" element={<Home />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/tracking/:orderId" element={<Tracking />} />

        {/* Operations */}
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/delivery" element={<Delivery />} />
      </Routes>
    </BrowserRouter>
  );
}