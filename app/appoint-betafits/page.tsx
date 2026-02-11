import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';

export const dynamic = 'force-dynamic';

export default async function AppointBetafitsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                title="Appoint Betafits"
                subtitle="Connect with our team to discuss your benefit strategy and next steps."
            />

            <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
                <p className="text-gray-500 font-medium">Content coming soon.</p>
            </div>
        </div>
    );
}
