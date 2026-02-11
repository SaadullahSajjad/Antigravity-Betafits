'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AccountSettingsClientProps {
    user: any;
}

export default function AccountSettingsClient({ user }: AccountSettingsClientProps) {
    const { data: session } = useSession();
    const currentUser = session?.user || user;
    
    const [name, setName] = useState(
        currentUser?.firstName && currentUser?.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : ''
    );
    const [email] = useState(currentUser?.email || '');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim()) {
            alert('Name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/account/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsEditing(false);
                // Refresh the session to get updated user data
                window.location.reload();
            } else {
                alert(data.error || 'Failed to update account');
            }
        } catch (error) {
            console.error('Error updating account:', error);
            alert('An error occurred while updating account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
            {/* Email Field */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900">{email}</span>
                    {/* Hide edit button if user doesn't have permission to update email */}
                    {currentUser?.canUpdateEmail !== false && (
                        <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => {
                                // Email editing might be restricted
                                alert('Email changes require administrator approval. Please contact support.');
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Name Field */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setIsEditing(true);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#97C25E] focus:border-transparent"
                    placeholder="Enter your name"
                />
            </div>

            {/* Update Button */}
            <div className="flex justify-start">
                <button
                    onClick={handleUpdate}
                    disabled={!isEditing || loading || !name.trim()}
                    className="px-6 py-3 bg-[#97C25E] hover:bg-[#8bb356] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {loading ? 'Updating...' : 'Update'}
                </button>
            </div>
        </div>
    );
}
