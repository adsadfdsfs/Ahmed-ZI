
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  onNavigate?: (view: View) => void;
  showNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, backgroundImage, onNavigate, showNav = true }) => {
  return (
    <div 
      className="min-h-screen w-full relative overflow-x-hidden flex flex-col"
      style={{
        backgroundImage: backgroundImage ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {showNav && onNavigate && (
        <nav className="w-full bg-slate-950/40 backdrop-blur-md border-b border-amber-900/30 px-6 py-3 flex justify-between items-center z-50 no-print">
          <button 
            onClick={() => onNavigate('LANDING')}
            className="text-amber-500 font-black tracking-tighter uppercase font-serif flex items-center gap-2 hover:text-amber-400 transition-all"
          >
            <span className="text-xl">Mythic</span>
            <span className="text-white text-xs opacity-60">Creator</span>
          </button>

          <div className="flex gap-4">
            <button 
              onClick={() => onNavigate('VAULT')}
              className="text-[10px] font-black text-amber-500/80 hover:text-amber-400 uppercase tracking-widest flex items-center gap-2"
              title="Personal Vault"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden md:inline">Vault</span>
            </button>

            <button 
              onClick={() => onNavigate('LIBRARY')}
              className="text-[10px] font-black text-blue-400/80 hover:text-blue-300 uppercase tracking-widest flex items-center gap-2"
              title="Community Library"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="hidden md:inline">Library</span>
            </button>
          </div>
        </nav>
      )}

      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
