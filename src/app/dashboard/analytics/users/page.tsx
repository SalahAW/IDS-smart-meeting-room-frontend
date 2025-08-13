"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Video } from 'lucide-react';

// --- MOCK DATA ---
const userLeaderboardData = [
    { name: 'Jane Smith', meetingsHosted: 22, meetingsAttended: 45, department: 'Engineering' },
    { name: 'John Doe', meetingsHosted: 18, meetingsAttended: 52, department: 'Marketing' },
    { name: 'Mike Ross', meetingsHosted: 15, meetingsAttended: 38, department: 'Design' },
    { name: 'Alice Brown', meetingsHosted: 12, meetingsAttended: 60, department: 'Sales' },
    { name: 'Sam Wilson', meetingsHosted: 10, meetingsAttended: 35, department: 'HR' },
];

const LeaderboardItem = ({ rank, user }) => (
    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
        <div className="w-8 text-lg font-bold text-slate-500">{rank}</div>
        <img src={`https://placehold.co/40x40/E2E8F0/475569?text=${user.name.charAt(0)}`} alt={user.name} className="w-10 h-10 rounded-full mx-4" />
        <div className="flex-grow">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-slate-500">{user.department}</p>
        </div>
        <div className="flex items-center space-x-6 text-right">
            <div>
                <p className="font-bold text-slate-700">{user.meetingsHosted}</p>
                <p className="text-xs text-slate-500">Hosted</p>
            </div>
            <div>
                <p className="font-bold text-slate-700">{user.meetingsAttended}</p>
                <p className="text-xs text-slate-500">Attended</p>
            </div>
        </div>
    </div>
);


const UserAnalyticsPage = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <a href="/dashboard/analytics" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to Analytics Overview
            </a>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">User Analytics</h2>
                <p className="text-slate-500 mt-1">Understand meeting habits and identify power users.</p>
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                <h3 className="font-bold text-slate-800 mb-4">Activity Leaderboard</h3>
                <div className="space-y-3">
                    {userLeaderboardData.map((user, index) => (
                        <LeaderboardItem key={user.name} rank={index + 1} user={user} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default UserAnalyticsPage;
