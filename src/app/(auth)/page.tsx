'use client';

import React, { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Mail, Lock, UserPlus } from 'lucide-react';
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import Button from "@/app/(auth)/components/LoginButton"; // Assuming this is the correct path
import Input from "@/app/(auth)/components/LoginInput";   // Assuming this is the correct path
import Alert from "@/app/(auth)/components/LoginAlert";   // Assuming this is the correct path
import LoadingSpinner from "@/app/(auth)/components/LoadingSpinner"; // Assuming this is the correct path
import Typewriter from "@/app/(auth)/components/Typewriter"; // Assuming this is the correct path

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setErrorMessage(undefined); // Clear previous errors

    startTransition(async () => {
      const identifier = formData.get('identifier') as string;
      const password = formData.get('password') as string;

      // Basic validation
      if (!identifier || !password) {
        setErrorMessage("Email and password are required.");
        return;
      }

      try {
        const result = await signIn('credentials', {
          redirect: false, // We handle the redirect manually
          identifier,
          password,
        });

        if (result?.error) {
          // The error from the `authorize` function in auth.ts will be caught here
          console.error('Login Failed:', result.error);
          setErrorMessage('Invalid login credentials. Please try again.');
        } else if (result?.ok) {
          // On successful login, redirect to the dashboard
          // The middleware will handle this, but a manual push is good for UX
          router.push('/dashboard');
          router.refresh(); // Ensures the page re-renders with user session
        }
      } catch (err) {
        console.error('An unexpected error occurred during login:', err);
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    });
  };

  return (
      <>
        <AnimatedBackground />
        {/* We now use the `action` attribute with a server action that calls our handler */}
        <form action={handleSubmit} className="LoginContainer flex flex-col w-full max-w-md gap-8 relative z-10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl bg-white/10">

          <div className={"Logo flex items-center space-x-3 group cursor-pointer"}>
            <a href={"/"} className={"LogoGroup flex items-center space-x-3 group cursor-pointer"}>
              <div className="relative">
                <img src="/favicon.ico" alt="Logo"
                     className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"/>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-0 group-hover:opacity-20 blur transition-opacity duration-200"></div>
              </div>
              <h1 className={"LogoText text-[2em] font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"}>
                SmartMeet</h1>
            </a>
          </div>

          <div className={"WelcomeBack flex flex-col items-center"}>
            <h1 className={"text-[1.5em] font-bold text-white mb-2 cursive-font"}>
              <Typewriter text="Welcome Back!" delay={80} />
            </h1>
            <p className={"text-[0.7em] text-slate-300 cursive-font"}>
              <Typewriter text="Sign in to your account" delay={60} />
            </p>
          </div>

          {/* Pass the pending state and error message down */}
          <LoginFormContent errorMessage={errorMessage} isPending={isPending} />

        </form>

        <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
        .cursive-font { font-family: 'Dancing Script', cursive; font-weight: 600; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; opacity: 0; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
      </>
  );
}

// This component now receives the pending state from its parent
function LoginFormContent({ errorMessage, isPending }: { errorMessage: string | undefined, isPending: boolean }) {
  return (
      <>
        {isPending && <LoadingSpinner />}

        {errorMessage && (
            <Alert
                type="error"
                message={errorMessage}
            />
        )}

        <div className={"LoginForm flex flex-col gap-4 animate-fade-in animation-delay-400"}>
          <Input
              name="identifier" // Changed from 'email' to 'identifier' to match the signIn call
              placeholder={"Email or Username"}
              icon={<Mail className={"w-4 h-4"} />}
              type="text" // Allow text for username
              disabled={isPending}
              required
          />
          <Input
              name="password"
              placeholder={"Password"}
              icon={<Lock className={"w-4 h-4"} />}
              type="password"
              disabled={isPending}
              required
          />
          <div className={"flex items-center justify-between"}>
            <p className="text-sm text-slate-300 hover:text-blue-400 cursor-pointer transition-colors duration-200 hover:underline">Forgot Password?</p>
          </div>

          <Button type="submit" className={"w-full"} disabled={isPending}>
            Sign In
          </Button>

          <div className={"flex items-center justify-center"}>
            <button type="button" className="group flex items-center space-x-2 text-sm text-slate-300 cursor-pointer hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 hover:shadow-md" disabled={isPending}>
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:underline">Request an account</span>
            </button>
          </div>
        </div>
      </>
  );
}




