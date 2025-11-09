import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Lead, Email, PotentialLead, Campaign, SummaryData, LeadAnalysis } from '../types';
import { generateEmailSequence, findPotentialLeads, generateDirectEmail, summarizePotentialLeads, analyzeLead } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import { LeadAnalysisModal } from './LeadAnalysisModal';
import { AnalyzeIcon } from './icons/Icons';

// --- Reusable Components ---
const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card-bg border border-white/10 rounded-2xl shadow-lg backdrop-blur-lg p-6 ${className}`}>
        {children}
    </div>
);

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-16 w-16',
    };
    return <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]}`}></div>;
};

const getStatusClass = (status: Lead['status']) => {
    switch(status) {
        case 'New': return 'bg-blue-500/20 text-blue-300';
        case 'Contacted': return 'bg-yellow-500/20 text-yellow-300';
        case 'Qualified': return 'bg-green-500/20 text-green-300';
        case 'Lost': return 'bg-red-500/20 text-red-300';
    }
}

const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
    const scoreColor = score >= 75 ? 'text-green-400 border-green-400/50' 
                     : score >= 50 ? 'text-yellow-400 border-yellow-400/50' 
                     : 'text-red-400 border-red-400/50';
    return (
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${scoreColor} bg-white/5 font-bold text-base`}>
            {score}
        </div>
    );
};

// --- Modals ---

const LeadFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Omit<Lead, 'lastContacted' | 'id'> & { id?: string }) => void;
    initialData?: Partial<Lead> | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '', company: '', email: '', phone: '', location: '',
        potential: 0, industry: '', status: 'New' as Lead['status'],
        tags: [] as string[],
    });
    const [currentTag, setCurrentTag] = useState('');

    const isEditing = useMemo(() => !!initialData?.id, [initialData]);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || '', company: initialData?.company || '',
                email: initialData?.email || '', phone: initialData?.phone || '',
                location: initialData?.location || '',
                potential: initialData?.potential || 0, industry: initialData?.industry || '',
                status: initialData?.status || 'New',
                tags: initialData?.tags || [],
            });
            setCurrentTag('');
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'potential' ? Number(value) : value }));
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
        }
        setCurrentTag('');
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        onSave({ ...formData, id: initialData?.id }); 
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-[95vw] max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-poppins font-bold">{isEditing ? 'Edit Lead' : 'Add New Lead'}</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Contact Name" className="bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" required />
                            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" className="bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="Industry" className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" required />
                            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., City, State)" className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="tags-input" className="block text-sm font-medium text-text-light">Tags</label>
                            <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[2.5rem]">
                                {formData.tags.map((tag, index) => (
                                    <div key={index} className="flex items-center bg-primary/30 text-primary-light rounded-full pl-3 pr-2 py-1 text-sm font-medium">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-lg leading-none hover:text-white transition-colors">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    id="tags-input"
                                    type="text" 
                                    value={currentTag} 
                                    onChange={(e) => setCurrentTag(e.target.value)} 
                                    onKeyDown={handleTagInputKeyDown}
                                    placeholder="Add a tag and press Enter" 
                                    className="flex-grow bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button type="button" onClick={handleAddTag} className="py-2 px-4 bg-primary/50 hover:bg-primary/80 rounded-lg transition-colors text-sm">Add</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="number" name="potential" value={formData.potential} onChange={handleChange} placeholder="Potential ($)" className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>New</option><option>Contacted</option><option>Qualified</option><option>Lost</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg transition-colors shadow-glow-primary ml-4">Save Lead</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

const PotentialLeadDetailsModal: React.FC<{
    lead: PotentialLead | null;
    onClose: () => void;
    onAdd: (lead: PotentialLead) => void;
}> = ({ lead, onClose, onAdd }) => {
    if (!lead) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <GlassCard className="w-[95vw] max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-poppins font-bold">{lead.company}</h2>
                        {lead.name && <p className="text-text-muted">{lead.name}</p>}
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                </div>
                <div className="space-y-4 text-sm">
                    <div>
                        <p className="font-semibold text-primary">Reason for Interest</p>
                        <p className="text-text-light">{lead.reason || 'N/A'}</p>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                            <p className="font-semibold text-primary">Industry</p>
                            <p>{lead.industry || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Location</p>
                            <p>{lead.location || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Email</p>
                            <p>{lead.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Phone</p>
                            <p>{lead.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">Close</button>
                    <button type="button" onClick={() => onAdd(lead)} className="py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg transition-colors shadow-glow-primary">Add this Lead</button>
                </div>
            </GlassCard>
        </div>
    );
};

const StatCard: React.FC<{ icon: 'document' | 'email' | 'phone'; value: number; label: string }> = ({ icon, value, label }) => {
    const icons = {
        document: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
        email: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
        phone: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>,
    };

    return (
        <div className="bg-black/20 p-3 rounded-lg flex flex-col items-center justify-center">
            <div className="text-primary mb-1">{icons[icon]}</div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
        </div>
    );
};

const FindLeadsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddLeads: (leads: Omit<Lead, 'id' | 'lastContacted'>[]) => void;
    existingCompanies: string[];
}> = ({ isOpen, onClose, onAddLeads, existingCompanies }) => {
    const [query, setQuery] = useState('tech companies in SF');
    const [count, setCount] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [foundLeads, setFoundLeads] = useState<PotentialLead[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [viewingLead, setViewingLead] = useState<PotentialLead | null>(null);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

    const groupedLeads = useMemo(() => {
        if (foundLeads.length === 0) return null;

        const groups: Record<string, { lead: PotentialLead; originalIndex: number }[]> = {
            'Email & Phone': [],
            'Email Only': [],
            'Phone Only': [],
            'Other': [],
        };

        foundLeads.forEach((lead, index) => {
            const hasEmail = lead.email && lead.email.trim() !== '';
            const hasPhone = lead.phone && lead.phone.trim() !== '';

            if (hasEmail && hasPhone) {
                groups['Email & Phone'].push({ lead, originalIndex: index });
            } else if (hasEmail) {
                groups['Email Only'].push({ lead, originalIndex: index });
            } else if (hasPhone) {
                groups['Phone Only'].push({ lead, originalIndex: index });
            } else {
                groups['Other'].push({ lead, originalIndex: index });
            }
        });
        
        // FIX: Replaced the `Object.fromEntries` logic which was causing type inference issues.
        // This new implementation ensures `nonEmptyGroups` is correctly typed, resolving downstream errors.
        const nonEmptyGroups = Object.fromEntries(
            Object.entries(groups).filter(([, leadsInGroup]) => leadsInGroup.length > 0)
        );

        return nonEmptyGroups;
    }, [foundLeads]);

    const handleSearch = async () => {
        setIsLoading(true);
        setFoundLeads([]);
        setSelectedIndices(new Set());
        setSummary(null);
        const results = await findPotentialLeads(query, count, existingCompanies);
        if (results && results.length > 0) {
            setFoundLeads(results);
            setIsSummarizing(true);
            const summaryData = await summarizePotentialLeads(results);
            setSummary(summaryData);
            setIsSummarizing(false);
        } else if (results) {
            setFoundLeads(results);
        }
        setIsLoading(false);
    };

    const handleAddSelected = () => {
        const leadsToAdd = foundLeads.filter((_, index) => selectedIndices.has(index));
        const newLeads = leadsToAdd.map(l => ({
            name: l.name || '',
            company: l.company,
            email: l.email || '',
            phone: l.phone || '',
            status: 'New' as const,
            potential: 0,
            industry: l.industry || 'Unknown',
            location: l.location || ''
        }));
        onAddLeads(newLeads);
        onClose();
    };

    const handleAddSingleLead = (leadToAdd: PotentialLead) => {
        const newLead = {
            name: leadToAdd.name || '',
            company: leadToAdd.company,
            email: leadToAdd.email || '',
            phone: leadToAdd.phone || '',
            status: 'New' as const,
            potential: 0,
            industry: leadToAdd.industry || 'Unknown',
            location: leadToAdd.location || ''
        };
        onAddLeads([newLead]);
        setViewingLead(null);
        setFoundLeads(prev => prev.filter(l => l !== leadToAdd));
        setSelectedIndices(new Set());
    };

    const handleToggleSelection = (index: number) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    
    const allSelected = selectedIndices.size === foundLeads.length && foundLeads.length > 0;

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(foundLeads.map((_, i) => i)));
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setFoundLeads([]);
            setIsLoading(false);
            setSelectedIndices(new Set());
            setViewingLead(null);
            setSummary(null);
            setIsSummarizing(false);
            setIsSummaryExpanded(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <GlassCard className="w-[95vw] max-w-3xl bg-gradient-to-br from-background to-[#1a1f36] border border-primary/30">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-poppins font-bold">Find Potential Leads with AI</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-grow w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., local coffee shops with no website" />
                        <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="bg-card-bg border border-white/10 rounded-lg py-2 px-4 w-20 focus:outline-none focus:ring-2 focus:ring-primary" />
                        <button onClick={handleSearch} disabled={isLoading} className="py-2 px-4 w-full sm:w-auto bg-accent hover:bg-accent/80 rounded-lg transition-colors shadow-glow-accent disabled:opacity-50 flex items-center justify-center">
                            {isLoading ? <LoadingSpinner size="sm" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
                            <span className="ml-2">Search</span>
                        </button>
                    </div>
                    
                    {(isSummarizing || (summary && !isLoading)) && (
                        <div className="mb-4 bg-primary/10 border border-primary/30 rounded-lg">
                             <button
                                onClick={() => setIsSummaryExpanded(prev => !prev)}
                                className="w-full flex justify-between items-center p-4 text-left"
                                aria-expanded={isSummaryExpanded}
                            >
                                <h3 className="font-semibold text-primary flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    AI Summary
                                </h3>
                                <svg className={`w-5 h-5 text-primary transform transition-transform duration-300 ${isSummaryExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                             <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${isSummaryExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-4 pb-4 pt-2">
                                    {isSummarizing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                                            <span className="text-sm text-text-muted">Analyzing leads...</span>
                                        </div>
                                    ) : summary ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                                                <StatCard icon="document" value={summary.totalFound} label="Leads Found" />
                                                <StatCard icon="email" value={summary.withEmail} label="With Email" />
                                                <StatCard icon="phone" value={summary.withPhone} label="With Phone" />
                                            </div>
                                            <p className="text-sm text-text-muted italic text-center px-2">{summary.overview}</p>
                                            <div>
                                                <h4 className="font-semibold text-sm text-text-light mb-1">Promising Prospects:</h4>
                                                <p className="text-sm text-text-light whitespace-pre-wrap">{summary.promisingProspects}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-muted">Could not generate a summary for these leads.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {foundLeads.length > 0 && !isLoading && (
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                                <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="h-4 w-4 rounded bg-card-bg border-white/30 text-primary focus:ring-primary accent-primary"/>
                                Select All
                            </label>
                            <p className="text-sm text-text-muted">{selectedIndices.size} / {foundLeads.length} selected</p>
                        </div>
                    )}

                    <div className="h-64 overflow-y-auto bg-black/20 rounded-lg p-2 space-y-2">
                        {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}
                        {!isLoading && foundLeads.length === 0 && <div className="flex items-center justify-center h-full text-text-muted">No leads found. Try a different query.</div>}
                        {!isLoading && groupedLeads && Object.entries(groupedLeads).map(([groupName, leadsInGroup]) => (
                            <div key={groupName}>
                                <h4 className="text-xs font-bold uppercase text-text-muted px-2 pt-2 pb-1">{groupName} ({leadsInGroup.length})</h4>
                                {leadsInGroup.map(({ lead, originalIndex }) => (
                                     <div key={originalIndex} className="p-3 bg-card-bg/80 rounded-lg border border-white/10 flex items-center justify-between gap-4 transition-colors hover:border-primary/50">
                                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIndices.has(originalIndex)}
                                                onChange={() => handleToggleSelection(originalIndex)}
                                                className="h-5 w-5 rounded bg-card-bg border-white/30 text-primary focus:ring-primary focus:ring-offset-0 accent-primary flex-shrink-0"
                                            />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-semibold text-white truncate">{lead.company}</h4>
                                                <p className="text-sm text-text-muted truncate">{lead.reason}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setViewingLead(lead)}
                                            className="text-sm py-1 px-3 bg-primary/20 hover:bg-primary/40 text-primary rounded-md transition-colors whitespace-nowrap"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                        <button onClick={handleAddSelected} disabled={selectedIndices.size === 0} className="py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg transition-colors shadow-glow-primary ml-4 disabled:opacity-50">Add Selected ({selectedIndices.size})</button>
                    </div>
                </GlassCard>
            </div>
            <PotentialLeadDetailsModal lead={viewingLead} onClose={() => setViewingLead(null)} onAdd={handleAddSingleLead} />
        </>
    );
};


const DirectEmailModal: React.FC<{
    lead: Lead | null;
    onClose: () => void;
    onUpdateLead: (lead: Lead) => void;
}> = ({ lead, onClose, onUpdateLead }) => {
    const [email, setEmail] = useState<Email | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    useEffect(() => {
        if (lead) {
            setIsLoading(true);
            setIsSent(false); // Reset on new lead
            generateDirectEmail(lead).then(generatedEmail => {
                setEmail(generatedEmail);
                setIsLoading(false);
            });
        }
    }, [lead]);
    
    const handleComposeEmail = () => {
        if (!lead || !email) return;

        const subject = encodeURIComponent(email.subject);
        const body = encodeURIComponent(email.body);
        const mailtoLink = `mailto:${lead.email}?subject=${subject}&body=${body}`;
        
        // Open the user's default email client
        window.location.href = mailtoLink;

        // Immediately update the lead's status in the UI
        const updatedLead = {
            ...lead,
            status: 'Contacted' as const,
            lastContacted: new Date().toISOString().split('T')[0],
            activity: [
                ...(lead.activity || []),
                {
                    type: 'Email Sent' as const,
                    date: new Date().toISOString(),
                    details: `Direct Email composed: "${email.subject}"`,
                }
            ],
        };
        onUpdateLead(updatedLead);
        
        setIsSent(true);
        
        setTimeout(() => {
            onClose();
        }, 3000);
    };


    if (!lead) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-[95vw] max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-poppins font-bold">Compose Direct Email</h2>
                        <p className="text-text-muted">To: {lead.name} ({lead.email})</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                </div>
                {isSent ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-xl font-semibold">Email Client Opened!</h3>
                        <p className="text-text-muted mt-2">Your default email app is ready. The lead has been marked as 'Contacted'.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <LoadingSpinner />
                        <p className="mt-4 text-text-muted">AI is crafting the perfect email...</p>
                    </div>
                ) : email ? (
                    <div>
                        <input
                            type="text"
                            value={email.subject}
                            onChange={e => setEmail({ ...email, subject: e.target.value })}
                            className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Subject"
                        />
                        <textarea
                            value={email.body}
                            onChange={e => setEmail({ ...email, body: e.target.value })}
                            className="w-full h-64 bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Email body"
                        />
                        <div className="mt-6 flex justify-end">
                            <button onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                            <button 
                                onClick={handleComposeEmail}
                                disabled={!email}
                                className="py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg transition-colors shadow-glow-primary ml-4 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                            >
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                    Compose Email
                                </>
                            </button>
                        </div>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-red-400">Could not generate email content.</p>
                     </div>
                )}
            </GlassCard>
        </div>
    );
};


// --- Main Leads View ---

interface LeadsProps {
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

const tagColors = [
    'bg-blue-500/30 text-blue-300',
    'bg-green-500/30 text-green-300',
    'bg-yellow-500/30 text-yellow-300',
    'bg-purple-500/30 text-purple-300',
    'bg-pink-500/30 text-pink-300',
    'bg-indigo-500/30 text-indigo-300',
];
const getTagColor = (index: number) => tagColors[index % tagColors.length];

const Leads: React.FC<LeadsProps> = ({ leads, setLeads, campaigns, setCampaigns }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isFindLeadsOpen, setIsFindLeadsOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [emailingLead, setEmailingLead] = useState<Lead | null>(null);
    const [analyzingLead, setAnalyzingLead] = useState<Lead | null>(null);

    const handleOpenForm = (lead: Lead | null = null) => {
        setEditingLead(lead);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingLead(null);
    };

    const handleSaveLead = useCallback(async (leadData: Omit<Lead, 'lastContacted' | 'id'> & { id?: string }) => {
        handleCloseForm();
        const isEditing = !!leadData.id;

        if (isEditing && leadData.id) {
            const leadId = leadData.id;
            const originalLead = leads.find(l => l.id === leadId);
            if (!originalLead) return;

            // This is the complete data for the lead, which we'll use for analysis
            const leadToAnalyze = { ...originalLead, ...leadData };

            // 1. Update UI to show loading state immediately
            setLeads(prev => prev.map(l => 
                l.id === leadId 
                ? { ...leadToAnalyze, isAnalyzing: true, analysis: undefined, analysisError: false } 
                : l
            ));

            // 2. Run analysis in the background
            try {
                const analysisResult = await analyzeLead(leadToAnalyze);
                // 3. Update UI with the final result
                setLeads(prev => prev.map(l => 
                    l.id === leadId 
                    ? { ...l, analysis: analysisResult || undefined, isAnalyzing: false, analysisError: !analysisResult } 
                    : l
                ));
            } catch (err) {
                console.error("Analysis failed for lead:", leadId, err);
                setLeads(prev => prev.map(l => 
                    l.id === leadId 
                    ? { ...l, isAnalyzing: false, analysisError: true, analysis: undefined } 
                    : l
                ));
            }
        } else {
            // This is a new lead
            const newLead: Lead = {
                ...leadData,
                id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                lastContacted: new Date().toISOString().split('T')[0],
                activity: [{ type: 'Lead Created', date: new Date().toISOString(), details: 'Lead created manually' }],
            };

            // 1. Add lead to list with loading state
            setLeads(prev => [{ ...newLead, isAnalyzing: true, analysis: undefined, analysisError: false }, ...prev]);

            // 2. Run analysis in the background
            try {
                const analysisResult = await analyzeLead(newLead);
                 // 3. Update the newly added lead with the result
                setLeads(prev => prev.map(l => 
                    l.id === newLead.id 
                    ? { ...l, analysis: analysisResult || undefined, isAnalyzing: false, analysisError: !analysisResult } 
                    : l
                ));
            } catch (err) {
                console.error("Analysis failed for new lead:", newLead.id, err);
                setLeads(prev => prev.map(l => 
                    l.id === newLead.id 
                    ? { ...l, isAnalyzing: false, analysisError: true, analysis: undefined } 
                    : l
                ));
            }
        }
    }, [leads, setLeads]);


    const handleDeleteLead = (id: string) => {
        if (window.confirm("Are you sure you want to delete this lead? This will also remove them from any associated campaigns.")) {
            // Remove the lead from the main list
            setLeads(prev => prev.filter(l => l.id !== id));

            // Remove the lead from any campaigns they are a part of
            const updatedCampaigns = campaigns.map(campaign => {
                if (campaign.leadIds && campaign.leadIds.includes(id)) {
                    const newLeadIds = campaign.leadIds.filter(leadId => leadId !== id);
                    return {
                        ...campaign,
                        leadIds: newLeadIds,
                        leads: newLeadIds.length,
                    };
                }
                return campaign;
            });
            setCampaigns(updatedCampaigns);
        }
    };
    
    const handleAddPotentialLeads = (newLeadsData: Omit<Lead, 'id' | 'lastContacted'>[]) => {
        const leadsToAdd: Lead[] = newLeadsData.map(data => ({
            ...data,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            lastContacted: new Date().toISOString().split('T')[0]
        }));
        setLeads(prev => [...leadsToAdd, ...prev]);
    };
    
    const handleUpdateLead = (updatedLead: Lead) => {
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    };

    const existingCompanies = useMemo(() => leads.map(l => l.company), [leads]);

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-poppins font-bold">Leads</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setIsFindLeadsOpen(true)}
                        className="flex-1 sm:flex-none bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-glow-accent flex items-center justify-center gap-2"
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        Find with AI
                    </button>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-glow-primary flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add Lead
                    </button>
                </div>
            </div>

            <GlassCard className="overflow-x-auto">
                 {leads.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-4">Name</th>
                                <th className="p-4">Company</th>
                                <th className="p-4">Tags</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Analysis Score</th>
                                <th className="p-4">Potential</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-semibold">{lead.name}</td>
                                    <td className="p-4 text-text-muted">{lead.company}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {lead.tags?.map((tag, index) => (
                                                <span key={index} className={`text-xs font-semibold whitespace-nowrap py-1 px-2 rounded-full ${getTagColor(index)}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold py-1 px-2 rounded-full ${getStatusClass(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center">
                                        {lead.isAnalyzing ? (
                                            <LoadingSpinner size="sm" />
                                        ) : lead.analysisError ? (
                                            <div className="flex justify-center" title="Analysis failed">
                                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                        ) : lead.analysis ? (
                                            <button
                                                onClick={() => setAnalyzingLead(lead)}
                                                title="View Full Analysis"
                                            >
                                                <ScoreDisplay score={lead.analysis.leadScore} />
                                            </button>
                                        ) : (
                                            <span className="text-text-muted text-xs">N/A</span>
                                        )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-text-muted">${lead.potential.toLocaleString()}</td>
                                    <td className="p-4 text-text-muted">{lead.email}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                             <button onClick={() => setAnalyzingLead(lead)} className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors" title="Analyze Lead with AI">
                                                <AnalyzeIcon />
                                            </button>
                                             <button onClick={() => setEmailingLead(lead)} className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors" title="Send Direct Email">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            </button>
                                            <button onClick={() => handleOpenForm(lead)} className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors" title="Edit Lead">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDeleteLead(lead.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Delete Lead">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold mb-2">No leads yet</h3>
                        <p className="text-text-muted">Add your first lead manually or use the AI to find new ones.</p>
                    </div>
                )}
            </GlassCard>

            <LeadFormModal 
                isOpen={isFormOpen} 
                onClose={handleCloseForm} 
                onSave={handleSaveLead}
                initialData={editingLead} 
            />
            <FindLeadsModal
                isOpen={isFindLeadsOpen}
                onClose={() => setIsFindLeadsOpen(false)}
                onAddLeads={handleAddPotentialLeads}
                existingCompanies={existingCompanies}
            />
             <DirectEmailModal
                lead={emailingLead}
                onClose={() => setEmailingLead(null)}
                onUpdateLead={handleUpdateLead}
            />
             <LeadAnalysisModal
                lead={analyzingLead}
                onClose={() => setAnalyzingLead(null)}
                initialAnalysis={analyzingLead?.analysis}
            />
        </>
    );
};

export default Leads;