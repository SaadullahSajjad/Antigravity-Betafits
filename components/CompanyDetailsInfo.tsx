'use client';

import React, { useState } from 'react';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

export default function CompanyDetailsInfo({ data }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(data);

    const handleSave = () => {
        // TODO: Implement API call to update company data
        setIsEditing(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Legal & Contact Information</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Manage your company's legal and contact details.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-bold hover:bg-brand-700 transition-colors"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedData(data);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-[13px] font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-bold hover:bg-brand-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Company Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.companyName}
                            onChange={(e) => setEditedData({ ...editedData, companyName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-gray-900">{data.companyName || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Industry
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.industry}
                            onChange={(e) => setEditedData({ ...editedData, industry: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-gray-900">{data.industry || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Website
                    </label>
                    {isEditing ? (
                        <input
                            type="url"
                            value={editedData.website}
                            onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-brand-600">
                            {data.website ? (
                                <a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {data.website.replace(/^https?:\/\//, '')}
                                </a>
                            ) : '-'}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Phone Number
                    </label>
                    {isEditing ? (
                        <input
                            type="tel"
                            value={editedData.phone}
                            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-gray-900">{data.phone || '-'}</p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Address
                    </label>
                    {isEditing ? (
                        <textarea
                            value={editedData.address}
                            onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-gray-900">{data.address || '-'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
