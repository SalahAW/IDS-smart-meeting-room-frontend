import React from "react";

export default function LoginButton({ children, className, disabled = false, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`relative overflow-hidden cursor-pointer bg-gradient-to-r from-teal-600 via-teal-600 to-teal-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 group ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">{children}</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
    );
}