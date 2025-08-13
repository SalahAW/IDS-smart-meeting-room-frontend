"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';

// --- MOCK DATA ---
const roomUtilizationData = [
    { name: 'Orion', utilization: 85 }, { name: 'Pegasus', utilization: 72 },
    { name: 'Andromeda', utilization: 68 }, { name: 'Cygnus', utilization: 55 },
    { name: 'Draco', utilization: 40 }, { name: 'Lyra', utilization: 32 },
];
const peakHoursData = [
    { hour: '9 AM', bookings: 25 }, { hour: '10 AM', bookings: 45 }, { hour: '11 AM', bookings: 50 },
    { hour: '1 PM', bookings: 38 }, { hour: '2 PM', bookings: 60 }, { hour: '3 PM', bookings: 48 },
];
const roomTypeData = [ { name: 'Conference Room', value: 4 }, { name: 'Huddle Room', value: 2 } ];
const COLORS = ['#0088FE', '#00C49F'];

const AnalyticsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
        <div className="h-72">{children}</div>
    </div>
);

const RoomAnalyticsPage = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <a href="/dashboard/analytics" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to Analytics Overview
            </a>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Room Analytics</h2>
                <p className="text-slate-500 mt-1">Detailed insights into meeting room utilization and trends.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <AnalyticsCard title="Room Utilization Rate (%)">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roomUtilizationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                            <Bar dataKey="utilization" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </AnalyticsCard>

                <AnalyticsCard title="Peak Booking Hours">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakHoursData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                            <Bar dataKey="bookings" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </AnalyticsCard>

                <AnalyticsCard title="Bookings by Room Type">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={roomTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                                {roomTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </AnalyticsCard>
            </div>
        </motion.div>
    );
};

export default RoomAnalyticsPage;