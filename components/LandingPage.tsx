
import React from 'react';
import Layout from './Layout';
import { View } from '../types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1599713361090-ee5572569b43?auto=format&fit=crop&q=80&w=1920">
      <div className="text-center space-y-4 animate-in fade-in duration-1000 -mt-20">
        <div className="inline-block px-3 py-1 bg-amber-900/40 backdrop-blur-sm border border-amber-500/30 rounded mb-2">
          <span className="text-amber-400 font-bold text-[10px] tracking-[0.3em] uppercase">The Ultimate RPG Tool</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-amber-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] tracking-tighter uppercase">
          Mythic <span className="text-slate-100">Creator</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto medieval-font italic drop-shadow-md">
          "Forge your destiny. From deep dungeons to dragon's breath, your legend begins."
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => onNavigate('CREATOR')}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-sm font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(180,83,9,0.4)] border-2 border-amber-800 flex items-center gap-3 group"
          >
            <span>START ADVENTURE</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <button 
            onClick={() => onNavigate('SETTINGS')}
            className="px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-amber-100 rounded-sm font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-slate-700 backdrop-blur-md"
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
