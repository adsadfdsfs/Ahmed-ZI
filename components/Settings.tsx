
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { View, RollMode, CalculationMode, AdventureConfig } from '../types';

interface SettingsProps {
  onNavigate: (view: View) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const [config, setConfig] = useState<AdventureConfig>({
    rollMode: 'INGAME',
    calculationMode: 'AI_DESTINY',
    storytellingInstruction: 'Classic high-fantasy adventure with a focus on heroism and ancient mysteries.',
    showDamageEffects: true
  });

  const [audioSettings, setAudioSettings] = useState({
    overall: 80,
    sfx: 70,
    npcs: 90
  });

  useEffect(() => {
    const saved = localStorage.getItem('mythic_adventure_config');
    if (saved) {
      setConfig({ ...config, ...JSON.parse(saved) });
    }

    // Detect standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

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

  const saveConfig = (newConfig: AdventureConfig) => {
    setConfig(newConfig);
    localStorage.setItem('mythic_adventure_config', JSON.stringify(newConfig));
  };

  const handleAudioChange = (key: keyof typeof audioSettings, value: string) => {
    setAudioSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920">
      <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-amber-900 p-8 rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-8 animate-in slide-in-from-bottom duration-500 backdrop-blur-sm">
        <div className="flex justify-between items-center border-b border-amber-900/30 pb-4">
          <h2 className="text-4xl font-bold text-amber-500 uppercase tracking-widest fantasy-font">Altar of Settings</h2>
          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isStandalone ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' : 'bg-blue-900/40 text-blue-400 border border-blue-500/30'}`}>
            {isStandalone ? 'Standalone Portal' : 'Browser Mirror'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs text-amber-600 font-bold uppercase tracking-widest border-b border-amber-900/30 pb-2">Fate & Fortune</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => saveConfig({...config, rollMode: 'INGAME'})}
                  className={`p-3 border rounded-sm flex flex-col items-center gap-1 transition-all ${config.rollMode === 'INGAME' ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  <span className="text-[9px] font-black uppercase">In-Game Dice</span>
                </button>
                <button 
                  onClick={() => saveConfig({...config, rollMode: 'IRL'})}
                  className={`p-3 border rounded-sm flex flex-col items-center gap-1 transition-all ${config.rollMode === 'IRL' ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  <span className="text-[9px] font-black uppercase">IRL Tabletop</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs text-emerald-600 font-bold uppercase tracking-widest border-b border-emerald-900/30 pb-2">Audio Orchestration</h3>
              <AudioSlider label="Master" value={audioSettings.overall} onChange={(v) => handleAudioChange('overall', v)} />
              <AudioSlider label="SFX" value={audioSettings.sfx} onChange={(v) => handleAudioChange('sfx', v)} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs text-emerald-500 font-bold uppercase tracking-widest border-b border-emerald-900/30 pb-2">Planar Manifestation</h3>
              {isStandalone ? (
                <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded text-center space-y-2">
                  <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">App Manifested</div>
                  <p className="text-[9px] text-slate-500 italic">"This instance is running as a standalone PC application."</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[9px] text-slate-400 italic">"Summon this tool to your desktop for a native experience."</p>
                  {deferredPrompt ? (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 border-emerald-400 shadow-lg animate-pulse"
                    >
                      SUMMON TO DESKTOP
                    </button>
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-black leading-relaxed">
                        To Install: Open in Chrome/Edge & click the [Install] icon in your address bar.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Storyteller Instruction</label>
              <textarea 
                value={config.storytellingInstruction}
                onChange={(e) => saveConfig({...config, storytellingInstruction: e.target.value})}
                className="w-full h-24 bg-slate-950/50 border border-amber-900/30 text-amber-50 p-3 rounded text-[10px] font-serif italic focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('LANDING')}
          className="w-full py-5 bg-amber-600 text-white rounded-sm font-black uppercase tracking-widest hover:bg-amber-500 transition-all border-2 border-amber-400 shadow-xl"
        >
          SAVE & RETURN TO TAVERN
        </button>
      </div>
    </Layout>
  );
};

const AudioSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-end">
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <span className="text-[9px] font-mono text-amber-500">{value}%</span>
    </div>
    <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600" />
  </div>
);

export default Settings;
