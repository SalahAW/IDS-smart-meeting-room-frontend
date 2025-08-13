"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';

const ProfilePage = () => {
    // In a real app, user data would come from a context or API
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Employee',
        avatar: 'https://placehold.co/128x128/E2E8F0/475569?text=JD'
    };

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
                <p className="text-slate-500 mt-1">Manage your personal information and account settings.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="md:col-span-1 flex flex-col items-center">
                        <img src={user.avatar} alt="User Avatar" className="h-32 w-32 rounded-full mb-4 ring-4 ring-offset-2 ring-blue-500" />
                        <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                        <p className="text-slate-500">{user.role}</p>
                        <DefaultButton variant="outline" size="sm" className="mt-4">Change Photo</DefaultButton>
                    </div>

                    {/* Form Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" id="name" defaultValue={user.name} className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" id="email" defaultValue={user.email} className="mt-1 block w-full p-3 border border-slate-300 rounded-lg bg-slate-100" readOnly />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">New Password</label>
                            <input type="password" id="password" placeholder="Leave blank to keep current password" className="mt-1 block w-full p-3 border border-slate-300 rounded-lg" />
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <DefaultButton>
                                <Save size={16} className="mr-2"/>
                                Save Changes
                            </DefaultButton>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;