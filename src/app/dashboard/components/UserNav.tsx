'use client';
import { signOut } from 'next-auth/react';
import { LogOut, User, Settings } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

export function UserNav() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <DefaultButton
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:ring-2 hover:ring-blue-500 transition-all"
            >
                <User size={20} />
            </DefaultButton>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 animate-fade-in-down">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                        <p className="font-semibold">Salah</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">salahawji3@gmail.com</p>
                    </div>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings size={16} className="mr-2" />
                        Profile Settings
                    </a>
                    <DefaultButton
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                    </DefaultButton>
                </div>
            )}
            <style jsx>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out; }
      `}</style>
        </div>
    );
}