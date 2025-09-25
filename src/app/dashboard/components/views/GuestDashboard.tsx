"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Video, ArrowRight, Users, User, ChevronLeft, ChevronRight, FileText, X, CheckSquare, AlertTriangle } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSession } from "next-auth/react";
import api from '@/lib/api';
import ContentSpinner from "@/app/dashboard/components/ContentLoadingSpinner";

// --- Type Definitions for API Data ---
interface ApiMeeting {
    id: number;
    title: string;
    startTime: string; // ISO String
    hostName: string;
    attendeeCount: number;
    agenda: string;
}

interface Meeting {
    id: number;
    title: string;
    date: string;
    time: string;
    host: string;
    participants: number;
    description: string;
    todos: string[];
}

// --- Meeting Details Modal ---
const MeetingDetailsModal = ({ meeting, onClose }: { meeting: Meeting | null, onClose: () => void }) => {
    // This component remains the same
    const roomImages = [ "https://placehold.co/600x400/E2E8F0/475569?text=Conference+Room", "https://placehold.co/600x400/CBD5E1/475569?text=Whiteboard+Area", "https://placehold.co/600x400/94A3B8/FFFFFF?text=AV+Equipment", ];
    const [currentImage, setCurrentImage] = useState(0);
    useEffect(() => { const timer = setInterval(() => { setCurrentImage(prev => (prev + 1) % roomImages.length); }, 2500); return () => clearInterval(timer); }, [roomImages.length]);
    if (!meeting) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex items-start justify-between bg-white border-b border-slate-200 flex-shrink-0">
                    <div><h2 className="text-2xl font-bold text-slate-800">{meeting.title}</h2><p className="text-sm text-slate-500">Hosted by {meeting.host}</p></div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-3">
                        <div className="relative h-72 w-full rounded-xl overflow-hidden mb-4 group">{roomImages.map((src, i) => (<motion.img key={src} src={src} alt={`Room view ${i + 1}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: i === currentImage ? 1 : 0, scale: i === currentImage ? 1 : 1.05 }} transition={{ duration: 0.7, ease: 'easeInOut' }} className="absolute inset-0 w-full h-full object-cover" />))}<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">{roomImages.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentImage ? 'bg-white scale-125' : 'bg-white/50'}`}></div>))}</div></div>
                        <div className="grid grid-cols-2 gap-4 text-sm"><div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Calendar size={16} className="mr-3 text-slate-400"/> {meeting.date}</div><div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.time}</div><div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg col-span-2"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants} Participants</div></div>
                    </div>
                    <div className="md:col-span-2"><h3 className="font-semibold text-slate-700 mb-2">Description</h3><p className="text-sm text-slate-600 leading-relaxed mb-6">{meeting.description}</p><h3 className="font-semibold text-slate-700 mb-3">Action Items</h3><ul className="space-y-2">{meeting.todos.map((todo, i) => (<li key={i} className="flex items-center text-sm text-slate-700 bg-slate-100 p-3 rounded-lg"><CheckSquare size={16} className="mr-3 text-blue-600 flex-shrink-0"/><span>{todo}</span></li>))}</ul></div>
                </div>
                <div className="p-5 mt-auto bg-white border-t border-slate-200"><a href={`/dashboard/meetings/join/${meeting.id}`} className="w-full text-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors group shadow-md hover:shadow-lg flex items-center justify-center"><Video size={16} className="mr-2"/>Join Meeting</a></div>
            </motion.div>
        </motion.div>
    );
};

