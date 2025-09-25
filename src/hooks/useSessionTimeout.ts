"use client";

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/app/dashboard/components/Toast';

export const useSessionTimeout = () => {
    const { data: session } = useSession();
    const { addToast } = useToast();

    useEffect(() => {
        // Do nothing if the session or required timing properties are not available.
        if (!session?.user?.loginTime || !session?.user?.maxAge) return;

        // MINIMAL CHANGE: Use the dynamic session duration from the session object.
        const sessionDuration = session.user.maxAge * 1000; // Convert seconds to milliseconds
        const warningTime = 10 * 1000;

        const expirationTime = (session.user.loginTime * 1000) + sessionDuration;
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;

        if (timeUntilExpiration <= 0) {
            signOut({ redirectTo: '/' });
            return;
        }

        const warningTimeout = setTimeout(() => {
            addToast('You will be logged out in 10 seconds to refresh your token.', 'error', 9000);
        }, timeUntilExpiration - warningTime);

        const logoutTimeout = setTimeout(() => {
            signOut({ redirectTo: '/' });
        }, timeUntilExpiration);

        return () => {
            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);
        };
    }, [session, addToast]);
};