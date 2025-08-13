"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DoorOpen, Video, Users, ArrowRight } from 'lucide-react';

// --- MOCK DATA ---
const meetingTrendData = [
    { name: 'May', meetings: 120 }, { name: 'Jun', meetings: 150 },
    { name: 'Jul', meetings: 130 }, { name: 'Aug', meetings: 180 },
    { name: 'Sep', meetings: 210 },
];

const roomPopularityData = [
    { name: 'Orion', bookings: 95 }, { name: 'Pegasus', bookings: 80 },
    { name: 'Andromeda', bookings: 75 }, { name: 'Cygnus', bookings: 60 },
    { name: 'Draco', bookings: 45 },
];

const StatCard = ({ icon: Icon, title, value, description, link, color }) => (
    <a href={link} className={`block bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:scale-101 transition-all duration-300 group`}>
        <div className="flex items-start justify-between">
            <div>
                <p className={`text-sm font-semibold ${color}`}>{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
            <div className={`p-3 rounded-full bg-slate-100`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
        </div>
        <div className="mt-4 text-sm font-semibold text-slate-500 group-hover:text-blue-600 flex items-center">
            View Report <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
    </a>
);

const AnalyticsOverviewPage = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Analytics Overview</h2>
                <p className="text-slate-500 mt-1">A high-level summary of your organization's meeting activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <StatCard icon={DoorOpen} title="Room Analytics" value="Orion" description="Busiest Meeting Room" link="/dashboard/analytics/rooms" color="text-purple-600" />
                <StatCard icon={Video} title="Meeting Analytics" value="210" description="Meetings this month" link="/dashboard/analytics/meetings" color="text-blue-600" />
                <StatCard icon={Users} title="User Analytics" value="Jane Smith" description="Most Active Organizer" link="/dashboard/analytics/users" color="text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Meeting Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">Meeting Trend (Last 5 Months)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={meetingTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                                <Line type="monotone" dataKey="meetings" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Room Popularity Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <h3 className="font-bold text-slate-800 mb-4">Room Popularity</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roomPopularityData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                                <Bar dataKey="bookings" fill="#8884d8" radius={[0, 4, 4, 0]} background={{ fill: '#f1f5f9', radius: 4 }}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyticsOverviewPage;