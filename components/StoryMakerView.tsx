
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { View, World, CommunityItem } from '../types';
import { WORLD_TAGS, PREMADE_WORLDS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface StoryMakerViewProps {
  onNavigate: (view: View) => void;
  initialWorld?: World | null;
  onSaveWorld: (world: World) => void;
}

const StoryMakerView: React.FC<StoryMakerViewProps> = ({ onNavigate, initialWorld, onSaveWorld }) => {
  const [worldId, setWorldId] = useState(initialWorld?.id || '');
  const [worldName, setWorldName] = useState(initialWorld?.name || '');
  const [description, setDescription] = useState(initialWorld?.description || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialWorld?.tags || []);
  const [loading, setLoading] = useState(false);
  const [showPremade, setShowPremade] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (initialWorld) {
      setWorldId(initialWorld.id);
      setWorldName(initialWorld.name);
      setDescription(initialWorld.description);
      setSelectedTags(initialWorld.tags);
    }
  }, [initialWorld]);

  const manifestWorldAI = async () => {
    if (!worldName) return alert("Give your world a name first!");
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Create an immersive D&D world setting guide for a world called "${worldName}". 
      Themes: ${selectedTags.join(', ')}. 
      Include a short history, one major landmark, and one dangerous faction.
      Return the content in markdown or plain paragraphs.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setDescription(prev => prev ? prev + "\n\n" + response.text : response.text || "");
    } catch (e) {
      console.error(e);
      alert("The cosmic archives are unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveToVault = () => {
    if (!worldName.trim()) return alert("Your realm needs a name!");
    setSaveStatus('saving');
    const world: World = {
      id: worldId || `world-${Date.now()}`,
      name: worldName,
      description,
      tags: selectedTags
    };
    onSaveWorld(world);
    setWorldId(world.id);
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleShare = () => {
    if (!worldName || !description) return alert("Your chronicle is incomplete!");
    
    const world: World = {
      id: worldId || `world-${Date.now()}`,
      name: worldName,
      description,
      tags: selectedTags
    };

    const communityItem: CommunityItem = {
      id: `lib-${Date.now()}`,
      type: 'world',
      author: 'Unknown Scribe',
      data: world,
      timestamp: Date.now()
    };

    const existing = JSON.parse(localStorage.getItem('community_library') || '[]');
    localStorage.setItem('community_library', JSON.stringify([...existing, communityItem]));
    
    alert("Your world has been shared with the Community Library!");
  };

  const selectPremade = (world: World) => {
    setWorldId(''); 
    setWorldName(world.name);
    setDescription(world.description);
    setSelectedTags(world.tags);
    setShowPremade(false);
  };

  return (
    <Layout 
      onNavigate={onNavigate} 
      backgroundImage="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1920"
    >
      <div className="w-full max-w-7xl space-y-6 animate-in fade-in duration-700 pb-12">
        <div className="flex justify-between items-end border-b border-emerald-900/30 pb-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-emerald-500 uppercase tracking-tighter font-serif">Chronicle Forge</h2>
            <p className="text-slate-400 italic medieval-font text-sm">"Penning the destiny of a new realm."</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSaveToVault}
              className={`px-6 py-2 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 border ${
                saveStatus === 'saved' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-emerald-900/40 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
              }`}
            >
              {saveStatus === 'saving' ? 'Etching...' : saveStatus === 'saved' ? 'Etched!' : 'Save to Vault'}
            </button>
            <button 
              onClick={() => onNavigate('VAULT')}
              className="px-6 py-2 bg-slate-900/80 text-amber-500 border border-amber-900/50 rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
            >
              Open Vault
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Chronicle Scroll - PRIMARY */}
          <div className="lg:col-span-8 bg-slate-900 border-2 border-emerald-900/50 rounded-sm shadow-2xl relative flex flex-col min-h-[700px] order-2 lg:order-1">
            <div className="p-4 border-b border-emerald-900/30 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Master Chronicle Scroll</span>
                 <div className="flex gap-1">
                    {selectedTags.map(t => <span key={t} className="text-[7px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 uppercase font-bold border border-emerald-900/50">{t}</span>)}
                 </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { if(confirm("This will burn all current writings. Are you sure?")) setDescription(''); }}
                  className="text-[9px] text-slate-500 hover:text-red-400 uppercase font-bold transition-colors"
                >
                  Burn Page
                </button>
              </div>
            </div>
            
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The blank scroll awaits your vision. Describe the terrain, the gods, the major conflicts, or the hidden cities..."
              className="flex-grow w-full bg-[#0c140c] p-12 text-slate-200 font-serif italic text-xl leading-relaxed focus:outline-none resize-none custom-scrollbar shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
            />

            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Summoning Divine Inspiration...</p>
              </div>
            )}
          </div>

          {/* Configuration Panel - SECONDARY */}
          <div className="lg:col-span-4 space-y-4 order-1 lg:order-2">
            <div className="bg-slate-900/90 border border-emerald-900/50 p-6 rounded-sm shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realm Identity</label>
                  <button 
                    onClick={() => setShowPremade(!showPremade)}
                    className="text-[9px] text-amber-500 font-bold uppercase hover:underline"
                  >
                    Premade Settings
                  </button>
                </div>

                {showPremade ? (
                  <div className="space-y-2 animate-in slide-in-from-top duration-300 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {PREMADE_WORLDS.map(w => (
                      <button 
                        key={w.id}
                        onClick={() => selectPremade(w)}
                        className="w-full text-left p-3 bg-black/60 border border-emerald-900/30 rounded hover:bg-emerald-900/20 transition-all group"
                      >
                        <div className="text-emerald-400 font-bold text-sm uppercase">{w.name}</div>
                        <div className="text-[9px] text-slate-500">{w.tags.join(' • ')}</div>
                      </button>
                    ))}
                    <button onClick={() => setShowPremade(false)} className="w-full text-center py-2 text-[9px] text-slate-500 uppercase border-t border-emerald-900/20 mt-2">Cancel</button>
                  </div>
                ) : (
                  <input 
                    type="text"
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                    placeholder="Enter Realm Name..."
                    className="w-full bg-black/60 border border-emerald-900/30 text-emerald-100 p-4 rounded text-lg focus:outline-none focus:border-emerald-500 transition-all font-serif italic"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">World Themes (Select Multiple)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {WORLD_TAGS.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1.5 rounded-sm text-[9px] font-bold border transition-all text-left truncate ${selectedTags.includes(tag) ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-emerald-700'}`}
                    >
                      {tag.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-emerald-900/20 space-y-3">
                <p className="text-[10px] text-slate-500 italic mb-2">Need help writing? The Oracle can add content to your current scroll.</p>
                <button 
                  onClick={manifestWorldAI}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-900/20 text-emerald-400 border-2 border-dashed border-emerald-700 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-emerald-900/40 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  CONSULT ORACLE
                </button>
                <button 
                  onClick={handleShare}
                  className="w-full py-3 bg-blue-950/40 text-blue-400 border border-blue-900/50 rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-blue-900/60 transition-all flex items-center justify-center gap-2"
                >
                  Share to Library
                </button>
              </div>
            </div>

            <div className="p-6 bg-emerald-950/10 border border-emerald-900/20 rounded-sm shadow-inner">
              <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-3 tracking-widest">Scribe's Wisdom</h4>
              <ul className="text-[11px] text-slate-500 space-y-3 font-serif italic leading-relaxed">
                <li>• Start with a "High Concept" (e.g. "A world where time only flows when people speak").</li>
                <li>• Define the major conflict. Is it gods vs mortals? Magic vs machinery?</li>
                <li>• The scroll auto-saves to your Vault when you click "Save".</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-start pt-4">
          <button 
            onClick={() => onNavigate('LANDING')}
            className="px-10 py-3 bg-slate-900 text-slate-500 rounded-sm font-bold border border-slate-800 uppercase tracking-widest text-[11px] hover:text-white transition-colors"
          >
            Return to Tavern
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default StoryMakerView;
