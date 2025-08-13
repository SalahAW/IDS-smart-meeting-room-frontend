"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

// You can wrap all your client-side providers here
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={false}>
            {children}
        </SessionProvider>
    );
}