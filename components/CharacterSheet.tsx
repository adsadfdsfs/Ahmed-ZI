
import React, { useState } from 'react';
import Layout from './Layout';
import { Character, View, Stats, Race, Class } from '../types';

interface CharacterSheetProps {
  character: Character;
  onNavigate: (view: View) => void;
  onUpdateCharacter: (char: Character) => void;
}

interface StatBoxProps {
  label: string;
  score: number;
  modifier: string;
  isEditing: boolean;
  onScoreChange: (val: number) => void;
}

const StatBox: React.FC<StatBoxProps> = ({ label, score, modifier, isEditing, onScoreChange }) => (
  <div className={`bg-slate-900 border-2 ${isEditing ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-amber-900/40'} p-5 rounded-md text-center transition-all relative group overflow-hidden stat-glow`}>
    <div className={`text-[10px] font-black ${isEditing ? 'text-emerald-500' : 'text-amber-500'} mb-2 tracking-[0.2em] uppercase z-10 relative`}>{label}</div>
    {isEditing ? (
       <input type="number" value={score} onChange={(e) => onScoreChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-950 text-center text-4xl font-black text-white focus:outline-none rounded border border-emerald-900/50 py-1" />
    ) : (
      <div className="text-4xl font-black text-white drop-shadow-md z-10 relative">{modifier}</div>
    )}
    {!isEditing && (
      <div className="text-[10px] bg-amber-950/40 rounded-full px-3 py-1 flex items-center justify-center mx-auto mt-3 border border-amber-900/50 text-amber-500 font-black shadow-inner z-10 relative">
        CORE: {score}
      </div>
    )}
    <div className="absolute top-0 left-0 w-full h-full rune-pattern pointer-events-none opacity-5"></div>
  </div>
);

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character: initialCharacter, onNavigate, onUpdateCharacter }) => {
  const [character, setCharacter] = useState<Character>({ ...initialCharacter });
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Adventuring Gear');

  const calculateModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  };

  const handleStatChange = (stat: keyof Stats, value: number) => {
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, [stat]: value } }));
  };

  const handleSave = () => {
    onUpdateCharacter(character);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=1920">
      <div className="w-full max-w-6xl space-y-6 animate-in zoom-in duration-700 pb-20 print:pb-0">
        
        {/* Navigation Actions */}
        <div className="flex justify-between items-center no-print px-2">
           <button onClick={() => onNavigate('VAULT')} className="text-slate-500 hover:text-amber-500 font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-2 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
             THE VAULT
           </button>
           <div className="flex gap-4">
              <button onClick={handlePrint} className="px-6 py-2 border-2 border-slate-800 text-slate-400 rounded-full font-black uppercase text-[10px] hover:text-white hover:border-slate-600 transition-all">Export Scroll (Print)</button>
              <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`px-8 py-2 rounded-full text-[10px] uppercase font-black border-2 transition-all shadow-xl ${isEditing ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500'}`}>
                {isEditing ? 'COMMIT CHANGES' : 'ALTER DESTINY'}
              </button>
           </div>
        </div>

        {/* The Actual Sheet Container */}
        <div className={`bg-slate-900 border-4 ${isEditing ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 'border-amber-900'} rounded-sm shadow-2xl relative transition-all overflow-hidden print-container`}>
          
          {/* Header Banner */}
          <div className="relative p-10 bg-slate-950 border-b border-amber-900/50 overflow-hidden">
             <div className="absolute inset-0 rune-pattern opacity-10 pointer-events-none"></div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-900/10 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h2 className="text-6xl font-black text-amber-500 uppercase tracking-tighter drop-shadow-xl font-serif mb-2">{character.name}</h2>
                   <div className="flex flex-wrap items-center gap-4 text-xl text-slate-400 font-black uppercase tracking-widest medieval-font">
                      <span className="text-slate-100">Level {character.level}</span>
                      <span className="w-1 h-1 bg-amber-900 rounded-full"></span>
                      <span>{character.race === Race.HOMEBREW ? character.customRaceName : character.race}</span>
                      <span className="w-1 h-1 bg-amber-900 rounded-full"></span>
                      <span className="text-amber-600">{character.class === Class.HOMEBREW ? character.customClassName : character.class}</span>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black text-amber-700 uppercase tracking-[0.4em] mb-1">Vault Wealth</div>
                   <div className="text-4xl font-black text-amber-500 font-serif drop-shadow-md">{character.gold} <span className="text-xl">GP</span></div>
                </div>
             </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Stats Sidebar */}
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 h-fit">
              {(Object.keys(character.stats) as Array<keyof Stats>).map(statKey => (
                <StatBox key={statKey} label={statKey.toUpperCase()} score={character.stats[statKey]} modifier={calculateModifier(character.stats[statKey])} isEditing={isEditing} onScoreChange={(val) => handleStatChange(statKey, val)} />
              ))}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border-2 border-amber-900/20 p-6 rounded-md shadow-xl relative overflow-hidden group">
                  <h3 className="text-amber-600 text-[10px] font-black mb-4 border-b border-amber-900/20 pb-2 uppercase tracking-[0.3em] font-serif">MASTER ARTIFACT</h3>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-white uppercase font-serif tracking-tight">{character.weapon.name}</p>
                    <div className="mt-2 flex items-center gap-3">
                       <span className="text-lg font-black text-amber-500">{character.weapon.damage}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{character.weapon.type}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-125 duration-700 pointer-events-none">
                    <svg className="w-32 h-32 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11 20l-1.5-1.5L16 12 9.5 5.5 11 4l8 8-8 8z"/><path d="M5 20l-1.5-1.5L10 12 3.5 5.5 5 4l8 8-8 8z"/></svg>
                  </div>
                </div>
                
                <div className="bg-slate-950 border-2 border-amber-900/20 p-6 rounded-md md:col-span-2 shadow-xl flex flex-col">
                  <h3 className="text-amber-600 text-[10px] font-black mb-4 border-b border-amber-900/20 pb-2 uppercase tracking-[0.3em] font-serif">IDENTITY MANIFEST</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                    {[
                      { l: 'Gender', v: character.appearance.gender },
                      { l: 'Physique', v: character.appearance.build },
                      { l: 'Stature', v: character.appearance.height },
                      { l: 'Skin Tone', v: character.appearance.skinTone },
                      { l: 'Hair', v: character.appearance.hairColor },
                      { l: 'Eyes', v: character.appearance.eyeColor },
                      { l: 'Style', v: character.appearance.hairStyle },
                      { l: 'Aesthetic', v: character.appearance.clothingAesthetic }
                    ].map(item => (
                      <div key={item.l} className="space-y-0.5">
                        <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{item.l}</div>
                        <div className="text-[11px] text-amber-100 font-bold uppercase tracking-tight">{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Homebrew section if exists */}
              {character.homebrewTraits && (
                <div className="bg-emerald-950/20 border-2 border-emerald-900/30 p-8 rounded-md shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                  <h3 className="text-emerald-500 text-[11px] font-black mb-6 border-b border-emerald-900/20 pb-3 uppercase tracking-[0.4em] font-serif">ANCIENT HERITAGE (CUSTOM)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-xs leading-relaxed">
                    <div className="space-y-6">
                       <div className="space-y-1">
                          <span className="text-emerald-800 font-black uppercase text-[9px] tracking-widest block">Ancestral Roots</span>
                          <span className="text-emerald-100 italic font-serif text-sm">{character.homebrewTraits.ancestors}</span>
                       </div>
                       <div className="space-y-1">
                          <span className="text-emerald-800 font-black uppercase text-[9px] tracking-widest block">Elemental Resistances</span>
                          <span className="text-emerald-100 font-bold tracking-tight">{character.homebrewTraits.resistances}</span>
                       </div>
                       <div className="space-y-1">
                          <span className="text-emerald-800 font-black uppercase text-[9px] tracking-widest block">Innate Manifestations</span>
                          <span className="text-emerald-100 block mt-1 leading-relaxed bg-black/20 p-3 rounded border border-emerald-900/10 italic">{character.homebrewTraits.abilities}</span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <span className="text-emerald-800 font-black uppercase text-[9px] tracking-widest block">Lore Fragment</span>
                       <span className="text-emerald-100 block italic leading-relaxed font-serif text-sm bg-black/20 p-4 rounded border border-emerald-900/10 shadow-inner">"{character.homebrewTraits.raceBackstory}"</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backstory Chronicle */}
                <div className="bg-slate-950/40 border-2 border-slate-800 p-8 rounded-md shadow-2xl flex flex-col h-full relative">
                  <h3 className="text-amber-600 text-[10px] font-black mb-6 border-b border-amber-900/20 pb-3 uppercase tracking-[0.3em] font-serif flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    LEGEND CHRONICLE
                  </h3>
                  <div className="text-slate-300 italic text-lg font-serif leading-relaxed h-[350px] overflow-y-auto custom-scrollbar pr-4 whitespace-pre-wrap select-text">
                    {character.backstory}
                  </div>
                  <div className="absolute bottom-2 right-4 text-[8px] text-slate-700 font-black uppercase">Etched by Gemini Oracle</div>
                </div>

                {/* Inventory / Satchel */}
                <div className="bg-slate-950/40 border-2 border-slate-800 p-8 rounded-md shadow-2xl flex flex-col h-full overflow-hidden">
                  <h3 className="text-amber-600 text-[10px] font-black mb-6 border-b border-amber-900/20 pb-3 uppercase tracking-[0.3em] font-serif flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    SATCHEL OF HOLDING
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-4 no-print">
                    {Object.keys(character.inventory).map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-[9px] px-5 py-2.5 border-2 rounded-full transition-all font-black uppercase tracking-widest whitespace-nowrap ${activeCategory === cat ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-500 hover:border-amber-900/50'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex-grow overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar mt-2">
                    {character.inventory[activeCategory]?.map((item, idx) => (
                      <div key={idx} className="p-4 bg-black/40 border-2 border-slate-900/50 rounded-md text-sm text-amber-100 italic font-serif flex items-center justify-between group hover:border-amber-900/30 transition-all">
                        <span>{item}</span>
                        <div className="w-1 h-1 bg-amber-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                    {(!character.inventory[activeCategory] || character.inventory[activeCategory].length === 0) && (
                       <div className="h-full flex items-center justify-center text-slate-700 italic font-serif py-12">The pouch feels lighter than expected...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-slate-950/80 p-6 border-t border-amber-900/50 flex justify-between items-center no-print">
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Mythic Creator v2.5 - System Manifested</p>
             <div className="flex gap-6">
                <span className="text-[10px] text-amber-900/60 font-black uppercase">AUTHENTICATED BY LEGEND</span>
             </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex justify-center gap-6 py-8 no-print">
          <button onClick={() => onNavigate('LANDING')} className="px-12 py-4 bg-slate-900/80 text-slate-500 rounded-full font-black border-2 border-slate-800 uppercase tracking-widest text-[11px] shadow-2xl hover:text-white hover:border-slate-600 transition-all">EXIT TO TAVERN</button>
          <button onClick={() => onNavigate('CREATOR')} className="px-12 py-4 bg-amber-950/20 text-amber-500 rounded-full font-black border-2 border-amber-900/40 uppercase tracking-widest text-[11px] shadow-2xl hover:bg-amber-900/20 transition-all">FORGE ANOTHER</button>
        </div>
      </div>
    </Layout>
  );
};

export default CharacterSheet;
