"use client";

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { User, Mail, Save, KeyRound, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { DefaultButton } from '@/app/dashboard/components/DefaultButton';
import { updateProfile } from '@/actions';
import { useToast } from '@/app/dashboard/components/Toast';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

/**
 * A dedicated submit button that shows a loading state
 * when the form is being submitted.
 */
const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <DefaultButton type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                </>
            )}
        </DefaultButton>
    );
};

const ProfilePage = () => {
    const { data: session, status, update: updateSession } = useSession({ required: true });
    const { addToast } = useToast();

    // Use ref to track if we've already processed this state to prevent duplicate toasts
    const processedStateRef = useRef<any>(null);

    // Stable callback for updating session
    const handleSessionUpdate = useCallback(async (newName: string) => {
        try {
            // This will now trigger the JWT callback with trigger: "update"
            // which will fetch fresh user data from your API
            await updateSession();
        } catch (error) {
            console.error('Failed to update session:', error);
        }
    }, [updateSession]);

    // The useActionState hook manages the form's state
    const [state, formAction] = useActionState(updateProfile, undefined);

    // Fixed useEffect with proper state tracking to prevent loops
    React.useEffect(() => {
        // Skip if no state or if we've already processed this exact state object
        if (!state || processedStateRef.current === state) {
            return;
        }

        // Mark this state as processed
        processedStateRef.current = state;

        if (state.success) {
            addToast(state.message, 'success');

            // Update session with new name if provided
            if (state.newName && state.newName !== session?.user?.name) {
                handleSessionUpdate(state.newName);
            }
        } else {
            addToast(state.message, 'error');
        }
    }, [state, addToast, session?.user?.name, handleSessionUpdate]);

    // Reset processed state ref when form action is called
    const handleFormAction = useCallback((formData: FormData) => {
        processedStateRef.current = null;
        formAction(formData);
    }, [formAction]);

    // Show loading spinner while session is being fetched
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center p-8">
                <ContentSpinner />
                <span className="ml-3 text-slate-600">Loading your profile...</span>
            </div>
        );
    }

    const user = session?.user;
    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
                <p className="text-slate-500 mt-1">Manage your personal information and account settings.</p>
            </motion.div>

            <motion.form
                key={user?.id || 'profile-form'} // Use user ID instead of name for key
                action={handleFormAction}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80"
            >
                {/* Action State Feedback */}
                {state && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
                        state.success
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {state.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm">{state.message}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="md:col-span-1 flex flex-col items-center">
                        <img
                            src={`https://placehold.co/128x128/E2E8F0/475569?text=${userInitials}`}
                            alt="User Avatar"
                            className="h-32 w-32 rounded-full mb-4 ring-4 ring-offset-2 ring-blue-500"
                        />
                        <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                        <p className="text-slate-500 capitalize">{user?.role}</p>
                    </div>

                    {/* Form Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    defaultValue={user?.name || ''}
                                    className="block w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    defaultValue={user?.email || ''}
                                    className="block w-full pl-10 p-3 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Email address cannot be changed</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                                    New Password
                                </label>
                                <div className="relative mt-1">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        placeholder="Leave blank to keep current"
                                        className="block w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                    Confirm Password
                                </label>
                                <div className="relative mt-1">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="Confirm new password"
                                        className="block w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <SubmitButton />
                        </div>
                    </div>
                </div>
            </motion.form>
        </div>
    );
};

export default ProfilePage;