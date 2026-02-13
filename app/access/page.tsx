"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

function AccessPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Invalid access link. Missing token.");
            setLoading(false);
            return;
        }

        // Authenticate with magic link token
        const authenticate = async () => {
            try {
                console.log("[Access Page] Attempting authentication with token:", token.substring(0, 20) + "...");
                
                const result = await signIn("magic-link", {
                    token,
                    redirect: false,
                });

                console.log("[Access Page] SignIn result:", { ok: result?.ok, error: result?.error });

                if (result?.error) {
                    const errorMessage = process.env.NODE_ENV === 'development' 
                        ? `Magic link validation failed: ${result.error}. Check server logs for details.`
                        : "It seems your magic link is no longer valid. Please, contact your administrator.";
                    setError(errorMessage);
                    setLoading(false);
                } else if (result?.ok) {
                    console.log("[Access Page] Authentication successful, redirecting...");
                    // Check if user needs to change password
                    // This will be handled by middleware or redirect logic
                    router.push("/");
                    router.refresh();
                } else {
                    // No result - this shouldn't happen but handle it
                    setError("Authentication failed. Please try again.");
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("[Access Page] Authentication error:", err);
                const errorMessage = process.env.NODE_ENV === 'development'
                    ? `Error: ${err.message || 'Unknown error'}`
                    : "An error occurred. Please try again.";
                setError(errorMessage);
                setLoading(false);
            }
        };

        authenticate();
    }, [token, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#97C25E] mb-4"></div>
                    <p className="text-gray-600">Verifying access link...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="flex-1 flex flex-col relative">
                    <div className="p-8 pb-0">
                        <Image
                            src="/betafits-logo.png"
                            alt="Betafits"
                            width={120}
                            height={32}
                            className="h-8 w-auto"
                        />
                    </div>
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="w-full max-w-[420px] bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 py-12 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-red-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <h1 className="text-[28px] font-bold text-gray-900 mb-2">
                                    Something went wrong...
                                </h1>
                                <p className="text-gray-600 text-sm mb-6">{error}</p>
                                <button
                                    onClick={() => router.push("/")}
                                    className="w-full bg-[#97C25E] hover:bg-[#8bb356] text-white font-bold py-4 rounded-xl text-[15px] transition-all shadow-sm shadow-[#97C25E]/20"
                                >
                                    back to home page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

    return null;
}

export default function AccessPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen bg-white items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#97C25E] mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <AccessPageContent />
        </Suspense>
    );
}
