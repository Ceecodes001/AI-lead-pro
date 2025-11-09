
export enum View {
  Dashboard = 'Dashboard',
  Leads = 'Leads',
  Campaigns = 'Campaigns',
  Analytics = 'Analytics',
  Email = 'Email',
  Settings = 'Settings',
}

export interface ActivityEvent {
  type: 'Email Sent' | 'Email Opened' | 'Link Clicked' | 'Lead Created';
  date: string;
  details: string; // e.g., "Campaign: 'Q3 Outreach' (Version A)" or "Direct Email"
  campaignId?: string;
}


export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  lastContacted: string;
  potential: number;
  industry: string;
  location?: string;
  tags?: string[];
  activity?: ActivityEvent[];
  analysis?: LeadAnalysis;
  isAnalyzing?: boolean;
  analysisError?: boolean;
}

export interface PotentialLead {
  company: string;
  name:string;
  industry: string;
  reason: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface SummaryData {
    overview: string;
    totalFound: number;
    withEmail: number;
    withPhone: number;
    promisingProspects: string;
}

export type EmailComponentType = 'text' | 'image' | 'button' | 'spacer';

export interface BaseEmailComponent {
  id: string;
  type: EmailComponentType;
}

export interface TextComponent extends BaseEmailComponent {
  type: 'text';
  content: string;
}

export interface ImageComponent extends BaseEmailComponent {
  type: 'image';
  src: string;
  alt: string;
}

export interface ButtonComponent extends BaseEmailComponent {
  type: 'button';
  text: string;
  href: string;
}

export interface SpacerComponent extends BaseEmailComponent {
    type: 'spacer';
    height: number;
}

export type EmailComponent = TextComponent | ImageComponent | ButtonComponent | SpacerComponent;


export interface CampaignVariant {
    id: string;
    name: string;
    subject: string;
    body: EmailComponent[];
}

export interface FollowUpRule {
    id: string;
    trigger: 'not_opened' | 'not_clicked';
    delayDays: number;
    subject: string;
    body: EmailComponent[];
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Scheduled';
  openRate: number;
  clickRate: number;
  leads: number;
  startDate: string;
  variants: CampaignVariant[];
  followUps?: FollowUpRule[];
  leadIds?: string[];
  scheduledAt?: string;
}

export interface Email {
    subject: string;
    body: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

// FIX: Added 'text' property to the Message interface to hold the message content,
// which was missing and causing type errors in AIAssistant.tsx.
export interface Message {
    sender: 'user' | 'ai';
    text: string;
}

export interface LeadAnalysis {
  leadScore: number; // A score from 0 to 100
  summary: string; // A brief summary of the analysis
  keyInsights: string[]; // An array of key findings
  suggestedTalkingPoints: string[]; // An array of suggested talking points for outreach
}