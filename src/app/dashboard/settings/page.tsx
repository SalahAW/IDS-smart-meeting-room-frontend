"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Palette, Shield } from 'lucide-react';

const SettingsPage = () => {

    const SettingRow = ({ icon: Icon, title, description, children }) => (
        <div className="flex items-start justify-between py-6 border-b border-slate-200">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                    <Icon className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800">{title}</h4>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );

    // A simple toggle switch component
    const ToggleSwitch = () => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked/>
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
                <p className="text-slate-500 mt-1">Customize your application experience.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80"
            >
                <h3 className="text-xl font-bold text-slate-800 mb-2">Preferences</h3>
                <div className="divide-y divide-slate-200">
                    <SettingRow icon={Bell} title="Email Notifications" description="Receive email alerts for meeting invites and updates.">
                        <ToggleSwitch />
                    </SettingRow>
                    <SettingRow icon={Palette} title="Dark Mode" description="Enable a darker theme for the application.">
                        <ToggleSwitch />
                    </SettingRow>
                    <SettingRow icon={Shield} title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                        <ToggleSwitch />
                    </SettingRow>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
