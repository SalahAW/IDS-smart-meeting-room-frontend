"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, Users, Percent, Shield, Calendar, Hourglass } from 'lucide-react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';

// --- Data Types (Unchanged) ---
interface HourlyUsageDto {
    Hour: string;
    Meetings: number;
}
interface DailyUsageDto {
    Day: string;
    Meetings: number;
}
interface RoomAnalyticsDto {
    overallUtilizationPercentage: number;
    totalBookingHours: number;
    averageMeetingDurationMinutes: number;
    usageByHour: HourlyUsageDto[];
    usageByDay: DailyUsageDto[];
}

// --- Reusable Components (Unchanged) ---
const StatCard = ({ icon: Icon, title, value, unit, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color.bg}`}>
                <Icon className={`h-6 w-6 ${color.text}`} />
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{value} <span className="text-lg font-medium text-slate-400">{unit}</span></p>
            </div>
        </div>
    </div>
);
const AnalyticsSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 w-1/2 bg-slate-200 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-80 bg-slate-200 rounded-2xl"></div>
            <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
    </div>
);

const RoomAnalyticsPage = () => {
    const { data: session, status } = useSession({ required: true });
    const [data, setData] = useState<RoomAnalyticsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoomAnalytics = async () => {
            setIsLoading(true);
            try {
                // The api object from @/lib/api will automatically add the auth token
                const response = await api.get<RoomAnalyticsDto>('/api/Analytics/Rooms');
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch room analytics:", err);
                setError("Could not load room analytics. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        // MINIMAL CHANGE: Only fetch data when the session is authenticated.
        if (status === 'authenticated') {
            fetchRoomAnalytics();
        }
    }, [status]); // MINIMAL CHANGE: Add 'status' as a dependency.

    if (status === 'loading' || isLoading) {
        return <AnalyticsSkeleton />;
    }

    if (session?.user?.role !== 'admin') {
        return ( <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-lg shadow-md"><Shield size={64} className="text-red-500 mb-4" /><h1 className="text-2xl font-bold text-slate-800">Access Denied</h1><p className="text-slate-600 mt-2">You do not have permission to view analytics.</p></div> );
    }

    if (error) {
        return <div className="text-center py-20 text-red-600">{error}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Room Analytics</h2>
                <p className="text-slate-500 mt-1">Insights into room usage and booking patterns over the last 30 days.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Percent} title="Overall Utilization" value={data?.overallUtilizationPercentage || 0} unit="%" color={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                <StatCard icon={Hourglass} title="Total Booking Hours" value={data?.totalBookingHours || 0} unit="hours" color={{bg: 'bg-green-100', text: 'text-green-600'}} />
                <StatCard icon={Clock} title="Avg. Meeting Duration" value={data?.averageMeetingDurationMinutes || 0} unit="mins" color={{bg: 'bg-yellow-100', text: 'text-yellow-600'}} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">Busiest Times of Day</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.usageByHour || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="Hour" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                                <Area type="monotone" dataKey="Meetings" stroke="#10b981" fill="#a7f3d0" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">Busiest Days of the Week</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.usageByDay || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="Day" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                                <Bar dataKey="Meetings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomAnalyticsPage;