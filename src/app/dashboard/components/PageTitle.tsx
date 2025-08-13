"use client";

import React from 'react';

interface PageTitleProps {
    title: string;
    description?: string;
}

export default function PageTitle({ title, description }: PageTitleProps) {
    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
            {description && (
                <p className="mt-1 text-md text-gray-500 dark:text-gray-400">{description}</p>
            )}
            <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
        </div>
    );
}