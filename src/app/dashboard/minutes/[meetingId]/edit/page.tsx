"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import { saveMinutes } from '@/actions';
import { useToast } from '@/app/dashboard/components/Toast';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import api from '@/lib/api';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

// --- Type Definitions ---
interface Attendee {
    id: number;
    name: string;
    email: string;
}

interface MeetingDetails {
    id: number;
    title: string;
    attendees: Attendee[];
}

interface ActionItem {
    id?: number;
    description: string;
    assignedTo: number;
    isCompleted: boolean;
}

interface MomData {
    id: number;
    notes: string;
    decisions: string;
    actionItems: ActionItem[];
}

const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <DefaultButton type="submit" size="lg" disabled={pending}>
            {pending ? <><Loader2 size={18} className="mr-2 animate-spin" /> Saving...</> : <><Save size={18} className="mr-2" /> Save Minutes</>}
        </DefaultButton>
    );
};

const EditMinutesPage = ({ params }: { params: { meetingId: string } }) => {
    const { meetingId } = params;
    const [state, dispatch] = useFormState(saveMinutes, undefined);
    const { addToast } = useToast();

    // --- Component State ---
    const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);
    const [momId, setMomId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [decisions, setDecisions] = useState('');
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // First, fetch meeting details and attendees
                const [meetingRes, attendeesRes] = await Promise.all([
                    api.get(`/Meetings/${meetingId}`),
                    api.get(`/Meetings/${meetingId}/attendees`)
                ]);

                if (!meetingRes.data || !meetingRes.data.meeting) {
                    throw new Error("Meeting data could not be loaded.");
                }

                // Set meeting details with attendees
                setMeetingDetails({
                    id: meetingRes.data.meeting.id,
                    title: meetingRes.data.meeting.title,
                    attendees: attendeesRes.data.attendees || []
                });

                // Now try to fetch existing minutes (if they exist)
                try {
                    const momRes = await api.get(`/Moms/ByMeeting/${meetingId}`);

                    if (momRes.data) {
                        setMomId(momRes.data.id);
                        setNotes(momRes.data.notes || '');
                        setDecisions(momRes.data.decisions || '');
                        setActionItems(momRes.data.actionItems || []);
                    }
                } catch (momError: any) {
                    // If it's a 404, that's fine - we're creating new minutes
                    if (momError.response?.status === 404) {
                        console.log('No existing minutes found - creating new');
                        // Initialize with empty values for new minutes
                        setMomId(null);
                        setNotes('');
                        setDecisions('');
                        setActionItems([]);
                    } else {
                        // For other errors, log but don't fail the whole page
                        console.error("Error fetching minutes:", momError);
                    }
                }

            } catch (err: any) {
                console.error("Data fetching error:", err);
                setError("Failed to load meeting details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [meetingId]);

    // --- Form Handlers for Dynamic Action Items ---
    const handleAddActionItem = () => {
        const defaultAssigneeId = meetingDetails?.attendees[0]?.id || 0;
        setActionItems([...actionItems, {
            description: '',
            assignedTo: defaultAssigneeId,
            isCompleted: false
        }]);
    };

    const handleRemoveActionItem = (index: number) => {
        setActionItems(actionItems.filter((_, i) => i !== index));
    };

    const handleActionItemChange = (index: number, field: keyof ActionItem, value: any) => {
        const updatedItems = [...actionItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setActionItems(updatedItems);
    };

    // --- Handle form submission response ---
    useEffect(() => {
        if (state?.success) {
            addToast('Minutes saved successfully!', 'success');
        } else if (state && !state.success) {
            addToast(state.message || 'Failed to save minutes', 'error');
        }
    }, [state, addToast]);

    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <ContentSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="text-red-600 mb-4">{error}</div>
                <Link href="/dashboard/meetings">
                    <DefaultButton variant="outline">Back to Meetings</DefaultButton>
                </Link>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
                <Link href="/dashboard/meetings" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 group">
                    <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to My Meetings
                </Link>
                <h2 className="text-3xl font-bold text-slate-900">
                    {momId ? 'Edit Meeting Minutes' : 'Create Meeting Minutes'}
                </h2>
                <p className="text-slate-500 mt-1">
                    For: <span className="font-semibold text-slate-700">{meetingDetails?.title}</span>
                </p>
            </div>

            <form action={dispatch} className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 space-y-8">
                {state && !state.success && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                        <AlertCircle size={20} className="mr-3" />
                        <p>{state.message}</p>
                    </div>
                )}

                <input type="hidden" name="meetingId" value={meetingId} />
                {momId && <input type="hidden" name="momId" value={momId} />}
                <input
                    type="hidden"
                    name="momData"
                    value={JSON.stringify({
                        meetingId: parseInt(meetingId),
                        notes,
                        decisions,
                        actionItems: actionItems.map(item => ({
                            description: item.description,
                            assignedToId: item.assignedTo,
                            isCompleted: item.isCompleted
                        }))
                    })}
                />

                {/* Main Form Fields */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                        Discussion Points / Notes
                    </label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Summarize the key topics discussed..."
                    />
                </div>

                <div>
                    <label htmlFor="decisions" className="block text-sm font-medium text-slate-700 mb-2">
                        Key Decisions
                    </label>
                    <textarea
                        id="decisions"
                        value={decisions}
                        onChange={(e) => setDecisions(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="List the important decisions made..."
                    />
                </div>

                {/* Dynamic Action Items Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Action Items</h3>
                    {actionItems.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-500 mb-4">No action items yet</p>
                            <DefaultButton type="button" variant="outline" onClick={handleAddActionItem}>
                                <PlusCircle size={16} className="mr-2" /> Add First Action Item
                            </DefaultButton>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {actionItems.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleActionItemChange(index, 'description', e.target.value)}
                                                placeholder="Task description..."
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <select
                                                value={item.assignedTo}
                                                onChange={(e) => handleActionItemChange(index, 'assignedTo', parseInt(e.target.value))}
                                                className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={0} disabled>Assign to...</option>
                                                {meetingDetails?.attendees.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4 pt-2">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isCompleted}
                                                    onChange={(e) => handleActionItemChange(index, 'isCompleted', e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                Completed
                                            </label>
                                            <DefaultButton
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveActionItem(index)}
                                                className="text-red-500 hover:bg-red-100"
                                            >
                                                <Trash2 size={16} />
                                            </DefaultButton>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <DefaultButton type="button" variant="outline" onClick={handleAddActionItem} className="mt-4">
                                <PlusCircle size={16} className="mr-2" /> Add Another Action Item
                            </DefaultButton>
                        </>
                    )}
                </div>

                {/* Submission Button */}
                <div className="pt-6 border-t border-slate-200">
                    <SubmitButton />
                </div>
            </form>
        </motion.div>
    );
};

export default EditMinutesPage;