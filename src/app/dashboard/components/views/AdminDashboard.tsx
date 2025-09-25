"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Video, DoorOpen, Users, AlertTriangle, UserPlus, Building, MessageSquare, Download, Settings, Bell, Clock, MoreVertical, Edit, Trash2, Shield, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import ActivityFeed from "@/app/dashboard/components/ActivityFeed";
import { DefaultButton } from "@/app/dashboard/components/DefaultButton";
import { useSession } from "next-auth/react";
import { useToast } from '@/app/dashboard/components/Toast';
import api from '@/lib/api';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

// Data Types
interface DashboardStats {
    totalMeetingsToday: number;
    activeRooms: number;
    totalRooms: number;
    activeUsers: number;
    issuesReported: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    roleId: number;
    createdAt: string;
    updatedAt: string;
}

interface Room {
    id: number;
    name: string;
    capacity: number;
    location?: string;
    status?: string;
}

interface AnalyticsData {
    meetingTrend: Array<{ name: string; meetings: number }>;
    roomUtilization: Array<{ name: string; value: number }>;
}

// Color schemes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- REUSABLE COMPONENTS ---
const AnimatedWrapper = ({ children, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
        {children}
    </motion.div>
);

const KPIStatCard = ({ icon: Icon, title, value, change, color, delay, isLoading }) => (
    <AnimatedWrapper delay={delay}>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    {isLoading ? (
                        <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
            </div>
            {change && !isLoading && <p className="text-xs text-slate-500 mt-2">{change}</p>}
        </div>
    </AnimatedWrapper>
);

// --- STABLE CHART COMPONENTS (moved outside to prevent recreation) ---
const MeetingTrendChart = React.memo(({ data, isLoading }) => (
    <AnimatedWrapper delay={0.5}>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Meeting Trends</h3>
                <a href="/dashboard/analytics/meetings">
                    <DefaultButton variant="outline" size="sm">View Details</DefaultButton>
                </a>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-80">
                    <ContentSpinner />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={data?.meetingTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                        <Line type="monotone" dataKey="meetings" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    </AnimatedWrapper>
));

const RoomUtilizationChart = React.memo(({ data, isLoading }) => (
    <AnimatedWrapper delay={0.6}>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Room Utilization</h3>
                <a href="/dashboard/analytics/rooms">
                    <DefaultButton variant="outline" size="sm">View Details</DefaultButton>
                </a>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-80">
                    <ContentSpinner />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={data?.roomUtilization}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {data?.roomUtilization?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    </AnimatedWrapper>
));

// --- CUSTOM HOOKS ---
const useAnalyticsData = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/api/Analytics/Overview');
                const data = response.data;

                setAnalyticsData({
                    meetingTrend: data.meetingTrend || [],
                    roomUtilization: data.roomPopularity?.map(room => ({
                        name: room.name,
                        value: room.bookings
                    })) || []
                });
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
                setAnalyticsData({
                    meetingTrend: [],
                    roomUtilization: []
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return { analyticsData, isLoading };
};

// --- DASHBOARD WIDGETS ---
const UserManagementTable = React.memo(() => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/Users');
                const allUsers = response.data.users || [];
                // --- THIS IS THE FIX ---
                // Sort users by createdAt date from newest to oldest
                const sortedUsers = allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                const latestUsers = sortedUsers.slice(0, 7);
                setUsers(latestUsers);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Failed to load users");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getRoleClass = (roleId: number) => {
        if (roleId === 1) return 'bg-indigo-100 text-indigo-700';
        if (roleId === 2) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
    };

    const getRoleName = (roleId: number) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Employee';
            case 3: return 'Guest';
            default: return 'Unknown';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <AnimatedWrapper delay={0.3}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800">Recent Users</h3>
                    <div className="flex space-x-2">
                        <a href="/dashboard/users/add">
                            <DefaultButton size="sm">
                                <UserPlus size={16} className="mr-2" /> Add User
                            </DefaultButton>
                        </a>
                        <a href="/dashboard/users">
                            <DefaultButton variant="outline" size="sm">
                                View All
                            </DefaultButton>
                        </a>
                    </div>
                </div>

                <div className="overflow-y-auto h-96 flex-grow pr-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <ContentSpinner />
                            <p className="text-sm text-slate-500 mt-2">Loading users...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-600">
                            <AlertTriangle size={24} className="mb-2" />
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 text-slate-500 sticky top-0 bg-white">
                            <tr>
                                <th className="p-3">User</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Added</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3">
                                        <p className="font-semibold text-slate-800">{user.name}</p>
                                        <p className="text-slate-500 text-xs">{user.email}</p>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleClass(user.roleId)}`}>
                                            {getRoleName(user.roleId)}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600 text-xs">{getTimeAgo(user.createdAt)}</td>
                                    <td className="p-3 text-right">
                                        <a href={`/dashboard/users/edit/${user.id}`}>
                                            <DefaultButton variant="secondary" size="sm">
                                                <Edit size={14} />
                                            </DefaultButton>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AnimatedWrapper>
    );
});

const RoomManagementWidget = React.memo(() => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/Rooms');
                const latestRooms = (response.data.rooms || []).slice(0, 5);
                setRooms(latestRooms);
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const getStatusClass = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-700';
            case 'occupied':
                return 'bg-red-100 text-red-700';
            case 'maintenance':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AnimatedWrapper delay={0.4}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Room Status</h3>
                    <div className="flex space-x-2">
                        <a href="/dashboard/rooms/add">
                            <DefaultButton size="sm">
                                <Building size={16} className="mr-2" /> Add Room
                            </DefaultButton>
                        </a>
                        <a href="/dashboard/rooms">
                            <DefaultButton variant="outline" size="sm">
                                View All
                            </DefaultButton>
                        </a>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <ContentSpinner />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rooms.map(room => (
                            <div key={room.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                                <div className="flex items-center">
                                    <div className="p-2 bg-slate-100 rounded-lg mr-4">
                                        <Building className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{room.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {room.capacity} people • {room.location || 'Location not set'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(room.status)}`}>
                                        {room.status || 'Available'}
                                    </span>
                                    <a href={`/dashboard/rooms/edit/${room.id}`}>
                                        <DefaultButton variant="secondary" size="sm">
                                            <Settings size={14} />
                                        </DefaultButton>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AnimatedWrapper>
    );
});

const QuickActions = React.memo(() => (
    <AnimatedWrapper delay={0.7}>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
                <a href="/dashboard/analytics">
                    <DefaultButton variant="outline" className="w-full justify-start">
                        <MessageSquare size={16} className="mr-3" />
                        View Full Analytics
                    </DefaultButton>
                </a>
                <a href="/dashboard/users">
                    <DefaultButton variant="outline" className="w-full justify-start">
                        <Users size={16} className="mr-3" />
                        Manage Users
                    </DefaultButton>
                </a>
                <a href="/dashboard/rooms">
                    <DefaultButton variant="outline" className="w-full justify-start">
                        <Building size={16} className="mr-3" />
                        Manage Rooms
                    </DefaultButton>
                </a>
                <DefaultButton variant="outline" className="w-full justify-start">
                    <Download size={16} className="mr-3" />
                    Export Reports
                </DefaultButton>
            </div>
        </div>
    </AnimatedWrapper>
));

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export const AdminDashboard = () => {
    const { data: session } = useSession();
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalMeetingsToday: 0,
        activeRooms: 0,
        totalRooms: 0,
        activeUsers: 0,
        issuesReported: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Use the custom hook for analytics data
    const { analyticsData, isLoading: analyticsLoading } = useAnalyticsData();

    // Memoize KPI data to prevent unnecessary re-renders
    const kpiData = useMemo(() => [
        {
            icon: Video,
            title: "Meetings This Month",
            value: dashboardStats.totalMeetingsToday,
            change: "Based on current data",
            color: "blue",
            delay: 0.1
        },
        {
            icon: DoorOpen,
            title: "Rooms in Use",
            value: `${dashboardStats.activeRooms} / ${dashboardStats.totalRooms}`,
            change: `${dashboardStats.totalRooms > 0 ? Math.round((dashboardStats.activeRooms / dashboardStats.totalRooms) * 100) : 0}% utilization`,
            color: "green",
            delay: 0.15
        },
        {
            icon: Users,
            title: "Total Users",
            value: dashboardStats.activeUsers,
            change: "Registered users",
            color: "indigo",
            delay: 0.2
        },
        {
            icon: AlertTriangle,
            title: "System Status",
            value: "Online",
            change: "All systems operational",
            color: "yellow",
            delay: 0.25
        },
    ], [dashboardStats]);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const [usersResponse, roomsResponse, analyticsResponse] = await Promise.allSettled([
                    api.get('/Users'),
                    api.get('/Rooms'),
                    api.get('/api/Analytics/Overview').catch(() => ({ data: {} }))
                ]);

                const users = usersResponse.status === 'fulfilled' ? usersResponse.value.data.users || [] : [];
                const rooms = roomsResponse.status === 'fulfilled' ? roomsResponse.value.data.rooms || [] : [];
                const analytics = analyticsResponse.status === 'fulfilled' ? analyticsResponse.value.data : {};

                setDashboardStats({
                    totalMeetingsToday: analytics.meetingsThisMonth || 0,
                    activeRooms: rooms.filter(room => room.status === 'occupied').length,
                    totalRooms: rooms.length,
                    activeUsers: users.length,
                    issuesReported: 0
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchDashboardStats();
    }, []);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-6"
            >
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                        Welcome back, {session?.user?.name || 'Administrator'}
                    </h2>
                    <p className="text-slate-500 mt-1">Here's what's happening with your meeting rooms today.</p>
                </div>
                <div className="flex space-x-3">
                    <a href="/dashboard/analytics">
                        <DefaultButton variant="outline">
                            <MessageSquare size={18} className="mr-2" /> Analytics
                        </DefaultButton>
                    </a>
                    <a href="/dashboard/users/add">
                        <DefaultButton>
                            <UserPlus size={18} className="mr-2" /> Add User
                        </DefaultButton>
                    </a>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpiData.map(kpi => (
                    <KPIStatCard key={kpi.title} {...kpi} isLoading={isLoadingStats} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <UserManagementTable />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <MeetingTrendChart data={analyticsData} isLoading={analyticsLoading} />
                <RoomUtilizationChart data={analyticsData} isLoading={analyticsLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <RoomManagementWidget />
                </div>
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
            </div>
        </>
    );
};