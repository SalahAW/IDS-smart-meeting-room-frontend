"use client";

import React, { useEffect, useState, useActionState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Building,
    Users,
    Tv,
    Mic,
    Video,
    X,
    Trash2,
    AlertCircle,
    CheckCircle,
    Loader2,
    FileText
} from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useFormStatus } from 'react-dom';
import { updateRoom, getRoomById } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/dashboard/components/Toast';

// --- CUSTOM HOOK to get URL params ---
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

// List of all possible features
const allFeatures = [
    { icon: Tv, label: 'Projector / TV', id: 'projector' },
    { icon: Video, label: 'Video Conferencing', id: 'video_conf' },
    { icon: Mic, label: 'Conference Phone', id: 'phone' },
    // Correcting the icon for Whiteboard
    { icon: FileText, label: 'Whiteboard', id: 'whiteboard' },
];

/**
 * A dedicated submit button aware of the form's submission status.
 */
const SubmitButton = ({ isLoading }: { isLoading: boolean }) => {
    const { pending } = useFormStatus();
    const isDisabled = pending || isLoading;

    return (
        <DefaultButton type="submit" size="lg" disabled={isDisabled} className="w-full md:w-auto">
            {isDisabled ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
                <Save size={18} className="mr-2" />
            )}
            {pending ? "Updating Room..." : "Save Changes"}
        </DefaultButton>
    );
};

