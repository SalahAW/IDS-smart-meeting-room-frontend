"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserPlus, Shield, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';

// --- Data Types (The New API Contract) ---
interface UserRoleCountDto {
    RoleName: string;
    Count: number;
}
interface UserActivityDto {
    UserName: string;
    ActivityScore: number;
}
interface UserAnalyticsDto {
    totalUsers: number;
    newUsersThisMonth: number;
    roleDistribution: UserRoleCountDto[];
    mostActiveUsers: UserActivityDto[];
}

// --- Reusable Components ---
const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color.bg}`}><Icon className={`h-6 w-6 ${color.text}`} /></div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
        </div>
    </div>
);
const AnalyticsSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 w-1/2 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-1/3 bg-slate-200 rounded-md mt-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="h-96 bg-slate-200 rounded-2xl lg:col-span-2"></div>
            <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
    </div>
);


const UserAnalyticsPage = () => {
    const { data: session, status } = useSession({ required: true });
    const [data, setData] = useState<UserAnalyticsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAnalytics = async () => {
            try {
                const response = await api.get<UserAnalyticsDto>('/api/Analytics/Users');
                setData(response.data);
            } catch (err) {
                setError("Could not load user analytics. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAnalytics();
    }, []);

    if (status === 'loading' || isLoading) {
        return <AnalyticsSkeleton />;
    }
    if (session.user.role !== 'admin') {
        return ( <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-lg shadow-md"><Shield size={64} className="text-red-500 mb-4" /><h1 className="text-2xl font-bold text-slate-800">Access Denied</h1></div> );
    }
    if (error) {
        return <div className="text-center py-20 text-red-600">{error}</div>;
    }

    const BAR_COLORS = ["#3b82f6", "#8b5cf6", "#a855f7"];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">User Analytics</h2>
                <p className="text-slate-500 mt-1">Key insights into your user base and their engagement.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={Users} title="Total Users" value={data?.totalUsers || 0} color={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                <StatCard icon={UserPlus} title="New This Month" value={data?.newUsersThisMonth || 0} color={{bg: 'bg-green-100', text: 'text-green-600'}} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">User Role Distribution</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.roleDistribution || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="RoleName" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                                <Bar dataKey="Count" name="Users" radius={[4, 4, 0, 0]}>
                                    {(data?.roleDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 h-full">
                    <div className="flex items-center mb-4">
                        <Star className="h-5 w-5 text-slate-500 mr-2" />
                        <h3 className="font-bold text-slate-800">Most Active Users</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Based on meetings created & attended.</p>
                    <ul className="space-y-3">
                        {(data && data.mostActiveUsers.length > 0) ? data.mostActiveUsers.map((item, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 truncate font-medium">{index + 1}. {item.UserName}</span>
                                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{item.ActivityScore} activities</span>
                            </li>
                        )) : <p className="text-sm text-slate-400 text-center py-8">No user activity data available yet.</p>}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

export default UserAnalyticsPage;