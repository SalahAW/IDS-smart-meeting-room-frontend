"use client";

// MINIMAL CHANGE: Import useMemo
import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ToastProvider } from './components/Toast';
import { SessionManager } from './components/SessionManager';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: session, status } = useSession();
    const user = session?.user;

    // MINIMAL CHANGE: Memoize the children to prevent re-renders from session updates
    const memoizedChildren = useMemo(() => children, [children]);

    return (
        <ToastProvider>
            <SessionManager />
            <div className="flex h-screen bg-slate-50 text-slate-800">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    role={user?.role}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8 sm-p-6 relative">
                        <div style={{ visibility: status === 'loading' ? 'hidden' : 'visible' }}>
                            {/* MINIMAL CHANGE: Render the memoized children */}
                            {memoizedChildren}
                        </div>

                        {status === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                                <ContentSpinner />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
};

export default DashboardLayout;