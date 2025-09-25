"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { PlusCircle, Edit, Trash2, X, AlertTriangle, Hammer, Shield, Loader2 } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useToast } from '@/app/dashboard/components/Toast';
import { deleteRoom } from '@/actions';
import api from '@/lib/api';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';
import Link from 'next/link';

// Type for the Room object
interface Room {
    id: number;
    name: string;
    location?: string;
    capacity: number;
    status: string;
}

// Enhanced Confirmation Modal with loading states
const ConfirmationModal = ({ count, onConfirm, onCancel, isDeleting }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900">Delete Room{count > 1 ? 's' : ''}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Are you sure you want to delete {count} selected room{count > 1 ? 's' : ''}? This action cannot be undone and will permanently remove {count > 1 ? 'these rooms' : 'this room'} from the system.
                    </p>
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-xs text-amber-700">
                            <strong>Warning:</strong> Any scheduled meetings in {count > 1 ? 'these rooms' : 'this room'} may be affected.
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <DefaultButton
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="w-full sm:ml-3 sm:w-auto"
                >
                    {isDeleting ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        'Confirm Deletion'
                    )}
                </DefaultButton>
                <DefaultButton
                    variant="outline"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                    Cancel
                </DefaultButton>
            </div>
        </motion.div>
    </motion.div>
);

const RoomsPage = () => {
    const { data: session, status } = useSession({ required: true });
    const { addToast } = useToast();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isAdmin = session?.user?.role === 'admin';

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/Rooms');
                setRooms(response.data.rooms || []);
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
                setError("Could not load room data. Please try again later.");
                addToast("Failed to load rooms. Please try again.", 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [addToast]);

    const handleDeleteSelected = async () => {
        setIsDeleting(true);
        const roomsToDelete = [...selectedRoomIds];
        let successCount = 0;
        let failureCount = 0;

        try {
            // Delete rooms one by one (you could also implement batch delete in your API)
            for (const roomId of roomsToDelete) {
                try {
                    const result = await deleteRoom(roomId.toString());
                    if (result.success) {
                        successCount++;
                        // Remove the room from local state immediately
                        setRooms(currentRooms => currentRooms.filter(r => r.id !== roomId));
                    } else {
                        failureCount++;
                        console.error(`Failed to delete room ${roomId}:`, result.message);
                    }
                } catch (error) {
                    failureCount++;
                    console.error(`Error deleting room ${roomId}:`, error);
                }
            }

            // Show appropriate success/error messages
            if (successCount > 0) {
                addToast(
                    `${successCount} room${successCount !== 1 ? 's' : ''} deleted successfully.`,
                    'success'
                );
            }

            if (failureCount > 0) {
                addToast(
                    `Failed to delete ${failureCount} room${failureCount !== 1 ? 's' : ''}.`,
                    'error'
                );
            }

        } catch (error) {
            console.error("Error during bulk delete:", error);
            addToast("An unexpected error occurred during deletion.", 'error');
        } finally {
            setSelectedRoomIds([]);
            setShowDeleteModal(false);
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRoomIds(rooms.map(r => r.id));
        } else {
            setSelectedRoomIds([]);
        }
    };

    const handleSelectRoom = (id: number) => {
        setSelectedRoomIds(prev =>
            prev.includes(id) ? prev.filter(roomId => roomId !== id) : [...prev, id]
        );
    };

    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-700';
            case 'occupied':
                return 'bg-red-100 text-red-700';
            case 'maintenance':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    if (status === "loading") {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <ContentSpinner />
                <p className="ml-3 text-slate-600">Verifying session...</p>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {showDeleteModal && (
                    <ConfirmationModal
                        count={selectedRoomIds.length}
                        onConfirm={handleDeleteSelected}
                        onCancel={() => setShowDeleteModal(false)}
                        isDeleting={isDeleting}
                    />
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-6 h-12 flex items-center">
                    <AnimatePresence mode="wait">
                        {selectedRoomIds.length > 0 && isAdmin ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex items-center justify-between w-full"
                            >
                                <h2 className="text-xl font-semibold text-slate-800">
                                    {selectedRoomIds.length} room{selectedRoomIds.length !== 1 ? 's' : ''} selected
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <DefaultButton variant="secondary" disabled={isDeleting}>
                                        <Hammer size={16} className="mr-2" /> Set Maintenance
                                    </DefaultButton>
                                    <DefaultButton
                                        variant="destructive"
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 size={16} className="mr-2" /> Delete Selected
                                    </DefaultButton>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="title"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex items-center justify-between w-full"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Meeting Rooms</h2>
                                    <p className="text-slate-500 mt-1">View, manage, and configure all meeting rooms.</p>
                                </div>
                                {isAdmin && (
                                    <a href="/dashboard/rooms/add">
                                        <DefaultButton>
                                            <PlusCircle size={18} className="mr-2" /> Add New Room
                                        </DefaultButton>
                                    </a>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    {isLoading ? (
                        <div className="flex flex-col h-full w-full items-center justify-center gap-4 py-16">
                            <ContentSpinner />
                            <p className="text-slate-500 animate-pulse">Loading rooms...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <div className="text-red-600 mb-4">{error}</div>
                            <DefaultButton
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </DefaultButton>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-slate-500 mb-4">No rooms found.</p>
                            {isAdmin && (
                                <a href="/dashboard/rooms/add">
                                    <DefaultButton>
                                        <PlusCircle size={18} className="mr-2" /> Add First Room
                                    </DefaultButton>
                                </a>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                            <tr className="border-b border-slate-200">
                                {isAdmin && (
                                    <th className="p-4 w-12">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                            onChange={handleSelectAll}
                                            checked={selectedRoomIds.length > 0 && selectedRoomIds.length === rooms.length}
                                            disabled={isDeleting}
                                        />
                                    </th>
                                )}
                                <th className="p-4">Room Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Capacity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rooms.map(room => {
                                const statusText = room.status || 'Available';
                                const statusClass = getStatusClass(statusText);

                                return (
                                    <tr
                                        key={room.id}
                                        className={`border-b border-slate-100 transition-colors ${
                                            selectedRoomIds.includes(room.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                                        } ${isDeleting ? 'opacity-50' : ''}`}
                                    >
                                        {isAdmin && (
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                                    checked={selectedRoomIds.includes(room.id)}
                                                    onChange={() => handleSelectRoom(room.id)}
                                                    disabled={isDeleting}
                                                />
                                            </td>
                                        )}
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">{room.name}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-slate-600">{room.location || 'Not specified'}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-slate-600">{room.capacity} people</p>
                                        </td>
                                        <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                                    {statusText}
                                                </span>
                                        </td>
                                        <td className="p-4 space-x-2 text-right">
                                            {isAdmin ? (
                                                <>
                                                    <a href={`/dashboard/rooms/edit/${room.id}`}>
                                                        <DefaultButton
                                                            variant="secondary"
                                                            size="sm"
                                                            className="bg-green-100 text-green-700 hover:bg-green-200"
                                                            disabled={isDeleting}
                                                        >
                                                            <Edit size={16} />
                                                        </DefaultButton>
                                                    </a>
                                                    <DefaultButton
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRoomIds([room.id]);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 size={16} />
                                                    </DefaultButton>
                                                </>
                                            ) : (
                                                <Link href={`/dashboard/meetings/schedule?roomId=${room.id}`}>
                                                    <DefaultButton size="sm">Book Now</DefaultButton>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default RoomsPage;