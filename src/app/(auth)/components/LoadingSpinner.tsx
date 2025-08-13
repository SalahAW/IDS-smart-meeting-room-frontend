import {Loader2} from "lucide-react";
import React from "react";

export default function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-50">
            <div className="bg-white/10 rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                    <p className="text-white font-semibold text-sm font-black">Please Wait</p>
                </div>
            </div>
        </div>
    );
}