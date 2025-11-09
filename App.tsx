
import React, { useCallback, useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Campaigns from './components/Campaigns';
import Analytics from './components/Analytics';
import AIAssistant from './components/AIAssistant';
import { View, Lead, Campaign } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { loadLeads, saveLeads, loadCampaigns, saveCampaigns } from './services/firebaseService';


const App: React.FC = () => {
    const [currentView, setCurrentView] = useLocalStorage<View>('currentView', View.Dashboard);
    const [isAssistantOpen, setAssistantOpen] = useLocalStorage<boolean>('isAssistantOpen', false);
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [loadedLeads, loadedCampaigns] = await Promise.all([
                loadLeads(),
                loadCampaigns(),
            ]);
            setLeads(loadedLeads || []);
            setCampaigns(loadedCampaigns || []);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Persist leads to Firebase whenever they change
    useEffect(() => {
        if (!isLoading) {
            saveLeads(leads);
        }
    }, [leads, isLoading]);

    // Persist campaigns to Firebase whenever they change
    useEffect(() => {
        if (!isLoading) {
            saveCampaigns(campaigns);
        }
    }, [campaigns, isLoading]);

    // Check for scheduled campaigns to activate
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            let needsUpdate = false;
            const updatedCampaigns = campaigns.map(campaign => {
                if (campaign.status === 'Scheduled' && campaign.scheduledAt && new Date(campaign.scheduledAt) <= now) {
                    needsUpdate = true;
                    return { ...campaign, status: 'Active' as const, scheduledAt: undefined };
                }
                return campaign;
            });

            if (needsUpdate) {
                setCampaigns(updatedCampaigns);
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [campaigns, setCampaigns]);


    const renderView = () => {
        switch (currentView) {
            case View.Dashboard:
                return <Dashboard leads={leads} campaigns={campaigns} />;
            case View.Leads:
                return <Leads leads={leads} setLeads={setLeads} campaigns={campaigns} setCampaigns={setCampaigns} />;
            case View.Campaigns:
                return <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} leads={leads} setLeads={setLeads} />;
            case View.Analytics:
                return <Analytics leads={leads} campaigns={campaigns} />;
            // Add other views here when implemented
            default:
                return <Dashboard leads={leads} campaigns={campaigns} />;
        }
    };

    const toggleAssistant = useCallback(() => {
        setAssistantOpen(prev => !prev);
    }, [setAssistantOpen]);

    const handleSetView = (view: View) => {
        setCurrentView(view);
        setMobileNavOpen(false);
    }
    
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-text-light">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse delay-150"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse delay-300"></div>
                    <span className="ml-2 font-poppins">Loading Data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-text-light font-inter overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar currentView={currentView} setCurrentView={handleSetView} />
            </div>

            {/* Mobile Sidebar */}
            {isMobileNavOpen && (
                 <div className="md:hidden fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)}></div>
                    <div className="relative z-10 h-full">
                         <Sidebar currentView={currentView} setCurrentView={handleSetView} isMobileView={true} />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col relative min-w-0">
                <Header 
                    currentView={currentView} 
                    toggleAssistant={toggleAssistant} 
                    toggleMobileNav={() => setMobileNavOpen(prev => !prev)} 
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
            
            {/* AI Assistant Overlay */}
            {isAssistantOpen && <div className="fixed inset-0 bg-black/60 z-30" onClick={toggleAssistant}></div>}
            <AIAssistant isOpen={isAssistantOpen} onClose={toggleAssistant} />
        </div>
    );
};

export default App;