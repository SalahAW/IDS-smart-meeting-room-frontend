"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, AtSign, Shield, Save } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';

// --- CUSTOM HOOK to get URL params on client ---
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

// --- MOCK DATA ---
const allUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Employee' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Admin' },
    // ... add other users if needed
];

const getUserDetails = (id) => allUsers.find(user => user.id.toString() === id) || null;

const EditUserPage = () => {
    const params = useClientParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            const userDetails = getUserDetails(params.id);
            setUser(userDetails);
            setIsLoading(false);
        }
    }, [params.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`User "${user.name}" updated successfully!`);
    };

    if (isLoading) return <div className="text-center p-8">Loading user data...</div>;
    if (!user) return <div className="text-center p-8">User not found.</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <a href="/dashboard/users" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to User Management
            </a>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Edit User</h2>
                <p className="text-slate-500 mt-1">Modify the details for {user.name}.</p>
            </div>

            {/* UPDATED: Removed max-width to allow the form to fill the container */}
            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 w-full"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <div className="mt-1 relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="text" id="name" defaultValue={user.name} className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg" required />
                        </div>
                    </div>
                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                        <div className="mt-1 relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="email" id="email" defaultValue={user.email} className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg" required />
                        </div>
                    </div>
                    {/* User Role */}
                    <div className="md:col-span-2">
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">User Role</label>
                        <div className="mt-1 relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select id="role" defaultValue={user.role} className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg appearance-none" required>
                                <option>Employee</option>
                                <option>Admin</option>
                                <option>Guest</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200">
                    <DefaultButton type="submit" size="lg">
                        <Save size={18} className="mr-2" />
                        Save Changes
                    </DefaultButton>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default EditUserPage;