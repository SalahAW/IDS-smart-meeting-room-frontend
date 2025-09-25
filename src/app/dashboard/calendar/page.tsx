"use client";

import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Users, Clock, Video, X } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import api from '@/lib/api';
import ContentSpinner from '../components/ContentLoadingSpinner';

// --- LIVE DATA TYPES (Unchanged) ---
interface CalendarRoom {
    id: number;
    name: string;
    color: string;
}
interface CalendarMeeting {
    id: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    roomId: number;
    host: string;
    participants: number;
    description: string;
}

// --- HELPER FUNCTIONS (Unchanged) ---
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const areDatesSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

// --- COMPONENTS (Unchanged except for MonthView) ---
const MeetingDetailsModal = ({ meeting, rooms, onClose }: { meeting: CalendarMeeting, rooms: CalendarRoom[], onClose: () => void }) => {
    if (!meeting) return null;
    const room = rooms.find(r => r.id === meeting.roomId);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex items-start justify-between bg-white border-b border-slate-200 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{meeting.title}</h2>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <span className={`w-3 h-3 rounded-full ${room?.color || 'bg-gray-400'} mr-2`}></span>
                            {room?.name || 'Unknown Room'}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex items-center"><CalendarIcon size={16} className="mr-3 text-slate-400"/> {new Date(meeting.date + 'T00:00:00').toDateString()}</div>
                    <div className="flex items-center"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.startTime} - {meeting.endTime}</div>
                    <div className="flex items-center"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants} Participants</div>
                </div>
                <div className="p-5 mt-auto bg-white border-t border-slate-200 rounded-b-2xl">
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
            <a href="/dashboard/meetings/schedule">
                <DefaultButton className="w-full mb-6"><Plus className="mr-2" size={18}/> Schedule Meeting</DefaultButton>
            </a>
            <h3 className="font-bold text-slate-800 mb-3 mt-8">Rooms</h3>
            <div className="space-y-2">
                {rooms.map(room => (
                    <label key={room.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                        <input type="checkbox" checked={filteredRoomIds.includes(room.id)} onChange={() => handleRoomFilterChange(room.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                        <span className={`w-3 h-3 rounded-full ${room.color}`}></span>
                        <span className="text-sm text-slate-700">{room.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

// --- MINIMAL CHANGE: Enhanced MonthView Component with Multiple Meeting Logic ---
const MonthView = ({ currentDate, meetings, rooms, onMeetingClick }) => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

    return (
        <div className="grid grid-cols-7 flex-grow">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 py-2 border-b border-slate-200 bg-slate-50">{day}</div>
            ))}
            {calendarDays.map((day, index) => {
                const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;

                // Sort meetings by start time to get the earliest one
                const meetingsOnDay = day ? meetings
                        .filter(m => areDatesSameDay(new Date(m.date + 'T00:00:00'), date))
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    : [];

                const firstMeeting = meetingsOnDay.length > 0 ? meetingsOnDay[0] : null;
                const otherMeetingsCount = meetingsOnDay.length - 1;
                const isToday = day ? areDatesSameDay(today, date) : false;

                return (
                    <div key={index} className="border-b border-r border-slate-200 p-2 min-h-[120px] flex flex-col transition-colors duration-200 hover:bg-slate-50/50">
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-2 ${isToday ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}>{day}</div>
                        <div className="space-y-2 overflow-y-auto pr-1">
                            {firstMeeting && (
                                <button
                                    key={firstMeeting.id}
                                    onClick={() => onMeetingClick(firstMeeting)}
                                    // ENHANCEMENT: Changed border color to a static blue and refined styles
                                    className="w-full text-left p-2 rounded-lg bg-slate-100 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
                                >
                                    <p className="font-bold text-xs text-slate-700 truncate">{firstMeeting.title}</p>
                                    <p className="text-xs text-slate-500">{firstMeeting.startTime}</p>
                                    {/* NEW: Show count of other meetings */}
                                    {otherMeetingsCount > 0 && (
                                        <p className="text-xs font-bold text-blue-600 mt-1">
                                            + {otherMeetingsCount} more
                                        </p>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const WeekView = ({ currentDate, meetings, rooms, onMeetingClick }) => {
    // A more complete week view implementation would go here.
    return <div className="p-4">Week View is under construction.</div>;
};

// --- CalendarPage Component (Unchanged) ---
const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('Month');
    const [selectedMeeting, setSelectedMeeting] = useState<CalendarMeeting | null>(null);
    const [filteredRoomIds, setFilteredRoomIds] = useState<number[]>([]);
    const [rooms, setRooms] = useState<CalendarRoom[]>([]);
    const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCalendarData = async () => {
            setIsLoading(true);
            setError(null);

            const start = new Date(currentDate);
            const end = new Date(currentDate);

            if (view === 'Month') {
                start.setDate(1);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
            } else { // Week view
                const day = start.getDay();
                const diff = start.getDate() - day + (day === 0 ? -6:1);
                start.setDate(diff);
                end.setDate(start.getDate() + 6);
            }

            try {
                const response = await api.get('/Meetings/Calendar', {
                    params: {
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                    }
                });
                setRooms(response.data.rooms || []);
                setMeetings(response.data.meetings || []);
                if (filteredRoomIds.length === 0 && response.data.rooms) {
                    setFilteredRoomIds(response.data.rooms.map(r => r.id));
                }
            } catch (err) {
                setError("Failed to load calendar data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCalendarData();
    }, [currentDate, view]);


    const changeDate = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (view === 'Month') newDate.setMonth(newDate.getMonth() + amount);
            if (view === 'Week') newDate.setDate(newDate.getDate() + amount * 7);
            return newDate;
        });
    };

    const filteredMeetings = useMemo(() => meetings.filter(m => filteredRoomIds.includes(m.roomId)), [meetings, filteredRoomIds]);

    const getHeaderText = () => {
        if (view === 'Month') return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (view === 'Week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('default', {month:'short', day:'numeric'})} - ${endOfWeek.toLocaleDateString('default', {month:'short', day:'numeric', year:'numeric'})}`
        }
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <>
            <AnimatePresence>
                {selectedMeeting && <MeetingDetailsModal meeting={selectedMeeting} rooms={rooms} onClose={() => setSelectedMeeting(null)} />}
            </AnimatePresence>
            <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 overflow-hidden">
                <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <DefaultButton variant="outline" onClick={() => setCurrentDate(new Date())}>Today</DefaultButton>
                        <div className="flex items-center">
                            <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><ChevronLeft size={20} /></button>
                            <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><ChevronRight size={20} /></button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 w-64 text-center">{getHeaderText()}</h2>
                    </div>
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        {['Month', 'Week'].map(viewName => (
                            <button key={viewName} onClick={() => setView(viewName)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === viewName ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>
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
                    <div className="flex-grow flex flex-col overflow-auto relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><ContentSpinner /></div>
                        ) : error ? (
                            <div className="absolute inset-0 flex items-center justify-center text-red-600">{error}</div>
                        ) : (
                            <>
                                {view === 'Month' && <MonthView currentDate={currentDate} meetings={filteredMeetings} rooms={rooms} onMeetingClick={setSelectedMeeting} />}
                                {view === 'Week' && <WeekView currentDate={currentDate} meetings={filteredMeetings} rooms={rooms} onMeetingClick={setSelectedMeeting} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalendarPage;