import { View } from './types';
import { DashboardIcon, LeadsIcon, CampaignsIcon, AnalyticsIcon, EmailIcon, SettingsIcon } from './components/icons/Icons';

export const NAV_ITEMS = [
    { id: View.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { id: View.Leads, label: 'Leads', icon: LeadsIcon },
    { id: View.Campaigns, label: 'Campaigns', icon: CampaignsIcon },
    { id: View.Analytics, label: 'Analytics', icon: AnalyticsIcon },
    { id: View.Email, label: 'Email', icon: EmailIcon },
    { id: View.Settings, label: 'Settings', icon: SettingsIcon },
];
