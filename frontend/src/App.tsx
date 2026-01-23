import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tracking from "./pages/Tracking";
import Delivery from "./pages/Delivery";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tracking/:orderId" element={<Tracking />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/tracking" element={<Tracking />} />
      </Routes>
    </BrowserRouter>
  );
}