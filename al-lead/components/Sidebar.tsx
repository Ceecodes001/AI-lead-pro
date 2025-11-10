"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { View } from "@/types";

interface SidebarProps {
  currentView: string;
  isMobileNavOpen?: boolean;
  setMobileNavOpen?: (open: boolean) => void;
}

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: () => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        ></path>
      </svg>
    ),
  },
  {
    path: "/leads",
    label: "Leads",
    icon: () => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
    ),
  },
  {
    path: "/campaigns",
    label: "Campaigns",
    icon: () => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        ></path>
      </svg>
    ),
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: () => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        ></path>
      </svg>
    ),
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isMobileNavOpen,
  setMobileNavOpen,
}) => {
  const pathname = usePathname();
  return (
    <nav
      className={`
        h-full bg-background border-r border-white/10 p-4 
        flex flex-col items-center justify-between
        w-64 lg:w-[100px] relative z-50
      `}
    >
      <div className="w-full flex flex-col items-center justify-center">
        {/* Logo */}
        <Link href="/dashboard">
          <div className="w-[75px] h-[75px] mb-8 lg:mb-12 flex items-center justify-center mx-auto bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
            <img
              src="/logo2.png"
              alt="AI Lead Manager Pro"
              className="w-20 h-20 object-contain brightness-110 contrast-110"
            />
          </div>
        </Link>

        {/* Navigation Items */}
        <ul className="space-y-2 lg:space-y-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={() => {
                  if (setMobileNavOpen) setMobileNavOpen(false);
                }}
                className={`
                  group relative flex items-center w-full rounded-lg 
                  transition-all duration-300
                  justify-start px-4 lg:px-0 lg:w-12 lg:justify-center
                  h-12
                  ${
                    pathname === item.path
                      ? "bg-primary text-white shadow-glow-primary"
                      : "text-text-muted hover:bg-primary/20 hover:text-white"
                  }
                `}
                title={item.label}
              >
                <item.icon />
                <span className="ml-4 font-medium lg:hidden">{item.label}</span>

                {/* Desktop Tooltip */}
                <span className="hidden lg:block absolute left-full ml-4 w-auto min-w-max px-3 py-1.5 bg-card-bg text-white text-sm rounded-md shadow-lg shadow-black/50 scale-0 group-hover:scale-100 transition-transform duration-200 origin-left backdrop-blur-sm z-[9999] border border-white/20">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Avatar */}
      <div
        className="w-10 h-10 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url('https://picsum.photos/100/100')` }}
      ></div>
    </nav>
  );
};

export default Sidebar;
