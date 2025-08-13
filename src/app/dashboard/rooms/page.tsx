"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context (REDUNDANT)/_________AuthContext';
import { PlusCircle, Edit, Trash2, X, AlertTriangle, Hammer } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useToast } from '@/app/dashboard/components/Toast'; // Import the useToast hook

// --- MOCK DATA ---
const initialRoomsData = [
    { id: 1, name: "Orion", capacity: 10, status: "Available" },
    { id: 2, name: "Pegasus", capacity: 8, status: "In Use" },
    { id: 3, name: "Andromeda", capacity: 12, status: "Available" },
];

// --- Confirmation Modal ---
const ConfirmationModal = ({ count, onConfirm, onCancel }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900">Delete Room(s)</h3>
                    <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete {count} selected room(s)?</p>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <DefaultButton variant="destructive" onClick={onConfirm}>Confirm Deletion</DefaultButton>
                <DefaultButton variant="outline" onClick={onCancel}>Cancel</DefaultButton>
            </div>
        </motion.div>
    </motion.div>
);


const RoomsPage = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState(initialRoomsData);
    const [selectedRoomIds, setSelectedRoomIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { addToast } = useToast(); // Initialize the toast hook

    const handleDeleteSelected = () => {
        const count = selectedRoomIds.length;
        setRooms(currentRooms => currentRooms.filter(r => !selectedRoomIds.includes(r.id)));
        setSelectedRoomIds([]);
        setShowDeleteModal(false);
        // Trigger the toast notification
        addToast(`${count} room(s) deleted successfully.`, 'success');
    };

    // ... (rest of the component logic is the same)

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRoomIds(rooms.map(r => r.id));
        } else {
            setSelectedRoomIds([]);
        }
    };

    const handleSelectRoom = (id) => {
        setSelectedRoomIds(prev =>
            prev.includes(id) ? prev.filter(roomId => roomId !== id) : [...prev, id]
        );
    };


    return (
        <>
            <AnimatePresence>
                {showDeleteModal && <ConfirmationModal count={selectedRoomIds.length} onConfirm={handleDeleteSelected} onCancel={() => setShowDeleteModal(false)} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-6 h-12 flex items-center">
                    <AnimatePresence mode="wait">
                        {selectedRoomIds.length > 0 ? (
                            <motion.div key="actions" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-between w-full">
                                <h2 className="text-xl font-semibold text-slate-800">{selectedRoomIds.length} room(s) selected</h2>
                                <div className="flex items-center space-x-2">
                                    <DefaultButton variant="secondary"><Hammer size={16} className="mr-2" /> Set Maintenance</DefaultButton>
                                    <DefaultButton variant="destructive" onClick={() => setShowDeleteModal(true)}><Trash2 size={16} className="mr-2" /> Delete Selected</DefaultButton>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between w-full">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Meeting Rooms</h2>
                                    <p className="text-slate-500 mt-1">View, manage, and configure all meeting rooms.</p>
                                </div>
                                <a href="/dashboard/rooms/add">
                                    <DefaultButton><PlusCircle size={18} className="mr-2" /> Add New Room</DefaultButton>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    <table className="w-full text-left text-sm">
                        {/* Table Head */}
                        <thead>
                        <tr className="border-b border-slate-200">
                            <th className="p-4 w-12"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" onChange={handleSelectAll} checked={selectedRoomIds.length > 0 && selectedRoomIds.length === rooms.length}/></th>
                            <th className="p-4">Room Name</th>
                            <th className="p-4">Capacity</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                        {rooms.map(room => (
                            <tr key={room.id} className={`border-b border-slate-100 transition-colors ${selectedRoomIds.includes(room.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" checked={selectedRoomIds.includes(room.id)} onChange={() => handleSelectRoom(room.id)}/></td>
                                <td className="p-4 font-semibold">{room.name}</td>
                                <td className="p-4">{room.capacity} people</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{room.status}</span></td>
                                <td className="p-4 space-x-2 text-right">
                                    <a href={`/dashboard/rooms/edit/${room.id}`}><DefaultButton variant="secondary" size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><Edit size={16} /></DefaultButton></a>
                                    <DefaultButton variant="destructive" size="sm" onClick={() => { setSelectedRoomIds([room.id]); setShowDeleteModal(true); }}><Trash2 size={16} /></DefaultButton>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </>
    );
};

export default RoomsPage;