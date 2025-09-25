"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, AtSign, Shield, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { useFormState, useFormStatus } from 'react-dom';
import { updateUser, getUserById } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/dashboard/components/Toast';

// --- CUSTOM HOOK to get URL params on client ---
const useClientParams = () => {
    const [params, setParams] = useState({ id: '' });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const id = pathSegments[pathSegments.length - 1];
            setParams({ id });
        }
    }, []);
    return params;
};

/**
 * A dedicated submit button aware of the form's submission status.
 */
const SubmitButton = ({ isLoading }: { isLoading: boolean }) => {
    const { pending } = useFormStatus();
    const isDisabled = pending || isLoading;

    return (
        <DefaultButton type="submit" size="lg" disabled={isDisabled}>
            {isDisabled ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
                <Save size={18} className="mr-2" />
            )}
            {pending ? "Updating User..." : "Save Changes"}
        </DefaultButton>
    );
};

const EditUserPage = () => {
    const params = useClientParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    // Form state for the update action
    const [updateState, updateDispatch] = useFormState(updateUser, undefined);

    const router = useRouter();
    const { addToast } = useToast();

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            if (!params.id) return;

            setIsLoading(true);
            setFetchError(null);

            try {
                const result = await getUserById(params.id);
                if (result.success && result.user) {
                    setUser(result.user);
                } else {
                    setFetchError(result.message || 'Failed to load user data');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setFetchError('An unexpected error occurred while loading user data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [params.id]);

    // Handle update response
    useEffect(() => {
        if (updateState?.success) {
            addToast(updateState.message, 'success', 4000);
            // Wait a moment for the user to see the toast, then redirect.
            const timer = setTimeout(() => {
                router.push('/dashboard/users');
            }, 1500);
            return () => clearTimeout(timer);
        } else if (updateState && !updateState.success) {
            addToast(updateState.message, 'error', 5000);
        }
    }, [updateState, router, addToast]);

    const handleSubmit = async (formData: FormData) => {
        setIsFormSubmitted(true);
        // Add the user ID to the form data
        formData.append('userId', params.id);
        updateDispatch(formData);
    };

    const getRoleIdFromName = (roleName: string): string => {
        switch (roleName.toLowerCase()) {
            case 'admin': return '1';
            case 'employee': return '2';
            case 'guest': return '3';
            default: return '2';
        }
    };

    const getRoleNameFromId = (roleId: number): string => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Employee';
            case 3: return 'Guest';
            default: return 'Employee';
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Loading user data...</span>
            </div>
        );
    }

    // Error state
    if (fetchError || !user) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/dashboard/users" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                    <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to User Management
                </Link>
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex items-start space-x-3">
                    <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium">Error Loading User</h3>
                        <p className="text-sm mt-1">{fetchError || 'User not found'}</p>
                        <Link
                            href="/dashboard/users"
                            className="inline-block mt-3 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                        >
                            Return to User List
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/dashboard/users" className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 group">
                <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Back to User Management
            </Link>

            <div>
                <h2 className="text-3xl font-bold text-slate-900">Edit User</h2>
                <p className="text-slate-500 mt-1">Modify the details for {user.name}.</p>
            </div>

            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                action={handleSubmit}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 w-full"
            >
                {/* Enhanced error/success display */}
                {updateState && isFormSubmitted && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
                        updateState.success
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {updateState.success ? (
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className="font-medium">{updateState.success ? 'Success!' : 'Error'}</p>
                            <p className="text-sm mt-1">{updateState.message}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                            Full Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                defaultValue={user.name}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="Enter full name"
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address *
                        </label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                defaultValue={user.email}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>

                    {/* User Role */}
                    <div className="md:col-span-2">
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                            User Role *
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                id="role"
                                name="role"
                                defaultValue={getRoleNameFromId(user.roleId)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                required
                            >
                                <option value="">Select a role</option>
                                <option value="Employee">Employee</option>
                                <option value="Admin">Admin</option>
                                <option value="Guest">Guest</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Info Display */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">User Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">User ID:</span>
                            <span className="ml-2 font-medium">{user.id}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Created:</span>
                            <span className="ml-2 font-medium">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Last Updated:</span>
                            <span className="ml-2 font-medium">
                                {new Date(user.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    <p className="text-sm text-slate-500">
                        * Required fields
                    </p>
                    <SubmitButton isLoading={isLoading} />
                </div>
            </motion.form>
        </motion.div>
    );
};

export default EditUserPage;