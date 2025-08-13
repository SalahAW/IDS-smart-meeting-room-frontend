'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })} // Redirect to home page after sign out
            style={{ marginTop: '20px' }}
        >
            Sign Out
        </button>
    );
}