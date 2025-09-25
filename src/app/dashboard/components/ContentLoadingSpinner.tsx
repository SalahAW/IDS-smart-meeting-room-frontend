"use client";

import React from 'react';

/**
 * A simple, centered loading spinner for the main content area of the dashboard.
 */
const contentLoadingSpinner = () => {
    return (
        <div className="flex h-fit w-full items-center justify-center">
            <div className="h-24 w-24 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
        </div>
    );
};

export default contentLoadingSpinner;