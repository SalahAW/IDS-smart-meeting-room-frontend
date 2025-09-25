"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DefaultButton } from './DefaultButton';

/**
 * A full-page component displayed when a user does not have the required
 * permissions to view a specific page.
 */
const AccessDeniedPage = () => {
    return (
        // Main container to center the content vertically and horizontally.
        <motion.div
            className="flex h-full items-center justify-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-slate-200/80 max-w-lg w-full">

                {/* Icon container */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                    <ShieldOff className="h-9 w-9 text-red-500" />
                </div>

                {/* Main text content */}
                <h1 className="text-3xl font-bold text-slate-800">
                    Access Denied
                </h1>
                <p className="mt-3 text-slate-600">
                    Your user role is not recognized or you do not have the required permissions to view this page.
                </p>

                {/* Action buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/dashboard">
                        <DefaultButton>
                            <ArrowLeft size={16} className="mr-2" />
                            Go back to Dashboard
                        </DefaultButton>
                    </Link>
                    <a href="mailto:support@smartmeet.com" className="text-sm text-slate-500 hover:text-blue-600 hover:underline">
                        Contact Support
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default AccessDeniedPage;