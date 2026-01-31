import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Banner from "../components/Banner";
import IntroAnimation from "../components/IntroAnimation";
import UserProfile from "../components/UserProfile";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const { cart } = useContext(CartContext);

  useEffect(() => {
    // Check if location is already selected
    const storedLoc = localStorage.getItem("selected_location");
    if (storedLoc) {
      setSelectedLocation(JSON.parse(storedLoc));
    }

    // Intro animation handling is now separate
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (!selectedLocation) {
      setShowLocationModal(true);
    }
  };

  useEffect(() => {
    // Fetch Locations
    api.get("/api/locations").then(res => setLocations(res.data));
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      // Fetch products for specific location
      api.get(`/api/products?location_id=${selectedLocation.location_id}`)
        .then((res) => setProducts(res.data));
    }
  }, [selectedLocation]);

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem("selected_location", JSON.stringify(loc));
    // Save city_id specifically for checkout usage if needed
    localStorage.setItem("selected_city_id", loc.city_id);
    setShowLocationModal(false);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">

      {/* LOCATION SELECTION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">📍</span>
              <h2 className="text-xl font-bold text-gray-900">Select Your Location</h2>
              <p className="text-sm text-gray-500">To show you products available nearby.</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {locations.map(loc => (
                <button
                  key={loc.location_id}
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full text-left p-3 border rounded-xl hover:border-green-500 hover:bg-green-50 transition flex items-center gap-3 group"
                >
                  <div className="bg-gray-100 p-2 rounded-full group-hover:bg-green-200">🏢</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Store: {loc.location_id}</p>
                    <p className="text-xs text-gray-500">{loc.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INTRO ANIMATION */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-0 md:px-4 py-3 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* LEFT: Logo & Location Information (Blinkit Style) */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <h1 className="font-extrabold text-3xl text-yellow-500 tracking-tight leading-none bg-yellow-50 px-2 rounded-md">
                Quick<span className="text-green-600">Pick</span>
              </h1>
            </div>

            {/* Delivery Info Block */}
            <div className="flex flex-col cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition" onClick={() => setShowLocationModal(true)}>
              <h2 className="font-bold text-lg md:text-xl leading-none text-gray-900">
                Delivery in <span className="text-gray-900">19 minutes</span>
              </h2>
              <div className="flex items-center text-xs md:text-sm text-gray-500 font-medium">
                {selectedLocation ? (
                  <span className="truncate max-w-[150px] md:max-w-[200px]">{selectedLocation.address}</span>
                ) : (
                  "Select Location"
                )}
                <span className="ml-1 text-gray-400">▼</span>
              </div>
            </div>
          </div>

          {/* CENTER: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative w-full">
              <span className="absolute left-4 top-3 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder='Search "egg", "milk", "bread"...'
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:bg-white focus:shadow-md transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* RIGHT: Login & Cart */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-gray-700 font-medium cursor-pointer relative">
              <button onClick={() => setShowProfile(!showProfile)} className="hover:text-green-600 transition flex items-center gap-1">
                Login <span className="text-xs">▼</span>
              </button>
              {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
            </div>

            <Link to="/customer/cart">
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition">
                <span className="text-xl">🛒</span>
                <span className="hidden md:inline">My Cart</span>
                {cart.length > 0 && <span className="bg-green-800 text-xs px-2 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Search (Below Header) */}
        <div className="md:hidden mt-3 px-4 pb-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder='Search "egg", "milk"...'
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* BANNER SECTION */}
        <Banner />

        {/* PROMOTIONAL TAGS (Optional) */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide">
          {["All", "Vegetables", "Fruits", "Dairy", "Beverages", "Snacks"].map((cat) => (
            <button key={cat} className="px-5 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-600 transition whitespace-nowrap shadow-sm">
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div>
          <h2 className="font-bold text-gray-900 text-2xl mb-6 flex items-center gap-2">
            Recommended for you <span className="text-sm font-normal text-gray-400 ml-2">(Based on your location)</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
            {products.length === 0 && !showLocationModal && (
              <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🙁</div>
                <h3 className="text-xl font-bold text-gray-800">No products found</h3>
                <p className="text-gray-500">Try selecting a different location or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STICKY CART FOOTER */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-20">
          <Link to="/customer/cart">
            <div className="max-w-md mx-auto bg-green-600 text-white rounded-xl shadow-lg p-3 flex justify-between items-center cursor-pointer hover:bg-green-700 transition">
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase text-green-100">{cart.reduce((a, b) => a + b.qty, 0)} ITEMS</span>
                <span className="font-bold">₹{totalAmount}</span>
              </div>
              <div className="flex items-center font-bold text-sm">
                View Cart <span className="ml-1 text-lg">›</span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}