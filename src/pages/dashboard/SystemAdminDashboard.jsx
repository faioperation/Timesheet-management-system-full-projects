import React, { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiCompass } from 'react-icons/fi';
import { PiBuildingsLight } from 'react-icons/pi';
import { apiFetch } from '../../libs/apiFetch';

const StatCard = ({ title, value, percentage, icon: Icon, iconColor, iconBg, badgeColor, badgeText, isLoading }) => {
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
                    {isLoading ? (
                        <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                            {badgeColor && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                                    {badgeText}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function SystemAdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [businessStats, setBusinessStats] = useState({
        total: 0,
        active: 0,
        totalUsers: 0,
    });

    useEffect(() => {
        fetchDashboardStatistics();
    }, []);

    const fetchDashboardStatistics = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/system-dashboard', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const result = await response.json();
            console.log('Dashboard data:', result);

            // API returns: { business: number, activeBusiness: number, user: number }
            setBusinessStats({
                total: result.business || 0,
                active: result.activeBusiness || 0,
                totalUsers: result.user || 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        {
            title: 'Total Company',
            value: businessStats.total.toString().padStart(2, '0'),
            badgeText: '0%',
            badgeColor: 'bg-gray-100 text-gray-500',
            icon: FiCompass,
            iconColor: 'text-[#F46B6A]',
            iconBg: 'bg-[#FEF2F2]',
        },
        {
            title: 'Active Business',
            value: businessStats.active.toString().padStart(2, '0'),
            badgeText: businessStats.total > 0
                ? `${Math.round((businessStats.active / businessStats.total) * 100)}%`
                : '0%',
            badgeColor: 'bg-[#DCFCE7] text-[#1B654A]',
            icon: FiBriefcase,
            iconColor: 'text-[#1B654A]',
            iconBg: 'bg-[#F0FDF4]',
        },
        {
            title: 'Total User',
            value: businessStats.totalUsers.toString().padStart(2, '0'),
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
                    <StatCard key={index} {...stat} isLoading={isLoading} />
                ))}
            </div>
        </div>
    );
}
