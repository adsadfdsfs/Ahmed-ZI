
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { View } from '../types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1599713361090-ee5572569b43?auto=format&fit=crop&q=80&w=1920">
      <div className="text-center space-y-4 animate-in fade-in duration-1000 -mt-20">
        <div className="inline-block px-3 py-1 bg-amber-900/40 backdrop-blur-sm border border-amber-500/30 rounded mb-2">
          <span className="text-amber-400 font-bold text-[10px] tracking-[0.3em] uppercase">The Ultimate RPG Tool</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-amber-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] tracking-tighter uppercase font-serif">
          Mythic <span className="text-slate-100">Creator</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto medieval-font italic drop-shadow-md">
          "Forge your destiny. From deep dungeons to dragon's breath, your legend begins."
        </p>
        
        <div className="flex flex-col gap-4 items-center pt-10">
          <button 
            onClick={() => onNavigate('ADVENTURE')}
            className="w-full max-w-2xl px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-sm font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(180,83,9,0.5)] border-2 border-amber-400 flex items-center justify-center gap-4 group uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>START ADVENTURE</span>
          </button>

          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full max-w-2xl py-3 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-400 rounded-sm font-black text-sm transition-all border-2 border-emerald-700/50 backdrop-blur-md flex items-center justify-center gap-3 animate-bounce"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>SUMMON APP TO DESKTOP</span>
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button 
              onClick={() => onNavigate('CREATOR')}
              className="px-8 py-3 bg-slate-900/80 hover:bg-slate-800 text-amber-500 rounded-sm font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 border-amber-900/50 backdrop-blur-md flex items-center justify-center gap-3 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>CHARACTER MAKER</span>
            </button>

            <button 
              onClick={() => onNavigate('STORY_MAKER')}
              className="px-8 py-3 bg-slate-900/80 hover:bg-slate-800 text-emerald-500 rounded-sm font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 border-emerald-900/50 backdrop-blur-md flex items-center justify-center gap-3 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>STORY MAKER</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button 
              onClick={() => onNavigate('LIBRARY')}
              className="px-8 py-3 bg-slate-900/80 hover:bg-slate-800 text-blue-400 rounded-sm font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 border-blue-900/50 backdrop-blur-md flex items-center justify-center gap-3 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>COMMUNITY LIBRARY</span>
            </button>

            <button 
              onClick={() => onNavigate('VAULT')}
              className="px-8 py-3 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 rounded-sm font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 border-amber-900/50 backdrop-blur-md flex items-center justify-center gap-3 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>THE VAULT</span>
            </button>
          </div>

          <button 
            onClick={() => onNavigate('SETTINGS')}
            className="w-full max-w-2xl py-3 bg-slate-950/40 hover:bg-slate-900 text-slate-400 rounded-sm font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 border-slate-800 backdrop-blur-md uppercase tracking-[0.2em]"
          >
            SETTINGS
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-amber-500/50 text-[10px] medieval-font tracking-widest uppercase flex items-center gap-4">
        <span className="h-px w-6 bg-amber-900/50"></span>
        Powered by Gemini AI Oracle
        <span className="h-px w-6 bg-amber-900/50"></span>
      </div>
    </Layout>
  );
};

export default LandingPage;
