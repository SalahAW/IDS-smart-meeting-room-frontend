"use client";

import React, {createContext, useContext, useState, ReactNode, useCallback, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

// --- CONTEXT SETUP ---
interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type: Toast['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// --- SINGLE TOAST COMPONENT ---
const Toast = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) => {
    const { id, message, type, duration = 3000 } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    const icons = {
        success: <CheckCircle className="text-green-500" />,
        error: <AlertTriangle className="text-red-500" />,
        info: <Info className="text-blue-500" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="relative flex w-full max-w-sm items-start space-x-4 overflow-hidden rounded-lg bg-white p-4 shadow-2xl"
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium text-slate-800">{message}</div>
            <button onClick={() => onDismiss(id)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={16} />
            </button>
            {/* Progress Bar */}
            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-blue-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
            />
        </motion.div>
    );
};


// --- TOAST PROVIDER ---
export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast['type'], duration: number = 3000) => {
        const newToast: Toast = { id: Date.now(), message, type, duration };
        setToasts(prevToasts => [...prevToasts, newToast]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
