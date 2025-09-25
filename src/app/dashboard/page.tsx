"use client";

import { useSession } from "next-auth/react";
import { AdminDashboard } from './components/views/AdminDashboard';
import EmployeeDashboard from './components/views/EmployeeDashboard';
import { GuestDashboard } from './components/views/GuestDashboard';
import ContentLoadingSpinner from "@/app/dashboard/components/ContentLoadingSpinner";
import AccessDeniedPage from "@/app/dashboard/components/AccessDeniedPage";

// A simple, consistent loading component for the dashboard.
const DashboardLoading = () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <ContentLoadingSpinner />
        <p className="text-slate-500 animate-pulse">Please Wait...</p>
    </div>
);

const DashboardPage = () => {
    // MINIMAL CHANGE: Add the `required: true` option to the useSession hook.
    // This tells NextAuth.js that this is a protected page and it must have a valid session.
    // It will show the loading state until the session is confirmed.
    const { data: session, status } = useSession({
        required: true,
    });

    // While the session is being verified, the status will be 'loading'.
    // Because of `required: true`, we will never see an 'unauthenticated' state here;
    // the user would have been redirected away by the middleware or this hook.
    if (status === "loading") {
        return <DashboardLoading />;
    }

    // If we reach this point, `required: true` guarantees that the session and user object exist.
    const user = session.user;

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'employee':
            return <EmployeeDashboard />;
        case 'guest':
            return <GuestDashboard />;
        default:
            // This 'Access Denied' message handles the case of an authenticated
            // user who has a missing or unknown role, which is a much safer default.
            return <AccessDeniedPage />;
    }
};

export default DashboardPage;