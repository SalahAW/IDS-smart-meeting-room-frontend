"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, Building, Users, Tv, Mic, Video, X, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useFormState, useFormStatus } from 'react-dom';
import { createRoom } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/dashboard/components/Toast';

// List of all possible features
const allFeatures = [
    { icon: Tv, label: 'Projector / TV', id: 'projector' },
    { icon: Video, label: 'Video Conferencing', id: 'video_conf' },
    { icon: Mic, label: 'Conference Phone', id: 'phone' },
    { icon: Building, label: 'Whiteboard', id: 'whiteboard' },
];

/**
 * A dedicated submit button aware of the form's submission status.
 */
const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <DefaultButton type="submit" size="lg" disabled={pending} className="w-full md:w-auto">
            {pending ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
                <PlusCircle size={18} className="mr-2" />
            )}
            {pending ? "Creating Room..." : "Create Room"}
        </DefaultButton>
    );
};

const AddRoomPage = () => {
    // State to manage the list of selected features for the new room
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    // Form state for the create room action
    const [state, dispatch] = useFormState(createRoom, undefined);

    const router = useRouter();
    const { addToast } = useToast();

    // Handle create room response
    useEffect(() => {
        if (state?.success) {
            addToast(state.message, 'success', 4000);
            // Wait a moment for the user to see the toast, then redirect.
            const timer = setTimeout(() => {
                router.push('/dashboard/rooms');
            }, 1000);
            return () => clearTimeout(timer);
        } else if (state && !state.success) {
            addToast(state.message, 'error', 5000);
        }
    }, [state, router, addToast]);

    // Function to add a feature from the dropdown
    const handleAddFeature = (featureLabel) => {
        if (featureLabel && !selectedFeatures.some(f => f.label === featureLabel)) {
            const featureToAdd = allFeatures.find(f => f.label === featureLabel);
            if (featureToAdd) {
                setSelectedFeatures([...selectedFeatures, featureToAdd]);
            }
        }
    };

    // Function to remove a feature by clicking its 'x' button
    const handleRemoveFeature = (featureLabel) => {
        setSelectedFeatures(selectedFeatures.filter(f => f.label !== featureLabel));
    };

    // Function to clear all selected features
    const handleClearFeatures = () => {
        setSelectedFeatures([]);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsFormSubmitted(true);

        // Add selected features as JSON string to form data
        formData.append('features', JSON.stringify(selectedFeatures.map(f => ({
            id: f.id,
            label: f.label
        }))));

        dispatch(formData);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/dashboard/rooms" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to All Rooms
            </Link>

            <div>
                <h2 className="text-3xl font-bold text-slate-900">Add New Meeting Room</h2>
                <p className="text-slate-500 mt-1">Configure the details and features for a new room.</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                action={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 space-y-6"
            >
                {/* Enhanced error/success display */}
                {state && isFormSubmitted && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
                        state.success
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {state.success ? (
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className="font-medium">{state.success ? 'Success!' : 'Error'}</p>
                            <p className="text-sm mt-1">{state.message}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="roomName" className="block text-sm font-medium text-slate-700 mb-1">
                            Room Name *
                        </label>
                        <input
                            type="text"
                            id="roomName"
                            name="roomName"
                            placeholder="e.g., Orion Conference Room"
                            className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="e.g., 3rd Floor, West Wing"
                            className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">
                            Capacity *
                        </label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            placeholder="e.g., 12"
                            min="1"
                            max="100"
                            className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">Maximum 100 people</p>
                    </div>
                </div>

                {/* Enhanced Features Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Features
                            <span className="text-xs text-slate-500 font-normal ml-1">(Optional)</span>
                        </label>
                        {/* Clear All button appears when features are selected */}
                        {selectedFeatures.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearFeatures}
                                className="text-xs text-slate-500 hover:text-red-600 flex items-center font-semibold transition-colors"
                            >
                                <Trash2 size={14} className="mr-1"/>
                                Clear All ({selectedFeatures.length})
                            </button>
                        )}
                    </div>

                    <div className="p-3 border border-slate-300 rounded-lg min-h-[60px] flex flex-wrap items-center gap-2 bg-slate-50/50">
                        {selectedFeatures.length === 0 && (
                            <span className="text-slate-400 text-sm">No features selected</span>
                        )}

                        {selectedFeatures.map(feature => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center bg-blue-100 text-blue-800 rounded-md pl-3 pr-2 py-2 text-sm font-medium border border-blue-200"
                            >
                                <feature.icon size={16} className="mr-2 text-blue-600"/>
                                <span>{feature.label}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFeature(feature.label)}
                                    className="ml-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-200 p-0.5 transition-colors"
                                    aria-label={`Remove ${feature.label}`}
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}

                        {allFeatures.filter(f => !selectedFeatures.some(sf => sf.label === f.label)).length > 0 && (
                            <select
                                onChange={(e) => {
                                    handleAddFeature(e.target.value);
                                    e.target.value = ''; // Reset select
                                }}
                                value=""
                                className="bg-transparent border-none focus:outline-none text-slate-600 text-sm cursor-pointer"
                            >
                                <option value="" disabled>+ Add feature...</option>
                                {allFeatures
                                    .filter(f => !selectedFeatures.some(sf => sf.label === f.label))
                                    .map(feature => (
                                        <option key={feature.label} value={feature.label}>
                                            {feature.label}
                                        </option>
                                    ))
                                }
                            </select>
                        )}
                    </div>

                    {selectedFeatures.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                            {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    <p className="text-sm text-slate-500">
                        * Required fields
                    </p>
                    <SubmitButton />
                </div>
            </motion.form>
        </motion.div>
    );
};

export default AddRoomPage;