"use client";

import React, { useRef, useState, useEffect } from "react";
import {Bell, ChevronDown, Menu, Search, X, User as UserIcon, LogOut, Settings, Clock} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { DefaultButton } from "./DefaultButton";
import useOutsideClick from "../hooks/useOutsideClick";

const Header = ({ onMenuClick }) => {
    // REMOVED: const { user } = useAuth();
    const { data: session } = useSession();

    // The user object now comes directly from the session
    const user = session?.user;

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [expiresIn, setExpiresIn] = useState("00:00:00");

    const userDropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    useOutsideClick(userDropdownRef, () => setUserDropdownOpen(false));
    useOutsideClick(notificationsRef, () => setNotificationsOpen(false));

    // Session Timer Logic (Updated to be more robust)
    useEffect(() => {
        if (session?.expires) {
            const interval = setInterval(() => {
                const now = new Date();
                const expiryDate = new Date(session.expires);
                const diff = expiryDate.getTime() - now.getTime();

                if (diff <= 0) {
                    setExpiresIn("Expired");
                    clearInterval(interval);
                    // Optional: auto-logout when expired
                    // signOut({ redirectTo: '/' });
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setExpiresIn(
                        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                    );
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    // Mock Notifications
    const notifications = [
        { text: "Meeting 'Marketing Sync-up' was rescheduled.", time: "15m ago" },
        { text: "You have a new action item from 'Q3 Planning'.", time: "1h ago" },
        { text: "New files were added to 'Project Phoenix'.", time: "3h ago" },
    ];

    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';

    return (
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 w-full p-4 sm:p-6 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center flex-grow">
                <DefaultButton variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden mr-2 text-slate-600"><Menu size={24} /></DefaultButton>
                <div className="relative hidden sm:block flex-grow mr-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="text" placeholder="Search for meetings, rooms, or people..." className="pl-10 pr-4 py-2 w-full bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">

                {/* Notifications Bell */}
                <div className="relative" ref={notificationsRef}>
                    <DefaultButton variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-slate-500">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                    </DefaultButton>
                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-100">
                                <div className="p-3 font-semibold text-slate-800 border-b border-slate-200">Notifications</div>
                                <div className="py-1">
                                    {notifications.map((item, i) => (
                                        <a key={i} href="#" className="block px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                                            <p>{item.text}</p>
                                            <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                                        </a>
                                    ))}
                                </div>
                                <div className="p-2 bg-slate-50 text-center">
                                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline">View all notifications</a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                    <DefaultButton variant="ghost" onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 p-1.5 rounded-full">
                        <img src={`https://placehold.co/40x40/E2E8F0/475569?text=${userInitials}`} alt="User Avatar" className="h-9 w-9 rounded-full" />
                        <span className="hidden sm:inline font-medium text-slate-700">{user?.name}</span>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </DefaultButton>
                    <AnimatePresence>
                        {userDropdownOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-100 py-1">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                                <a href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><UserIcon size={16} className="mr-2"/> Profile</a>
                                <a href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Settings size={16} className="mr-2"/> Settings</a>
                                <div className="my-1 h-px bg-slate-100"></div>
                                <div className="px-4 py-2 text-xs text-slate-500">
                                    <div className="flex items-center">
                                        <Clock size={14} className="mr-2" />
                                        <span>Session expires in: {expiresIn}</span>
                                    </div>
                                </div>
                                <div className="my-1 h-px bg-slate-100"></div>
                                <button onClick={handleLogout} className="w-full cursor-pointer text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50"><LogOut size={16} className="mr-2"/> Logout</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;