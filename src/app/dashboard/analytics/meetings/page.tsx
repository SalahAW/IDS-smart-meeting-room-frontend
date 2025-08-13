"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeft } from 'lucide-react';

// --- MOCK DATA ---
const meetingsByDeptData = [
    { name: 'Engineering', meetings: 85 }, { name: 'Marketing', meetings: 62 },
    { name: 'Sales', meetings: 55 }, { name: 'HR', meetings: 30 },
    { name: 'Design', meetings: 45 },
];
const avgDurationData = [
    { name: 'Engineering', duration: 55 }, { name: 'Marketing', duration: 45 },
    { name: 'Sales', duration: 65 }, { name: 'HR', duration: 30 },
    { name: 'Design', duration: 75 },
];

const AnalyticsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
        <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
        <div className="h-80">{children}</div>
    </div>
);

const MeetingAnalyticsPage = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <a href="/dashboard/analytics" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to Analytics Overview
            </a>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Meeting Analytics</h2>
                <p className="text-slate-500 mt-1">Insights into meeting frequency, duration, and departmental usage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <AnalyticsCard title="Meetings by Department">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={meetingsByDeptData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                            <Bar dataKey="meetings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </AnalyticsCard>

                <AnalyticsCard title="Average Meeting Duration (in mins)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={avgDurationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                            <Line type="monotone" dataKey="duration" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </AnalyticsCard>
            </div>
        </motion.div>
    );
};

export default MeetingAnalyticsPage;