"use client";

import React from "react";
import Dashboard from "@/components/Dashboard";
import { useData } from "@/contexts/DataContext";

export default function Home() {
  const { leads, campaigns } = useData();

  return <Dashboard leads={leads} campaigns={campaigns} />;
}
