"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ArrowLeft, Trash2, X, ChevronDown, Search } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useFormState, useFormStatus } from 'react-dom';
import { createMeeting } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/dashboard/components/Toast';
import api from '@/lib/api';
import useOutsideClick from '@/app/dashboard/hooks/useOutsideClick';

// --- Component Types ---
interface SelectListItem {
    id: number;
    name: string;
}
interface MeetingFormData {
    rooms: SelectListItem[];
    users: SelectListItem[];
}

const AttendeeSelector = ({ allUsers, selectedAttendees, setSelectedAttendees }: { allUsers: SelectListItem[], selectedAttendees: SelectListItem[], setSelectedAttendees: React.Dispatch<React.SetStateAction<SelectListItem[]>> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    useOutsideClick(dropdownRef, () => setIsOpen(false));

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedAttendees.some(attendee => attendee.id === user.id)
    );

    const handleAddAttendee = (user: SelectListItem) => {
        setSelectedAttendees(prev => [...prev, user]);
    };

    const handleRemoveAttendee = (userId: number) => {
        setSelectedAttendees(prev => prev.filter(attendee => attendee.id !== userId));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* The hidden inputs that will be submitted with the form */}
            {selectedAttendees.map(attendee => (
                <input key={attendee.id} type="hidden" name="attendeeIds" value={attendee.id} />
            ))}

            <label htmlFor="attendees" className="block text-sm font-medium text-slate-700">Invite Attendees</label>
            <div onClick={() => setIsOpen(true)} className="mt-1 flex items-center flex-wrap gap-2 p-2 min-h-[46px] border border-slate-300 rounded-lg bg-white cursor-text">
                {selectedAttendees.map(attendee => (
                    <span key={attendee.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                        {attendee.name}
                        <button type="button" onClick={() => handleRemoveAttendee(attendee.id)} className="text-blue-600 hover:text-blue-800">
                            <X size={14} />
                        </button>
                    </span>
                ))}
                {!selectedAttendees.length && <span className="text-slate-400 px-1">Select attendees...</span>}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 w-full bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <ul className="max-h-60 overflow-y-auto p-2">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <li key={user.id} onClick={() => handleAddAttendee(user)} className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-blue-50 hover:text-blue-800 cursor-pointer">
                                    {user.name}
                                </li>
                            )) : <li className="px-3 py-2 text-sm text-slate-500">No users found.</li>}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <DefaultButton type="submit" size="lg" disabled={pending}>
            <Calendar size={18} className="mr-2" />
            {pending ? "Scheduling Meeting..." : "Schedule Meeting"}
        </DefaultButton>
    );
};

const ScheduleMeetingPage = () => {
    const [state, dispatch] = useFormState(createMeeting, undefined);
    const router = useRouter();
    const { addToast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    // State for form dropdowns
    const [formData, setFormData] = useState<MeetingFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // State for the new attendee selector
    const [selectedAttendees, setSelectedAttendees] = useState<SelectListItem[]>([]);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const response = await api.get('/Meetings/Form-Data');
                setFormData(response.data);
            } catch (error) {
                addToast("Failed to load form data.", 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFormData();
    }, [addToast]);

    useEffect(() => {
        if (state?.success) {
            addToast(state.message, 'success', 4000);
            const timer = setTimeout(() => {
                router.push('/dashboard/meetings');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state, router, addToast]);

    const handleReset = () => {
        formRef.current?.reset();
        setSelectedAttendees([]);
        addToast("Form cleared.", 'info');
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading form...</div>;
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <Link href="/dashboard/meetings" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 group">
                        <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                        Back to My Meetings
                    </Link>
                    <h2 className="text-3xl font-bold text-slate-900">Schedule a New Meeting</h2>
                    <p className="text-slate-500 mt-1">Fill out the details below to book a room and invite attendees.</p>
                </div>
                {/* The new "Reset" button */}
                <DefaultButton variant="ghost" onClick={handleReset} className="text-slate-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} className="mr-2" /> Clear Form
                </DefaultButton>
            </motion.div>

            <motion.form
                ref={formRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                action={dispatch}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 max-w-5xl mx-auto"
            >
                {state && !state.success && ( <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"><p>{state.message}</p></div> )}

                {/* The new, more balanced grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Details Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Meeting Title</label>
                            <input name="title" type="text" id="title" placeholder="e.g., Q4 Strategy Session" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">Start Time</label>
                                <input name="startTime" type="datetime-local" id="startTime" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">End Time</label>
                                <input name="endTime" type="datetime-local" id="endTime" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="roomId" className="block text-sm font-medium text-slate-700">Room</label>
                            <select name="roomId" id="roomId" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg bg-white" defaultValue="" required>
                                <option value="" disabled>Select a room</option>
                                {formData?.rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="agenda" className="block text-sm font-medium text-slate-700">Agenda / Description</label>
                            <textarea name="agenda" id="agenda" rows={5} placeholder="Briefly describe the meeting's purpose and key talking points..." className="mt-1 block w-full p-3 border border-slate-300 rounded-lg"></textarea>
                        </div>
                    </div>

                    {/* Attendees Section */}
                    <div className="md:col-span-1">
                        <AttendeeSelector
                            allUsers={formData?.users || []}
                            selectedAttendees={selectedAttendees}
                            setSelectedAttendees={setSelectedAttendees}
                        />
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-200">
                    <SubmitButton />
                </div>
            </motion.form>
        </div>
    );
};

export default ScheduleMeetingPage;