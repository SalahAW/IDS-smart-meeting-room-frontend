"use client";

// --- NECESSARY CHANGES START HERE ---

// 1. Import useSession instead of useAuth
import { useSession } from "next-auth/react";

import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle, Shield } from "lucide-react";
import React, { useState, useMemo, useEffect } from 'react';
import { DefaultButton } from "@/app/dashboard/components/DefaultButton";
import { motion, AnimatePresence } from "framer-motion";
import api from '@/lib/api';

// --- Confirmation Modal Component (Unchanged) ---
const ConfirmationModal = ({ onConfirm, onCancel, count }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900">Delete User(s)</h3>
                    <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete {count} selected user(s)? This action cannot be undone.</p>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <DefaultButton variant="destructive" onClick={onConfirm} className="w-full sm:ml-3 sm:w-auto">Confirm Deletion</DefaultButton>
                <DefaultButton variant="outline" onClick={onCancel} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</DefaultButton>
            </div>
        </motion.div>
    </motion.div>
);

const UsersPage = () => {
    // 2. Use the useSession hook to get session data
    const { data: session } = useSession();
    // 3. Extract the user object from the session for easier use
    const user = session?.user;

    // --- NECESSARY CHANGES END HERE ---

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Data Fetching Logic (Unchanged) ---
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/Users');
                setUsers(response.data.users || []);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Could not load user data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteSelected = () => {
        console.log("Deleting users:", selectedUserIds);
        setUsers(currentUsers => currentUsers.filter(u => !selectedUserIds.includes(u.id)));
        setSelectedUserIds([]);
        setShowDeleteModal(false);
    };

    // Pagination logic (Unchanged)
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return users.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, users]);

    const totalPages = Math.ceil(users.length / itemsPerPage);

    // Helper functions (Unchanged)
    const handleSelectAll = (e) => {
        if (e.target.checked) { setSelectedUserIds(paginatedUsers.map(u => u.id)); }
        else { setSelectedUserIds([]); }
    };
    const handleSelectUser = (id) => {
        setSelectedUserIds(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
    };

    // Map Role ID to Role Name for display (Unchanged)
    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Employee';
            case 3: return 'Guest';
            default: return 'Unknown';
        }
    };

    const getRoleClass = (roleId) => {
        if (roleId === 1) return 'bg-indigo-100 text-indigo-700';
        if (roleId === 2) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
    };

    // --- Component Render (Unchanged) ---
    // The rest of your component's JSX remains exactly the same.
    // The `user?.role === 'admin'` check will now work correctly.
    return (
        <>
            <AnimatePresence>
                {showDeleteModal && <ConfirmationModal count={selectedUserIds.length} onConfirm={handleDeleteSelected} onCancel={() => setShowDeleteModal(false)} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-6 h-12 flex items-center">
                    <AnimatePresence mode="wait">
                        {selectedUserIds.length > 0 ? (
                            <motion.div key="actions" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-between w-full">
                                <h2 className="text-xl font-semibold text-slate-800">{selectedUserIds.length} user(s) selected</h2>
                                <div className="flex items-center space-x-2">
                                    <DefaultButton variant="secondary"><Shield size={16} className="mr-2" /> Change Role</DefaultButton>
                                    <DefaultButton variant="destructive" onClick={() => setShowDeleteModal(true)}><Trash2 size={16} className="mr-2" /> Delete Selected</DefaultButton>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between w-full">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">User Management</h2>
                                    <p className="text-slate-500 mt-1">View, add, and manage user accounts.</p>
                                </div>
                                <a href="/dashboard/users/add">
                                    <DefaultButton><PlusCircle size={18} className="mr-2" /> Add New User</DefaultButton>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60">
                    {isLoading ? (
                        <div className="text-center py-16">Loading users...</div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-600">{error}</div>
                    ) : (
                        <>
                            <table className="w-full text-left text-sm">
                                <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="p-4 w-12"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" onChange={handleSelectAll} checked={selectedUserIds.length > 0 && selectedUserIds.length === paginatedUsers.length} /></th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    {user?.role === 'admin' && (<th className="p-4 text-right">Actions</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedUsers.map(u => (
                                    <tr key={u.id} className={`border-b border-slate-100 transition-colors ${selectedUserIds.includes(u.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                        <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" checked={selectedUserIds.includes(u.id)} onChange={() => handleSelectUser(u.id)} /></td>
                                        <td className="p-4"><p className="font-semibold text-slate-800">{u.name}</p><p className="text-slate-500">{u.email}</p></td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleClass(u.roleId)}`}>{getRoleName(u.roleId)}</span></td>
                                        {user?.role === 'admin' && (
                                            <td className="p-4 space-x-2 text-right">
                                                <a href={`/dashboard/users/edit/${u.id}`}><DefaultButton variant="secondary" size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><Edit size={16} /></DefaultButton></a>
                                                <DefaultButton variant="destructive" size="sm" onClick={() => { setSelectedUserIds([u.id]); setShowDeleteModal(true); }}><Trash2 size={16} /></DefaultButton>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-sm text-slate-500">Showing {paginatedUsers.length} of {users.length} users</span>
                                    <div className="flex items-center space-x-2">
                                        <DefaultButton variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft size={16} /></DefaultButton>
                                        <span className="text-sm font-medium text-slate-600">{currentPage} / {totalPages}</span>
                                        <DefaultButton variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight size={16} /></DefaultButton>
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

export default UsersPage;