"use client";

import React, { useEffect, useState, useRef, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, X, Trash2, Search, FileText, Calendar, Clock, DoorOpen } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useFormStatus } from 'react-dom';
import { updateMeeting, getMeetingForEdit, getMeetingFormData } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/dashboard/components/Toast';
import useOutsideClick from '@/app/dashboard/hooks/useOutsideClick';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';


// --- Types ---
interface SelectListItem {
    id: number;
    name: string;
}

// --- CUSTOM HOOKS ---
const useClientParams = () => {
    const [params, setParams] = useState({ id: '' });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const id = pathSegments[pathSegments.length - 1];
            setParams({ id });
        }
    }, []);
    return params;
};

// --- MINIMAL CHANGE: Enhanced AttendeeSelector component ---
const AttendeeSelector = ({ allUsers, selectedAttendees, setSelectedAttendees }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    useOutsideClick(dropdownRef, () => setIsOpen(false));

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedAttendees.some(attendee => attendee.id === user.id)
    );

    const handleAddAttendee = (user) => {
        setSelectedAttendees(prev => [...prev, user]);
    };

    const handleRemoveAttendee = (userId) => {
        setSelectedAttendees(prev => prev.filter(attendee => attendee.id !== userId));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="attendees" className="block text-sm font-medium text-slate-700">Attendees *</label>
                {selectedAttendees.length > 0 && (
                    <button type="button" onClick={() => setSelectedAttendees([])} className="text-xs text-slate-500 hover:text-red-600 flex items-center font-semibold transition-colors">
                        <Trash2 size={14} className="mr-1"/>Clear All ({selectedAttendees.length})
                    </button>
                )}
            </div>
            {/* Added max-h-28 and overflow-y-auto for scrollability */}
            <div onClick={() => setIsOpen(true)} className="mt-1 flex items-center flex-wrap gap-2 p-2 min-h-[60px] max-h-28 overflow-y-auto border border-slate-300 rounded-lg bg-white cursor-text">
                {selectedAttendees.map(attendee => (
                    <motion.span
                        key={attendee.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full"
                    >
                        {attendee.name}
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveAttendee(attendee.id); }} className="text-blue-600 hover:text-blue-800">
                            <X size={14} />
                        </button>
                    </motion.span>
                ))}
                {selectedAttendees.length === 0 && <span className="text-slate-400 px-1">Select attendees...</span>}
            </div>

            <AnimatePresence>
                {isOpen && (
                    // Changed positioning to bottom-full and mb-2 to appear on top
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full mb-2 w-full bg-white border border-slate-300 rounded-lg shadow-lg z-10">
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
                        {/* Added max-h-60 and overflow-y-auto for the user list */}
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
        <DefaultButton type="submit" size="lg" disabled={pending} className="w-full md:w-auto">
            {pending ? (<><Loader2 size={18} className="mr-2 animate-spin" /> Updating Meeting...</>) : (<><Save size={18} className="mr-2" /> Save Changes</>)}
        </DefaultButton>
    );
};

const EditMeetingPage = () => {
    const params = useClientParams();
    const router = useRouter();
    const { addToast } = useToast();

    const [meeting, setMeeting] = useState(null);
    const [formData, setFormData] = useState<{ rooms: SelectListItem[], users: SelectListItem[] }>({ rooms: [], users: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAttendees, setSelectedAttendees] = useState<SelectListItem[]>([]);

    const [updateState, updateDispatch] = useActionState(updateMeeting, undefined);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!params.id) return;
            setIsLoading(true);
            setError(null);
            try {
                const [meetingResult, formDataResult] = await Promise.all([
                    getMeetingForEdit(params.id),
                    getMeetingFormData()
                ]);

                if (!meetingResult.success) throw new Error(meetingResult.message);
                if (!formDataResult.success) throw new Error(formDataResult.message);

                setMeeting(meetingResult.meeting);
                const allUsers = formDataResult.data.users || [];
                setFormData({
                    rooms: formDataResult.data.rooms || [],
                    users: allUsers,
                });

                const initialAttendees = allUsers.filter(user =>
                    meetingResult.meeting?.attendeeIds?.includes(user.id)
                );
                setSelectedAttendees(initialAttendees);

            } catch (err) {
                const errorMessage = err.message || 'Failed to load required data.';
                setError(errorMessage);
                addToast(errorMessage, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [params.id, addToast]);

    useEffect(() => {
        if (updateState?.success) {
            addToast(updateState.message, 'success');
            setTimeout(() => router.push('/dashboard/meetings'), 1500);
        } else if (updateState && !updateState.success) {
            addToast(updateState.message, 'error');
        }
    }, [updateState, router, addToast]);

    const handleSubmit = (formDataPayload: FormData) => {
        formDataPayload.append('meetingId', params.id);
        selectedAttendees.forEach(attendee => {
            formDataPayload.append('attendeeIds', attendee.id.toString());
        });
        updateDispatch(formDataPayload);
    };

    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - timezoneOffset);
            return localDate.toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    if (isLoading) return <div className="flex justify-center items-center p-8"><ContentSpinner /></div>;
    if (error) return <div className="text-center text-red-600 p-8 bg-red-50 rounded-lg">{error}</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/dashboard/meetings" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to Meetings
            </Link>

            <div>
                <h2 className="text-3xl font-bold text-slate-900">Edit Meeting</h2>
                <p className="text-slate-500 mt-1">Update the details for "{meeting?.title}"</p>
            </div>

            <motion.form action={handleSubmit} className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 w-full space-y-6">
                {updateState && ( <div className={`p-4 rounded-lg border flex items-start space-x-3 ${updateState.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{updateState.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}<p className="text-sm">{updateState.message}</p></div> )}

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Meeting Title *</label>
                    <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="text" id="title" name="title" defaultValue={meeting?.title} required className="input-field" placeholder="e.g., Q3 Project Kick-off" /></div>
                </div>
                <div>
                    <label htmlFor="agenda" className="block text-sm font-medium text-slate-700 mb-1">Agenda / Description</label>
                    <textarea id="agenda" name="agenda" defaultValue={meeting?.agenda} rows={4} className="input-field !pl-4" placeholder="Describe the main objectives of the meeting..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                        <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="datetime-local" id="startTime" name="startTime" defaultValue={formatDateTimeLocal(meeting?.startTime)} required className="input-field" /></div>
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
                        <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="datetime-local" id="endTime" name="endTime" defaultValue={formatDateTimeLocal(meeting?.endTime)} required className="input-field" /></div>
                    </div>
                </div>
                <div>
                    <label htmlFor="roomId" className="block text-sm font-medium text-slate-700 mb-1">Meeting Room *</label>
                    <div className="relative"><DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><select id="roomId" name="roomId" defaultValue={meeting?.roomId} required className="input-field bg-white appearance-none"><option value="">Select a room</option>{formData.rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></div>
                </div>

                <AttendeeSelector
                    allUsers={formData.users}
                    selectedAttendees={selectedAttendees}
                    setSelectedAttendees={setSelectedAttendees}
                />

                <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end">
                    <SubmitButton />
                </div>
            </motion.form>

            <style jsx>{`
                .input-field { display: block; width: 100%; padding-left: 2.5rem; padding-right: 0.75rem; padding-top: 0.75rem; padding-bottom: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; transition: all 0.2s; }
                .input-field:focus { --tw-ring-color: #3b82f6; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #3b82f6; outline: none; }
            `}</style>
        </motion.div>
    );
};

export default EditMeetingPage;