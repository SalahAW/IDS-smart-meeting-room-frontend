"use client";

import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Users, Clock, MapPin, X, FileText, CheckSquare, Video } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';

// --- MOCK DATA ---
const rooms = [
    { id: 1, name: 'Orion', color: 'bg-blue-500', colorClasses: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 2, name: 'Pegasus', color: 'bg-indigo-500', colorClasses: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
    { id: 3, name: 'Andromeda', color: 'bg-purple-500', colorClasses: 'bg-purple-100 border-purple-300 text-purple-800' },
    { id: 4, name: 'Cygnus', color: 'bg-pink-500', colorClasses: 'bg-pink-100 border-pink-300 text-pink-800' },
];

const meetingsData = [
    { id: 1, title: "Project Phoenix Kick-off", date: "2025-09-22", startTime: "10:00", endTime: "11:30", roomId: 1, host: "Jane Smith", participants: 12, description: "Initial kick-off for Project Phoenix.", todos: ["Review brief", "Finalize agenda"] },
    { id: 2, title: "Marketing Sync", date: "2025-09-22", startTime: "14:00", endTime: "15:00", roomId: 2, host: "John Doe", participants: 5, description: "Weekly marketing sync.", todos: ["Analyze metrics"] },
    { id: 3, title: "Q4 Planning", date: "2025-09-24", startTime: "09:00", endTime: "12:00", roomId: 3, host: "Jane Smith", participants: 8, description: "Q4 roadmap planning.", todos: ["Prepare slides"] },
    { id: 4, title: "Design Review", date: "2025-09-25", startTime: "13:00", endTime: "14:30", roomId: 1, host: "Mike Ross", participants: 7, description: "Review of new UI mockups.", todos: ["Provide feedback"] },
    { id: 5, title: "All Hands Meeting", date: "2025-10-01", startTime: "11:00", endTime: "12:00", roomId: 4, host: "CEO", participants: 50, description: "Company-wide monthly update.", todos: ["Submit questions"] },
];

// --- HELPER FUNCTIONS ---
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const areDatesSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

// --- COMPONENTS ---

const MeetingDetailsModal = ({ meeting, onClose }) => {
    if (!meeting) return null;
    const room = rooms.find(r => r.id === meeting.roomId);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex items-start justify-between bg-white border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{meeting.title}</h2>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <span className={`w-3 h-3 rounded-full ${room?.color} mr-2`}></span>
                            {room?.name}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex items-center"><CalendarIcon size={16} className="mr-3 text-slate-400"/> {new Date(meeting.date).toDateString()}</div>
                    <div className="flex items-center"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.startTime} - {meeting.endTime}</div>
                    <div className="flex items-center"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants} Participants</div>
                </div>
                <div className="p-5 mt-auto bg-white border-t border-slate-200">
                    <a href={`/dashboard/meetings/join/${meeting.id}`} className="w-full">
                        <DefaultButton className="w-full"><Video size={16} className="mr-2"/> Join Meeting</DefaultButton>
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CalendarSidebar = ({ rooms, filteredRoomIds, setFilteredRoomIds }) => {
    const handleRoomFilterChange = (roomId) => {
        setFilteredRoomIds(prev =>
            prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
        );
    };

    return (
        <div className="w-64 p-5 border-r border-slate-200 bg-white lg:block hidden">
            <a href="/dashboard/schedule">
                <DefaultButton className="w-full mb-6"><Plus className="mr-2" size={18}/> Schedule Meeting</DefaultButton>
            </a>

            <h3 className="font-bold text-slate-800 mb-3 mt-8">Rooms</h3>
            <div className="space-y-2">
                {rooms.map(room => (
                    <label key={room.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={filteredRoomIds.includes(room.id)}
                            onChange={() => handleRoomFilterChange(room.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`w-3 h-3 rounded-full ${room.color}`}></span>
                        <span className="text-sm text-slate-700">{room.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const MonthView = ({ currentDate, meetings, onMeetingClick }) => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

    return (
        <div className="grid grid-cols-7 flex-grow">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 py-2 border-b border-slate-200">{day}</div>
            ))}
            {calendarDays.map((day, index) => {
                const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                const meetingsOnDay = day ? meetings.filter(m => areDatesSameDay(new Date(m.date), date)) : [];
                const isToday = day ? areDatesSameDay(today, date) : false;

                return (
                    <div key={index} className="border-b border-r border-slate-200 p-2 min-h-[120px] flex flex-col">
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-2 ${isToday ? 'bg-blue-600 text-white' : ''}`}>{day}</div>
                        <div className="space-y-1 overflow-y-auto">
                            {meetingsOnDay.map(meeting => {
                                const room = rooms.find(r => r.id === meeting.roomId);
                                return (
                                    <button key={meeting.id} onClick={() => onMeetingClick(meeting)} className={`w-full text-left text-xs p-1 rounded ${room?.color} text-white truncate`}>
                                        {meeting.startTime} {meeting.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const WeekView = ({ currentDate, meetings, onMeetingClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday start
        startOfWeek.setDate(diff);
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    }, [currentDate]);

    const timeSlots = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`); // 8 AM to 6 PM

    const calculateEventStyle = (startTime, endTime) => {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const startHour = start.getHours();
        const startMinute = start.getMinutes();
        const pixelsPerHour = 60;
        const top = ((startHour - 8) * pixelsPerHour) + (startMinute / 60 * pixelsPerHour);
        const height = (durationMinutes / 60) * pixelsPerHour;
        return { top: `${top}px`, height: `${height}px` };
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const currentTimePosition = () => {
        const now = currentTime;
        const top = ((now.getHours() - 8) * 60) + now.getMinutes();
        return top;
    };

    return (
        <div className="grid grid-cols-[auto_1fr] flex-grow">
            <div className="flex flex-col">
                <div className="h-20 flex-shrink-0"></div>
                {timeSlots.map(time => (
                    <div key={time} className="h-[60px] text-right pr-2 text-xs text-slate-400 border-t border-slate-100 -mt-px pt-1">
                        {time}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="relative border-l border-slate-100">
                        <div className={`h-20 sticky top-0 bg-white z-10 border-b border-slate-200 text-center flex flex-col justify-center ${areDatesSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-600'}`}>
                            <span className="text-sm font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
                            <span className={`text-3xl font-bold mt-1 ${areDatesSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-10 h-10 mx-auto flex items-center justify-center' : ''}`}>{day.getDate()}</span>
                        </div>
                        <div className="relative">
                            {timeSlots.map(time => <div key={time} className="h-[60px] border-t border-slate-100"></div>)}
                            {meetings
                                .filter(booking => areDatesSameDay(new Date(booking.date), day))
                                .map(booking => {
                                    const room = rooms.find(r => r.id === booking.roomId);
                                    return (
                                        <motion.button
                                            key={booking.id}
                                            onClick={() => onMeetingClick(booking)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`absolute w-[95%] left-1 p-2 rounded-md border text-xs text-left ${room?.colorClasses}`}
                                            style={calculateEventStyle(booking.startTime, booking.endTime)}
                                        >
                                            <p className="font-bold truncate">{booking.title}</p>
                                            <p className="truncate">{room?.name}</p>
                                        </motion.button>
                                    );
                                })
                            }
                            {areDatesSameDay(day, new Date()) && (
                                <div className="absolute w-full h-0.5 bg-red-500 z-20" style={{ top: `${currentTimePosition()}px` }}>
                                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date("2025-09-22T12:00:00"));
    const [view, setView] = useState('Week');
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [filteredRoomIds, setFilteredRoomIds] = useState(rooms.map(r => r.id));

    const changeDate = (amount) => {
        const unit = view.toLowerCase();
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (unit === 'month') newDate.setMonth(newDate.getMonth() + amount);
            if (unit === 'week') newDate.setDate(newDate.getDate() + amount * 7);
            // Day logic removed
            return newDate;
        });
    };

    const filteredMeetings = useMemo(() => meetingsData.filter(m => filteredRoomIds.includes(m.roomId)), [filteredRoomIds]);

    const getHeaderText = () => {
        if (view === 'Month') return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (view === 'Week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('default', {month:'short', day:'numeric'})} - ${endOfWeek.toLocaleDateString('default', {month:'short', day:'numeric', year:'numeric'})}`
        }
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }); // Fallback
    };

    return (
        <>
            <AnimatePresence>
                {selectedMeeting && <MeetingDetailsModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />}
            </AnimatePresence>
            <div className="h-full flex flex-col bg-white">
                <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <DefaultButton variant="outline" onClick={() => setCurrentDate(new Date())}>Today</DefaultButton>
                        <div className="flex items-center">
                            <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={20} /></button>
                            <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronRight size={20} /></button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 w-64 text-center">{getHeaderText()}</h2>
                    </div>
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        {['Month', 'Week'].map(viewName => ( // REMOVED 'Day'
                            <button key={viewName} onClick={() => setView(viewName)} className={`px-3 py-1 text-sm font-semibold rounded-md ${view === viewName ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>
                                {viewName}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow flex overflow-hidden">
                    <CalendarSidebar
                        rooms={rooms}
                        filteredRoomIds={filteredRoomIds}
                        setFilteredRoomIds={setFilteredRoomIds}
                    />
                    <div className="flex-grow flex flex-col overflow-auto">
                        {view === 'Month' && <MonthView currentDate={currentDate} meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} />}
                        {view === 'Week' && <WeekView currentDate={currentDate} meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalendarPage;