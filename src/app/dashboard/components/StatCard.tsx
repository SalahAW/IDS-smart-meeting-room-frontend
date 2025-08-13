"use client";

import { LucideIcon } from 'lucide-react';
import React from 'react';

const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
};

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: keyof typeof colorClasses;
    delay: number;
}

export default function StatCard({ title, value, icon: Icon, color, delay }: StatCardProps) {
    return (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <style jsx>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
}