"use client";

import { useSession } from "next-auth/react";
import { AdminDashboard } from './components/views/AdminDashboard';
import EmployeeDashboard from './components/views/EmployeeDashboard';
import { GuestDashboard } from './components/views/GuestDashboard';

const DashboardPage = () => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    const user = session?.user;

    switch (user?.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'employee':
            return <EmployeeDashboard />;
        case 'guest':
            return <GuestDashboard />;
        default:
            return <div>Access Denied</div>;
    }
};

export default DashboardPage;