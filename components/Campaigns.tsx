

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Campaign, CampaignVariant, FollowUpRule, Lead, EmailComponent, EmailComponentType, TextComponent, ImageComponent, ButtonComponent, SpacerComponent } from '../types';
import { generateEmailVariations, findLeadEmail, generateEmailTemplate, generateInitialCampaignEmail, suggestLeadsForCampaign } from '../services/geminiService';

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card-bg border border-white/10 rounded-2xl shadow-lg backdrop-blur-lg p-6 ${className}`}>
        {children}
    </div>
);

const createId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// --- Email Builder Component (In-file for simplicity) ---
const EmailBuilder: React.FC<{ 
    body: EmailComponent[];
    // FIX: Changed setBody prop type to prevent type mismatch at call site.
    // The component only ever calls this with a value, not a function updater.
    setBody: (body: EmailComponent[]) => void;
}> = ({ body, setBody }) => {
    const [draggedItem, setDraggedItem] = useState<EmailComponent | null>(null);
    const [draggedType, setDraggedType] = useState<EmailComponentType | null>(null);
    const lastIndicatorId = useRef<string | null>(null);

    const handleDragStart = (e: React.DragEvent, item: EmailComponent | null, type?: EmailComponentType) => {
        if (item) {
            setDraggedItem(item);
        } else if (type) {
            setDraggedType(type);
        }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, index?: number) => {
        e.preventDefault();
        
        if (lastIndicatorId.current) {
            const indicator = document.getElementById(lastIndicatorId.current);
            if (indicator) {
                indicator.classList.remove('scale-x-100');
                indicator.classList.add('scale-x-0');
            }
            lastIndicatorId.current = null;
        }

        let newItem: EmailComponent | null = null;
        if (draggedType) {
            // FIX: Use a switch statement to correctly type the new component.
            // The previous implementation with spread attributes created a wider type
            // that was not assignable to the EmailComponent discriminated union.
            switch (draggedType) {
                case 'text':
                    newItem = { id: createId(), type: 'text', content: 'This is a new text block. Click to edit.' };
                    break;
                case 'image':
                    newItem = { id: createId(), type: 'image', src: 'https://picsum.photos/600/300', alt: 'Placeholder' };
                    break;
                case 'button':
                    newItem = { id: createId(), type: 'button', text: 'Click Me', href: '#' };
                    break;
                case 'spacer':
                    newItem = { id: createId(), type: 'spacer', height: 20 };
                    break;
            }
        } else if (draggedItem) {
            newItem = draggedItem;
        }

        if (!newItem) return;

        const newBody = draggedItem ? body.filter(item => item.id !== draggedItem.id) : [...body];
        const insertAt = index === undefined ? newBody.length : index;
        newBody.splice(insertAt, 0, newItem);

        setBody(newBody);
        setDraggedItem(null);
        setDraggedType(null);
    };
    
     const handleDragEnterItem = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (lastIndicatorId.current !== id) {
            if (lastIndicatorId.current) {
                const lastIndicator = document.getElementById(lastIndicatorId.current);
                if (lastIndicator) {
                    lastIndicator.classList.remove('scale-x-100');
                    lastIndicator.classList.add('scale-x-0');
                }
            }
            const indicator = document.getElementById(id);
            if (indicator) {
                indicator.classList.remove('scale-x-0');
                indicator.classList.add('scale-x-100');
                lastIndicatorId.current = id;
            }
        }
    };

    const handleCanvasDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            if (lastIndicatorId.current) {
                const indicator = document.getElementById(lastIndicatorId.current);
                if (indicator) {
                    indicator.classList.remove('scale-x-100');
                    indicator.classList.add('scale-x-0');
                }
                lastIndicatorId.current = null;
            }
        }
    };

    const handleUpdate = (id: string, newProps: Partial<EmailComponent>) => {
        setBody(body.map(item => item.id === id ? { ...item, ...newProps } : item));
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this component? This action cannot be undone.")) {
            setBody(body.filter(item => item.id !== id));
        }
    };

    const renderComponent = (item: EmailComponent) => {
        switch (item.type) {
            case 'text':
                const textItem = item as TextComponent;
                return <div className="p-2" dangerouslySetInnerHTML={{ __html: textItem.content.replace(/\n/g, '<br />') }} />;
            case 'image':
                 const imgItem = item as ImageComponent;
                return <img src={imgItem.src} alt={imgItem.alt} className="max-w-full h-auto" />;
            case 'button':
                const btnItem = item as ButtonComponent;
                return <a href={btnItem.href} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary text-white font-bold py-2 px-6 rounded-lg no-underline">{btnItem.text}</a>;
            case 'spacer':
                const spacerItem = item as SpacerComponent;
                return <div style={{ height: `${spacerItem.height}px` }}></div>;
            default: return null;
        }
    };

    const openEditModal = (item: EmailComponent) => {
        // A simple prompt-based editor for this example. A real app would use a modal.
        if (item.type === 'text') {
            const newContent = prompt('Edit text content:', (item as TextComponent).content);
            if (newContent !== null) handleUpdate(item.id, { content: newContent } as Partial<TextComponent>);
        } else if (item.type === 'button') {
            const newText = prompt('Edit button text:', (item as ButtonComponent).text);
            const newHref = prompt('Edit button URL:', (item as ButtonComponent).href);
            if (newText !== null && newHref !== null) handleUpdate(item.id, { text: newText, href: newHref } as Partial<ButtonComponent>);
        } else if (item.type === 'image') {
            const newSrc = prompt('Edit image URL:', (item as ImageComponent).src);
            if (newSrc !== null) handleUpdate(item.id, { src: newSrc } as Partial<ImageComponent>);
        } else if (item.type === 'spacer') {
            const newHeight = prompt('Edit spacer height (px):', (item as SpacerComponent).height.toString());
            if (newHeight !== null) handleUpdate(item.id, { height: parseInt(newHeight, 10) } as Partial<SpacerComponent>);
        }
    };
    
    const sidebarItems: { type: EmailComponentType, label: string }[] = [
        { type: 'text', label: 'Text' },
        { type: 'image', label: 'Image' },
        { type: 'button', label: 'Button' },
        { type: 'spacer', label: 'Spacer' },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Sidebar */}
            <div className="w-full md:w-48 flex-shrink-0">
                <h4 className="font-semibold text-sm mb-2">Components</h4>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {sidebarItems.map(({type, label}) => (
                         <div key={type} draggable onDragStart={(e) => handleDragStart(e, null, type)}
                            className="p-3 bg-card-bg border border-white/10 rounded-lg cursor-grab text-center text-sm hover:bg-primary/20 transition-colors">
                            {label}
                        </div>
                    ))}
                </div>
            </div>
            {/* Canvas */}
            <div className="flex-1 bg-black/30 rounded-lg p-4 min-h-[400px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)} onDragLeave={handleCanvasDragLeave}>
                 <div id="indicator-dropzone-start" className="h-1 bg-primary rounded-full scale-x-0 origin-center drop-indicator transition-transform duration-200 ease-in-out pointer-events-none"></div>
                {body.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-text-muted" onDragEnter={(e) => handleDragEnterItem(e, 'indicator-dropzone-start')}>
                        <p>Drag components here to build your email</p>
                    </div>
                ) : (
                    body.map((item, index) => (
                        <div key={item.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onDragEnter={(e) => handleDragEnterItem(e, `indicator-${index}`)}>
                            <div className="relative group border border-transparent hover:border-primary/50 rounded-md p-1">
                                <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md flex items-center">
                                    <button onClick={() => openEditModal(item)} className="p-1.5 text-text-muted hover:text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                    </button>
                                     <button onClick={() => handleDelete(item.id)} className="p-1.5 text-text-muted hover:text-red-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                    <div draggable onDragStart={(e) => handleDragStart(e, item)} className="p-1.5 cursor-grab text-text-muted hover:text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </div>
                                </div>
                                {renderComponent(item)}
                            </div>
                            <div id={`indicator-${index}`} className="h-1 bg-primary rounded-full scale-x-0 origin-center drop-indicator transition-transform duration-200 ease-in-out pointer-events-none"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// --- Templates Modal ---
const EmailTemplatesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: EmailComponent[]) => void;
}> = ({ isOpen, onClose, onSelect }) => {
    const [aiPrompt, setAiPrompt] = useState('A welcome email for a new subscriber to a tech newsletter');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    // FIX: Added explicit typing to the templates object to ensure
    // TypeScript correctly infers the type as EmailComponent[] for each template.
    const templates: { [key: string]: EmailComponent[] } = {
        'Welcome Email': [
            { id: createId(), type: 'text', content: '## Welcome Aboard!' },
            { id: createId(), type: 'text', content: 'We are so excited to have you. Here is what you can expect from us...' },
            { id: createId(), type: 'button', text: 'Explore More', href: '#' },
        ],
        'Product Launch': [
             { id: createId(), type: 'text', content: '# Announcing Our New Product!' },
             { id: createId(), type: 'image', src: 'https://picsum.photos/600/300', alt: 'Product image' },
             { id: createId(), type: 'text', content: 'Discover the amazing features of our latest innovation designed to solve your problems.' },
             { id: createId(), type: 'button', text: 'Learn More & Buy Now', href: '#' },
        ]
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const template = await generateEmailTemplate(aiPrompt);
        if (template) {
            onSelect(template);
            onClose();
        } else {
            alert('Failed to generate template. Please try again.');
        }
        setIsGenerating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-[95vw] max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-poppins font-bold">Choose a Template</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                </div>
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Generate with AI</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe the template you want..." className="flex-grow bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <button onClick={handleGenerate} disabled={isGenerating} className="py-2 px-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors shadow-glow-accent disabled:opacity-50 flex items-center justify-center">
                            {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>}
                            Generate
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Or start with a pre-built template</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(templates).map(([name, structure]) => (
                             <div key={name} onClick={() => { onSelect(structure); onClose(); }} className="border border-white/10 rounded-lg p-4 hover:bg-primary/20 hover:border-primary cursor-pointer transition-all">
                                 <h4 className="font-bold">{name}</h4>
                                 <p className="text-sm text-text-muted mt-1">{structure.map(s => s.type).join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

const ScheduleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (dateTime: string) => void;
    campaignName: string;
}> = ({ isOpen, onClose, onSchedule, campaignName }) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    const defaultTime = '09:00';

    const [date, setDate] = useState(defaultDate);
    const [time, setTime] = useState(defaultTime);

    useEffect(() => {
        if (isOpen) {
            setDate(defaultDate);
            setTime(defaultTime);
        }
    }, [isOpen, defaultDate]);

    const handleConfirm = () => {
        const combined = new Date(`${date}T${time}`);
        if (isNaN(combined.getTime())) {
            alert("Please enter a valid date and time.");
            return;
        }
        if (combined <= new Date()) {
            alert("Please select a future date and time.");
            return;
        }
        onSchedule(combined.toISOString());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <GlassCard className="w-[95vw] max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-poppins font-bold">Schedule Campaign</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                </div>
                <p className="text-text-muted mb-4">Set a date and time to automatically activate the campaign "{campaignName}".</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="schedule-date" className="block text-sm font-medium mb-1">Date</label>
                        <input
                            id="schedule-date"
                            type="date"
                            value={date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="schedule-time" className="block text-sm font-medium mb-1">Time</label>
                        <input
                            id="schedule-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                    <button type="button" onClick={handleConfirm} className="py-2 px-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors shadow-glow-accent">Confirm Schedule</button>
                </div>
            </GlassCard>
        </div>
    );
};

type EditingTarget = { type: 'variant'; index: number } | { type: 'followup'; index: number };

const CampaignEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaignData: Omit<Campaign, 'id' | 'startDate' | 'openRate' | 'clickRate' | 'leads' | 'leadIds'>, leadIds: string[], campaignId?: string) => void;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    editingCampaign: Campaign | null;
}> = ({ isOpen, onClose, onSave, leads, setLeads, editingCampaign }) => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<Campaign['status']>('Draft');
    const [variants, setVariants] = useState<CampaignVariant[]>([
        { id: createId(), name: 'Version A', subject: '', body: [] },
    ]);
    const [followUps, setFollowUps] = useState<FollowUpRule[]>([]);
    const [editingTarget, setEditingTarget] = useState<EditingTarget>({ type: 'variant', index: 0 });

    const [isGenerating, setIsGenerating] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    
    const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
    const [leadSearchTerm, setLeadSearchTerm] = useState('');
    const [isFindingEmails, setIsFindingEmails] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [isSuggestingLeads, setIsSuggestingLeads] = useState(false);
    const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            if (editingCampaign) {
                setName(editingCampaign.name);
                setVariants(editingCampaign.variants);
                setFollowUps(editingCampaign.followUps || []);
                setSelectedLeadIds(new Set(editingCampaign.leadIds || []));
                setStatus(editingCampaign.status === 'Scheduled' ? 'Draft' : editingCampaign.status);
            } else {
                // Reset for new campaign
                setName('');
                setVariants([{ id: createId(), name: 'Version A', subject: '', body: [] }]);
                setFollowUps([]);
                setSelectedLeadIds(new Set());
                setStatus('Draft');
            }
            setEditingTarget({ type: 'variant', index: 0 });
            setLeadSearchTerm('');
            setIsAutoFilling(false);
        }
    }, [isOpen, editingCampaign]);

    const handleAddVariant = () => {
        const nextChar = String.fromCharCode(65 + variants.length);
        setVariants([...variants, { id: createId(), name: `Version ${nextChar}`, subject: '', body: [] }]);
    };

    const handleContentChange = (field: 'subject' | 'body', value: string | EmailComponent[]) => {
        if (editingTarget.type === 'variant') {
            setVariants(current => {
                const newVariants = [...current];
                if (newVariants[editingTarget.index]) {
                    const updatedVariant = { ...newVariants[editingTarget.index], [field]: value };
                    newVariants[editingTarget.index] = updatedVariant;
                }
                return newVariants;
            });
        } else {
            setFollowUps(current => {
                const newFollowUps = [...current];
                if (newFollowUps[editingTarget.index]) {
                    const updatedFollowUp = { ...newFollowUps[editingTarget.index], [field]: value };
                    newFollowUps[editingTarget.index] = updatedFollowUp;
                }
                return newFollowUps;
            });
        }
    };
    
    const handleAddFollowUp = () => {
        setFollowUps([...followUps, {
            id: createId(),
            trigger: 'not_opened',
            delayDays: 3,
            subject: '',
            body: []
        }]);
    };

    const handleFollowUpRuleChange = (index: number, field: 'trigger' | 'delayDays', value: string | number) => {
        setFollowUps(current => {
            const newFollowUps = [...current];
            const updatedFollowUp = { ...newFollowUps[index], [field]: field === 'delayDays' ? (Number(value) || 0) : value };
            newFollowUps[index] = updatedFollowUp;
            return newFollowUps;
        });
    };
    
    const handleRemoveFollowUp = (indexToRemove: number) => {
        if (window.confirm("Are you sure you want to remove this follow-up email?")) {
            setFollowUps(current => current.filter((_, i) => i !== indexToRemove));
            setEditingTarget(current => {
                if (current.type === 'followup') {
                    if (current.index === indexToRemove) {
                        return { type: 'variant', index: 0 };
                    }
                    if (current.index > indexToRemove) {
                        return { type: 'followup', index: current.index - 1 };
                    }
                }
                return current;
            });
        }
    };

    const handleGenerateVariations = async () => {
        const baseVariant = variants[0];
        if (!baseVariant.subject.trim() || baseVariant.body.length === 0) {
            alert("Please fill out Version A's subject and body first.");
            return;
        }
        setIsGenerating(true);
        const variations = await generateEmailVariations(baseVariant.subject, baseVariant.body);
        if (variations) {
            const newVariants = [...variants];
            variations.forEach((v, i) => {
                const targetIndex = i + 1;
                if (newVariants[targetIndex]) {
                    newVariants[targetIndex] = { ...newVariants[targetIndex], subject: v.subject, body: v.body };
                } else {
                    const nextChar = String.fromCharCode(65 + newVariants.length);
                    newVariants.push({ id: createId(), name: `Version ${nextChar}`, subject: v.subject, body: v.body });
                }
            });
            setVariants(newVariants);
        }
        setIsGenerating(false);
    };

    const handleAutoFill = async () => {
        if (!name.trim()) {
            alert("Please enter a campaign name first to give the AI some context.");
            return;
        }
        setIsAutoFilling(true);
        const result = await generateInitialCampaignEmail(name);
        if (result) {
            handleContentChange('subject', result.subject);
            handleContentChange('body', result.body);
        } else {
            alert('Failed to generate email content. Please try again.');
        }
        setIsAutoFilling(false);
    };
    
    const handleToggleLead = (leadId: string) => {
        setSelectedLeadIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(leadId)) {
                newSet.delete(leadId);
            } else {
                newSet.add(leadId);
            }
            return newSet;
        });
    };

    const filteredLeads = useMemo(() => {
        if (!leadSearchTerm) return leads;
        return leads.filter(lead =>
            lead.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(leadSearchTerm.toLowerCase())
        );
    }, [leads, leadSearchTerm]);

    const handleFindEmails = async () => {
        setIsFindingEmails(true);
        const selectedLeads = leads.filter(l => selectedLeadIds.has(l.id));
        const leadsWithoutEmail = selectedLeads.filter(l => !l.email);

        if (leadsWithoutEmail.length === 0) {
            alert("All selected leads already have an email address.");
            setIsFindingEmails(false);
            return;
        }

        const emailPromises = leadsWithoutEmail.map(lead => 
            findLeadEmail(lead.name, lead.company).then(email => ({ leadId: lead.id, email }))
        );

        const results = await Promise.all(emailPromises);
        const updates = new Map<string, string>();
        results.forEach(result => {
            if (result.email) {
                updates.set(result.leadId, result.email);
            }
        });

        if (updates.size > 0) {
            setLeads(prevLeads => prevLeads.map(lead => {
                if (updates.has(lead.id)) {
                    return { ...lead, email: updates.get(lead.id)! };
                }
                return lead;
            }));
            alert(`Found ${updates.size} new email(s)! The list has been updated.`);
        } else {
            alert("Could not find any new email addresses.");
        }

        setIsFindingEmails(false);
    };

    const handleAISuggestLeads = async () => {
        if (!name.trim()) {
            alert("Please provide a campaign name first for context.");
            return;
        }
        setIsSuggestingLeads(true);
        const suggestedIds = await suggestLeadsForCampaign(name, leads);
        if (suggestedIds && suggestedIds.length > 0) {
            setSelectedLeadIds(prev => {
                const newSet = new Set(prev);
                suggestedIds.forEach(id => newSet.add(id));
                return newSet;
            });
            alert(`AI suggested and selected ${suggestedIds.length} new leads.`);
        } else {
            alert('The AI could not suggest any leads for this campaign.');
        }
        setIsSuggestingLeads(false);
    };

    const handleSubmit = () => {
        if (!name.trim()) { alert("Please enter a campaign name."); return; }
        if (status !== 'Draft' && selectedLeadIds.size === 0) { alert("Please select at least one lead for an active or paused campaign."); return; }
        
        onSave(
            { name, status, variants, followUps },
            Array.from(selectedLeadIds),
            editingCampaign?.id
        );
        onClose();
    };

    const handleSchedule = (dateTime: string) => {
        if (!name.trim()) { alert("Please enter a campaign name."); return; }
        if (selectedLeadIds.size === 0) { alert("Please select at least one lead to schedule a campaign."); return; }

        onSave(
            { name, status: 'Scheduled', variants, followUps, scheduledAt: dateTime },
            Array.from(selectedLeadIds),
            editingCampaign?.id
        );
        onClose();
    };
    
    const handleSelectTemplate = (templateBody: EmailComponent[]) => {
        handleContentChange('body', templateBody);
    };

    const currentItem = editingTarget.type === 'variant'
        ? variants[editingTarget.index]
        : followUps[editingTarget.index];
    
    const isVariant = editingTarget.type === 'variant';

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                <GlassCard className="w-full max-w-6xl h-[95vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-xl md:text-2xl font-poppins font-bold">{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Settings & Leads */}
                        <div className="lg:col-span-1 space-y-6">
                             <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="campaignName">Campaign Name</label>
                                <div className="flex flex-col sm:flex-row gap-2 items-center">
                                    <input id="campaignName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q3 Web Design Outreach" className="w-full bg-card-bg border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"/>
                                    {isVariant && (
                                        <button
                                            type="button"
                                            onClick={handleAutoFill}
                                            disabled={isAutoFilling || !name.trim()}
                                            title="Auto-fill subject and body with AI"
                                            className="py-3 px-4 w-full sm:w-auto bg-accent/80 hover:bg-accent rounded-lg transition-colors shadow-glow-accent text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 whitespace-nowrap"
                                        >
                                            {isAutoFilling ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white sm:mr-2"></div>
                                                    <span className="hidden sm:inline">Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span role="img" aria-label="sparkles" className="text-lg sm:mr-2">✨</span>
                                                    <span className="hidden sm:inline">Auto-fill with AI</span>
                                                    <span className="sm:hidden">AI Auto-fill</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="campaignStatus">Status</label>
                                <select
                                    id="campaignStatus"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Campaign['status'])}
                                    className="w-full bg-card-bg border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Paused">Paused</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                    <h3 className="text-lg font-poppins font-semibold">Target Audience</h3>
                                    <button
                                        type="button"
                                        onClick={handleAISuggestLeads}
                                        disabled={isSuggestingLeads || !name.trim()}
                                        className="flex items-center gap-2 py-2 px-3 bg-accent/80 hover:bg-accent rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-accent"
                                    >
                                        {isSuggestingLeads ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <span role="img" aria-label="sparkles">✨</span>
                                        )}
                                        <span>{isSuggestingLeads ? 'Thinking...' : 'AI Suggest'}</span>
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 flex-wrap gap-2">
                                     <input type="search" value={leadSearchTerm} onChange={e => setLeadSearchTerm(e.target.value)} placeholder="Search leads..." className="w-full sm:w-auto bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary flex-grow"/>
                                     <button onClick={handleFindEmails} disabled={isFindingEmails || selectedLeadIds.size === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-primary/70 hover:bg-primary/100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isFindingEmails && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>}
                                        Find Emails
                                    </button>
                                </div>
                                <p className="text-sm text-text-muted mb-2">{selectedLeadIds.size} / {leads.length} leads selected</p>
                                <div className="max-h-[250px] overflow-y-auto border border-white/10 rounded-lg p-2 space-y-1 bg-black/20">
                                   {filteredLeads.map(lead => (
                                        <label key={lead.id} className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                                            <input type="checkbox" checked={selectedLeadIds.has(lead.id)} onChange={() => handleToggleLead(lead.id)} className="h-5 w-5 rounded bg-card-bg border-white/30 text-primary focus:ring-primary focus:ring-offset-0 accent-primary" />
                                            <div>
                                                <p className="font-medium text-white">{lead.name} <span className="text-text-muted font-normal">- {lead.company}</span></p>
                                                <p className="text-xs text-primary">{lead.email || 'No email on file'}</p>
                                            </div>
                                        </label>
                                   ))}
                                </div>
                            </div>
                            
                            {/* --- Follow-up Rules Section --- */}
                            <div>
                                <h3 className="text-lg font-poppins font-semibold mb-2">Campaign Workflow</h3>
                                <div className="space-y-3">
                                    {/* Initial Email Variants */}
                                    {variants.map((variant, index) => (
                                        <button 
                                            key={variant.id}
                                            onClick={() => setEditingTarget({ type: 'variant', index })}
                                            className={`w-full text-left p-3 rounded-lg transition-colors text-sm border-l-4 ${editingTarget.type === 'variant' && editingTarget.index === index ? 'bg-primary/20 border-primary' : 'bg-card-bg border-transparent hover:bg-white/10'}`}
                                        >
                                            <p className="font-medium">{variant.name}</p>
                                            <p className="text-xs text-text-muted truncate">{variant.subject || 'No subject set'}</p>
                                        </button>
                                    ))}

                                    {/* Separator */}
                                    <div className="flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-dashed border-white/20"></div>
                                        <div className="px-2 text-xs text-text-muted">THEN</div>
                                        <div className="w-full border-t border-dashed border-white/20"></div>
                                    </div>
                                    
                                    {/* Follow-ups */}
                                    {followUps.map((followUp, index) => (
                                        <GlassCard key={followUp.id} className="!p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-sm">Follow-up #{index + 1}</h4>
                                                <button onClick={() => handleRemoveFollowUp(index)} className="p-1 rounded-full hover:bg-red-500/20 text-red-400 text-lg leading-none">&times;</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <select
                                                    value={followUp.trigger}
                                                    onChange={e => handleFollowUpRuleChange(index, 'trigger', e.target.value)}
                                                    className="w-full bg-card-bg border border-white/10 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    <option value="not_opened">If not opened</option>
                                                    <option value="not_clicked">If not clicked</option>
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-text-muted">after</span>
                                                    <input
                                                        type="number"
                                                        value={followUp.delayDays}
                                                        onChange={e => handleFollowUpRuleChange(index, 'delayDays', parseInt(e.target.value) || 0)}
                                                        className="w-full bg-card-bg border border-white/10 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    <span className="text-xs text-text-muted">days</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setEditingTarget({ type: 'followup', index })}
                                                className={`mt-2 w-full text-left p-2 rounded-md transition-colors text-sm border-l-4 ${editingTarget.type === 'followup' && editingTarget.index === index ? 'bg-primary/20 border-primary' : 'bg-card-bg border-transparent hover:bg-white/10'}`}
                                            >
                                                <p className="font-medium">Edit Email Content</p>
                                                <p className="text-xs text-text-muted truncate">{followUp.subject || 'No subject set'}</p>
                                            </button>
                                        </GlassCard>
                                    ))}
                                    <button onClick={handleAddFollowUp} className="w-full py-2 text-sm text-primary hover:bg-primary/20 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors">
                                        + Add Follow-up Step
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Email Editor */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                 <h3 className="text-lg font-poppins font-semibold">
                                    {/* FIX: Use a type guard ('name' in currentItem) to safely access the 'name' property.
                                        This resolves the error where 'name' doesn't exist on the FollowUpRule type. */}
                                    {`Editing: ${
                                        currentItem
                                            ? 'name' in currentItem
                                                ? currentItem.name
                                                : `Follow-up #${editingTarget.index + 1}`
                                            : ''
                                    }`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {isVariant && variants.length < 3 && <button onClick={handleAddVariant} className="py-2 px-3 text-sm font-medium text-text-muted hover:bg-white/5 rounded-lg">Add A/B Variant</button>}
                                    <button onClick={() => setIsTemplatesOpen(true)} className="py-2 px-4 bg-primary/20 text-primary hover:bg-primary/40 rounded-lg text-sm transition-colors">Load Template</button>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <input type="text" value={currentItem?.subject || ''} onChange={e => handleContentChange('subject', e.target.value)} placeholder="Email Subject" className="w-full bg-card-bg border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"/>
                            </div>

                            <EmailBuilder body={currentItem?.body || []} setBody={(newBody) => handleContentChange('body', newBody)} />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center flex-shrink-0 gap-4">
                         {isVariant ? (
                            <button onClick={handleGenerateVariations} disabled={isGenerating || variants.length < 2} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-accent/80 hover:bg-accent rounded-lg transition-colors shadow-glow-accent text-sm disabled:opacity-50" title={variants.length < 2 ? "Add at least one more variant to generate A/B test suggestions." : "Suggest A/B Variations"}>
                                {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>}
                                {isGenerating ? 'Generating...' : 'Suggest A/B Variations'}
                            </button>
                        ) : <div /> }
                        <div>
                            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                             <button type="button" onClick={() => setScheduleModalOpen(true)} className="py-2 px-4 bg-accent/80 hover:bg-accent rounded-lg transition-colors shadow-glow-accent ml-4">Schedule...</button>
                            <button type="button" onClick={handleSubmit} className="py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg transition-colors shadow-glow-primary ml-4">{editingCampaign ? 'Update Campaign' : 'Save Campaign'}</button>
                        </div>
                    </div>
                </GlassCard>
            </div>
            <EmailTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} onSelect={handleSelectTemplate} />
            <ScheduleModal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} onSchedule={handleSchedule} campaignName={name} />
        </>
    );
};

interface CampaignCardProps {
    campaign: Campaign;
    onEdit: (campaign: Campaign) => void;
    onDelete: (id: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onEdit, onDelete }) => {
    const getStatusClasses = (status: Campaign['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-300';
            case 'Paused': return 'bg-yellow-500/20 text-yellow-300';
            case 'Completed': return 'bg-blue-500/20 text-blue-300';
            case 'Scheduled': return 'bg-purple-500/20 text-purple-300';
            case 'Draft':
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };
    
    return (
        <GlassCard className="flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-poppins font-semibold text-white pr-4">{campaign.name}</h3>
                    <span className={`text-xs font-bold py-1 px-3 rounded-full whitespace-nowrap ${getStatusClasses(campaign.status)}`}>
                        {campaign.status}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-6 border-t border-b border-white/10 py-4">
                    <div>
                        <p className="text-2xl font-bold">{campaign.leads}</p>
                        <p className="text-xs text-text-muted">Leads</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{campaign.openRate}<span className="text-lg">%</span></p>
                        <p className="text-xs text-text-muted">Open Rate</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{campaign.clickRate}<span className="text-lg">%</span></p>
                        <p className="text-xs text-text-muted">Click Rate</p>
                    </div>
                </div>
                <p className="text-sm text-text-muted">
                    Start Date: {new Date(campaign.startDate).toLocaleDateString()}
                    {campaign.status === 'Scheduled' && campaign.scheduledAt && (
                        <span className="block text-purple-300">Scheduled for: {new Date(campaign.scheduledAt).toLocaleString()}</span>
                    )}
                </p>
            </div>
            <div className="mt-6 flex gap-2">
                <button
                    onClick={() => onEdit(campaign)}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 text-primary font-semibold py-2 px-4 rounded-lg transition-all"
                >
                    Edit Campaign
                </button>
                 <button onClick={() => onDelete(campaign.id)} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors" title="Delete Campaign">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </GlassCard>
    );
};


interface CampaignsProps {
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const Campaigns: React.FC<CampaignsProps> = ({ campaigns, setCampaigns, leads, setLeads }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const handleOpenCreateModal = () => {
        setEditingCampaign(null);
        setIsEditorOpen(true);
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsEditorOpen(true);
    };
    
    const handleDeleteCampaign = (id: string) => {
        if (window.confirm("Are you sure you want to delete this campaign? This action is irreversible.")) {
            setCampaigns(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingCampaign(null);
    };

    const handleSaveCampaign = useCallback((
        campaignData: Omit<Campaign, 'id' | 'startDate' | 'openRate' | 'clickRate' | 'leads' | 'leadIds'>,
        leadIds: string[],
        campaignId?: string
    ) => {
        if (campaignId) {
            // Update existing campaign
            setCampaigns(prev => prev.map(c => c.id === campaignId ? {
                ...c, // Preserve original stats like startDate, openRate, clickRate
                ...campaignData, // Apply new name, variants, etc.
                leads: leadIds.length,
                leadIds: leadIds,
            } : c));
        } else {
            // Create new campaign
            const newCampaign: Campaign = {
                ...campaignData,
                id: createId(),
                startDate: new Date().toISOString().split('T')[0],
                openRate: 0,
                clickRate: 0,
                leads: leadIds.length,
                leadIds: leadIds,
            };
            setCampaigns(prev => [newCampaign, ...prev]);
        }
        handleCloseEditor();
    }, [setCampaigns]);
    
    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-poppins font-bold">Campaigns</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-glow-primary w-full sm:w-auto"
                >
                    Create Campaign
                </button>
            </div>
            
            {campaigns.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {campaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} onEdit={handleEditCampaign} onDelete={handleDeleteCampaign} />
                    ))}
                </div>
            ) : (
                <GlassCard className="text-center py-16">
                    <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-text-muted mb-6">Click "Create Campaign" to get started.</p>

                    <button
                        onClick={handleOpenCreateModal}
                        className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-glow-primary"
                    >
                        Create Your First Campaign
                    </button>
                </GlassCard>
            )}

            <CampaignEditorModal
                isOpen={isEditorOpen}
                onClose={handleCloseEditor}
                onSave={handleSaveCampaign}
                leads={leads}
                setLeads={setLeads}
                editingCampaign={editingCampaign}
            />
        </>
    );
}

export default Campaigns;