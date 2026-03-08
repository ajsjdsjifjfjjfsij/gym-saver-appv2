"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const InstaStatsPage = () => {
    const [format, setFormat] = useState<'story' | 'post'>('story');

    const mostExpensive = [
        { city: 'Harrogate', price: 66.33 },
        { city: 'Farnham', price: 65.22 },
        { city: 'Hornchurch', price: 59.99 },
        { city: 'Woking', price: 59.98 },
        { city: 'Croydon', price: 59.50 },
    ];

    const cheapest = [
        { city: 'Chatham', price: 14.30 },
        { city: 'Farnborough', price: 14.97 },
        { city: 'Basildon', price: 16.98 },
        { city: 'Warrington', price: 17.24 },
        { city: 'Bury', price: 17.33 },
    ];

    const london = { city: 'London', price: 37.49, rank: '53 / 147' };

    const neonGreen = '#CCFF00';

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
            {/* Controls */}
            <div className="mb-8 flex gap-4 no-print">
                <button
                    onClick={() => setFormat('story')}
                    className={`px-4 py-2 rounded-full font-bold transition-all ${format === 'story' ? 'bg-[#CCFF00] text-black' : 'bg-black text-white border border-gray-700'}`}
                >
                    IG Story (9:16)
                </button>
                <button
                    onClick={() => setFormat('post')}
                    className={`px-4 py-2 rounded-full font-bold transition-all ${format === 'post' ? 'bg-[#CCFF00] text-black' : 'bg-black text-white border border-gray-700'}`}
                >
                    IG Post (1:1)
                </button>
            </div>

            {/* Capture Area */}
            <div
                id="capture-area"
                className={`bg-black relative overflow-hidden flex flex-col items-center justify-center`}
                style={{
                    width: format === 'story' ? '400px' : '500px',
                    height: format === 'story' ? '711px' : '500px', // simplified ratios
                    boxShadow: '0 0 50px rgba(204, 255, 0, 0.1)',
                    border: '1px solid rgba(204, 255, 0, 0.2)',
                    borderRadius: '24px'
                }}
            >
                {/* Neon Glow Effects */}
                <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-[#CCFF00] rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-[#CCFF00] rounded-full blur-[100px] opacity-20"></div>

                <div className="z-10 w-full px-8 flex flex-col h-full py-8 text-white relative">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6 mt-4">
                        <div className="relative w-full h-32 mb-4 flex justify-center">
                            <Image src="/images/official_logo.png" alt="GymSaver Logo" fill className="object-contain" />
                        </div>
                        <h1 className="text-3xl font-black text-center uppercase tracking-wider" style={{ textShadow: '0 0 10px rgba(204, 255, 0, 0.5)' }}>
                            UK Gym Price Index
                        </h1>
                    </div>

                    <div className="flex-1 flex flex-col justify-around gap-4">
                        {/* Most Expensive */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <h2 className="text-[#CCFF00] font-bold mb-3 uppercase tracking-widest text-xs flex items-center justify-between">
                                <span>Highest Avg Price</span>
                                <span>📈</span>
                            </h2>
                            <div className="space-y-2">
                                {mostExpensive.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-semibold">
                                        <span>{i + 1}. {item.city}</span>
                                        <span>£{item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cheapest */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <h2 className="text-[#CCFF00] font-bold mb-3 uppercase tracking-widest text-xs flex items-center justify-between">
                                <span>Lowest Avg Price</span>
                                <span>📉</span>
                            </h2>
                            <div className="space-y-2">
                                {cheapest.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-semibold">
                                        <span>{i + 1}. {item.city}</span>
                                        <span>£{item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* London Highlight */}
                        <div className="border border-[#CCFF00] bg-[#CCFF00]/10 rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00] rounded-full blur-[50px] opacity-10"></div>
                            <h2 className="text-white font-bold mb-1 uppercase tracking-widest text-xs flex justify-between relative z-10">
                                <span>London Average</span>
                                <span className="text-gray-400 font-normal">Rank {london.rank}</span>
                            </h2>
                            <div className="text-3xl font-black text-[#CCFF00] relative z-10 shadow-black drop-shadow-lg">
                                £{london.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 relative z-10">Based on 355 gyms analysed</div>
                        </div>
                    </div>

                    <div className="text-center mt-auto pt-4 text-[10px] text-gray-500 font-medium tracking-wide">
                        DATA FROM GYMSAVER.COM
                    </div>
                </div>
            </div>

            <p className="mt-6 text-gray-400 text-sm max-w-md text-center">
                Tip: Open this page on your phone or use a screenshot tool to capture the widget.
                It is automatically styled for Instagram aesthetics.
            </p>
        </div>
    );
};

export default InstaStatsPage;
