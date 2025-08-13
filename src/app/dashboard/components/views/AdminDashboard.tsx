"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Video, DoorOpen, Users, AlertTriangle, UserPlus, Building, MessageSquare, Download, Settings, Bell, Clock, MoreVertical } from 'lucide-react';
import React from 'react';
import ActivityFeed from "@/app/dashboard/components/ActivityFeed";
import {DefaultButton} from "@/app/dashboard/components/DefaultButton";
import {SessionDebugger} from "@/app/(auth)/SessionDebugger/page";

// --- MOCK DATA (EXPANDED FOR SCROLLING) ---
const weeklyMeetingData = [ { day: 'Mon', meetings: 65 }, { day: 'Tue', meetings: 82 }, { day: 'Wed', meetings: 95 }, { day: 'Thu', meetings: 88 }, { day: 'Fri', meetings: 73 }, { day: 'Sat', meetings: 21 }, { day: 'Sun', meetings: 15 }, ];
const roomUtilizationData = [ { name: 'Orion', value: 400 }, { name: 'Cygnus', value: 300 }, { name: 'Pegasus', value: 300 }, { name: 'Andromeda', value: 200 }, { name: 'Other', value: 278 }, ];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const usersData = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', status: 'Active', lastLogin: '2h ago' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Admin', status: 'Active', lastLogin: '15m ago' },
    { id: 3, name: 'Sam Wilson', email: 'sam.wilson@example.com', role: 'Employee', status: 'Inactive', lastLogin: '3d ago' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@guest.com', role: 'Guest', status: 'Active', lastLogin: '1d ago' },
    { id: 5, name: 'Mike Ross', email: 'mike.ross@example.com', role: 'Employee', status: 'Active', lastLogin: '5h ago' },
    { id: 6, name: 'Harvey Specter', email: 'harvey.specter@example.com', role: 'Admin', status: 'Active', lastLogin: '1h ago' },
    { id: 7, name: 'Donna Paulsen', email: 'donna.paulsen@example.com', role: 'Employee', status: 'Inactive', lastLogin: '7d ago' },
];


// --- REUSABLE COMPONENTS ---
const AnimatedWrapper = ({ children, delay = 0 }) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}> {children} </motion.div> );
const KPIStatCard = ({ icon: Icon, title, value, change, color, delay }) => ( <AnimatedWrapper delay={delay}> <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm"> <div className="flex items-start justify-between"> <div className="flex flex-col"> <p className="text-sm font-medium text-slate-500">{title}</p> <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p> </div> <div className={`p-3 rounded-full bg-${color}-100`}><Icon className={`h-6 w-6 text-${color}-600`} /></div> </div> {change && <p className="text-xs text-slate-500 mt-2">{change}</p>} </div> </AnimatedWrapper> );

// --- DASHBOARD WIDGETS (MODIFIED) ---

const UserManagementTable = () => {
    const getStatusClass = (status) => status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600';
    const getRoleClass = (role) => {
        if (role === 'Admin') return 'bg-indigo-100 text-indigo-700';
        if (role === 'Employee') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
    };
    return (
        <AnimatedWrapper delay={0.3}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
                    <a href="/dashboard/users/add">
                        <DefaultButton>
                            <UserPlus size={16} className="mr-2" /> Add User
                        </DefaultButton>
                    </a>
                </div>
                <div className="overflow-y-auto h-96 flex-grow pr-2">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-slate-500 sticky top-0 bg-white">
                        <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Last Login</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usersData.map(user => (
                            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3">
                                    <p className="font-semibold text-slate-800">{user.name}</p>
                                    <p className="text-slate-500">{user.email}</p>
                                </td>
                                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleClass(user.role)}`}>{user.role}</span></td>
                                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(user.status)}`}>{user.status}</span></td>
                                <td className="p-3 text-slate-600">{user.lastLogin}</td>
                                <td className="p-3 text-right">
                                    <DefaultButton variant={"secondary"} size={"sm"}><MoreVertical size={16} /></DefaultButton>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AnimatedWrapper>
    );
};


const SystemConfiguration = () => {
    const settings = [
        { icon: Clock, title: 'Booking Policies', description: 'Set minimum notice and max duration' },
        { icon: Bell, title: 'Notification Settings', description: 'Manage email and in-app alerts' },
        { icon: Users, title: 'User Roles & Permissions', description: 'Define what each role can see and do' },
    ];
    return (
        <AnimatedWrapper delay={0.5}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">System Configuration</h3>
                <ul className="space-y-3">
                    {settings.map((setting, i) => (
                        <li key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                            <div className="flex items-center">
                                <div className="p-2 bg-slate-100 rounded-lg mr-4"><setting.icon className="h-5 w-5 text-slate-600" /></div>
                                <div>
                                    <p className="font-semibold text-slate-800">{setting.title}</p>
                                    <p className="text-xs text-slate-500">{setting.description}</p>
                                </div>
                            </div>
                            <DefaultButton variant={"secondary"} size={"lg"}><Settings size={18} className="text-slate-400 hover:text-blue-600" /></DefaultButton>
                        </li>
                    ))}
                </ul>
            </div>
        </AnimatedWrapper>
    );
};

const ReportingModule = () => (
    <AnimatedWrapper delay={0.6}>
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex-shrink-0">Generate Reports</h3>
            <div className="space-y-4 flex flex-col flex-grow justify-between">
                <div>
                    <label htmlFor="report-type" className="text-sm font-medium text-slate-700">Report Type</label>
                    <select id="report-type" className="mt-1 block w-full p-2 border border-slate-300 rounded-md text-sm">
                        <option>Room Utilization</option>
                        <option>Meeting Attendance</option>
                        <option>User Activity Log</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="date-range" className="text-sm font-medium text-slate-700">Date Range</label>
                    <input type="date" id="date-range" className="mt-1 block w-full p-2 border border-slate-300 rounded-md text-sm" />
                </div>
                <DefaultButton className="w-full flex items-center justify-center p-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                    <Download size={16} className="mr-2" /> Download Report
                </DefaultButton>
            </div>
        </div>
    </AnimatedWrapper>
);

const MeetingVolumeChart = () => {
    return (
        <AnimatedWrapper delay={0.3}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Meeting Volume (This Week)</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={weeklyMeetingData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                        <Bar dataKey="meetings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AnimatedWrapper>
    );
};

const RoomUtilizationChart = () => {
    return (
        <AnimatedWrapper delay={0.4}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Room Utilization</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie data={roomUtilizationData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                            {roomUtilizationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </AnimatedWrapper>
    );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export const AdminDashboard = () => {
    const kpiData = [
        { icon: Video, title: "Meetings Today", value: "112", change: "+15% from yesterday", color: "blue", delay: 0.1 },
        { icon: DoorOpen, title: "Rooms in Use", value: "8 / 12", change: "66% utilization", color: "green", delay: 0.15 },
        { icon: Users, title: "Active Users", value: "473", change: "Online now", color: "indigo", delay: 0.2 },
        { icon: AlertTriangle, title: "Issues Reported", value: "3", change: "2 new since last login", color: "yellow", delay: 0.25 },
    ];

    return (
        <>
            <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold mb-6 text-slate-900">
                Administrator Overview
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpiData.map(kpi => <KPIStatCard key={kpi.title} {...kpi} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <UserManagementTable />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <MeetingVolumeChart />
                </div>
                <div className="lg:col-span-1">
                    <RoomUtilizationChart />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SystemConfiguration />
                </div>
                <div className="lg:col-span-1">
                    <ReportingModule />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SessionDebugger />
                </div>
            </div>
        </>
    );
};
