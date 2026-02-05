'use client';

import React from 'react';

interface Props {
    title: string;
    subtitle: string;
}

export default function DashboardHeader({ title, subtitle }: Props) {
    return (
        <header>
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                {title}
            </h1>
            <p className="text-[15px] text-gray-500 font-medium mt-1">
                {subtitle}
            </p>
        </header>
    );
}
