
import React, { useState, useEffect, useMemo } from 'react';
import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import { FunnelData, Campaign, Lead } from '../types';
import { getAIInsight } from '../services/geminiService';

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card-bg border border-white/10 rounded-2xl shadow-lg backdrop-blur-lg p-6 ${className}`}>
        {children}
    </div>
);

const CampaignCard: React.FC<{ campaign: Campaign & { calculatedOpenRate: number } }> = ({ campaign }) => (
    <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors">
        <div>
            <p className="font-semibold">{campaign.name}</p>
            <p className="text-sm text-text-muted">{campaign.leads} leads</p>
        </div>
        <div className={`text-xs font-bold py-1 px-2 rounded-full ${campaign.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
            {campaign.status}
        </div>
    </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full min-h-[150px] text-text-muted">
        <p>{message}</p>
    </div>
);


const Dashboard: React.FC<{ leads: Lead[]; campaigns: Campaign[] }> = ({ leads, campaigns }) => {
    const [aiSuggestion, setAiSuggestion] = useState('Generating suggestion...');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(true);

    const campaignStats = useMemo(() => {
        return campaigns.map(campaign => {
            const campaignLeads = leads.filter(l => campaign.leadIds?.includes(l.id));
            if (campaignLeads.length === 0) {
                return { ...campaign, calculatedOpenRate: 0, calculatedClickRate: 0 };
            }

            let sentCount = 0;
            let openCount = 0;

            for (const lead of campaignLeads) {
                const sentEvent = lead.activity?.find(a => a.type === 'Email Sent' && a.campaignId === campaign.id);
                if (sentEvent) {
                    sentCount++;
                    const openedEvent = lead.activity?.find(a => a.type === 'Email Opened' && a.campaignId === campaign.id);
                    if (openedEvent) {
                        openCount++;
                    }
                }
            }
            
            const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
            return { 
                ...campaign, 
                calculatedOpenRate: parseFloat(openRate.toFixed(1)),
            };
        });
    }, [campaigns, leads]);

    useEffect(() => {
        const generateSuggestion = async () => {
            setIsLoadingSuggestion(true);
            const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
            const activeCampaigns = campaignStats.filter(c => c.status === 'Active');
            const totalOpenRate = activeCampaigns.reduce((sum, c) => sum + c.calculatedOpenRate, 0);
            const avgOpenRate = activeCampaigns.length > 0 ? (totalOpenRate / activeCampaigns.length).toFixed(2) : 0;

            const prompt = `Analyze the following sales data and provide one concise, actionable suggestion for me (Jonathan, a web developer) to improve my lead generation or campaign performance. Leads count: ${leads.length}, Qualified leads: ${qualifiedLeads}. Active campaigns: ${activeCampaigns.length}. Average open rate for active campaigns: ${avgOpenRate}%.`;

            const insight = await getAIInsight(prompt);
            setAiSuggestion(insight);
            setIsLoadingSuggestion(false);
        };
        if (leads.length > 0 || campaigns.length > 0) {
            generateSuggestion();
        } else {
            setAiSuggestion("Add some leads or create a campaign to get started with AI suggestions.");
            setIsLoadingSuggestion(false);
        }
    }, [leads, campaignStats, campaigns.length]);

    const qualifiedLeadsCount = useMemo(() => leads.filter(l => l.status === 'Qualified').length, [leads]);
    const contactedLeadsCount = useMemo(() => leads.filter(l => l.status === 'Contacted' || l.status === 'Qualified').length, [leads]);
    const allLeadsCount = leads.length;

    const conversionFunnel: FunnelData[] = [
        { name: 'Total Leads', value: allLeadsCount, fill: '#4B6EF5' },
        { name: 'Contacted', value: contactedLeadsCount, fill: '#60A5FA' },
        { name: 'Qualified', value: qualifiedLeadsCount, fill: '#8B5CF6' },
    ];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Cards */}
            <GlassCard className="lg:col-span-1 text-center">
                <h3 className="font-semibold text-text-muted mb-1">Total Leads</h3>
                <p className="text-4xl font-bold text-primary">{allLeadsCount}</p>
            </GlassCard>
             <GlassCard className="lg:col-span-1 text-center">
                <h3 className="font-semibold text-text-muted mb-1">Contacted</h3>
                <p className="text-4xl font-bold">{contactedLeadsCount}</p>
            </GlassCard>
            <GlassCard className="lg:col-span-1 text-center">
                <h3 className="font-semibold text-text-muted mb-1">Qualified</h3>
                <p className="text-4xl font-bold text-green-400">{qualifiedLeadsCount}</p>
            </GlassCard>

            {/* AI Suggestion */}
            <GlassCard className="lg:col-span-1 flex flex-col justify-center items-center text-center bg-accent/10 border-accent/30">
                 <svg className="w-8 h-8 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <h3 className="font-semibold mb-2">AI Suggestion</h3>
                {isLoadingSuggestion ? (
                     <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300"></div>
                    </div>
                ) : (
                    <p className="text-sm text-text-muted">{aiSuggestion}</p>
                )}
            </GlassCard>

            {/* Funnel Chart */}
            <GlassCard className="md:col-span-2 lg:col-span-2">
                <h3 className="text-xl font-poppins font-semibold mb-4">Lead Conversion Funnel</h3>
                 {allLeadsCount > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart>
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 18, 25, 0.8)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.75rem'
                                }}
                            />
                            <Funnel dataKey="value" data={conversionFunnel} isAnimationActive>
                                <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                 ) : (
                    <EmptyState message="No lead data to display." />
                 )}
            </GlassCard>

            {/* Active Campaigns */}
            <GlassCard className="md:col-span-2 lg:col-span-2">
                <h3 className="text-xl font-poppins font-semibold mb-4">Active Campaigns Overview</h3>
                <div className="space-y-2">
                    {campaignStats.filter(c => c.status === 'Active').length > 0 ? (
                        campaignStats
                            .filter(c => c.status === 'Active')
                            .slice(0, 5) // Show top 5
                            .map(c => <CampaignCard key={c.id} campaign={c} />)
                    ) : (
                        <EmptyState message="No active campaigns." />
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default Dashboard;
