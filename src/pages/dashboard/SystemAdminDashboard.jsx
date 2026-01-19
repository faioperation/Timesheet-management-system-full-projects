import React from 'react';
import { FiUsers, FiBriefcase, FiCompass } from 'react-icons/fi';
import { PiBuildingsLight } from 'react-icons/pi'; // If available, otherwise FiBriefcase

const StatCard = ({ title, value, percentage, icon: Icon, iconColor, iconBg, badgeColor, badgeText }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
                    <Icon className={iconColor} size={20} />
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                    {badgeColor && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                            {badgeText}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function SystemAdminDashboard() {
    const stats = [
        {
            title: 'Total Company',
            value: '05',
            badgeText: '0%',
            badgeColor: 'bg-gray-100 text-gray-500',
            icon: FiCompass,
            iconColor: 'text-[#F46B6A]',
            iconBg: 'bg-[#FEF2F2]',
        },
        {
            title: 'Active Business',
            value: '10',
            badgeText: '+15%',
            badgeColor: 'bg-[#DCFCE7] text-[#1B654A]',
            icon: FiBriefcase,
            iconColor: 'text-[#1B654A]',
            iconBg: 'bg-[#F0FDF4]',
        },
        {
            title: 'Total User',
            value: '12',
            badgeText: '+10%',
            badgeColor: 'bg-[#DCFCE7] text-[#1B654A]',
            icon: FiUsers,
            iconColor: 'text-[#E5D416]',
            iconBg: 'bg-[#FEFCE8]',
        },
    ];

    return (
        <div className="w-full pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>
        </div>
    );
}
