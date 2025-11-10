"use client";

import React from "react";
import { View } from "@/types";

const Header: React.FC<{
  currentView?: View;
  toggleAssistant: () => void;
  setMobileNavOpen?: (open: boolean) => void;
  toggleMobileNav?: () => void;
}> = ({ currentView, toggleAssistant, setMobileNavOpen, toggleMobileNav }) => {
  const handleToggleMobileNav = () => {
    if (setMobileNavOpen) {
      setMobileNavOpen(true);
    } else if (toggleMobileNav) {
      toggleMobileNav();
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 bg-background/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 sm:px-6 md:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleToggleMobileNav}
          className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo - Mobile only */}
          <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 lg:hidden">
            <img
              src="/logo2.png"
              alt="AI Lead Manager Pro"
              className="w-6 h-6 object-contain brightness-110 contrast-110"
            />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-poppins font-bold truncate">
            {currentView || "Dashboard"}
          </h1>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
        <div className="relative hidden md:block">
          <input
            type="search"
            placeholder="Search..."
            className="bg-card-bg border border-white/10 rounded-lg py-2 pl-10 pr-4 w-40 lg:w-64 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
          />
          <svg
            className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <button
          onClick={toggleAssistant}
          className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition"
          aria-label="Toggle AI Assistant"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient
                id="sparkleGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="25%" stopColor="#4ecdc4" />
                <stop offset="50%" stopColor="#45b7d1" />
                <stop offset="75%" stopColor="#96ceb4" />
                <stop offset="100%" stopColor="#feca57" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C12 2 8 8 2 12C8 16 12 22 12 22C12 22 16 16 22 12C16 8 12 2 12 2Z"
              fill="url(#sparkleGradient)"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
