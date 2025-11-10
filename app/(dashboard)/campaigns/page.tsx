"use client";

import React from "react";
import Campaigns from "@/components/Campaigns";
import { useData } from "@/contexts/DataContext";

export default function CampaignsPage() {
  const { campaigns, setCampaigns, leads, setLeads } = useData();

  return (
    <Campaigns
      campaigns={campaigns}
      setCampaigns={setCampaigns}
      leads={leads}
      setLeads={setLeads}
    />
  );
}
