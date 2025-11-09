

import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Email, PotentialLead, EmailComponent, SummaryData, LeadAnalysis } from '../types';

// IMPORTANT: This service assumes `process.env.API_KEY` is set in the environment.
const getGenAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey });
};

export const getAIInsight = async (prompt: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a concise, confident, and intelligent sales and marketing assistant. Provide actionable insights and recommendations based on the data provided. Your tone should be professional and motivating.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI insight:", error);
        return "An error occurred while generating insights. Please try again.";
    }
};

export const findPotentialLeads = async (query: string, count: number, existingCompanies?: string[]): Promise<PotentialLead[] | null> => {
    try {
        const ai = getGenAI();
        const exclusionPrompt = existingCompanies && existingCompanies.length > 0
            ? `\n\nIMPORTANT: I have already found the following companies, so please provide different ones and do not include them in the results: ${existingCompanies.join(', ')}.`
            : '';

        const prompt = `
            Based on the query "${query}", use Google Search to find up to ${count} potential leads for a web design agency.${exclusionPrompt}
            Prioritize businesses with outdated or non-mobile-friendly websites.
            Return the results as a valid JSON array of objects inside a markdown block.
            Each object in the array should represent one lead and must have the following keys: "company", "name", "industry", "reason", "email", "phone", "location".
            The "reason" key should briefly explain why they are a good lead (e.g., "Website is not mobile-responsive").
            If a value for a key cannot be found, use an empty string "".
            If no leads are found, return an empty JSON array [].
            IMPORTANT: Your entire response must be ONLY the JSON array, inside a markdown code block. Do not include any other text or explanations.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : text;

        try {
            const leads = JSON.parse(jsonString);
            return leads;
        } catch (e) {
            console.error("Failed to parse leads JSON:", e, "Raw response:", jsonString);
            return [{
                company: "AI Analysis Result",
                name: "",
                industry: "N/A",
                reason: `The AI returned the following text which could not be parsed as JSON:\n\n${text}`,
                email: "",
                phone: ""
            }];
        }
    } catch (error) {
        console.error("Error finding potential leads:", error);
        return null;
    }
};

export const summarizePotentialLeads = async (leads: PotentialLead[]): Promise<SummaryData | null> => {
    if (!leads || leads.length === 0) {
        return null;
    }

    try {
        const ai = getGenAI();
        const prompt = `
            Based on this list of potential leads:
            ${JSON.stringify(leads.map(l => ({ company: l.company, industry: l.industry, reason: l.reason, hasEmail: !!l.email, hasPhone: !!l.phone })), null, 2)}

            Provide a concise JSON summary to help me prioritize. The JSON object must have these keys:
            - "overview": A brief, one-sentence overview of the types of businesses found.
            - "totalFound": The total number of leads found (as a number).
            - "withEmail": The number of leads with an email address (as a number).
            - "withPhone": The number of leads with a phone number (as a number).
            - "promisingProspects": A string containing a markdown bulleted list pointing out 1 or 2 of the most promising leads and why they stand out (e.g., "- Prospect A: ...").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overview: { type: Type.STRING },
                        totalFound: { type: Type.INTEGER },
                        withEmail: { type: Type.INTEGER },
                        withPhone: { type: Type.INTEGER },
                        promisingProspects: { type: Type.STRING }
                    },
                    required: ["overview", "totalFound", "withEmail", "withPhone", "promisingProspects"]
                }
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error summarizing potential leads:", error);
        return null;
    }
};


export const findLeadEmail = async (leadName: string, companyName: string): Promise<string | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            Using Google Search, find the professional email address for a person named "${leadName}" at the company "${companyName}".
            Return ONLY the email address as a string. If you cannot find a verified email, return an empty string.
            Do not add any extra text, explanation, or formatting. Your entire response should be just the email address.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text.trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
            return text;
        }
        return null;
    } catch (error) {
        console.error(`Error finding email for ${leadName} at ${companyName}:`, error);
        return null;
    }
};


export const generateEmailSequence = async (lead: Lead): Promise<Email[] | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            My name is Jonathan and I am a web developer. Generate a 3-email personalized outreach sequence for a potential lead.
            The goal is to advertise my web development services.
            The lead is:
            - Name: ${lead.name}
            - Company: ${lead.company}
            - Industry: ${lead.industry}
            - Status: ${lead.status}
            
            Focus on the benefits of a modern, professional website for their specific industry.
            Make the tone professional, engaging, and personalized.
            Return the sequence as a JSON array of objects, where each object has 'subject' and 'body' keys.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            subject: {
                                type: Type.STRING,
                                description: "The email subject line."
                            },
                            body: {
                                type: Type.STRING,
                                description: "The email body content. Use placeholders like {{name}} where appropriate."
                            }
                        },
                        required: ["subject", "body"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const sequence = JSON.parse(jsonString);
        return sequence;

    } catch (error) {
        console.error("Error generating email sequence:", error);
        return null;
    }
};

export const generateDirectEmail = async (lead: Lead): Promise<Email | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            My name is Jonathan, and I am a web developer. Generate a personalized, concise, and compelling cold outreach email to the following lead to advertise my web development services.
            The email should be addressed to ${lead.name} from ${lead.company} in the ${lead.industry} industry. The tone should be professional yet approachable.
            Focus on the value I can bring to their specific business.
            Return a single JSON object with 'subject' and 'body' keys.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    },
                    required: ['subject', 'body'],
                }
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error generating direct email:", error);
        return null;
    }
};


