"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Shield, ArrowLeft, Save } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';

const AddUserPage = () => {
    // In a real app, this would be a form with state management and API calls
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("New user created successfully!");
        // Redirect to the main users page or admin dashboard
        window.location.href = '/dashboard';
    };

    const ToggleSwitch = () => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked/>
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <a href="/dashboard" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 group">
                    <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Admin Dashboard
                </a>
                <h2 className="text-3xl font-bold text-slate-900">Create New User</h2>
                <p className="text-slate-500 mt-1">Add a new member to the SmartMeet system.</p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 max-w-4xl mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" id="fullName" placeholder="e.g., Jane Smith" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" id="email" placeholder="e.g., jane.smith@company.com" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">User Role</label>
                            <select id="role" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg bg-white" required>
                                <option>Employee</option>
                                <option>Admin</option>
                                <option>Guest</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <input type="password" id="password" placeholder="Enter a strong password" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <input type="password" id="confirmPassword" placeholder="Re-enter password" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-slate-700">Account Status</span>
                            <div className="flex items-center">
                                <span className="mr-3 text-sm text-slate-500">Active</span>
                                <ToggleSwitch/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8 mt-8 border-t border-slate-200">
                    <DefaultButton type="submit" size="lg">
                        <UserPlus size={18} className="mr-2" />
                        Create User Account
                    </DefaultButton>
                </div>
            </motion.form>
        </div>
    );
};

export default AddUserPage;

