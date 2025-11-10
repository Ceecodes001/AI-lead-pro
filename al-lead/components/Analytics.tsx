'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData, Lead, Campaign } from '@/types';

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card-bg border border-white/10 rounded-2xl shadow-lg backdrop-blur-lg p-6 ${className}`}>
        {children}
    </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-[300px] text-text-muted">
        <p>{message}</p>
    </div>
);

interface AnalyticsProps {
    leads: Lead[];
    campaigns: Campaign[];
}

const Analytics: React.FC<AnalyticsProps> = ({ leads, campaigns }) => {
    
    // Example data processing. In a real app, this would be more sophisticated.
    const openRateOverTime: ChartData[] = campaigns
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map(c => ({
            name: c.startDate,
            value: c.openRate,
        }));

    const topEmailsByClicks: ChartData[] = campaigns
        .sort((a,b) => b.clickRate - a.clickRate)
        .slice(0, 5)
        .map(c => ({
            name: c.name,
            value: c.clickRate
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-background/80 border border-white/10 rounded-lg shadow-lg">
                    <p className="label font-semibold">{label}</p>
                    <p className="text-primary">{`${payload[0].name} : ${payload[0].value}%`}</p>
                </div>
            );
        }
        return null;
    };
     const CustomBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-background/80 border border-white/10 rounded-lg shadow-lg">
                     <p className="label font-semibold">{label}</p>
                    <p className="text-accent">{`${payload[0].name} : ${payload[0].value}%`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <h1 className="text-2xl font-poppins font-bold mb-6">Analytics Overview</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h2 className="text-xl font-poppins font-semibold mb-4">Campaign Open Rate Over Time</h2>
                    {openRateOverTime.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={openRateOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#A3A3A3" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#A3A3A3" unit="%" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" name="Open Rate" stroke="#4B6EF5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState message="No data available. Launch a campaign to see open rates." />
                    )}
                </GlassCard>
                 <GlassCard>
                    <h2 className="text-xl font-poppins font-semibold mb-4">Top Performing Campaigns by Clicks</h2>
                    {topEmailsByClicks.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                           <ResponsiveContainer>
                              <BarChart data={topEmailsByClicks}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                                    <XAxis dataKey="name" stroke="#A3A3A3" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#A3A3A3" unit="%" />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Legend />
                                    <Bar dataKey="value" name="Click Rate" fill="#FF8A00" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState message="No click data available yet." />
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default Analytics;
