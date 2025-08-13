"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Calendar,
    DoorOpen,
    FileText,
    BarChart2,
    Users,
    Settings,
    ChevronDown,
    X,
    LucideProps,
    Video
} from 'lucide-react';
import React, { useState, useEffect, useRef, ForwardRefExoticComponent, RefAttributes } from 'react';
import useMediaQuery from "@/app/dashboard/hooks/useMediaQuery";
import useOutsideClick from "@/app/dashboard/hooks/useOutsideClick";
import {DefaultButton} from "@/app/dashboard/components/DefaultButton";



// Custom hook to get pathname on client-side to avoid next/navigation dependency
const useClientPathname = () => {
    const [pathname, setPathname] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPathname(window.location.pathname);
        }
    }, []);
    return pathname;
};


// --- TYPE DEFINITION ---
type NavItemType = {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    label: string;
    link?: string;
    children?: { label: string; link: string; }[];
};


// --- NAVIGATION ITEMS ---
const employeeNavItems: NavItemType[] = [
    { icon: LayoutGrid, label: 'Dashboard', link: '/dashboard' },
    { icon: Calendar, label: 'Calendar', link: '/dashboard/calendar' },
    { icon: DoorOpen, label: 'Rooms', link: '/dashboard/rooms' },
    { icon: FileText, label: 'Minutes', link: '/dashboard/minutes' },
];

const adminNavItems: NavItemType[] = [
    { icon: LayoutGrid, label: 'Dashboard', link: '/dashboard' },
    {
        icon: BarChart2,
        label: 'Analytics',
        children: [
            { label: 'Rooms', link: '/dashboard/analytics/rooms' },
            { label: 'Meetings', link: '/dashboard/analytics/meetings' },
            { label: 'Users', link: '/dashboard/analytics/users' },
        ]
    },
    { icon: Calendar, label: 'Calendar', link: '/dashboard/calendar' },
    { icon: DoorOpen, label: 'Rooms', link: '/dashboard/rooms' },
    { icon: Users, label: 'Users', link: '/dashboard/users' },
];

const guestNavItems: NavItemType[] = [
    { icon: Video, label: 'Dashboard', link: '/dashboard' },
];

const NavItem = ({ item }: { item: NavItemType }) => {
    const pathname = useClientPathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (item.children) {
            const isChildActive = item.children.some(child => pathname === child.link);
            if (isChildActive && !isOpen) {
                setIsOpen(true);
            }
        }
    }, [pathname, item.children, isOpen]);

    if (item.children) {
        return (
            <div className="py-1">
                {/* Main container for the two-part button */}
                <div className="flex items-center justify-between w-full p-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors group">
                    {/* Part 1: The Link */}
                    <a href={item.link || '/dashboard/analytics'} className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                    </a>

                    {/* Part 2: The Dropdown Toggle Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex justify-end p-1 flex-grow rounded-md cursor-pointer"
                    >
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* The dropdown content remains the same */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-8"
                        >
                            <ul className="pt-2 space-y-1">
                                {item.children.map(child => {
                                    const isActive = pathname === child.link;
                                    return (
                                        <li key={child.label}>
                                            <a href={child.link} className={`block p-2 rounded-md text-sm ${isActive ? 'bg-slate-100 text-slate-800 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                                                {child.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const isActive = pathname === item.link;
    return (
        <li className="py-1">
            <a href={item.link || '#'} className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
            </a>
        </li>
    );
};

const Sidebar = ({ isOpen, setIsOpen, role }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void, role?: 'admin' | 'employee' | 'guest' }) => {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const sidebarRef = useRef(null);

    let navItems: NavItemType[];
    switch (role) {
        case 'admin':
            navItems = adminNavItems;
            break;
        case 'guest':
            navItems = guestNavItems;
            break;
        default:
            navItems = employeeNavItems;
            break;
    }

    useOutsideClick(sidebarRef, () => {
        if (isOpen && !isDesktop) {
            setIsOpen(false);
        }
    });

    return (
        <>
            <AnimatePresence>
                {isOpen && !isDesktop && <motion.div className="fixed inset-0 bg-black/30 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} />}
            </AnimatePresence>
            <motion.div
                ref={sidebarRef}
                variants={{ open: { x: 0 }, closed: { x: '-100%' } }}
                initial="closed"
                animate={(isDesktop || isOpen) ? "open" : "closed"}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-64 bg-white z-50 lg:relative lg:translate-x-0 flex-shrink-0 border-r border-slate-200"
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <h1 className="text-xl font-bold text-slate-800">SmartMeet</h1>
                    </div>
                    {/* Close button for smaller screens */}
                    <DefaultButton variant={"minimal"} onClick={() => setIsOpen(false)} className="lg:hidden"><X size={24} /></DefaultButton>
                </div>
                <nav className="px-3">
                    <ul>
                        {navItems.map((item, index) => (
                            <NavItem key={index} item={item} />
                        ))}
                    </ul>
                </nav>
            </motion.div>
        </>
    );
};

export default Sidebar;