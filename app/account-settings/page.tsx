import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import AccountSettingsClient from '@/components/AccountSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    const user = session.user as any;
    const userInitials = user?.firstName && user?.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-white">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#97C25E] to-[#8bb356] h-48 flex flex-col items-center justify-end pb-8">
                {/* Avatar */}
                <div className="w-20 h-20 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                    {userInitials}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto -mt-10 px-4">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-2">
                        Account settings
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Manage your account
                    </p>
                </div>

                {/* Account Information Card */}
                <AccountSettingsClient user={session.user} />
            </div>
        </div>
    );
}
