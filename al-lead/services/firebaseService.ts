import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { Lead, Campaign, Message } from '@/types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKJr4-vvITdPU2cJNmNFVDxkSBl-KrPOI",
  authDomain: "ai-video-d39ef.firebaseapp.com",
  databaseURL: "https://ai-video-d39ef-default-rtdb.firebaseio.com",
  projectId: "ai-video-d39ef",
  storageBucket: "ai-video-d39ef.firebasestorage.app",
  messagingSenderId: "744296435575",
  appId: "1:744296435575:web:dc4da75613b6a8c7e85b72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(getDatabase());

// --- Generic Save/Load ---
const saveData = async (path: string, data: any): Promise<void> => {
    try {
        await set(ref(db, path), data);
    } catch (error) {
        console.error(`Error saving data to ${path}:`, error);
    }
};

const loadData = async <T>(path: string): Promise<T | null> => {
    try {
        const snapshot = await get(child(dbRef, path));
        if (snapshot.exists()) {
            return snapshot.val() as T;
        }
        return null;
    } catch (error) {
        console.error(`Error loading data from ${path}:`, error);
        return null;
    }
};

// --- Specific Data Functions ---

export const saveLeads = (leads: Lead[]) => saveData('data/leads', leads);
export const loadLeads = (): Promise<Lead[] | null> => loadData<Lead[]>('data/leads');

export const saveCampaigns = (campaigns: Campaign[]) => saveData('data/campaigns', campaigns);
export const loadCampaigns = (): Promise<Campaign[] | null> => loadData<Campaign[]>('data/campaigns');

export const saveAssistantMessages = (messages: Message[]) => saveData('data/assistantMessages', messages);
export const loadAssistantMessages = (): Promise<Message[] | null> => loadData<Message[]>('data/assistantMessages');
