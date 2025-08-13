"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, Building, Users, Tv, Mic, Video, X, Trash2 } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';

const AddRoomPage = () => {
    // List of all possible features
    const allFeatures = [
        { icon: Tv, label: 'Projector / TV' },
        { icon: Video, label: 'Video Conferencing' },
        { icon: Mic, label: 'Conference Phone' },
        { icon: Building, label: 'Whiteboard' },
    ];

    // State to manage the list of selected features for the new room
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    // Function to add a feature from the dropdown
    const handleAddFeature = (featureLabel) => {
        if (featureLabel && !selectedFeatures.some(f => f.label === featureLabel)) {
            const featureToAdd = allFeatures.find(f => f.label === featureLabel);
            setSelectedFeatures([...selectedFeatures, featureToAdd]);
        }
    };

    // Function to remove a feature by clicking its 'x' button
    const handleRemoveFeature = (featureLabel) => {
        setSelectedFeatures(selectedFeatures.filter(f => f.label !== featureLabel));
    };

    // NEW: Function to clear all selected features
    const handleClearFeatures = () => {
        setSelectedFeatures([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("New room created successfully!");
        window.location.href = '/dashboard/rooms';
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <a href="/dashboard/rooms" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to All Rooms
            </a>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Add New Meeting Room</h2>
                <p className="text-slate-500 mt-1">Configure the details and features for a new room.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="roomName" className="block text-sm font-medium text-slate-700">Room Name</label>
                        <input type="text" id="roomName" placeholder="e.g., Orion Conference Room" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                        <input type="text" id="location" placeholder="e.g., 3rd Floor, West Wing" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-slate-700">Capacity</label>
                        <input type="number" id="capacity" placeholder="e.g., 12" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                    </div>
                </div>

                {/* UPDATED: Features Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">Features</label>
                        {/* NEW: Clear All button appears when features are selected */}
                        {selectedFeatures.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearFeatures}
                                className="text-xs text-slate-500 hover:text-red-600 flex items-center font-semibold"
                            >
                                <Trash2 size={14} className="mr-1"/>
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="p-2 border border-slate-300 rounded-lg min-h-[50px] flex flex-wrap items-center gap-2">
                        {selectedFeatures.map(feature => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center bg-slate-100 text-slate-700 rounded-md pl-3 pr-2 py-1 text-sm font-medium"
                            >
                                <feature.icon size={16} className="mr-2 text-slate-500"/>
                                <span>{feature.label}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFeature(feature.label)}
                                    className="ml-2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                        <select
                            onChange={(e) => handleAddFeature(e.target.value)}
                            value="" // Reset select after choosing
                            className="bg-transparent flex-grow focus:outline-none text-slate-600"
                        >
                            <option value="" disabled>Add a feature...</option>
                            {allFeatures
                                .filter(f => !selectedFeatures.some(sf => sf.label === f.label))
                                .map(feature => (
                                    <option key={feature.label} value={feature.label}>{feature.label}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                    <DefaultButton type="submit" size="lg">
                        <PlusCircle size={18} className="mr-2"/>
                        Create Room
                    </DefaultButton>
                </div>
            </form>
        </motion.div>
    );
};

export default AddRoomPage;
