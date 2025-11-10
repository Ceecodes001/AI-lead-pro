"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Lead, Campaign } from "@/types";
import {
  loadLeads,
  saveLeads,
  loadCampaigns,
  saveCampaigns,
} from "@/services/firebaseService";

interface DataContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
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

  useEffect(() => {
    if (!isLoading) {
      saveLeads(leads);
    }
  }, [leads, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveCampaigns(campaigns);
    }
  }, [campaigns, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let needsUpdate = false;
      const updatedCampaigns = campaigns.map((campaign) => {
        if (
          campaign.status === "Scheduled" &&
          campaign.scheduledAt &&
          new Date(campaign.scheduledAt) <= now
        ) {
          needsUpdate = true;
          return {
            ...campaign,
            status: "Active" as const,
            scheduledAt: undefined,
          };
        }
        return campaign;
      });

      if (needsUpdate) {
        setCampaigns(updatedCampaigns);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [campaigns, setCampaigns]);

  const value = {
    leads,
    setLeads,
    campaigns,
    setCampaigns,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
