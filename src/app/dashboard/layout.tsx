"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ToastProvider } from './components/Toast';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get the full session object, which includes the user
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-500">Authenticating...</p>
            </div>
        );
    }

    // Extract the user object from the session
    const user = session?.user;

    return (
        <ToastProvider>
            <div className="flex h-screen bg-slate-50 text-slate-800">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    // Now the 'user' variable exists and this works correctly
                    role={user?.role}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
};

export default DashboardLayout;