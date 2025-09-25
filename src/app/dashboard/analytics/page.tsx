"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DoorOpen, Video, Users, ArrowRight, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import ContentSpinner from '../components/ContentLoadingSpinner';

// --- Data Types (The API Contract) ---
interface MonthlyMeetingData {
    name: string;
    meetings: number;
}
interface RoomBookingData {
    name: string;
    bookings: number;
}
interface AnalyticsOverviewData {
    busiestRoomName: string;
    meetingsThisMonth: number;
    mostActiveOrganizerName: string;
    meetingTrend: MonthlyMeetingData[];
    roomPopularity: RoomBookingData[];
}

// --- Reusable Components ---
const StatCard = React.memo(({ icon: Icon, title, value, description, link, color }) => (
    <a href={link} className="block bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-start justify-between">
            <div>
                <p className={`text-sm font-semibold ${color}`}>{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
            <div className="p-3 rounded-full bg-slate-100">
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
        </div>
        <div className="mt-4 text-sm font-semibold text-slate-500 group-hover:text-blue-600 flex items-center">
            View Report <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
    </a>
));

const AnalyticsSkeleton = React.memo(() => (
    <div className="animate-pulse">
        <div className="h-8 w-3/4 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-1/2 bg-slate-200 rounded-md mt-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="h-36 bg-slate-200 rounded-2xl"></div>
            <div className="h-36 bg-slate-200 rounded-2xl"></div>
            <div className="h-36 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="h-80 bg-slate-200 rounded-2xl"></div>
            <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
    </div>
));

// --- Chart Components (Stable) ---
const MeetingTrendChart = React.memo(({ data }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <h3 className="font-bold text-slate-800 mb-4">Meeting Trend (Last 5 Months)</h3>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="meetings" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
));

const RoomPopularityChart = React.memo(({ data }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <h3 className="font-bold text-slate-800 mb-4">Room Popularity</h3>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                    <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} background={{ fill: '#f1f5f9', radius: 4 }}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
));

// --- Custom Hook ---
const useAnalyticsOverview = () => {
    const [data, setData] = useState<AnalyticsOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get<AnalyticsOverviewData>('/api/Analytics/Overview');
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
                setError("Could not load analytics overview. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return { data, isLoading, error };
};

// --- Main Component ---
const AnalyticsOverviewPage = () => {
    const { data: session, status } = useSession({ required: true });
    const { data, isLoading, error } = useAnalyticsOverview();

    // Memoize stat cards data to prevent unnecessary re-renders
    const statCardsData = useMemo(() => [
        {
            icon: DoorOpen,
            title: "Room Analytics",
            value: data?.busiestRoomName || 'N/A',
            description: "Busiest Meeting Room",
            link: "/dashboard/analytics/rooms",
            color: "text-purple-600"
        },
        {
            icon: Video,
            title: "Meeting Analytics",
            value: data?.meetingsThisMonth?.toString() || '0',
            description: "Meetings this month",
            link: "/dashboard/analytics/meetings",
            color: "text-blue-600"
        },
        {
            icon: Users,
            title: "User Analytics",
            value: data?.mostActiveOrganizerName || 'N/A',
            description: "Most Active Organizer",
            link: "/dashboard/analytics/users",
            color: "text-green-600"
        }
    ], [data]);

    if (status === 'loading') {
        return <AnalyticsSkeleton />;
    }

    if (session?.user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-lg shadow-md">
                <Shield size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
                <p className="text-slate-600 mt-2">You do not have permission to view analytics.</p>
            </div>
        );
    }

    if (isLoading) {
        return <AnalyticsSkeleton />;
    }

    if (error) {
        return <div className="text-center py-20 text-red-600">{error}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Analytics Overview</h2>
                <p className="text-slate-500 mt-1">A high-level summary of your organization's meeting activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {statCardsData.map((cardData, index) => (
                    <StatCard key={`${cardData.title}-${index}`} {...cardData} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <MeetingTrendChart data={data?.meetingTrend} />
                <RoomPopularityChart data={data?.roomPopularity} />
            </div>
        </motion.div>
    );
};

export default AnalyticsOverviewPage;