export const generateEmailVariations = async (baseSubject: string, baseBody: EmailComponent[]): Promise<{subject: string, body: EmailComponent[]}[] | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            Given the following email draft:
            Subject: ${baseSubject}
            Body Structure (JSON): ${JSON.stringify(baseBody, null, 2)}

            Generate 2 alternative versions for A/B testing. The goal is to improve open and click-through rates for a web design agency's outreach.
            For each version, provide a different subject line and a slightly altered body structure. The tone should remain professional and persuasive.
            Return the result as a JSON array of objects, where each object has 'subject' (string) and 'body' (an array of component objects matching the input structure) keys. The array should contain exactly two objects.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            body: { type: Type.ARRAY }
                        },
                        required: ["subject", "body"]
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        const variations = JSON.parse(jsonString);
        return variations;
    } catch (error) {
        console.error("Error generating email variations:", error);
        return null;
    }
};

export const generateEmailTemplate = async (prompt: string): Promise<EmailComponent[] | null> => {
    try {
        const ai = getGenAI();
        const fullPrompt = `
            Generate an email template structure based on the following request: "${prompt}".
            The template should be a JSON array of component objects.
            Each object must have a unique 'id' (a random string), a 'type' (string: 'text', 'image', 'button', 'spacer'), and properties specific to that type.
            - For 'text': { "type": "text", "content": "Your text here..." }
            - For 'image': { "type": "image", "src": "https://picsum.photos/600/300", "alt": "Placeholder Image" }
            - For 'button': { "type": "button", "text": "Click Here", "href": "#" }
            - For 'spacer': { "type": "spacer", "height": 20 }
            
            Now, generate the template for: "${prompt}".
            Return ONLY the valid JSON array.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT }
                }
            }
        });

        const jsonString = response.text.trim();
        const template = JSON.parse(jsonString);
        // Add unique IDs if the model didn't
        return template.map((component: any) => ({...component, id: Date.now().toString() + Math.random().toString(36).substr(2, 9)}));
    } catch (error) {
        console.error("Error generating email template:", error);
        return null;
    }
};

export const generateInitialCampaignEmail = async (campaignName: string): Promise<{ subject: string; body: EmailComponent[] } | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            Based on the campaign goal described as "${campaignName}", generate a compelling initial outreach email.
            The email should be structured as a JSON object containing a 'subject' (string) and a 'body' (an array of component objects).
            The 'body' array should follow this structure:
            - Each object must have a 'type' (string: 'text', 'image', 'button', 'spacer').
            - Each object must have a unique 'id' (generate a random string for this).
            - For 'text': { "type": "text", "content": "Your text here..." }
            - For 'image': { "type": "image", "src": "https://picsum.photos/600/300", "alt": "Relevant Image" }
            - For 'button': { "type": "button", "text": "Call to Action", "href": "#" }
            - For 'spacer': { "type": "spacer", "height": 20 }

            The tone should be professional and engaging, aimed at generating leads for a web development agency.
            Return ONLY the valid JSON object.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT }
                        }
                    },
                    required: ["subject", "body"]
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (result.body && Array.isArray(result.body)) {
            result.body = result.body.map((component: any) => ({
                ...component,
                id: component.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9))
            }));
        }

        return result;

    } catch (error) {
        console.error("Error generating initial campaign email:", error);
        return null;
    }
};

export const suggestLeadsForCampaign = async (campaignName: string, allLeads: Lead[]): Promise<string[] | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            Based on the email campaign name "${campaignName}", select the top 5 most relevant leads from the following list.
            Consider factors like industry, company, and lead status to find the best fit. For example, a campaign about "new e-commerce features" should target retail or online businesses.
            
            Available leads:
            ${JSON.stringify(allLeads.map(l => ({id: l.id, name: l.name, company: l.company, industry: l.industry, status: l.status})), null, 2)}
            
            Return a JSON array containing only the string IDs of the suggested leads.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const leadIds = JSON.parse(jsonString);
        return leadIds;

    } catch (error) {
        console.error("Error suggesting leads for campaign:", error);
        return null;
    }
};

export const analyzeLead = async (lead: Lead): Promise<LeadAnalysis | null> => {
    try {
        const ai = getGenAI();
        const prompt = `
            As a senior sales analyst for a web development agency, perform a deep analysis of the following lead:
            - Name: ${lead.name}
            - Company: ${lead.company}
            - Industry: ${lead.industry}
            - Location: ${lead.location || 'Not provided'}
            
            Use Google Search to investigate the company's website, online presence, and any recent news.
            Based on your findings, provide a detailed analysis in a JSON object with the following structure:
            {
              "leadScore": (a number from 0 to 100 indicating their potential as a client for web development services),
              "summary": (a 2-3 sentence summary of your findings and overall recommendation),
              "keyInsights": (an array of 3-4 strings with bullet points on website quality, social media presence, and recent activity),
              "suggestedTalkingPoints": (an array of 3-4 strings with specific, actionable talking points for an outreach email)
            }
            Focus on identifying pain points like outdated websites, poor mobile experience, or lack of online presence that my web development services can solve.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        leadScore: { type: Type.INTEGER, description: "A score from 0 to 100." },
                        summary: { type: Type.STRING, description: "A brief summary." },
                        keyInsights: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "Array of key findings."
                        },
                        suggestedTalkingPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Array of talking points."
                        }
                    },
                    required: ["leadScore", "summary", "keyInsights", "suggestedTalkingPoints"]
                }
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error analyzing lead:", error);
        return null;
    }
};