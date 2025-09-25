"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Users, ArrowRight, Edit, Trash2, PlusCircle, AlertTriangle, Loader2, Video, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FilePenLine } from 'lucide-react';
import { useSession } from "next-auth/react";
import api from '@/lib/api';
import ContentSpinner from '../components/ContentLoadingSpinner';
import { DefaultButton } from "@/app/dashboard/components/DefaultButton";
import Link from "next/link";
import { useToast } from '@/app/dashboard/components/Toast';
import { deleteMeeting } from '@/actions';

// --- Data Types ---
interface Meeting {
    id: number;
    title: string;
    date: string; // ISO string
    time: string; // Formatted time string
    host: string;
    hostId: number;
    participants: number;
    description: string;
}

interface ApiMeeting {
    id: number;
    title: string;
    startTime: string;
    hostName: string;
    hostId: number;
    attendeeCount: number;
    agenda: string;
}

// --- Reusable Components ---

const MeetingDetailsModal = ({ meeting, onClose }: { meeting: Meeting, onClose: () => void }) => {
    if (!meeting) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex items-start justify-between bg-white border-b border-slate-200 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{meeting.title}</h2>
                        <p className="text-sm text-slate-500 mt-1">Hosted by {meeting.host}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex items-center"><CalendarIcon size={16} className="mr-3 text-slate-400"/> {new Date(meeting.date).toDateString()}</div>
                    <div className="flex items-center"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.time}</div>
                    <div className="flex items-center"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants} Participants</div>
                    <div className="text-slate-600 bg-slate-100 p-3 rounded-md border border-slate-200">
                        <p className="font-semibold text-slate-700 mb-1">Agenda</p>
                        <p>{meeting.description}</p>
                    </div>
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

// NEW: Confirmation Modal for Deletion
const ConfirmationModal = ({ count, onConfirm, onCancel, isDeleting }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900">Delete Meeting{count > 1 ? 's' : ''}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Are you sure you want to delete {count} selected meeting{count > 1 ? 's' : ''}? This action cannot be undone.
                    </p>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <DefaultButton variant="destructive" onClick={onConfirm} disabled={isDeleting} className="w-full sm:ml-3 sm:w-auto">
                    {isDeleting ? (<><Loader2 size={16} className="mr-2 animate-spin" /> Deleting...</>) : ('Confirm Deletion')}
                </DefaultButton>
                <DefaultButton variant="outline" onClick={onCancel} disabled={isDeleting} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</DefaultButton>
            </div>
        </motion.div>
    </motion.div>
);

