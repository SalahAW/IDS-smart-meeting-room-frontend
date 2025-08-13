import {AlertCircle, CheckCircle} from "lucide-react";
import React from "react";

export default function LoginAlert({ type, message, onClose }) {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-500/10' : 'bg-green-500/10';
    const borderColor = isError ? 'border-red-500/30' : 'border-green-500/30';
    const textColor = isError ? 'text-red-300' : 'text-green-300';
    const Icon = isError ? AlertCircle : CheckCircle;

    return (
        <div className={`${bgColor} ${borderColor} border rounded-xl p-4 backdrop-blur-sm animate-fade-in`}>
            <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${textColor} flex-shrink-0`} />
                <p className={`text-sm ${textColor} flex-1`}>{message}</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`${textColor} hover:opacity-70 transition-opacity duration-200 cursor-pointer`}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}