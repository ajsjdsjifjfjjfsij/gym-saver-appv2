"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface GymData {
    name: string;
    city: string;
    price: number;
    lat: number;
    lng: number;
}

export default function PureGymMapInsta() {
    const [format, setFormat] = useState<'story' | 'post'>('post');
    const [gyms, setGyms] = useState<GymData[]>([]);

    useEffect(() => {
        fetch('/puregym_map_data.json')
            .then(res => res.json())
            .then(data => setGyms(data))
            .catch(console.error);
    }, []);

    // Filter valid coordinates
    const validGyms = gyms.filter(g => g.lat && g.lng && g.price);

    if (validGyms.length === 0) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Map Data...</div>;

    // Sort by price to easily find min/max
    const sorted = [...validGyms].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];

    // Bounding Box for UK roughly (with slight padding compensation)
    const minLat = 50.0; // Math.min(...validGyms.map(g => g.lat));
    const maxLat = 59.0; // Math.max(...validGyms.map(g => g.lat));
    const minLng = -8.0; // Math.min(...validGyms.map(g => g.lng));
    const maxLng = 2.0;  // Math.max(...validGyms.map(g => g.lng));

    // SVG coordinate system: (0,0) is top-left
    // Aspect ratio of coordinates: 1 deg lat is roughly ~111km, 1 deg lng at UK latitude is roughly ~65km.
    // So Y axis should be scaled up to maintain shape.
    let paddingX = 40;
    let paddingY = 80;

    const width = format === 'story' ? 400 : 500;
    const height = format === 'story' ? 711 : 500;

    const getX = (lng: number) => paddingX + ((lng - minLng) / (maxLng - minLng)) * (width - paddingX * 2);
    // Lat needs to be inverted (higher lat = lower y)
    const getY = (lat: number) => paddingY + ((maxLat - lat) / (maxLat - minLat)) * (height - paddingY * 2);

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4 selection:bg-[#6BD85E]/30">
            <div className="mb-8 flex gap-4 no-print">
                <button
                    onClick={() => setFormat('story')}
                    className={`px-4 py-2 rounded-full font-bold transition-all ${format === 'story' ? 'bg-[#6BD85E] text-black' : 'bg-black text-white border border-gray-700'}`}
                >
                    IG Story (9:16)
                </button>
                <button
                    onClick={() => setFormat('post')}
                    className={`px-4 py-2 rounded-full font-bold transition-all ${format === 'post' ? 'bg-[#6BD85E] text-black' : 'bg-black text-white border border-gray-700'}`}
                >
                    IG Post (1:1)
                </button>
            </div>

            <div
                id="capture-area"
                className="bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center"
                style={{
                    width: width + 'px',
                    height: height + 'px',
                    boxShadow: '0 0 50px rgba(107, 216, 94, 0.1)',
                    border: '1px solid rgba(107, 216, 94, 0.2)',
                    borderRadius: '24px'
                }}
            >
                {/* Branding/Header */}
                <div className="absolute top-6 left-6 z-20">
                    <div className="relative w-28 h-8 opacity-90">
                        <Image src="/images/official_logo.png" alt="GymSaver Logo" fill className="object-contain" />
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-20 text-right">
                    <h1 className="text-white font-bold tracking-widest text-sm uppercase opacity-80">PureGym</h1>
                    <h2 className="text-[#6BD85E] font-black text-xl uppercase tracking-tighter shadow-black drop-shadow-md">Heatmap</h2>
                </div>

                {/* Grid Lines for Data Tech Aesthetic */}
                <div className="absolute inset-0 bg-[#ffffff03] bg-[linear-gradient(rgba(255,255,255,.03)1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)1px,transparent_1px)] bg-[size:40px_40px]"></div>

                {/* Map SVG */}
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute top-0 left-0 w-full h-full opacity-90" style={{ zIndex: 10 }}>
                    {validGyms.map((g, i) => {
                        const isCheapest = g.name === cheapest.name;
                        const isExpensive = g.name === mostExpensive.name;
                        const isHighlight = isCheapest || isExpensive;

                        if (isHighlight) return null;

                        // Color intensity based on price
                        const ratio = (g.price - cheapest.price) / (mostExpensive.price - cheapest.price);
                        // Interpolate between bright green (#6BD85E -> rgb(107,216,94)) and red (#ef4444 -> rgb(239, 68, 68))
                        const r = Math.round(107 + (239 - 107) * ratio);
                        const gCol = Math.round(216 - (216 - 68) * ratio);
                        const b = Math.round(94 - (94 - 68) * ratio);

                        return (
                            <circle
                                key={i}
                                cx={getX(g.lng)}
                                cy={getY(g.lat)}
                                r={format === 'story' ? "4" : "5"}
                                fill={`rgb(${r}, ${gCol}, ${b})`}
                                opacity="0.8"
                            />
                        );
                    })}

                    {/* Highlight Cheapest */}
                    <g transform={`translate(${getX(cheapest.lng)}, ${getY(cheapest.lat)})`}>
                        <circle r="16" fill="#6BD85E" opacity="0.3" className="animate-pulse" />
                        <circle r="6" fill="#6BD85E" stroke="white" strokeWidth="2" />
                        <rect x="14" y="-16" width="130" height="34" fill="#000000" stroke="#6BD85E" strokeWidth="2" rx="6" />
                        <text x="22" y="-3" fill="#6BD85E" fontSize="10" fontWeight="900" letterSpacing="0.5">CHEAPEST: £{cheapest.price}</text>
                        <text x="22" y="10" fill="white" fontSize="10" fontWeight="600">{cheapest.name.replace('PureGym', '').trim()}</text>
                    </g>

                    {/* Highlight Most Expensive */}
                    <g transform={`translate(${getX(mostExpensive.lng)}, ${getY(mostExpensive.lat)})`}>
                        <circle r="16" fill="#ef4444" opacity="0.3" className="animate-pulse" />
                        <circle r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
                        <rect x="-140" y="8" width="140" height="34" fill="#000000" stroke="#ef4444" strokeWidth="2" rx="6" />
                        <text x="-132" y="21" fill="#ef4444" fontSize="10" fontWeight="900" letterSpacing="0.5">EXPENSIVE: £{mostExpensive.price}</text>
                        <text x="-132" y="34" fill="white" fontSize="10" fontWeight="600">{mostExpensive.name.replace('PureGym', '').trim()}</text>
                    </g>
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-12 right-6 z-20 flex flex-col items-end gap-1">
                    <div className="text-[10px] text-gray-400 font-bold tracking-wider mb-1">PRICE SCALE</div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500">Low</span>
                        <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-[#6BD85E] to-[#ef4444]"></div>
                        <span className="text-[9px] text-gray-500">High</span>
                    </div>
                </div>

                {/* Footer overlay */}
                <div className="absolute bottom-4 left-0 w-full flex justify-center z-20">
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">
                        PLOTTING {validGyms.length} UK GYMS • GYMSAVER.COM
                    </span>
                </div>
            </div>

            <p className="mt-8 text-gray-400 text-sm max-w-md text-center">
                Review this on <a href="http://localhost:3000/insta-puregym" className="text-[#6BD85E] hover:underline" target="_blank">http://localhost:3000/insta-puregym</a>. Adjust to Story/Post format and screenshot for Instagram!
            </p>
        </div>
    );
}
