'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AccountSettingsClientProps {
    user: any;
}

export default function AccountSettingsClient({ user }: AccountSettingsClientProps) {
    const { data: session, update: updateSession } = useSession();
    const currentUser = session?.user || user;
    
    const [name, setName] = useState(
        currentUser?.firstName && currentUser?.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : ''
    );
    const [email] = useState(currentUser?.email || '');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleUpdate = async () => {
        if (!name.trim()) {
            alert('Name is required');
            return;
        }

        setLoading(true);
        setSuccessMessage(null);
        try {
            const response = await fetch('/api/account/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (response.ok) {
                const nameParts = name.trim().split(/\s+/);
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                await updateSession({ firstName, lastName });
                setIsEditing(false);
                setSuccessMessage('Account updated successfully.');
                setTimeout(() => setSuccessMessage(null), 4000);
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
        <div className="bg-white rounded-large shadow-card border border-neutral-200 p-3 mb-3">
            {/* Email Field */}
            <div className="mb-3">
                <label className="block text-label text-neutral-700 mb-2">
                    Email
                </label>
                <div className="flex items-center justify-between px-2 py-2 bg-neutral-50 rounded-medium border border-neutral-200">
                    <span className="text-neutral-900 text-body">{email}</span>
                    {/* Hide edit button if user doesn't have permission to update email */}
                    {currentUser?.canUpdateEmail !== false && (
                        <button
                            className="text-neutral-400 hover:text-neutral-600 transition-colors"
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
            <div className="mb-4">
                <label className="block text-label text-neutral-700 mb-2">
                    Name <span className="text-error-500">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setIsEditing(true);
                    }}
                    className="w-full h-10 px-2 bg-neutral-50 rounded-medium border border-neutral-300 text-neutral-900 text-body focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    placeholder="Enter your name"
                />
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-3 px-2 py-2 bg-success-bg border border-success-500 text-success-500 rounded-medium flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-body">{successMessage}</span>
                </div>
            )}

            {/* Update Button */}
            <div className="flex justify-start">
                <button
                    onClick={handleUpdate}
                    disabled={!isEditing || loading || !name.trim()}
                    className="h-10 px-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
                >
                    {loading ? 'Updating...' : 'Update'}
                </button>
            </div>
        </div>
    );
}
