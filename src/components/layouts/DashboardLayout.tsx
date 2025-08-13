'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Users,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    Plus,
    Video,
    TrendingUp,
    Clock,
    MapPin,
    Search,
    ChevronDown,
    ChevronRight,
    BarChart3,
    UserCheck,
    Building,
    FileBarChart
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const base = "/dashboard";

const navigation = [
    { name: 'Dashboard', href: base, icon: Home },
    { name: 'Meetings', href: `${base}/meetings`, icon: Calendar },
    { name: 'Rooms', href: `${base}/rooms`, icon: Users },
    { name: 'Minutes', href: `${base}/minutes`, icon: FileText },
    {
        name: 'Analytics',
        href: `${base}/analytics`,
        icon: TrendingUp,
        hasSubmenu: true,
        submenu: [
            { name: 'Bookings', href: `${base}/analytics/bookings`, icon: Calendar },
            { name: 'Users', href: `${base}/analytics/users`, icon: UserCheck },
            { name: 'Meetings', href: `${base}/analytics/meetings`, icon: BarChart3 },
            { name: 'Rooms', href: `${base}/analytics/rooms`, icon: Building },
            { name: 'Reports', href: `${base}/analytics/reports`, icon: FileBarChart },
        ]
    },
    { name: 'Notifications', href: `${base}/notifications`, icon: Bell },
];

const quickActions = [
    { name: 'Schedule Meeting', href: `${base}/meetings/schedule`, icon: Plus, color: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
    { name: 'Join Meeting', href: `${base}/meetings/join`, icon: Video, color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
    { name: 'View Minutes', href: `${base}/minutes`, icon: FileText, color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [dragStartX, setDragStartX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const toggleSubmenu = (menuName: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches[0].clientX < 20) {
            setDragStartX(e.touches[0].clientX);
            setIsDragging(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging && e.touches[0].clientX - dragStartX > 50) {
            setSidebarOpen(true);
            setIsDragging(false);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            className="min-h-screen bg-gray-100 relative overflow-x-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="min-w-[1024px] lg:min-w-0 lg:flex relative overflow-hidden">
                {/* Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-slate-900/10 transform transition-all duration-300 ease-in-out
                    lg:fixed lg:inset-y-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex flex-col h-screen">
                        {/* Logo */}
                        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                            <div className="flex items-center space-x-3">
                                <Link href={"/dashboard"} className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        SmartMeet
                                    </h1>
                                </Link>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="px-6 py-6 border-b border-slate-200/60">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                            <div className="space-y-3">
                                {quickActions.map((action) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <Link
                                            key={action.name}
                                            href={action.href}
                                            className={`flex items-center w-full px-4 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200 transform ${action.color}`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <IconComponent className="w-4 h-4 mr-3" />
                                            {action.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Navigation</h3>
                            {navigation.map((item) => {
                                const IconComponent = item.icon;
                                const active = isActive(item.href);
                                const expanded = expandedMenus[item.name];

                                return (
                                    <div key={item.name}>
                                        {item.hasSubmenu ? (
                                            <div>
                                                <button
                                                    onClick={() => toggleSubmenu(item.name)}
                                                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                                                        active
                                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg shadow-blue-500/10 border border-blue-200/50'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                                >
                                                    <IconComponent className={`w-5 h-5 mr-3 transition-colors ${
                                                        active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                                                    }`} />
                                                    {item.name}
                                                    <div className="ml-auto">
                                                        {expanded ? (
                                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                </button>

                                                {expanded && item.submenu && (
                                                    <div className="mt-2 ml-4 space-y-1">
                                                        {item.submenu.map((subItem) => {
                                                            const SubIconComponent = subItem.icon;
                                                            const subActive = isActive(subItem.href);

                                                            return (
                                                                <Link
                                                                    key={subItem.name}
                                                                    href={subItem.href}
                                                                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group ${
                                                                        subActive
                                                                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                                                    }`}
                                                                    onClick={() => setSidebarOpen(false)}
                                                                >
                                                                    <SubIconComponent className={`w-4 h-4 mr-3 transition-colors ${
                                                                        subActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                                                                    }`} />
                                                                    {subItem.name}
                                                                    {subActive && (
                                                                        <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                                                    active
                                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg shadow-blue-500/10 border border-blue-200/50'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <IconComponent className={`w-5 h-5 mr-3 transition-colors ${
                                                    active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                                                }`} />
                                                {item.name}
                                                {active && (
                                                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                )}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Sliding Handle for Mobile */}
                <div className="lg:hidden fixed left-0 top-1/2 transform -translate-y-1/2 z-40">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="bg-white/90 backdrop-blur-xl rounded-r-2xl shadow-xl border border-white/20 hover:bg-white hover:scale-105 transition-all duration-200 p-3"
                    >
                        <div className="flex flex-col space-y-1">
                            <div className="w-4 h-0.5 bg-slate-600 rounded"></div>
                            <div className="w-4 h-0.5 bg-slate-600 rounded"></div>
                            <div className="w-4 h-0.5 bg-slate-600 rounded"></div>
                        </div>
                    </button>
                </div>

                {/* Main content */}
                <div className="lg:flex-1 min-w-0 lg:ml-72">
                    {/* Top Header with Search and User Info */}
                    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
                            {/* Search Bar */}
                            <div className="flex-1 max-w-2xl">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search meetings, rooms, or minutes..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black placeholder-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Right side - Notifications and User Menu */}
                            <div className="flex items-center space-x-4 ml-6">
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setNotificationOpen(!notificationOpen)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative"
                                    >
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                    </button>

                                    {/* Notification Dropdown */}
                                    {notificationOpen && (
                                        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                                                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900">Meeting reminder</p>
                                                            <p className="text-xs text-slate-500 mt-1">Your meeting with the design team starts in 15 minutes</p>
                                                            <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900">Room booking confirmed</p>
                                                            <p className="text-xs text-slate-500 mt-1">Conference Room A has been booked for tomorrow at 2 PM</p>
                                                            <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900">Meeting minutes available</p>
                                                            <p className="text-xs text-slate-500 mt-1">Meeting minutes for "Q4 Planning Session" are now available for review</p>
                                                            <p className="text-xs text-slate-400 mt-1">3 hours ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900">New team member added</p>
                                                            <p className="text-xs text-slate-500 mt-1">Sarah Johnson has been added to the Marketing team</p>
                                                            <p className="text-xs text-slate-400 mt-1">1 day ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900">System update completed</p>
                                                            <p className="text-xs text-slate-500 mt-1">SmartMeet has been updated to version 2.1.0 with new features and improvements</p>
                                                            <p className="text-xs text-slate-400 mt-1">2 days ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                    View all notifications
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-xs font-bold text-white">JD</span>
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold text-slate-900">John Doe</p>
                                            <p className="text-xs text-slate-500">john@company.com</p>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-slate-200">
                                                <p className="text-sm font-semibold text-slate-900">John Doe</p>
                                                <p className="text-xs text-slate-500">john@company.com</p>
                                            </div>
                                            <Link
                                                href={`${base}/settings`}
                                                className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4 mr-3 text-slate-400" />
                                                Settings
                                            </Link>
                                            <button className="flex items-center w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <LogOut className="w-4 h-4 mr-3 text-slate-400" />
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="p-6 lg:p-8">
                        {children}
                    </main>
                </div>

                {/* Click outside to close menus */}
                {(userMenuOpen || notificationOpen || sidebarOpen) && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setUserMenuOpen(false);
                            setNotificationOpen(false);
                            setSidebarOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}