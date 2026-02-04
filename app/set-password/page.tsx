"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function SetPasswordPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if not authenticated or doesn't need to change password
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session?.user && !(session.user as any).mustChangePassword) {
            router.push("/");
            return;
        }
    }, [session, status, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Please enter both password fields");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Password set successfully, redirect to dashboard
                router.push("/");
                router.refresh();
            } else {
                setError(data.error || "Failed to set password");
                setLoading(false);
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    // Show loading while checking session
    if (status === "loading") {
        return (
            <div className="flex min-h-screen bg-white items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#97C25E] mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if redirecting
    if (status === "unauthenticated" || (session?.user && !(session.user as any).mustChangePassword)) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side */}
            <div className="flex-1 flex flex-col relative">
                {/* Top Left Logo */}
                <div className="p-8 pb-0">
                    <Image
                        src="/betafits-logo.png"
                        alt="Betafits"
                        width={120}
                        height={32}
                        className="h-8 w-auto"
                    />
                </div>

                {/* Centered Form Card */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-[420px] bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 py-12">
                        {/* Title */}
                        <div className="mb-10">
                            <h1 className="text-[28px] font-bold text-gray-900 mb-2">
                                Set your password
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Please create a secure password for your account.
                            </p>
                        </div>

                        {/* Password Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold text-gray-700 mb-2 tracking-wide"
                                >
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-4 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border-none focus:ring-1 focus:ring-[#97C25E]/50"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Must be at least 8 characters long
                                </p>
                            </div>

                            <div className="mb-8">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-bold text-gray-700 mb-2 tracking-wide"
                                >
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-4 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border-none focus:ring-1 focus:ring-[#97C25E]/50"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#97C25E] hover:bg-[#8bb356] text-white font-bold py-4 rounded-xl text-[15px] transition-all shadow-sm shadow-[#97C25E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Setting password..." : "Set Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Betafits Image & Centered Branding */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-b from-[#97C25E] to-[#f0f8e8]">
                <Image
                    src="/betafits-right-image.png"
                    alt="Betafits Background"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center top" }}
                    priority
                />
            </div>
        </div>
    );
}
