import { motion } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, ReactNode } from 'react';
import {DefaultButton} from "@/app/dashboard/components/DefaultButton";

// --- HELPER COMPONENT ---
// To resolve the import error, the AnimatedWrapper is now included directly in this file.
const AnimatedWrapper = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);


// --- MOCK DATA ---
// More detailed data for a full weekly calendar view.
// In a real app, you would fetch this based on the displayed week.
const weeklyBookings = [
    // Monday
    { id: 1, room: 'Orion', title: 'Q3 Strategy Review', date: '2025-08-25', startTime: '10:00', endTime: '11:30' },
    { id: 2, room: 'Andromeda', title: 'UX/UI Design Sprint', date: '2025-08-25', startTime: '09:00', endTime: '11:00' },
    // Tuesday
    { id: 3, room: 'Cygnus', title: 'Frontend Sync-up', date: '2025-08-26', startTime: '11:30', endTime: '12:30' },
    // Wednesday
    { id: 4, room: 'Pegasus', title: 'Project Phoenix Kick-off', date: '2025-08-27', startTime: '14:00', endTime: '15:30' },
    { id: 5, room: 'Draco', title: 'Security Audit', date: '2025-08-27', startTime: '10:00', endTime: '13:00' },
    // Friday
    { id: 6, room: 'Lyra', title: 'All-Hands Meeting', date: '2025-08-29', startTime: '16:00', endTime: '17:00' },
    { id: 7, room: 'Orion', title: 'Marketing Campaign Launch', date: '2025-08-29', startTime: '11:00', endTime: '12:00' },
];

const ROOM_COLORS = {
    Orion: 'bg-blue-100 border-blue-300 text-blue-800',
    Cygnus: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    Pegasus: 'bg-purple-100 border-purple-300 text-purple-800',
    Andromeda: 'bg-green-100 border-green-300 text-green-800',
    Draco: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    Lyra: 'bg-pink-100 border-pink-300 text-pink-800',
};

const RoomAvailability = () => {
    const [currentDate, setCurrentDate] = useState(new Date('2025-08-25T12:00:00')); // Set a fixed date for consistent mock data display
    const [currentTime, setCurrentTime] = useState(new Date());

    // Generate the days of the week for the header
    const weekDays = [];
    const startDate = new Date(currentDate);
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        weekDays.push(day);
    }

    // Generate time slots for the side column
    const timeSlots = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`); // 8 AM to 6 PM

    const changeWeek = (amount) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount * 7);
            return newDate;
        });
    };

    // Function to calculate event position and height
    const calculateEventStyle = (startTime, endTime) => {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

        const startHour = start.getHours();
        const startMinute = start.getMinutes();

        const pixelsPerHour = 60; // Each hour block is 60px tall
        const top = ((startHour - 8) * pixelsPerHour) + (startMinute / 60 * pixelsPerHour);
        const height = (durationMinutes / 60) * pixelsPerHour;

        return { top: `${top}px`, height: `${height}px` };
    };

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const currentTimePosition = () => {
        const now = currentTime;
        const startHour = 8;
        const pixelsPerHour = 60;
        const top = ((now.getHours() - startHour) * pixelsPerHour) + (now.getMinutes() / 60 * pixelsPerHour);
        return top;
    };


    return (
        <AnimatedWrapper delay={0.5}>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 h-full">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                        Room Schedule
                    </h3>
                    <div className="flex items-center space-x-4">
                        <DefaultButton variant= "ghost" onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-semibold border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
                            Today
                        </DefaultButton>
                        <div className="flex items-center space-x-2">
                            <DefaultButton variant= "outline" onClick={() => changeWeek(-1)} className="p-1 rounded-full hover:bg-slate-100"><ChevronLeft size={20} /></DefaultButton>
                            <DefaultButton variant= "outline" onClick={() => changeWeek(1)} className="p-1 rounded-full hover:bg-slate-100"><ChevronRight size={20} /></DefaultButton>
                        </div>
                        <p className="text-sm font-semibold text-slate-600 w-48 text-center">
                            {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-auto" style={{ height: '600px' }}>
                    <div className="grid grid-cols-[auto_1fr] min-w-[800px]">
                        {/* Time Column */}
                        <div className="flex flex-col">
                            <div className="h-12"></div> {/* Spacer for header */}
                            {timeSlots.map(time => (
                                <div key={time} className="h-[60px] text-right pr-2 text-xs text-slate-400 border-t border-slate-100 -mt-px">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        <div className="grid grid-cols-7">
                            {weekDays.map((day, dayIndex) => (
                                <div key={dayIndex} className="relative border-l border-slate-100">
                                    {/* Header */}
                                    <div className={`h-12 sticky top-0 bg-white z-10 border-b border-slate-200 text-center flex flex-col justify-center ${isToday(day) ? 'text-blue-600' : 'text-slate-600'}`}>
                                        <span className="text-sm font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className={`text-xl font-bold ${isToday(day) ? 'bg-blue-600 text-white rounded-full w-8 h-8 mx-auto flex items-center justify-center' : ''}`}>{day.getDate()}</span>
                                    </div>

                                    {/* Background Grid Lines */}
                                    {timeSlots.map(time => <div key={time} className="h-[60px] border-t border-slate-100"></div>)}

                                    {/* Events */}
                                    {weeklyBookings
                                        .filter(booking => new Date(booking.date).toDateString() === day.toDateString())
                                        .map(booking => (
                                            <motion.div
                                                key={booking.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`absolute w-[95%] left-1 p-2 rounded-md border text-xs ${ROOM_COLORS[booking.room] || 'bg-slate-100'}`}
                                                style={calculateEventStyle(booking.startTime, booking.endTime)}
                                            >
                                                <p className="font-bold truncate">{booking.title}</p>
                                                <p className="truncate">{booking.room}</p>
                                            </motion.div>
                                        ))
                                    }

                                    {/* Current Time Indicator */}
                                    {isToday(day) && (
                                        <div className="absolute w-full h-0.5 bg-red-500 z-20" style={{ top: `${currentTimePosition()}px` }}>
                                            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedWrapper>
    );
};

export default RoomAvailability;
