"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useFormState, useFormStatus } from 'react-dom';
import { createUser } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/dashboard/components/Toast';

/**
 * A reusable password input component with a show/hide toggle.
 */
const PasswordInput = ({ name, id, placeholder, required = false }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    return (
        <div className="relative">
            <input
                name={name}
                type={isPasswordVisible ? "text" : "password"}
                id={id}
                placeholder={placeholder}
                className="block w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={required}
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-700"
                aria-label="Toggle password visibility"
            >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
};

/**
 * A dedicated submit button aware of the form's submission status.
 */
const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <DefaultButton type="submit" size="lg" disabled={pending} className="w-full md:w-auto">
            <UserPlus size={18} className="mr-2" />
            {pending ? "Creating User..." : "Create User Account"}
        </DefaultButton>
    );
};

const AddUserPage = () => {
    const [state, dispatch] = useFormState(createUser, undefined);
    const router = useRouter();
    const { addToast } = useToast();
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    // This effect runs when the server action returns a response.
    useEffect(() => {
        if (state?.success) {
            // If successful, show the toast notification.
            addToast(state.message, 'success', 4000);
            // Wait a moment for the user to see the toast, then redirect.
            const timer = setTimeout(() => {
                router.push('/dashboard/users');
            }, 1000);
            return () => clearTimeout(timer);
        } else if (state && !state.success) {
            // Show error toast as well
            addToast(state.message, 'error', 5000);
        }
    }, [state, router, addToast]);

    const handleSubmit = async (formData: FormData) => {
        setIsFormSubmitted(true);
        dispatch(formData);
    };

    const ToggleSwitch = () => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="isActive" className="sr-only peer" defaultChecked/>
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/dashboard/users" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 group">
                    <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to User Management
                </Link>
                <h2 className="text-3xl font-bold text-slate-900">Create New User</h2>
                <p className="text-slate-500 mt-1">Add a new member to the SmartMeet system.</p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                action={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 max-w-4xl mx-auto"
            >
                {/* Enhanced error/success display */}
                {state && isFormSubmitted && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
                        state.success
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {state.success ? (
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className="font-medium">{state.success ? 'Success!' : 'Error'}</p>
                            <p className="text-sm mt-1">{state.message}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                name="fullName"
                                type="text"
                                id="fullName"
                                placeholder="e.g., Jane Smith"
                                className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                name="email"
                                type="email"
                                id="email"
                                placeholder="e.g., jane.smith@company.com"
                                className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                                User Role *
                            </label>
                            <select
                                name="role"
                                id="role"
                                className="block w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select a role</option>
                                <option value="Employee">Employee</option>
                                <option value="Admin">Admin</option>
                                <option value="Guest">Guest</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password *
                            </label>
                            <PasswordInput name="password" id="password" placeholder="Enter a strong password (min 6 chars)" required />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                Confirm Password *
                            </label>
                            <PasswordInput name="confirmPassword" id="confirmPassword" placeholder="Re-enter password" required />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-slate-700">Account Status</span>
                            <div className="flex items-center">
                                <span className="mr-3 text-sm text-slate-500">Active</span>
                                <ToggleSwitch/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    <p className="text-sm text-slate-500">
                        * Required fields
                    </p>
                    <SubmitButton />
                </div>
            </motion.form>
        </div>
    );
};

export default AddUserPage;