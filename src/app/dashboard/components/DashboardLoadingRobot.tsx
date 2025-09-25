"use client";

import React from 'react';

/**
 * A full-page loading component with an animated robot.
 * Displayed while the user session is being authenticated for the dashboard.
 */
const DashboardLoadingRobot = () => {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-600">
                <div className="w-48 h-48">
                    {/* SVG Robot */}
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <style>{`
                            .robot-arm {
                                animation: wave-animation 2s ease-in-out infinite;
                                transform-origin: 15% 55%;
                            }
                            @keyframes wave-animation {
                                0% { transform: rotate(0deg); }
                                10% { transform: rotate(14deg); }
                                20% { transform: rotate(-8deg); }
                                30% { transform: rotate(14deg); }
                                40% { transform: rotate(-4deg); }
                                50% { transform: rotate(10deg); }
                                60% { transform: rotate(0deg); }
                                100% { transform: rotate(0deg); }
                            }
                            .pulse-animation {
                                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                            }
                            @keyframes pulse {
                                0%, 100% { opacity: 1; }
                                50% { opacity: 0.7; }
                            }
                        `}</style>
                        {/* Head */}
                        <rect x="25" y="15" width="50" height="35" rx="5" fill="#CBD5E1"/>
                        <rect x="35" y="25" width="30" height="15" rx="3" fill="#475569"/>
                        <circle cx="42" cy="32.5" r="2" fill="#60A5FA"/>
                        <circle cx="58" cy="32.5" r="2" fill="#60A5FA"/>

                        {/* Body */}
                        <rect x="20" y="50" width="60" height="40" rx="5" fill="#94A3B8"/>
                        <circle cx="50" cy="70" r="10" fill="#475569"/>
                        <circle cx="50" cy="70" r="5" fill="#3B82F6" className="pulse-animation"/>

                        {/* Waving Arm */}
                        <g className="robot-arm">
                            <rect x="5" y="50" width="15" height="10" rx="5" fill="#94A3B8"/>
                            <circle cx="10" cy="70" r="5" fill="#CBD5E1"/>
                        </g>

                        {/* Other Arm */}
                        <rect x="80" y="50" width="15" height="10" rx="5" fill="#94A3B8"/>
                        <circle cx="85" cy="70" r="5" fill="#CBD5E1"/>
                    </svg>
                </div>
                <p className="mt-4 text-lg font-semibold pulse-animation">Please wait...</p>
            </div>
        </>
    );
};

export default DashboardLoadingRobot;