
import React from 'react';
import { View } from '../types';

const Header: React.FC<{ currentView: View, toggleAssistant: () => void, toggleMobileNav: () => void }> = ({ currentView, toggleAssistant, toggleMobileNav }) => {
    return (
        <header className="sticky top-0 z-10 h-20 bg-background/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-4">
                <button onClick={toggleMobileNav} className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition md:hidden" aria-label="Open navigation menu">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <h1 className="text-xl sm:text-2xl font-poppins font-bold">{currentView}</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
                <div className="relative hidden sm:block">
                    <input
                        type="search"
                        placeholder="Search..."
                        className="bg-card-bg border border-white/10 rounded-lg py-2 pl-10 pr-4 w-40 sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <svg className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <button onClick={toggleAssistant} className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition" aria-label="Toggle AI Assistant">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
