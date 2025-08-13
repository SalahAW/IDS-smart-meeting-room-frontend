import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (

        <div className="min-h-screen bg-gradient-to-br from-[#032B44] via-[#04293A] to-[#032B44] flex items-center justify-center p-4">
            <div className="flex flex-col items-center max-w-md w-full rounded-[2em] shadow-xl ">
                {children}
            </div>
        </div>
    );
}