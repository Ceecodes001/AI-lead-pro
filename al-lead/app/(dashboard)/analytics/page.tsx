"use client";

import React from "react";
import Analytics from "@/components/Analytics";
import { useData } from "@/contexts/DataContext";

export default function AnalyticsPage() {
  const { leads, campaigns } = useData();

  return <Analytics leads={leads} campaigns={campaigns} />;
}
