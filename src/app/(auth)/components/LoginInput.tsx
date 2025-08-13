import React, {useEffect, useState} from "react";
import {Eye, EyeOff} from "lucide-react";

export default function LoginInput({ placeholder, icon, type = "text", disabled = false, ...props }) {
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    useEffect(() => {
        if (type === "password") {
            setInputType(showPassword ? "text" : "password");
        }
    }, [showPassword, type]);

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div className={`${disabled ? 'text-slate-500' : 'text-slate-400 group-hover:text-blue-500'} transition-colors duration-200`}>
                    {icon}
                </div>
            </div>
            <input
                type={inputType}
                placeholder={placeholder}
                className={`w-full pl-12 pr-12 py-3.5 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-slate-400 text-white hover:bg-white/10 hover:border-white/30 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={disabled}
                {...props}
            />
            {type === "password" && !disabled && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-slate-400 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            )}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 ${!disabled ? 'group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5' : ''} transition-all duration-300 pointer-events-none`}></div>
        </div>
    );
}