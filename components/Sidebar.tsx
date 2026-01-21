'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Navigation items matching pages from context layer
    const navItems = [
        {
            id: 'home',
            name: 'Dashboard',
            href: '/',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        },
        {
            id: 'company-details',
            name: 'Company Details',
            href: '/company-details',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        },
        {
            id: 'benefit-plans',
            name: 'Benefit Plans',
            href: '/benefit-plans',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        },
        {
            id: 'benefits-analysis',
            name: 'Benefits Budget',
            href: '/benefits-analysis',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        },
        {
            id: 'employee-feedback',
            name: 'Employee Feedback',
            href: '/employee-feedback',
            icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
        },
        {
            id: 'faq',
            name: 'FAQ',
            href: '/faq',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            id: 'solutions-catalog',
            name: 'Solutions Catalog',
            href: '/solutions-catalog',
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className={`${isCollapsed ? 'w-24' : 'w-72'} border-r border-gray-100 bg-white h-full hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:border-gray-300 transition-all z-20 text-gray-400 hover:text-gray-600"
            >
                <svg className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Brand Header */}
            <div className={`p-8 pb-4 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-10 h-10 bg-brand-500 rounded-md flex items-center justify-center flex-shrink-0 text-white font-black text-xl">
                    B
                </div>
                {!isCollapsed && (
                    <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
                        Betafits
                    </span>
                )}
            </div>

            {/* Navigation */}
            <div className="p-6 flex-1 overflow-y-auto pt-10 px-4">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'} py-2.5 rounded-md transition-all duration-200 group font-semibold ${active
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-[#4b5563]/70 hover:bg-gray-50 hover:text-[#4b5563]'
                                    }`}
                            >
                                <svg
                                    className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-gray-900' : 'text-[#4b5563]/50 group-hover:text-[#4b5563]'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {!isCollapsed && (
                                    <span className="text-[14px] tracking-tight">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Profile */}
            <div className={`mt-auto p-6 border-t border-gray-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 bg-gray-50/50 p-2 w-full border border-gray-100'} rounded-md transition-all cursor-pointer group`}>
                    <div className="w-9 h-9 bg-brand-200 text-brand-800 flex items-center justify-center rounded-md font-bold text-[13px] flex-shrink-0">
                        MP
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-gray-900 truncate tracking-tight">
                                Matt Prisco
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium truncate">
                                Betafits Advisor
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
