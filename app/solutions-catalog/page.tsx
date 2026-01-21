import React from 'react';
import SolutionsCatalog from '@/components/SolutionsCatalog';
import { SOLUTIONS } from '@/constants';

export default function SolutionsCatalogPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="max-w-xl">
                    <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                        Solutions Ecosystem
                    </h1>
                    <p className="text-[15px] text-gray-500 font-medium mt-1">
                        Explore our curated network of top-tier providers and platforms.
                    </p>
                </div>
            </header>

            <SolutionsCatalog solutions={SOLUTIONS} />
        </div>
    );
}
