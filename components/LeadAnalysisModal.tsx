
import React, { useState, useEffect } from 'react';
import { Lead, LeadAnalysis } from '../types';
import { analyzeLead } from '../services/geminiService';

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card-bg border border-white/10 rounded-2xl shadow-lg backdrop-blur-lg p-6 ${className}`}>
        {children}
    </div>
);

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-16 w-16',
    };
    return <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]}`}></div>;
};

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const scoreColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
    const ringColor = score >= 75 ? 'stroke-green-400' : score >= 50 ? 'stroke-yellow-400' : 'stroke-red-400';

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="stroke-current text-white/10"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className={`transition-all duration-1000 ease-in-out ${ringColor}`}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <span className={`absolute text-3xl font-bold ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div>
        <h3 className="text-lg font-poppins font-semibold mb-3 flex items-center gap-2">
            <span className="text-primary">{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

export const LeadAnalysisModal: React.FC<{
    lead: Lead | null;
    onClose: () => void;
    initialAnalysis?: LeadAnalysis | null;
}> = ({ lead, onClose, initialAnalysis }) => {
    const [analysis, setAnalysis] = useState<LeadAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (lead) {
            if (initialAnalysis) {
                setAnalysis(initialAnalysis);
                setIsLoading(false);
                setError(null);
            } else {
                setIsLoading(true);
                setAnalysis(null);
                setError(null);
                analyzeLead(lead).then(result => {
                    if (result) {
                        setAnalysis(result);
                    } else {
                        setError('Failed to generate analysis. The AI may be unavailable or could not process the request.');
                    }
                    setIsLoading(false);
                }).catch(e => {
                    console.error(e);
                    setError('An unexpected error occurred while analyzing the lead.');
                    setIsLoading(false);
                });
            }
        }
    }, [lead, initialAnalysis]);

    if (!lead) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <GlassCard className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-poppins font-bold">Lead Analysis</h2>
                        <p className="text-text-muted">{lead.name} at {lead.company}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl leading-none">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-text-muted">AI is analyzing {lead.company}...</p>
                            <p className="text-sm text-text-muted/70">This may take a moment.</p>
                        </div>
                    )}
                    {error && !isLoading && (
                         <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                            <div className="w-16 h-16 bg-red-500/20 text-red-300 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold text-red-400">Analysis Failed</h3>
                            <p className="text-text-muted mt-2">{error}</p>
                        </div>
                    )}
                    {analysis && !isLoading && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-black/20 rounded-lg">
                                <ScoreRing score={analysis.leadScore} />
                                <div className="flex-1 text-center sm:text-left">
                                     <h3 className="text-lg font-poppins font-semibold mb-2 flex items-center justify-center sm:justify-start gap-2">
                                        <span className="text-primary"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
                                        AI Summary
                                    </h3>
                                    <p className="text-text-muted">{analysis.summary}</p>
                                </div>
                            </div>

                            <AnalysisSection title="Key Insights" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>}>
                                <ul className="space-y-2 list-none pl-0">
                                    {analysis.keyInsights.map((insight, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-primary mt-1">&#8227;</span>
                                            <span className="text-text-light">{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AnalysisSection>

                             <AnalysisSection title="Suggested Talking Points" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>}>
                               <ul className="space-y-2 list-none pl-0">
                                    {analysis.suggestedTalkingPoints.map((point, i) => (
                                       <li key={i} className="flex items-start gap-3">
                                            <span className="text-primary mt-1">&#8227;</span>
                                            <span className="text-text-light">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AnalysisSection>
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex justify-end flex-shrink-0">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg transition-colors shadow-glow-primary">Close</button>
                </div>
            </GlassCard>
        </div>
    );
};