import { useEffect, useState } from "react";

export default function IntroAnimation({ onComplete }) {
    const [slide, setSlide] = useState(false);

    useEffect(() => {
        // Wait 2s before triggering the slide (reading time)
        const timer1 = setTimeout(() => {
            setSlide(true);
        }, 2000);

        // Complete after the slide animation finishes (1.5s duration)
        const timer2 = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] bg-orange-50 flex flex-col items-center justify-center transition-transform duration-[1500ms] ease-in-out will-change-transform overflow-visible ${slide ? "translate-x-full" : "translate-x-0"}`}
        >
            <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">⚡</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-wider">QuickPick</h1>
            </div>

            {/* Road */}
            <div className="w-full max-w-lg h-1 bg-gray-300 relative mt-10 overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gray-400 opacity-20 stripes-animation"></div>
            </div>

            <p className="mt-12 text-gray-500 font-medium animate-pulse">Delivering happiness...</p>

            {/* Bike - Positioned to 'Lead' the curtain (Left Edge) */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 z-[101]">
                <div className="text-6xl bike-animation" style={{ transform: "scaleX(-1)" }}>
                    🛵
                </div>
            </div>
        </div>
    );
}
