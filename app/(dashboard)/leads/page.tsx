"use client";

import React from "react";
import Leads from "@/components/Leads";
import { useData } from "@/contexts/DataContext";

export default function LeadsPage() {
  const { leads, setLeads, campaigns, setCampaigns } = useData();

  return (
    <Leads
      leads={leads}
      setLeads={setLeads}
      campaigns={campaigns}
      setCampaigns={setCampaigns}
    />
  );
}