const EditRoomPage = () => {
    const params = useClientParams();
    const [room, setRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    // MINIMAL CHANGE: useActionState is the new name for useFormState
    const [updateState, updateDispatch] = useActionState(updateRoom, undefined);

    const router = useRouter();
    const { addToast } = useToast();

    // Fetch room data when component mounts
    useEffect(() => {
        const fetchRoom = async () => {
            if (!params.id) return;

            setIsLoading(true);
            setFetchError(null);

            try {
                const result = await getRoomById(params.id);
                if (result.success && result.room) {
                    setRoom(result.room);

                    // MINIMAL CHANGE: Safely map and filter features to prevent crashes
                    if (result.room.features) {
                        const roomFeatures = result.room.features
                            .map(featureData =>
                                allFeatures.find(f => f.id === featureData.id || f.label === featureData.label)
                            )
                            .filter(Boolean); // This removes any undefined entries if a match isn't found
                        setSelectedFeatures(roomFeatures);
                    }

                } else {
                    setFetchError(result.message || 'Failed to load room data');
                }
            } catch (error) {
                console.error('Error fetching room:', error);
                setFetchError('An unexpected error occurred while loading room data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoom();
    }, [params.id]);

    // Handle update response
    useEffect(() => {
        if (updateState?.success) {
            addToast(updateState.message, 'success', 4000);
            const timer = setTimeout(() => {
                router.push('/dashboard/rooms');
            }, 1500);
            return () => clearTimeout(timer);
        } else if (updateState && !updateState.success) {
            addToast(updateState.message, 'error', 5000);
        }
    }, [updateState, router, addToast]);

    const handleAddFeature = (featureLabel) => {
        if (featureLabel && !selectedFeatures.some(f => f.label === featureLabel)) {
            const featureToAdd = allFeatures.find(f => f.label === featureLabel);
            if (featureToAdd) {
                setSelectedFeatures([...selectedFeatures, featureToAdd]);
            }
        }
    };

    const handleRemoveFeature = (featureLabel) => {
        setSelectedFeatures(selectedFeatures.filter(f => f.label !== featureLabel));
    };

    const handleClearFeatures = () => {
        setSelectedFeatures([]);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsFormSubmitted(true);
        formData.append('roomId', params.id);
        formData.append('features', JSON.stringify(selectedFeatures.map(f => ({
            id: f.id,
            label: f.label
        }))));
        updateDispatch(formData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Loading room details...</span>
            </div>
        );
    }

    if (fetchError || !room) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/dashboard/rooms" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                    <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to All Rooms
                </Link>
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex items-start space-x-3">
                    <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium">Error Loading Room</h3>
                        <p className="text-sm mt-1">{fetchError || 'Room not found'}</p>
                        <Link href="/dashboard/rooms" className="inline-block mt-3 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors">
                            Return to Room List
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/dashboard/rooms" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to All Rooms
            </Link>

            <div>
                <h2 className="text-3xl font-bold text-slate-900">Edit Room: {room.name}</h2>
                <p className="text-slate-500 mt-1">Update the details and features for this meeting room.</p>
            </div>

            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                action={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 space-y-6"
            >
                {updateState && isFormSubmitted && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${updateState.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {updateState.success ? <CheckCircle size={20} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />}
                        <div>
                            <p className="font-medium">{updateState.success ? 'Success!' : 'Error'}</p>
                            <p className="text-sm mt-1">{updateState.message}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="roomName" className="block text-sm font-medium text-slate-700 mb-1">Room Name *</label>
                        <input type="text" id="roomName" name="roomName" defaultValue={room.name} className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="Enter room name" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                        <input type="text" id="location" name="location" defaultValue={room.location} className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="Enter location" />
                    </div>
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">Capacity *</label>
                        <input type="number" id="capacity" name="capacity" defaultValue={room.capacity} min="1" max="100" className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="Enter capacity" />
                        <p className="text-xs text-slate-500 mt-1">Maximum 100 people</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">Features<span className="text-xs text-slate-500 font-normal ml-1">(Optional)</span></label>
                        {selectedFeatures.length > 0 && (<button type="button" onClick={handleClearFeatures} className="text-xs text-slate-500 hover:text-red-600 flex items-center font-semibold transition-colors"><Trash2 size={14} className="mr-1"/>Clear All ({selectedFeatures.length})</button>)}
                    </div>
                    <div className="p-3 border border-slate-300 rounded-lg min-h-[60px] flex flex-wrap items-center gap-2 bg-slate-50/50">
                        {selectedFeatures.length === 0 && (<span className="text-slate-400 text-sm">No features selected</span>)}

                        {/* MINIMAL CHANGE: Use feature.id for the key for better stability */}
                        {selectedFeatures.map(feature => (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center bg-blue-100 text-blue-800 rounded-md pl-3 pr-2 py-2 text-sm font-medium border border-blue-200"
                            >
                                <feature.icon size={16} className="mr-2 text-blue-600"/>
                                <span>{feature.label}</span>
                                <button type="button" onClick={() => handleRemoveFeature(feature.label)} className="ml-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-200 p-0.5 transition-colors" aria-label={`Remove ${feature.label}`}>
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}

                        {allFeatures.filter(f => !selectedFeatures.some(sf => sf.label === f.label)).length > 0 && (
                            <select onChange={(e) => { handleAddFeature(e.target.value); e.target.value = ''; }} value="" className="bg-transparent border-none focus:outline-none text-slate-600 text-sm cursor-pointer">
                                <option value="" disabled>+ Add feature...</option>
                                {allFeatures.filter(f => !selectedFeatures.some(sf => sf.label === f.label)).map(feature => (<option key={feature.id} value={feature.label}>{feature.label}</option>))}
                            </select>
                        )}
                    </div>
                    {selectedFeatures.length > 0 && (<p className="text-xs text-slate-500 mt-2">{selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected</p>)}
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Room Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-slate-500">Room ID:</span><span className="ml-2 font-medium">{room.id}</span></div>
                        {room.createdAt && (<div><span className="text-slate-500">Created:</span><span className="ml-2 font-medium">{new Date(room.createdAt).toLocaleDateString()}</span></div>)}
                        {room.updatedAt && (<div><span className="text-slate-500">Last Updated:</span><span className="ml-2 font-medium">{new Date(room.updatedAt).toLocaleDateString()}</span></div>)}
                        <div><span className="text-slate-500">Current Features:</span><span className="ml-2 font-medium">{selectedFeatures.length}</span></div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    <p className="text-sm text-slate-500">* Required fields</p>
                    <SubmitButton isLoading={isLoading} />
                </div>
            </motion.form>
        </motion.div>
    );
};

export default EditRoomPage;