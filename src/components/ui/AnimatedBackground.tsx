'use client';

import React from 'react';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Gradients for shapes */}
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                        <stop offset="100%" stopColor="rgba(147, 51, 234, 0.1)" />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.08)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0.08)" />
                    </linearGradient>
                    <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(147, 51, 234, 0.06)" />
                        <stop offset="100%" stopColor="rgba(219, 39, 119, 0.06)" />
                    </linearGradient>

                    {/* Filters for blur effects */}
                    <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
                    </filter>
                    <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
                    </filter>
                </defs>

                {/* Large floating circles */}
                <circle
                    cx="200"
                    cy="200"
                    r="80"
                    fill="url(#gradient1)"
                    filter="url(#blur1)"
                    opacity="0.6"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 30,20; 0,0"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.6; 0.3; 0.6"
                        dur="15s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle
                    cx="1600"
                    cy="300"
                    r="120"
                    fill="url(#gradient2)"
                    filter="url(#blur1)"
                    opacity="0.4"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; -40,25; 0,0"
                        dur="25s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.4; 0.2; 0.4"
                        dur="18s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle
                    cx="1700"
                    cy="800"
                    r="100"
                    fill="url(#gradient3)"
                    filter="url(#blur1)"
                    opacity="0.5"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 20,-30; 0,0"
                        dur="22s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle
                    cx="100"
                    cy="900"
                    r="90"
                    fill="url(#gradient1)"
                    filter="url(#blur1)"
                    opacity="0.3"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 35,15; 0,0"
                        dur="28s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Medium geometric shapes */}
                <polygon
                    points="800,150 850,200 800,250 750,200"
                    fill="rgba(99, 102, 241, 0.08)"
                    filter="url(#blur2)"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 800 200; 360 800 200"
                        dur="40s"
                        repeatCount="indefinite"
                    />
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 15,10; 0,0"
                        dur="16s"
                        repeatCount="indefinite"
                        additive="sum"
                    />
                </polygon>

                <rect
                    x="1200"
                    y="600"
                    width="60"
                    height="60"
                    rx="8"
                    fill="rgba(16, 185, 129, 0.06)"
                    filter="url(#blur2)"
                    transformOrigin="1230 630"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 1230 630; 180 1230 630; 0 1230 630"
                        dur="30s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.6; 0.2; 0.6"
                        dur="12s"
                        repeatCount="indefinite"
                    />
                </rect>

                <polygon
                    points="500,700 530,720 520,760 480,760 470,720"
                    fill="rgba(147, 51, 234, 0.07)"
                    filter="url(#blur2)"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 25,-15; 0,0"
                        dur="24s"
                        repeatCount="indefinite"
                    />
                </polygon>

                <rect
                    x="300"
                    y="500"
                    width="40"
                    height="40"
                    rx="20"
                    fill="rgba(59, 130, 246, 0.05)"
                    transformOrigin="320 520"
                >
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1; 1.2; 1"
                        dur="14s"
                        repeatCount="indefinite"
                    />
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 20,20; 0,0"
                        dur="18s"
                        repeatCount="indefinite"
                        additive="sum"
                    />
                </rect>

                {/* Small floating elements */}
                <circle
                    cx="600"
                    cy="400"
                    r="12"
                    fill="rgba(255, 255, 255, 0.1)"
                    opacity="0.8"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 40,60; 80,20; 120,80; 160,40; 200,100"
                        dur="35s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.8; 0.3; 0.8; 0.4; 0.8"
                        dur="8s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle
                    cx="1400"
                    cy="500"
                    r="8"
                    fill="rgba(255, 255, 255, 0.12)"
                    opacity="0.6"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; -30,40; -60,10; -90,50; -120,20; -150,60"
                        dur="32s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle
                    cx="900"
                    cy="800"
                    r="6"
                    fill="rgba(16, 185, 129, 0.15)"
                    opacity="0.7"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 25,-35; 50,20; 75,-15; 100,30"
                        dur="28s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle
                    cx="1100"
                    cy="200"
                    r="10"
                    fill="rgba(147, 51, 234, 0.1)"
                    opacity="0.5"
                >
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 45,25; 90,-20; 135,40; 180,10"
                        dur="38s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Subtle connecting lines */}
                <path
                    d="M 400,300 Q 600,350 800,200"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.8"
                >
                    <animate
                        attributeName="opacity"
                        values="0.8; 0.2; 0.8"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                </path>

                <path
                    d="M 1200,400 Q 1000,500 1300,700"
                    stroke="rgba(59, 130, 246, 0.04)"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.6"
                >
                    <animate
                        attributeName="opacity"
                        values="0.6; 0.1; 0.6"
                        dur="25s"
                        repeatCount="indefinite"
                    />
                </path>

                {/* Additional ambient particles */}
                <g opacity="0.4">
                    <circle cx="150" cy="600" r="3" fill="rgba(255, 255, 255, 0.2)">
                        <animate attributeName="cy" values="600; 580; 600" dur="6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="1800" cy="150" r="4" fill="rgba(16, 185, 129, 0.15)">
                        <animate attributeName="cx" values="1800; 1780; 1800" dur="8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="750" cy="950" r="2" fill="rgba(147, 51, 234, 0.2)">
                        <animate attributeName="cy" values="950; 930; 950" dur="7s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="1500" cy="750" r="5" fill="rgba(59, 130, 246, 0.1)">
                        <animate attributeName="cx" values="1500; 1520; 1500" dur="9s" repeatCount="indefinite" />
                    </circle>
                </g>

                {/* Grid overlay for subtle corporate feel */}
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />
            </svg>
        </div>
    );
};

export default AnimatedBackground;