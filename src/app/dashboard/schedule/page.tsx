"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, FileText, ArrowLeft } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';

const ScheduleMeetingPage = () => {
    // In a real app, this would be a form with state management (e.g., useState or react-hook-form)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic
        alert("Meeting scheduled successfully!");
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <a href="/dashboard" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 group">
                    <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </a>
                <h2 className="text-3xl font-bold text-slate-900">Schedule a New Meeting</h2>
                <p className="text-slate-500 mt-1">Book a room, invite participants, and set your agenda.</p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Meeting Title</label>
                        <input type="text" id="title" placeholder="e.g., Q4 Project Planning" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" required />
                    </div>
                    <div>
                        <label htmlFor="room" className="block text-sm font-medium text-slate-700">Select Room</label>
                        <select id="room" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" required>
                            <option>Orion (10 people)</option>
                            <option>Pegasus (8 people)</option>
                            <option>Andromeda (12 people)</option>
                            <option>Cygnus (6 people)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
                            <input type="date" id="date" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" required />
                        </div>
                        <div>
                            <label htmlFor="start-time" className="block text-sm font-medium text-slate-700">Start Time</label>
                            <input type="time" id="start-time" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" required />
                        </div>
                        <div>
                            <label htmlFor="end-time" className="block text-sm font-medium text-slate-700">End Time</label>
                            <input type="time" id="end-time" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" required />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="attendees" className="block text-sm font-medium text-slate-700">Invite Attendees</label>
                        <input type="text" id="attendees" placeholder="Search by name or email..." className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" />
                        {/* In a real app, this would be a multi-select component */}
                    </div>
                    <div>
                        <label htmlFor="agenda" className="block text-sm font-medium text-slate-700">Agenda / Description</label>
                        <textarea id="agenda" rows={4} placeholder="Describe the main objectives for this meeting..." className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"></textarea>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="lg:col-span-2 pt-6 border-t border-slate-200">
                    <DefaultButton type="submit" size="lg" className="w-full sm:w-auto">
                        Book Meeting
                    </DefaultButton>
                </div>
            </motion.form>
        </div>
    );
};

export default ScheduleMeetingPage;