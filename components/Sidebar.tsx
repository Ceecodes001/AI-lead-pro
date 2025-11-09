
import React from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    isMobileView?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileView }) => {
    return (
        <nav className={`${isMobileView ? 'w-64' : 'w-20'} bg-background border-r border-white/10 p-4 flex flex-col items-center justify-between h-full`}>
            <div>
                <div className="w-10 h-10 bg-primary rounded-full mb-12 shadow-glow-primary flex items-center justify-center font-bold text-lg">
                    AL
                </div>
                <ul className="space-y-4">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setCurrentView(item.id)}
                                className={`group relative flex items-center w-full rounded-lg transition-all duration-300 ${
                                    isMobileView ? 'justify-start px-4' : 'w-12 justify-center'
                                } h-12 ${
                                    currentView === item.id 
                                        ? 'bg-primary text-white shadow-glow-primary' 
                                        : 'text-text-muted hover:bg-primary/20 hover:text-white'
                                }`}
                                title={!isMobileView ? item.label : undefined}
                            >
                                <item.icon />
                                {isMobileView && <span className="ml-4 font-medium">{item.label}</span>}
                                {!isMobileView && <span className="absolute left-full ml-4 w-auto min-w-max px-3 py-1.5 bg-card-bg text-white text-sm rounded-md shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200 origin-left backdrop-blur-sm">
                                    {item.label}
                                </span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/100/100')` }}></div>
        </nav>
    );
};

export default Sidebar;
