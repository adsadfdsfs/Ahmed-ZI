
import React, { useState } from 'react';
import Layout from './Layout';
import { View } from '../types';

interface SettingsProps {
  onNavigate: (view: View) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    overall: 80,
    sfx: 70,
    npcs: 90
  });

  const handleAudioChange = (key: keyof typeof audioSettings, value: string) => {
    setAudioSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920">
      <div className="w-full max-w-xl bg-slate-900/95 border-2 border-amber-900 p-8 rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-8 animate-in slide-in-from-bottom duration-500 backdrop-blur-sm">
        <h2 className="text-4xl font-bold text-amber-500 text-center uppercase tracking-widest fantasy-font">Altar of Settings</h2>
        
        <div className="space-y-6">
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-xs text-amber-600 font-bold uppercase tracking-widest border-b border-amber-900/30 pb-2">Audio Orchestration</h3>
            
            <AudioSlider 
              label="Overall Master" 
              value={audioSettings.overall} 
              onChange={(v) => handleAudioChange('overall', v)} 
            />
            
            <AudioSlider 
              label="Sound Effects" 
              value={audioSettings.sfx} 
              onChange={(v) => handleAudioChange('sfx', v)} 
            />
            
            <AudioSlider 
              label="NPC Voices" 
              value={audioSettings.npcs} 
              onChange={(v) => handleAudioChange('npcs', v)} 
            />
          </div>
          
          {/* Visuals Toggle */}
          <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded border border-slate-700/50">
            <span className="text-amber-100 font-bold text-sm tracking-wide">ARCANE VISUAL EFFECTS</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Model Info */}
          <div className="space-y-2">
            <label className="text-[10px] text-amber-700 font-bold uppercase tracking-tighter">Gemini Oracle Status</label>
            <div className="p-3 bg-slate-950/50 text-slate-500 rounded border border-slate-800 text-xs italic flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Communing with gemini-3-flash-preview
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="pt-4 space-y-4">
          {!showFeedback ? (
            <button 
              onClick={() => setShowFeedback(true)}
              className="w-full py-3 bg-slate-800 text-amber-400 rounded font-bold hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              SEND FEEDBACK
            </button>
          ) : (
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-sm animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-amber-600 uppercase">Oracle Support</span>
                <button onClick={() => setShowFeedback(false)} className="text-slate-500 hover:text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-amber-100 mb-2">Send your scrolls and suggestions to our master scribe:</p>
              <code className="block p-2 bg-black/40 text-amber-500 rounded text-center font-mono text-sm border border-amber-900/20 select-all">
                wasayfmuscat@gmail.com
              </code>
            </div>
          )}
        </div>

        <button 
          onClick={() => onNavigate('LANDING')}
          className="w-full py-4 bg-amber-600 text-white rounded font-bold hover:bg-amber-500 transition-all border-2 border-amber-800 shadow-lg shadow-amber-900/20"
        >
          SAVE & RETURN
        </button>
      </div>
    </Layout>
  );
};

const AudioSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-end">
      <label className="text-[10px] font-bold text-amber-200/60 uppercase tracking-widest">{label}</label>
      <span className="text-[10px] font-mono text-amber-500">{value}%</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
    />
  </div>
);

export default Settings;
