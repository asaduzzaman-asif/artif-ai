"use client";

import { SignInButton, SignUpButton, Show, UserButton, useUser } from '@clerk/nextjs';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { isSignedIn } = useUser();
    const [credits, setCredits] = useState<number | null>(null);

    // পেজ লোড হলে ইউজারের ক্রেডিট ফেচ করে আনা
    useEffect(() => {
        if (isSignedIn) {
            fetch("/api/user")
                .then((res) => res.json())
                .then((data) => {
                    if (data.credits !== undefined) {
                        setCredits(data.credits);
                    }
                })
                .catch((err) => console.error("Failed to load credits", err));
        }
    }, [isSignedIn]);

    return (
        <nav className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-extrabold text-white tracking-wide">
                            Artif<span className="text-indigo-500">AI</span>
                        </Link>
                    </div>

                    {/* Menu Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            <Link href="/" className="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Generate</Link>
                            <Link href="/gallery" className="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Gallery</Link>
                            <Link href="/pricing" className="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
                        </div>
                    </div>

                    {/* Auth Buttons & Credits */}
                    <div>
                        <div className="flex gap-4 items-center">
                            <Show when="signed-out">
                                <SignInButton mode="modal">
                                    <button className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition">Sign In</button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Sign Up</button>
                                </SignUpButton>
                            </Show>
                            
                            <Show when="signed-in">
                                {/* Credit Badge */}
                                {credits !== null && (
                                    <div className="bg-slate-800 text-indigo-400 px-3 py-1.5 rounded-full text-sm font-semibold border border-slate-700 flex items-center gap-1 shadow-sm">
                                        <span>✨</span> {credits} Credits
                                    </div>
                                )}
                                <UserButton />
                            </Show>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );



}








