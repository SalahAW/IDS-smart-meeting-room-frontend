"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge"; // Using tailwind-merge is still highly recommended to avoid class conflicts, but it's optional.

// Define the props for the button component
export interface DefaultButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'minimal' | 'pointerOnly' | 'edit';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

// Create the Button component
const DefaultButton = React.forwardRef<HTMLButtonElement, DefaultButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {

        // Base styles that apply to all buttons
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors" +
            " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

        // Styles for different variants
        const variantStyles = {
            default: "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer",
            destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 cursor-pointer",
            outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 cursor-pointer",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 cursor-pointer",
            ghost: "hover:bg-slate-100 hover:text-slate-900 cursor-pointer",
            minimal: "bg-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer",
            pointerOnly: "cursor-pointer hover:text-slate-900",
            edit: "bg-green-600 text-slate-50 hover:bg-green-500/90 cursor-pointer",
        };

        // Styles for different sizes
        const sizeStyles = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        };

        // Combine all the classes together
        const combinedClasses = twMerge(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            className
        );

        return (
            <button
                className={combinedClasses}
                ref={ref}
                {...props}
            />
        );
    }
);
DefaultButton.displayName = "DefaultButton";

export { DefaultButton };
