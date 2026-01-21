import React from 'react';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata = {
    title: 'Betafits Prospect Portal',
    description: 'Manage your intake workflow and document submissions',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50">
                <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
