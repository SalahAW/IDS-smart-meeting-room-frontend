"use client";

import { useSessionTimeout } from '@/hooks/useSessionTimeout';

/**
 * A client component that activates the session timeout hook.
 * This component renders no UI but manages the session auto-logout logic.
 */
export const SessionManager = () => {
    // This line activates the auto-logout and toast notification logic.
    useSessionTimeout();

    // The component renders nothing.
    return null;
};