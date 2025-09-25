"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, Users, CheckSquare, FileText, Download, Printer, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import api from '@/lib/api';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

// --- Type Definitions for API Data ---
interface ActionItem {
    task: string;
    assignee: string;
    status: string;
}

interface MeetingMinute {
    id: number;
    title: string;
    date: string; // ISO String
    attendees: string[];
    discussionPoints: string;
    decisions: string;
    actionItems: ActionItem[];
}


// --- Meeting Minutes Modal ---
const MeetingMinutesModal = ({ meeting, onClose }: { meeting: MeetingMinute | null, onClose: () => void }) => {
    if (!meeting) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex items-start justify-between border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{meeting.title}</h2>
                        <p className="text-sm text-slate-500">Minutes from {new Date(meeting.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center"><Users size={16} className="mr-2 text-slate-400"/> Attendees</h3>
                        <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map(name => <span key={name} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">{name}</span>)}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center"><FileText size={16} className="mr-2 text-slate-400"/> Discussion Summary</h3>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">{meeting.discussionPoints}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center"><CheckSquare size={16} className="mr-2 text-slate-400"/> Key Decisions</h3>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">{meeting.decisions}</p>
                    </div>
                    {meeting.actionItems.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-3 flex items-center"><CheckSquare size={16} className="mr-2 text-slate-400"/> Action Items</h3>
                            <ul className="space-y-2">
                                {meeting.actionItems.map((item, i) => (
                                    <li key={i} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-slate-800">{item.task}</p>
                                            <p className="text-xs text-slate-500">Assigned to: {item.assignee}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="p-5 mt-auto bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
                    <DefaultButton variant="outline" onClick={handlePrint}><Printer size={16} className="mr-2"/> Print</DefaultButton>
                    <DefaultButton><Download size={16} className="mr-2"/> Export as PDF</DefaultButton>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN MINUTES PAGE ---
const MinutesPage = () => {
    // --- State for Data, Filters, and UI ---
    const [allMeetings, setAllMeetings] = useState<MeetingMinute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMeeting, setSelectedMeeting] = useState<MeetingMinute | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchMinutes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/Moms');
                setAllMeetings(response.data.meetings || []);
            } catch (err) {
                console.error("Failed to fetch minutes:", err);
                setError("Could not load meeting minutes. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMinutes();
    }, []);

    // --- Client-Side Filtering ---
    const filteredMeetings = useMemo(() => {
        return allMeetings.filter(meeting => {
            const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.attendees.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Compare only the date part of the ISO string
            const matchesDate = !selectedDate || meeting.date.startsWith(selectedDate);

            return matchesSearch && matchesDate;
        });
    }, [searchTerm, selectedDate, allMeetings]);

    // --- Pagination ---
    const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
    const paginatedMeetings = filteredMeetings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDate]);

    // --- Render ---
    return (
        <>
            <AnimatePresence>
                {selectedMeeting && <MeetingMinutesModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />}
            </AnimatePresence>

            <div>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-3xl font-bold text-slate-900">Meeting Minutes</h2>
                    <p className="text-slate-500 mt-1">Search and review notes from past meetings.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 mb-6 flex items-center gap-4">
                    {/* Filter controls remain the same */}
                    <div className="relative flex-grow"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="text" placeholder="Search by meeting title or attendee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-white text-lg" /></div>
                    <div className="relative"><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-lg text-slate-600" /></div>
                    <DefaultButton variant="outline" onClick={() => setSelectedDate('')} disabled={!selectedDate}>Clear</DefaultButton>
                </motion.div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16"><ContentSpinner /><p className="mt-4 text-slate-500">Loading minutes...</p></div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50 text-red-700 rounded-2xl border border-red-200"><AlertTriangle className="mx-auto h-12 w-12 text-red-400" /><h3 className="mt-4 text-xl font-semibold">An Error Occurred</h3><p className="mt-2">{error}</p></div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedMeetings.map((meeting, i) => (
                                <motion.div key={meeting.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }} onClick={() => setSelectedMeeting(meeting)} className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4"><FileText className="text-slate-500" /></div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{meeting.title}</p>
                                            <div className="flex items-center text-sm text-slate-500 mt-1">
                                                <Calendar size={14} className="mr-1.5" /><span>{new Date(meeting.date).toLocaleDateString()}</span>
                                                <span className="mx-2">•</span>
                                                <Users size={14} className="mr-1.5" /><span>{meeting.attendees.length} Attendees</span>
                                            </div>
                                        </div>
                                    </div>
                                    <DefaultButton variant="outline" size="sm">View Details</DefaultButton>
                                </motion.div>
                            ))}
                            {filteredMeetings.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
                                    <h3 className="text-xl font-semibold text-slate-700">No minutes found.</h3>
                                    <p className="text-slate-500 mt-2">Try adjusting your search or date filter, or add minutes to a past meeting.</p>
                                </motion.div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center mt-8">
                                <DefaultButton variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16} className="mr-1"/>Previous</DefaultButton>
                                <span className="mx-4 text-sm font-medium text-slate-600">Page {currentPage} of {totalPages}</span>
                                <DefaultButton variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next<ChevronRight size={16} className="ml-1"/></DefaultButton>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default MinutesPage;