// --- WIDGETS ---
const GuestScheduleWidget = ({ meetings, onDateClick }: { meetings: Meeting[], onDateClick: (meeting: Meeting) => void }) => {
    // This component remains the same
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); const meetingDates = new Set(meetings.map(m => new Date(m.date).toDateString())); const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); const calendarDays = Array.from({ length: firstDayOfMonth }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1)); while (calendarDays.length < 35) { calendarDays.push(null); } const changeMonth = (amount) => { setCurrentDate(prev => { const newDate = new Date(prev); newDate.setMonth(newDate.getMonth() + amount); return newDate; }); }; const handleDateClick = (day) => { const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString(); const meeting = meetings.find(m => new Date(m.date).toDateString() === dateStr); if (meeting) { onDateClick(meeting); } };
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-800">Your Schedule</h3><div className="flex items-center space-x-2"><button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><ChevronLeft size={18} /></button><span className="text-sm font-semibold text-slate-600 w-28 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><ChevronRight size={18} /></button></div></div>
            <div className="grid grid-cols-7 gap-y-2 text-center">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-xs text-slate-500 font-semibold">{day}</div>)}{calendarDays.map((day, index) => { if (!day) return <div key={`empty-${index}`} className="w-8 h-8 flex items-center justify-center rounded-full text-sm mx-auto bg-slate-50"></div>; const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString(); const hasMeeting = meetingDates.has(dateStr); const isToday = new Date().toDateString() === dateStr; const buttonClasses = `w-8 h-8 flex items-center justify-center rounded-full text-sm mx-auto transition-colors ${isToday ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold shadow-md' : ''} ${hasMeeting ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-md cursor-pointer' : 'bg-slate-100 text-slate-600'}`; return (<button key={day} onClick={() => handleDateClick(day)} disabled={!hasMeeting} className={buttonClasses}>{day}</button>); })}</div>
        </div>
    );
};

// --- THIS COMPONENT IS NOW FUNCTIONAL ---
const AttendanceChart = ({ meetings }: { meetings: ApiMeeting[] }) => {
    const [timeframe, setTimeframe] = useState('Monthly');

    // Calculate real attendance data from the meetings prop
    const attendanceData = useMemo(() => {
        const now = new Date();
        const pastMeetings = meetings.filter(m => new Date(m.startTime) < now);

        // Monthly Data (last 6 months)
        const monthlyCounts = new Map<string, number>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.toLocaleString('default', { month: 'short' });
            monthlyCounts.set(monthKey, 0);
        }
        pastMeetings.forEach(m => {
            const monthKey = new Date(m.startTime).toLocaleString('default', { month: 'short' });
            if (monthlyCounts.has(monthKey)) {
                monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
            }
        });

        // Weekly Data (last 6 weeks)
        const weeklyCounts = new Map<string, number>();
        const getWeek = (d: Date) => { const date = new Date(d.getTime()); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7); const week1 = new Date(date.getFullYear(), 0, 4); return 'W' + (1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)); };
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i * 7);
            weeklyCounts.set(getWeek(d), 0);
        }
        pastMeetings.forEach(m => {
            const weekKey = getWeek(new Date(m.startTime));
            if (weeklyCounts.has(weekKey)) {
                weeklyCounts.set(weekKey, (weeklyCounts.get(weekKey) || 0) + 1);
            }
        });

        // Daily Data (last 7 days)
        const dailyCounts = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayKey = `${d.getDate()}/${d.getMonth() + 1}`;
            dailyCounts.set(dayKey, 0);
        }
        pastMeetings.forEach(m => {
            const d = new Date(m.startTime);
            const dayKey = `${d.getDate()}/${d.getMonth() + 1}`;
            if (dailyCounts.has(dayKey)) {
                dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1);
            }
        });

        return {
            Daily: Array.from(dailyCounts, ([name, attended]) => ({ name, attended })),
            Weekly: Array.from(weeklyCounts, ([name, attended]) => ({ name, attended })),
            Monthly: Array.from(monthlyCounts, ([name, attended]) => ({ name, attended })),
            totalLifetimeMeetings: pastMeetings.length
        };
    }, [meetings]);

    const activeData = attendanceData[timeframe];

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 mt-6">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-800">Meeting Attendance</h3><div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">{['Daily', 'Weekly', 'Monthly'].map(view => (<button key={view} onClick={() => setTimeframe(view)} className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${timeframe === view ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{view}</button>))}</div></div>
            <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={activeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} /><Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', borderColor: '#e2e8f0' }} /><Bar dataKey="attended" fill="#4f46e5" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="text-center mt-4 pt-4 border-t border-slate-200"><p className="text-sm text-slate-500">Lifetime Meetings Attended</p><p className="text-2xl font-bold text-slate-800">{attendanceData.totalLifetimeMeetings}</p></div>
        </div>
    );
};