const AllMeetingsPage = () => {
    const { data: session } = useSession();
    const { addToast } = useToast();

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedMeetingIds, setSelectedMeetingIds] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMeetingDetails, setSelectedMeetingDetails] = useState<Meeting | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchMyMeetings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/Meetings/MyMeetings');
                const transformedMeetings = (response.data.meetings || []).map((apiMeeting: ApiMeeting) => ({
                    id: apiMeeting.id,
                    title: apiMeeting.title,
                    date: apiMeeting.startTime,
                    time: new Date(apiMeeting.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    host: apiMeeting.hostName || 'N/A',
                    hostId: apiMeeting.hostId || 0,
                    participants: apiMeeting.attendeeCount || 0,
                    description: apiMeeting.agenda || "No description provided.",
                }));
                setMeetings(transformedMeetings);
            } catch (err) {
                setError("Could not load meetings.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyMeetings();
    }, []);

    const handleDeleteSelected = async () => {
        setIsDeleting(true);
        const meetingsToDelete = [...selectedMeetingIds];
        let successCount = 0;
        let failureCount = 0;

        for (const meetingId of meetingsToDelete) {
            try {
                const result = await deleteMeeting(meetingId.toString());
                if (result.success) {
                    successCount++;
                    setMeetings(current => current.filter(m => m.id !== meetingId));
                } else failureCount++;
            } catch (error) {
                failureCount++;
            }
        }

        if (successCount > 0) addToast(`${successCount} meeting${successCount > 1 ? 's' : ''} deleted.`, 'success');
        if (failureCount > 0) addToast(`Failed to delete ${failureCount} meeting${failureCount > 1 ? 's' : ''}.`, 'error');

        setSelectedMeetingIds([]);
        setShowDeleteModal(false);
        setIsDeleting(false);
    };

    const paginatedMeetings = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return meetings.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, meetings]);

    const totalPages = Math.ceil(meetings.length / itemsPerPage);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedMeetingIds(paginatedMeetings.map(m => m.id));
        } else {
            setSelectedMeetingIds([]);
        }
    };

    const handleSelectMeeting = (id: number) => {
        setSelectedMeetingIds(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]);
    };

    const isAdmin = session?.user?.role === 'admin';
    const currentUserId = parseInt(session?.user?.id || '0');

    const canManageMeeting = (meeting: Meeting): boolean => {
        return isAdmin || meeting.hostId === currentUserId;
    };

    const isMeetingInPast = (isoDateString: string): boolean => {
        return new Date(isoDateString) < new Date();
    };

    // NEW: Check if meeting is currently ongoing (within 30 minutes of start time)
    const isMeetingOngoing = (isoDateString: string): boolean => {
        const meetingTime = new Date(isoDateString);
        const now = new Date();
        const thirtyMinutesAfter = new Date(meetingTime.getTime() + 30 * 60 * 1000);
        return now >= meetingTime && now <= thirtyMinutesAfter;
    };

    // NEW: Check if join button should be disabled
    const shouldDisableJoin = (meeting: Meeting): boolean => {
        return isMeetingInPast(meeting.date) && !isMeetingOngoing(meeting.date);
    };

    return (
        <>
            <AnimatePresence>
                {selectedMeetingDetails && <MeetingDetailsModal meeting={selectedMeetingDetails} onClose={() => setSelectedMeetingDetails(null)} />}
                {showDeleteModal && (
                    <ConfirmationModal
                        count={selectedMeetingIds.length}
                        onConfirm={handleDeleteSelected}
                        onCancel={() => setShowDeleteModal(false)}
                        isDeleting={isDeleting}
                    />
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-6 h-12 flex items-center">
                    <AnimatePresence mode="wait">
                        {selectedMeetingIds.length > 0 && isAdmin ? (
                            <motion.div key="actions" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-between w-full">
                                <h2 className="text-xl font-semibold text-slate-800">{selectedMeetingIds.length} meeting{selectedMeetingIds.length > 1 ? 's' : ''} selected</h2>
                                <DefaultButton variant="destructive" onClick={() => setShowDeleteModal(true)} disabled={isDeleting}><Trash2 size={16} className="mr-2" /> Delete Selected</DefaultButton>
                            </motion.div>
                        ) : (
                            <motion.div key="title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between w-full">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">My Meetings</h2>
                                    <p className="text-slate-500 mt-1">Browse, join, and manage your meetings.</p>
                                </div>
                                <Link href="/dashboard/meetings/schedule"><DefaultButton><PlusCircle size={18} className="mr-2"/> Schedule New Meeting</DefaultButton></Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    {isLoading ? (
                        <div className="flex flex-col h-full w-full items-center justify-center gap-4 py-16"><ContentSpinner /><p>Loading meetings...</p></div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-600">{error}</div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center py-16"><p className="text-slate-500 mb-4">No meetings scheduled.</p><Link href="/dashboard/meetings/add"><DefaultButton><PlusCircle size={18} className="mr-2" /> Schedule First Meeting</DefaultButton></Link></div>
                    ) : (
                        <>
                            <table className="w-full text-left text-sm">
                                <thead>
                                <tr className="border-b border-slate-200">
                                    {isAdmin && <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedMeetingIds.length > 0 && selectedMeetingIds.length === paginatedMeetings.length} disabled={isDeleting} /></th>}
                                    <th className="p-4">Meeting Details</th>
                                    <th className="p-4">Host</th>
                                    <th className="p-4">Participants</th>
                                    <th className="p-4">Minutes</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedMeetings.map(meeting => (
                                    <tr key={meeting.id} className={`border-b border-slate-100 transition-colors ${selectedMeetingIds.includes(meeting.id) ? 'bg-blue-50' : 'hover:bg-slate-50'} ${isDeleting ? 'opacity-50' : ''}`}>
                                        {isAdmin && <td className="p-4"><input type="checkbox" checked={selectedMeetingIds.includes(meeting.id)} onChange={() => handleSelectMeeting(meeting.id)} disabled={isDeleting} /></td>}
                                        <td className="p-4">
                                            <button onClick={() => setSelectedMeetingDetails(meeting)} className="text-left cursor-pointer ">
                                                <p className="font-semibold text-slate-800">{meeting.title}</p>
                                                <p className="text-slate-500">{new Date(meeting.date).toDateString()} at {meeting.time}</p>
                                            </button>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {meeting.host}
                                            {meeting.hostId === currentUserId && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">You</span>}
                                        </td>
                                        <td className="p-4 text-slate-600">{meeting.participants}</td>
                                        <td className="p-4">
                                            {isMeetingInPast(meeting.date) && canManageMeeting(meeting) ? (
                                                <Link href={`/dashboard/minutes/${meeting.id}/edit`}>
                                                    <DefaultButton variant="outline" size="sm"><FilePenLine size={14} className="mr-2"/> Add / Edit</DefaultButton>
                                                </Link>
                                            ) : isMeetingInPast(meeting.date) ? (
                                                <span className="text-xs text-slate-400">View Only</span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Upcoming</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center space-x-2">
                                                {canManageMeeting(meeting) && (
                                                    <>
                                                        <Link href={`/dashboard/meetings/edit/${meeting.id}`} title="Edit Meeting">
                                                            <DefaultButton variant="secondary" size="sm" className="bg-green-100 text-green-700 hover:bg-green-200" disabled={isDeleting}><Edit size={16} /></DefaultButton>
                                                        </Link>
                                                        <DefaultButton variant="destructive" size="sm" onClick={() => { setSelectedMeetingIds([meeting.id]); setShowDeleteModal(true); }} disabled={isDeleting} title="Delete Meeting"><Trash2 size={16} /></DefaultButton>
                                                    </>
                                                )}
                                                <a href={`/dashboard/meetings/join/${meeting.id}`}>
                                                    <DefaultButton
                                                        size="sm"
                                                        disabled={shouldDisableJoin(meeting)}
                                                        className={shouldDisableJoin(meeting) ? 'opacity-50 cursor-not-allowed' : ''}
                                                    >
                                                        {shouldDisableJoin(meeting) ? 'Expired' : 'Join Now'}
                                                        {!shouldDisableJoin(meeting) && <ArrowRight size={16} className="ml-1" />}
                                                        {shouldDisableJoin(meeting) && <Clock size={16} className="ml-1" />}
                                                    </DefaultButton>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-sm text-slate-500">Showing {paginatedMeetings.length} of {meetings.length} meetings</span>
                                    <div className="flex items-center space-x-2">
                                        <DefaultButton variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isDeleting}><ChevronLeft size={16} /></DefaultButton>
                                        <span className="text-sm font-medium text-slate-600">{currentPage} / {totalPages}</span>
                                        <DefaultButton variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || isDeleting}><ChevronRight size={16} /></DefaultButton>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default AllMeetingsPage;