// file: app/dashboard/meetings/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Users, ArrowRight, Search, X, Calendar, Video, CheckSquare } from 'lucide-react';

// --- MOCK DATA ---
const allMeetingsData = [
    { id: 1, title: "Project Phoenix Kick-off", date: new Date().toISOString(), time: "02:00 PM", host: "Jane Smith", participants: 12, description: "Initial kick-off for the new Project Phoenix. We will discuss project goals, timeline, and assign initial tasks.", todos: ["Review project brief", "Prepare introduction slides", "Finalize agenda"] },
    { id: 2, title: "Marketing Sync-up", date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), time: "11:00 AM", host: "John Doe", participants: 5, description: "Weekly sync-up to review campaign performance and plan for the upcoming week.", todos: ["Analyze last week's metrics", "Present new ad creatives"] },
    { id: 3, title: "Q3 Planning Session", date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), time: "09:30 AM", host: "Jane Smith", participants: 8, description: "A detailed planning session to finalize the roadmap and budget for the third quarter.", todos: ["Prepare budget proposal", "Outline key initiatives"] },
    { id: 4, title: "Design Review", date: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(), time: "02:00 PM", host: "Mike Ross", participants: 7, description: "Reviewing the latest design mockups for the mobile app.", todos: ["Provide feedback on UX", "Check for brand consistency"] },
    { id: 5, title: "Last Month's Review", date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), time: "10:00 AM", host: "Jane Smith", participants: 15, description: "A review of last month's performance across all departments.", todos: ["Prepare departmental reports"] },
];

// --- Meeting Details Modal ---
const MeetingDetailsModal = ({ meeting, onClose }) => {
    const roomImages = [
        "https://placehold.co/600x400/E2E8F0/475569?text=Conference+Room",
        "https://placehold.co/600x400/CBD5E1/475569?text=Whiteboard+Area",
        "https://placehold.co/600x400/94A3B8/FFFFFF?text=AV+Equipment",
    ];
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % roomImages.length);
        }, 2500);
        return () => clearInterval(timer);
    }, [roomImages.length]);

    if (!meeting) return null;

    const meetingDate = new Date(meeting.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -20 }}
                className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 flex items-start justify-between bg-white border-b border-slate-200 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{meeting.title}</h2>
                        <p className="text-sm text-slate-500">Hosted by {meeting.host}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-3">
                        <div className="relative h-72 w-full rounded-xl overflow-hidden mb-4 group">
                            {roomImages.map((src, i) => (<motion.img key={src} src={src} alt={`Room view ${i + 1}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: i === currentImage ? 1 : 0, scale: i === currentImage ? 1 : 1.05 }} transition={{ duration: 0.7, ease: 'easeInOut' }} className="absolute inset-0 w-full h-full object-cover" />))}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">{roomImages.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentImage ? 'bg-white scale-125' : 'bg-white/50'}`}></div>))}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Calendar size={16} className="mr-3 text-slate-400"/> {meetingDate}</div>
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.time}</div>
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg col-span-2"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants} Participants</div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">{meeting.description}</p>
                        <h3 className="font-semibold text-slate-700 mb-3">Action Items</h3>
                        <ul className="space-y-2">
                            {meeting.todos.map((todo, i) => (<li key={i} className="flex items-center text-sm text-slate-700 bg-slate-100 p-3 rounded-lg"><CheckSquare size={16} className="mr-3 text-blue-600 flex-shrink-0"/><span>{todo}</span></li>))}
                        </ul>
                    </div>
                </div>
                <div className="p-5 mt-auto bg-white border-t border-slate-200">
                    <a href={`/dashboard/meetings/join/${meeting.id}`} className="w-full text-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors group shadow-md hover:shadow-lg flex items-center justify-center">
                        <Video size={16} className="mr-2"/>
                        Join Meeting
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};


const AllMeetingsPage = () => {
    const [filter, setFilter] = useState('This Week');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const filteredMeetings = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return allMeetingsData.filter(meeting => {
            // By stripping the time from the meeting date, we ensure accurate comparisons regardless of time of day.
            const meetingDate = new Date(meeting.date);
            const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());

            // First, check if it matches the search term
            const matchesSearch = searchTerm.trim() === '' ||
                meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.host.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // Then, check if it matches the date filter
            switch (filter) {
                case 'Today':
                    return meetingDay.getTime() === today.getTime();
                case 'This Week':
                    return meetingDay >= startOfWeek && meetingDay <= endOfWeek;
                case 'This Month':
                    return meetingDay >= startOfMonth && meetingDay <= endOfMonth;
                case 'All':
                    return true;
                default:
                    return true;
            }
        });
    }, [filter, searchTerm]);

    return (
        <>
            <AnimatePresence>
                {selectedMeeting && <MeetingDetailsModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />}
            </AnimatePresence>

            <div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Scheduled Meetings</h2>
                        <p className="text-slate-500 mt-1">Browse, filter, and join your upcoming meetings.</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60"
                >
                    <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
                        {['Today', 'This Week', 'This Month', 'All'].map(view => (
                            <button
                                key={view}
                                onClick={() => setFilter(view)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${filter === view ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title or host..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white"
                        />
                    </div>
                </motion.div>

                <div className="space-y-5">
                    {filteredMeetings.length > 0 ? filteredMeetings.map((meeting, i) => {
                        const dateObj = new Date(meeting.date);
                        const day = dateObj.getDate();
                        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                        return (
                            <motion.div
                                key={meeting.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-200/80 flex items-stretch overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                            >
                                <div className="flex flex-col items-center justify-center w-24 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-200">
                                    <span className="text-3xl font-bold text-slate-700">{day}</span>
                                    <span className="text-sm font-semibold text-slate-500">{month}</span>
                                </div>
                                <div className="p-5 flex-grow cursor-pointer hover:bg-slate-50" onClick={() => setSelectedMeeting(meeting)}>
                                    <p className="font-bold text-slate-800 text-lg">{meeting.title}</p>
                                    <div className="flex items-center text-sm text-slate-500 mt-2 space-x-5">
                                        <span className="flex items-center"><Clock size={14} className="mr-1.5"/>{meeting.time}</span>
                                        <span className="flex items-center"><User size={14} className="mr-1.5"/>Hosted by {meeting.host}</span>
                                        <span className="flex items-center"><Users size={14} className="mr-1.5"/>{meeting.participants} Participants</span>
                                    </div>
                                </div>
                                <div className="flex items-center px-5">
                                    <a href={`/dashboard/meetings/join/${meeting.id}`} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors group shadow-md hover:shadow-lg">
                                        Join Now
                                        <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-lg">
                            <h3 className="text-xl font-semibold text-slate-700">No meetings found.</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your filters or clearing your search.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AllMeetingsPage;
