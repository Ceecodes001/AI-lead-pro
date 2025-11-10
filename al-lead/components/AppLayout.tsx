"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AIAssistant from "@/components/AIAssistant";
import { DataProvider, useData } from "@/contexts/DataContext";
import { View } from "@/types";
import useLocalStorage from "@/hooks/useLocalStorage";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { leads, campaigns, isLoading } = useData();
  const [isAssistantOpen, setAssistantOpen] = useLocalStorage<boolean>(
    "isAssistantOpen",
    false
  );
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleAssistant = useCallback(() => {
    setAssistantOpen((prev) => !prev);
  }, [setAssistantOpen]);

  // Check if we're on an auth page (should not show sidebar/header)
  const isAuthPage =
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/register";

  // Check if we're on the landing page (should not show sidebar/header)
  const isLandingPage = pathname === "/";

  const getCurrentView = (): View => {
    switch (pathname) {
      case "/leads":
        return View.Leads;
      case "/campaigns":
        return View.Campaigns;
      case "/analytics":
        return View.Analytics;
      default:
        return View.Dashboard;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading AI Lead Manager...
          </p>
        </div>
      </div>
    );
  }

  // If it's an auth page, render without sidebar/header
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {children}
      </div>
    );
  }

  // If it's the landing page, render without sidebar/header
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless opened */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${
          isMobileNavOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <Sidebar
          currentView={pathname}
          isMobileNavOpen={isMobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative z-0">
        <Header
          currentView={getCurrentView()}
          toggleAssistant={toggleAssistant}
          setMobileNavOpen={setMobileNavOpen}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      {isAssistantOpen && (
        <AIAssistant
          isOpen={isAssistantOpen}
          onClose={toggleAssistant}
          leads={leads}
          campaigns={campaigns}
        />
      )}
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <DataProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </DataProvider>
  );
}
