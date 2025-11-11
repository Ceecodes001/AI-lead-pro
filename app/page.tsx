"use client";

import React, { useState } from "react";
import Link from "next/link";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [waitlistEmails, setWaitlistEmails] = useLocalStorage<string[]>(
    "waitlist",
    []
  );
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || waitlistEmails.includes(email)) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setWaitlistEmails([...waitlistEmails, email]);
    setIsJoined(true);
    setEmail("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:14px_24px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-900/20 to-black/50"></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 border border-white/5 rounded-full animate-pulse"></div>
        <div
          className="absolute top-20 sm:top-40 right-4 sm:right-20 w-12 sm:w-24 h-12 sm:h-24 bg-white/3 rounded-lg rotate-45 animate-bounce"
          style={{ animationDuration: "6s" }}
        ></div>
        <div className="absolute bottom-16 sm:bottom-32 left-4 sm:left-20 w-8 sm:w-16 h-8 sm:h-16 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-8 sm:right-32 w-10 sm:w-20 h-10 sm:h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full"></div>
      </div>
      {/* Header */}
      <header className="relative z-50 px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="flex items-center space-x-2 sm:space-x-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-gray-400/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center">
              <img
                src="/logo2.png"
                alt="Nova Leads"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain brightness-110 contrast-110"
              />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Nova Leads
          </span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Link
            href="/auth/login"
            className="hidden sm:block text-gray-300 hover:text-white transition-all duration-300 font-medium hover:scale-105"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="relative group bg-gradient-to-r from-white to-gray-200 text-black px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-gray-100 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20 lg:py-10">
        {/* Advanced background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-tl from-gray-400/10 via-gray-500/5 to-transparent rounded-full blur-3xl"
            style={{ animationDelay: "2s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-r from-transparent via-white/2 to-transparent rounded-full blur-3xl"></div>

          {/* Space background image */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-70">
            <img
              src="/background.png"
              alt=""
              className="w-full h-full object-cover filter brightness-50 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Hero Content - Text Above Video on Mobile, Side by Side on Desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-12 sm:mb-16 lg:mb-20">
            {/* Text Content - Always First on Mobile */}
            <div className="text-center lg:text-left order-1 lg:order-1 w-full">
              {/* Enhanced main heading */}
              <div className="mb-6 sm:mb-8 lg:mb-16">
                <div className="inline-flex items-start px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 rounded-full bg-gradient-to-r from-gray-800/80 to-gray-900/60 border border-gray-600/30 backdrop-blur-xl shadow-2xl">
                  <div className="relative flex items-center">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-1.5 sm:mr-2 lg:mr-3 animate-pulse shadow-lg shadow-orange-500/50"></span>
                    <span className="text-xs sm:text-sm bg-gradient-to-r from-white to-gray-300 bg-clip-text text-white font-semibold">
                      Currently in Beta • Early Access Available
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-[0.9] tracking-tight">
                  <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                    AI-Powered
                  </span>
                  <span className="block bg-gradient-to-r from-gray-100 via-gray-300 to-gray-400 bg-clip-text text-transparent">
                    Lead Management
                  </span>
                </h1>

                {/* Decorative line */}
                <div className="flex justify-center lg:justify-start mb-6 sm:mb-8">
                  <div className="w-12 sm:w-16 lg:w-24 h-1 bg-gradient-to-r from-white/40 via-white/60 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* Enhanced description */}
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 sm:mb-8 lg:mb-12 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                Transform your lead generation with{" "}
                <span className="text-white font-medium">
                  intelligent AI automation
                </span>
                . <br className="hidden sm:block" />
                Nova Leads helps you{" "}
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">
                  capture, nurture, and convert
                </span>{" "}
                prospects with unprecedented efficiency.
              </p>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 justify-center lg:justify-start">
                <Link
                  href="/auth/register"
                  className="group relative w-full sm:w-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-white via-gray-200 to-white rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-gradient-to-r from-white to-gray-100 text-black px-4 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:from-gray-50 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-2xl text-center">
                    Start Free Trial
                    <svg
                      className="inline-block w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </Link>

                <button
                  onClick={() =>
                    document
                      .getElementById("waitlist")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group relative w-full sm:w-auto border-2 border-gray-600/50 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:border-gray-500 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Join Waitlist
                    <svg
                      className="inline-block w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ml-1.5 sm:ml-2 group-hover:rotate-12 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </div>
            </div>

            {/* Video - Second on Mobile */}
            <div className="relative group order-2 lg:order-2 w-full max-w-lg lg:max-w-none mx-auto">
              {/* Glow effect behind video */}
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-l from-white/20 via-gray-400/10 to-white/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>

              {/* GIF container */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/world.gif"
                  alt="World Animation"
                  className="w-full h-auto object-cover filter "
                />

                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-xl sm:rounded-2xl"></div>
              </div>
            </div>
          </div>

          {/* Dashboard Screenshot Section */}
          <div className="relative mx-auto max-w-6xl px-2 sm:px-0">
            <div className="relative group">
              {/* Glow effect behind image */}
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-white/20 via-gray-400/10 to-white/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>

              {/* Main container with glass effect */}
              <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-xl sm:rounded-2xl border border-gray-600/30 p-2 sm:p-4 backdrop-blur-xl shadow-2xl">
                {/* Browser-like header */}
                <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-600/20">
                  <div className="flex space-x-1 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500/60 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500/60 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500/60 rounded-full"></div>
                  </div>
                  <div className="flex-1 mx-2 sm:mx-4">
                    <div className="bg-gray-700/30 rounded-md sm:rounded-lg px-2 sm:px-3 py-1 text-xs text-gray-400 border border-gray-600/20">
                      nova-leads.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Actual dashboard image */}
                <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src="/dashboard.png"
                    alt="Nova Leads Dashboard"
                    className="w-full h-auto object-cover filter brightness-110 contrast-105"
                    style={{
                      background: `url('data:image/svg+xml,${btoa(`
                        <svg width="1200" height="700" viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="1200" height="700" fill="%23111111"/>
                          <text x="600" y="350" text-anchor="middle" fill="%23666666" font-family="Arial" font-size="24">Dashboard Preview</text>
                        </svg>
                      `)}') center/cover`,
                    }}
                  />

                  {/* Overlay gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                  {/* Floating elements for visual interest */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/10 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1 border border-white/20">
                    <span className="text-xs text-white/80">Live Demo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-32 border-t border-white/5">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent px-4">
              Why Choose Nova Leads?
            </h2>
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"></div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto font-light px-4">
              Powerful features designed to{" "}
              <span className="text-white font-medium">revolutionize</span> your
              lead management workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 - Enhanced */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-gray-400/5 to-white/10 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-gradient-to-br from-gray-800/30 via-gray-900/20 to-black/30 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-500 backdrop-blur-xl shadow-2xl group-hover:shadow-3xl transform group-hover:-translate-y-2">
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-light">
                  Leverage advanced AI to analyze lead behavior, predict
                  conversion likelihood, and optimize your sales strategy{" "}
                  <span className="text-white font-medium">automatically</span>.
                </p>
              </div>
            </div>

            {/* Feature 2 - Enhanced */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-gray-400/5 to-white/10 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-gradient-to-br from-gray-800/30 via-gray-900/20 to-black/30 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-500 backdrop-blur-xl shadow-2xl group-hover:shadow-3xl transform group-hover:-translate-y-2">
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Smart Campaigns
                </h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-light">
                  Create and manage intelligent marketing campaigns that adapt
                  to customer responses and optimize{" "}
                  <span className="text-white font-medium">
                    conversion rates
                  </span>{" "}
                  in real-time.
                </p>
              </div>
            </div>

            {/* Feature 3 - Enhanced */}
            <div className="group relative md:col-span-2 lg:col-span-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-gray-400/5 to-white/10 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-gradient-to-br from-gray-800/30 via-gray-900/20 to-black/30 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-500 backdrop-blur-xl shadow-2xl group-hover:shadow-3xl transform group-hover:-translate-y-2">
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Advanced Analytics
                </h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-light">
                  Get detailed insights into your lead pipeline with
                  comprehensive analytics,{" "}
                  <span className="text-white font-medium">
                    conversion tracking
                  </span>
                  , and performance metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section
        id="waitlist"
        className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-32 border-t border-white/5"
      >
        {/* Enhanced background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white/5_0%,transparent_70%)]"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent px-4">
            Join the Beta Waitlist
          </h2>

          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-32 sm:w-40 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"></div>
          </div>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-12 sm:mb-14 lg:mb-16 max-w-3xl mx-auto font-light leading-relaxed px-4">
            Get early access to Nova Leads and be among the{" "}
            <span className="text-white font-medium">first to experience</span>{" "}
            the future of lead management.
          </p>

          {isJoined ? (
            <div className="group relative max-w-2xl mx-auto px-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-green-400/10 to-green-500/20 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-br from-green-500/20 via-green-600/10 to-green-500/20 border border-green-500/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-transparent rounded-full blur opacity-50"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center backdrop-blur-sm border border-green-400/30">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mb-3 sm:mb-4 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  You're on the list!
                </h3>
                <p className="text-gray-300 text-base sm:text-lg">
                  We'll notify you as soon as Nova Leads is ready for early
                  access.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4">
              <form onSubmit={handleWaitlistSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-gray-400/10 to-white/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-700"></div>
                <div className="relative flex flex-col lg:flex-row gap-4 sm:gap-6 p-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-600/30 backdrop-blur-xl">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="flex-1 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-transparent text-white text-base sm:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg sm:rounded-xl border border-gray-700/50 focus:border-white/30 transition-all backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="group/btn relative bg-gradient-to-r from-white to-gray-100 text-black px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-gray-50 hover:to-white disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-2xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="hidden sm:inline">Joining...</span>
                        <span className="sm:hidden">...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="hidden sm:inline">Join Waitlist</span>
                        <span className="sm:hidden">Join</span>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 group-hover/btn:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced benefits */}
          <div className="flex flex-wrap items-center justify-center mt-12 sm:mt-16 gap-4 sm:gap-6 lg:gap-8 text-sm text-gray-400 px-4">
            <div className="flex items-center group hover:text-gray-300 transition-colors duration-300">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-green-500 to-green-400 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                <svg
                  className="w-2 h-2 sm:w-3 sm:h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="font-medium">Free during beta</span>
            </div>
            <div className="flex items-center group hover:text-gray-300 transition-colors duration-300">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                <svg
                  className="w-2 h-2 sm:w-3 sm:h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="font-medium">No spam, ever</span>
            </div>
            <div className="flex items-center group hover:text-gray-300 transition-colors duration-300">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                <svg
                  className="w-2 h-2 sm:w-3 sm:h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-medium">Early access priority</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-gray-400/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <img
                  src="/logo2.png"
                  alt="Nova Leads"
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain brightness-110 contrast-110"
                />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Nova Leads
            </span>
          </div>
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-20 sm:w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
          <p className="text-gray-400 text-base sm:text-lg px-4">
            &copy; 2024 Nova Leads. All rights reserved.{" "}
            <span className="text-white font-medium">Currently in Beta</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