// --- MAIN GUEST DASHBOARD COMPONENT ---
export const GuestDashboard = () => {
    const { data: session } = useSession();
    const [rawMeetings, setRawMeetings] = useState<ApiMeeting[]>([]);
    const [transformedMeetings, setTransformedMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/Meetings/MyMeetings');
                const apiMeetings = response.data.meetings || [];
                setRawMeetings(apiMeetings);

                const transformed = apiMeetings.map((apiMeeting: ApiMeeting): Meeting => ({
                    id: apiMeeting.id,
                    title: apiMeeting.title,
                    date: new Date(apiMeeting.startTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    time: new Date(apiMeeting.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    host: apiMeeting.hostName,
                    participants: apiMeeting.attendeeCount,
                    description: apiMeeting.agenda || "No description provided.",
                    todos: []
                }));
                setTransformedMeetings(transformed);
            } catch (err) {
                console.error("Failed to fetch guest meetings:", err);
                setError("Could not load your schedule. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    const userName = session?.user?.name || 'Guest';

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><ContentSpinner /></div>;
    }

    if (error) {
        return <div className="text-center py-16 bg-red-50 text-red-700 rounded-2xl border border-red-200"><AlertTriangle className="mx-auto h-12 w-12 text-red-400" /><h3 className="mt-4 text-xl font-semibold">An Error Occurred</h3><p className="mt-2">{error}</p></div>
    }

    return (
        <>
            <AnimatePresence>
                {selectedMeeting && <MeetingDetailsModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />}
            </AnimatePresence>
            <div>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-3xl font-bold text-slate-900">Welcome, {userName}!</h2>
                    <p className="text-slate-500 mt-1">Here are your scheduled meetings. We're looking forward to seeing you.</p>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 p-5 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-4 flex-shrink-0">Upcoming Meetings</h3>
                        {transformedMeetings.length > 0 ? (
                            <div className="space-y-5 h-full overflow-y-auto flex-grow pr-2">
                                {transformedMeetings.map((meeting, i) => {
                                    const dateObj = new Date(meeting.date); const day = dateObj.getDate(); const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                                    return (
                                        <div key={`${meeting.id}-${i}`} className="bg-white rounded-2xl border border-slate-200/80 flex items-stretch overflow-hidden transition-all duration-300 hover:shadow-md">
                                            <div className="flex flex-col items-center justify-center w-24 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-200"><span className="text-3xl font-bold text-slate-700">{day}</span><span className="text-sm font-semibold text-slate-500">{month}</span></div>
                                            <div className="p-5 flex-grow cursor-pointer hover:bg-slate-50" onClick={() => setSelectedMeeting(meeting)}>
                                                <p className="font-bold text-slate-800 text-lg">{meeting.title}</p>
                                                <div className="flex items-center text-sm text-slate-500 mt-2 space-x-5"><span className="flex items-center"><Clock size={14} className="mr-1.5"/>{meeting.time}</span><span className="flex items-center"><User size={14} className="mr-1.5"/>Hosted by {meeting.host}</span><span className="flex items-center"><Users size={14} className="mr-1.5"/>{meeting.participants} Participants</span></div>
                                            </div>
                                            <div className="flex items-center px-5"><a href={`/dashboard/meetings/join/${meeting.id}`} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors group shadow-md hover:shadow-lg">Join Now<ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" /></a></div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 h-72"><Calendar size={48} className="mb-4 text-slate-400" /><h4 className="font-semibold">No Meetings Scheduled</h4><p className="text-sm">Your invitations will appear here once you're added to a meeting.</p></div>
                        )}
                        <div className="text-center mt-4 pt-4 border-t border-slate-200 flex-shrink-0"><p className="text-sm text-slate-500">You have <span className="font-bold text-slate-700">{transformedMeetings.length}</span> meetings scheduled.</p></div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-1">
                        <GuestScheduleWidget meetings={transformedMeetings} onDateClick={setSelectedMeeting} />
                        <AttendanceChart meetings={rawMeetings} />
                    </motion.div>
                </div>
            </div>
        </>
    );
};