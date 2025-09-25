"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Bell, ChevronDown, Menu, Search, X, User as UserIcon, LogOut, Settings, Clock, Loader2, Video, DoorOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { DefaultButton } from "./DefaultButton";
import useOutsideClick from "../hooks/useOutsideClick";
import useDebounce from "../hooks/useDebounce";
import { globalSearch } from "@/actions";
import Link from "next/link";

// --- Search Result Types ---
interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    type: string;
    link: string;
}
interface GlobalSearchResults {
    meetings: SearchResult[];
    rooms: SearchResult[];
    users: SearchResult[];
}

// --- Search Dropdown Component ---
const SearchResultsDropdown = ({ results, isLoading, onResultClick, session }: { results: GlobalSearchResults, isLoading: boolean, onResultClick: () => void, session: any }) => {
    const hasResults = results.meetings.length > 0 || results.rooms.length > 0 || results.users.length > 0;
    const isAdmin = session?.user?.role === 'admin';

    const renderResultSection = (title: string, items: SearchResult[], icon: React.ElementType) => {
        if (items.length === 0) return null;
        const Icon = icon;
        return (
            <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2">{title}</h3>
                <ul>
                    {items.map(item => {
                        const isUserResult = title === "Users";
                        const isClickable = !isUserResult || isAdmin;

                        const content = (
                            <>
                                <div className="p-2 bg-slate-100 rounded-md mr-3">
                                    <Icon size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{item.title}</p>
                                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                                </div>
                            </>
                        );

                        return (
                            <li key={`${item.type}-${item.id}`}>
                                {isClickable ? (
                                    <Link href={item.link} onClick={onResultClick} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                                        {content}
                                    </Link>
                                ) : (
                                    <div className="flex items-center px-4 py-2.5 text-sm text-slate-700 cursor-default opacity-70">
                                        {content}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
        >
            <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-16">
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                    </div>
                ) : hasResults ? (
                    <div className="py-2">
                        {renderResultSection("Meetings", results.meetings, Video)}
                        {renderResultSection("Rooms", results.rooms, DoorOpen)}
                        {renderResultSection("Users", results.users, UserIcon)}
                    </div>
                ) : (
                    <div className="text-center p-16 text-sm text-slate-500">
                        <p>No results found.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};


// --- Main Header Component ---
const Header = ({ onMenuClick }) => {
    const { data: session, status } = useSession();
    const user = session?.user;

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [expiresIn, setExpiresIn] = useState("00:00:00");

    // --- Search State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<GlobalSearchResults>({ meetings: [], rooms: [], users: [] });
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

    const userDropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const searchRef = useRef(null);

    useOutsideClick(userDropdownRef, () => setUserDropdownOpen(false));
    useOutsideClick(notificationsRef, () => setNotificationsOpen(false));
    useOutsideClick(searchRef, () => setIsSearchFocused(false));

    // Effect to perform the search when debounced term changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchTerm.length < 2) {
                setSearchResults({ meetings: [], rooms: [], users: [] });
                setIsSearchLoading(false);
                return;
            }
            setIsSearchLoading(true);
            const response = await globalSearch(debouncedSearchTerm);
            if (response.success) {
                setSearchResults(response.data);
            }
            setIsSearchLoading(false);
        };
        performSearch();
    }, [debouncedSearchTerm]);


    // Session timer effect (unchanged)
    useEffect(() => {
        if (session?.user?.loginTime && session?.user?.maxAge) {
            const expirationTime = (session.user.loginTime * 1000) + (session.user.maxAge * 1000);
            const interval = setInterval(() => {
                const diff = expirationTime - Date.now();
                if (diff <= 0) {
                    setExpiresIn("Expired");
                    clearInterval(interval);
                } else {
                    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
                    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
                    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                    setExpiresIn(`${h}:${m}:${s}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const handleLogout = () => signOut({ callbackUrl: '/' });
    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';

    return (
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 w-full p-4 sm:p-6 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center flex-grow">
                <DefaultButton variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden mr-2 text-slate-600"><Menu size={24} /></DefaultButton>

                {/* --- Interactive Search Bar --- */}
                <div className="relative hidden sm:block flex-grow mr-4" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for meetings, rooms, or people..."
                        className="pl-10 pr-4 py-2 w-full bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                    />
                    <AnimatePresence>
                        {isSearchFocused && searchTerm.length > 0 && (
                            <SearchResultsDropdown
                                results={searchResults}
                                isLoading={isSearchLoading}
                                session={session}
                                onResultClick={() => {
                                    setSearchTerm("");
                                    setIsSearchFocused(false);
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
                {/* Notifications Bell (unchanged) */}
                <div className="relative" ref={notificationsRef}>
                    <DefaultButton variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-slate-500">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                    </DefaultButton>
                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-100">
                                {/* Placeholder for notifications */}
                                <div className="p-4 text-sm text-center text-slate-500">No new notifications.</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile Dropdown (unchanged) */}
                <div className="relative" ref={userDropdownRef}>
                    {status === 'loading' ? (
                        <div className="flex items-center space-x-2 p-1.5 animate-pulse">
                            <div className="h-9 w-9 rounded-full bg-slate-200"></div>
                            <div className="hidden sm:block h-4 w-20 bg-slate-200 rounded-md"></div>
                        </div>
                    ) : (
                        <>
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
                                        <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><UserIcon size={16} className="mr-2"/> Profile</Link>
                                        <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Settings size={16} className="mr-2"/> Settings</Link>
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
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;