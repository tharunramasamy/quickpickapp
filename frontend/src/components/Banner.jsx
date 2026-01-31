import { useState, useEffect } from "react";

const banners = [
    {
        id: 1,
        title: "Fresh & Organic",
        subtitle: "Get 20% off on all vegetables",
        bg: "bg-gradient-to-r from-green-400 to-green-600",
        emoji: "🥗",
    },
    {
        id: 2,
        title: "Instant Delivery",
        subtitle: "Groceries at your door in minutes",
        bg: "bg-gradient-to-r from-orange-400 to-red-500",
        emoji: "🚀",
    },
    {
        id: 3,
        title: "Summer Sale",
        subtitle: "Cool deals on refreshing drinks",
        bg: "bg-gradient-to-r from-blue-400 to-blue-600",
        emoji: "🥤",
    },
];

export default function Banner() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg mb-6">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 flex items-center justify-between px-8 md:px-16 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
                        } ${banner.bg}`}
                >
                    <div className="text-white z-10 animate-in slide-in-from-left duration-700">
                        <h2 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-md">
                            {banner.title}
                        </h2>
                        <p className="text-lg md:text-xl font-medium opacity-90">
                            {banner.subtitle}
                        </p>
                        <button className="mt-4 px-6 py-2 bg-white text-gray-900 font-bold rounded-full shadow-md hover:bg-gray-100 transition transform hover:scale-105">
                            Shop Now
                        </button>
                    </div>
                    <div className="text-9xl md:text-[10rem] opacity-20 rotate-12 transform scale-150 animate-pulse">
                        {banner.emoji}
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === current ? "bg-white w-6" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
