"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GenerateMagicLinkPage() {
    const [email, setEmail] = useState("");
    const [magicLink, setMagicLink] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setMagicLink("");
        setLoading(true);

        if (!email) {
            setError("Please enter an email address");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/generate-magic-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.success !== false) {
                if (data.magicLink) {
                    setMagicLink(data.magicLink);
                    setError("");
                } else {
                    // User not found or other issue
                    setError(data.message || "User not found. Please check the email address.");
                    setMagicLink("");
                }
            } else {
                // Handle both error responses and success: false responses
                setError(data.message || data.error || "Failed to generate magic link");
                setMagicLink("");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (magicLink) {
            navigator.clipboard.writeText(magicLink);
            alert("Magic link copied to clipboard!");
        }
    };

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
                    <div className="w-full max-w-[500px] bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 py-12">
                        {/* Title */}
                        <div className="mb-10">
                            <h1 className="text-[28px] font-bold text-gray-900 mb-2">
                                Generate Magic Link
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Enter an email address to generate a magic link for user login.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-bold text-gray-700 mb-2 tracking-wide"
                                >
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@company.com"
                                    required
                                    className="w-full px-4 py-4 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border-none focus:ring-1 focus:ring-[#97C25E]/50"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            {magicLink && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <p className="text-xs font-bold text-green-800 mb-2">Magic Link Generated:</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={magicLink}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-xs text-gray-700 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-[#97C25E] hover:bg-[#8bb356] text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => window.open(magicLink, '_blank', 'noopener,noreferrer')}
                                        className="w-full px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                    >
                                        Open Magic Link
                                    </button>
                                    <p className="text-xs text-green-700 mt-2">
                                        Link has been stored in Airtable and is valid for 24 hours.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#97C25E] hover:bg-[#8bb356] text-white font-bold py-4 rounded-xl text-[15px] transition-all shadow-sm shadow-[#97C25E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Generating..." : "Generate Magic Link"}
                            </button>
                        </form>

                        {/* Back to login */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => router.push("/login")}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Betafits Image */}
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
