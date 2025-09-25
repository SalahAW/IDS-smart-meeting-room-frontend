"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Video, Users, CheckSquare, XSquare, Clock, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';

// --- Data Types (The API Contract) ---
interface MeetingStatusDto {
    StatusName: string;
    Count: number;
}
interface MeetingDurationDto {
    Title: string;
    DurationMinutes: number;
}
interface MeetingAnalyticsDto {
    totalMeetings: number;
    averageAttendees: number;
    statusDistribution: MeetingStatusDto[];
    longestMeetings: MeetingDurationDto[];
}

// --- Reusable Components ---
const StatCard = ({ icon: Icon, title, value, unit, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color.bg}`}><Icon className={`h-6 w-6 ${color.text}`} /></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
            <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-80 bg-slate-200 rounded-2xl"></div>
            <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
    </div>
);

const MeetingAnalyticsPage = () => {
    const { data: session, status } = useSession({ required: true });
    const [data, setData] = useState<MeetingAnalyticsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeetingAnalytics = async () => {
            setIsLoading(true);
            try {
                // The api object from @/lib/api will automatically add the auth token
                const response = await api.get<MeetingAnalyticsDto>('/api/Analytics/Meetings');
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch meeting analytics:", err);
                setError("Could not load meeting analytics. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        // MINIMAL CHANGE: Only fetch data when the session is authenticated.
        if (status === 'authenticated') {
            fetchMeetingAnalytics();
        }
    }, [status]); // MINIMAL CHANGE: Add 'status' as a dependency.

    if (status === 'loading' || isLoading) {
        return <AnalyticsSkeleton />;
    }
    if (session?.user?.role !== 'admin') {
        return ( <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-lg shadow-md"><Shield size={64} className="text-red-500 mb-4" /><h1 className="text-2xl font-bold text-slate-800">Access Denied</h1></div> );
    }
    if (error) {
        return <div className="text-center py-20 text-red-600">{error}</div>;
    }

    const PIE_COLORS = ['#34D399', '#F87171', '#60A5FA', '#FBBF24'];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Meeting Analytics</h2>
                <p className="text-slate-500 mt-1">Insights into meeting patterns over the last 30 days.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard icon={Video} title="Total Meetings" value={data?.totalMeetings || 0} unit="" color={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                <StatCard icon={Users} title="Avg. Attendees / Meeting" value={Math.round(data?.averageAttendees || 0)} unit="" color={{bg: 'bg-purple-100', text: 'text-purple-600'}} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">Meeting Status Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data?.statusDistribution || []} dataKey="Count" nameKey="StatusName" cx="50%" cy="50%" outerRadius={100} label>
                                    {(data?.statusDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">Longest Meetings (Top 5)</h3>
                    <ul className="space-y-4">
                        {(data?.longestMeetings || []).map((meeting, index) => (
                            <li key={index} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 truncate">{meeting.Title}</span>
                                <span className="font-semibold text-slate-800">{Math.round(meeting.DurationMinutes)} mins</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

export default MeetingAnalyticsPage;