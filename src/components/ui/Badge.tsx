import React from "react";

interface BadgeProps {
    children: React.ReactNode
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    size?: 'sm' | 'md'
}

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
    const variants = {
        default: 'bg-slate-100 text-slate-600',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700'
    }

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm'
    }

    return (
        <span className={`${variants[variant]} ${sizes[size]} rounded-full font-medium`}>
      {children}
    </span>
    )
}
