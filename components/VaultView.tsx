
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { View, Character, World } from '../types';

interface VaultViewProps {
  onNavigate: (view: View) => void;
  onLoadCharacter: (char: Character) => void;
  onLoadWorld: (world: World) => void;
}

const VaultView: React.FC<VaultViewProps> = ({ onNavigate, onLoadCharacter, onLoadWorld }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [tab, setTab] = useState<'characters' | 'worlds'>('characters');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedChars = JSON.parse(localStorage.getItem('my_characters') || '[]');
    const savedWorlds = JSON.parse(localStorage.getItem('my_worlds') || '[]');
    setCharacters(savedChars);
    setWorlds(savedWorlds);
  }, []);

  const deleteCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you wish to banish this character to the void?")) return;
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    localStorage.setItem('my_characters', JSON.stringify(updated));
  };

  const deleteWorld = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you wish to collapse this universe?")) return;
    const updated = worlds.filter(w => w.id !== id);
    setWorlds(updated);
    localStorage.setItem('my_worlds', JSON.stringify(updated));
  };

  const filteredCharacters = characters.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredWorlds = worlds.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Layout 
      onNavigate={onNavigate} 
      backgroundImage="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920"
    >
      <div className="w-full max-w-7xl space-y-8 animate-in fade-in duration-700 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-amber-900/30 pb-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-5xl font-black text-amber-500 uppercase tracking-tighter font-serif">The Archive Vault</h2>
            <p className="text-slate-400 italic medieval-font">"Your legacy, etched in stone and soul."</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
             <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Archives..."
                  className="w-full bg-slate-900 border border-amber-900/30 text-amber-100 px-10 py-2 rounded-sm text-sm focus:outline-none focus:border-amber-600 font-serif"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <div className="flex bg-slate-900 p-1 rounded-sm border border-amber-900/30">
                <button 
                  onClick={() => setTab('characters')}
                  className={`px-6 py-2 rounded-sm text-[10px] font-black uppercase transition-all tracking-widest ${tab === 'characters' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-amber-400'}`}
                >
                  Characters
                </button>
                <button 
                  onClick={() => setTab('worlds')}
                  className={`px-6 py-2 rounded-sm text-[10px] font-black uppercase transition-all tracking-widest ${tab === 'worlds' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-emerald-400'}`}
                >
                  Worlds
                </button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tab === 'characters' ? (
            filteredCharacters.length === 0 ? (
              <EmptyState message={searchTerm ? "No legends match your search terms." : "No legends yet dwell within your vault."} />
            ) : (
              filteredCharacters.map(char => (
                <div 
                  key={char.id} 
                  onClick={() => { onLoadCharacter(char); onNavigate('SHEET'); }}
                  className="bg-slate-900 border-2 border-amber-900/50 p-6 rounded-sm shadow-2xl space-y-4 hover:border-amber-500 transition-all group relative overflow-hidden cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-amber-500 font-serif uppercase leading-tight group-hover:text-amber-400">{char.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{char.race} • {char.class}</p>
                    </div>
                    <button 
                      onClick={(e) => deleteCharacter(char.id, e)} 
                      className="text-slate-700 hover:text-red-500 transition-colors p-1"
                      title="Delete Entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex gap-2 text-[10px] font-bold text-amber-900/80">
                    <span>STR {char.stats.strength}</span>
                    <span>DEX {char.stats.dexterity}</span>
                    <span>INT {char.stats.intelligence}</span>
                  </div>

                  <p className="text-xs text-slate-500 italic line-clamp-3 leading-relaxed font-serif pt-2 border-t border-amber-900/10">"{char.backstory}"</p>
                  
                  <div className="flex justify-between items-center pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-amber-600 font-black uppercase">Click to open</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredWorlds.length === 0 ? (
              <EmptyState message={searchTerm ? "No realms match your search terms." : "No realms have yet been manifested by your quill."} />
            ) : (
              filteredWorlds.map(world => (
                <div 
                  key={world.id} 
                  onClick={() => { onLoadWorld(world); onNavigate('STORY_MAKER'); }}
                  className="bg-slate-900 border-2 border-emerald-900/50 p-6 rounded-sm shadow-2xl space-y-4 hover:border-emerald-500 transition-all group relative overflow-hidden cursor-pointer hover:-translate-y-1"
                >
                   <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-emerald-500 font-serif uppercase leading-tight group-hover:text-emerald-400">{world.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {world.tags.slice(0, 3).map(t => <span key={t} className="text-[7px] bg-emerald-950 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-bold border border-emerald-900/30">{t}</span>)}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteWorld(world.id, e)} 
                      className="text-slate-700 hover:text-red-500 transition-colors p-1"
                      title="Collapse World"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 italic line-clamp-4 leading-relaxed font-serif pt-2 border-t border-emerald-900/10">"{world.description}"</p>
                  
                  <div className="flex justify-between items-center pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-emerald-600 font-black uppercase">Open Chronicle Forge</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        <div className="flex justify-center pt-10 border-t border-amber-900/10">
          <button 
            onClick={() => onNavigate('LANDING')}
            className="px-12 py-3 bg-slate-900 text-slate-400 rounded-sm font-bold border border-slate-800 uppercase tracking-widest text-[11px] hover:text-white hover:border-amber-900 transition-all"
          >
            Exit the Vault
          </button>
        </div>
      </div>
    </Layout>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full py-32 text-center bg-black/40 border-2 border-dashed border-slate-800 rounded-lg">
    <p className="text-slate-600 italic medieval-font text-2xl drop-shadow-sm">{message}</p>
  </div>
);

export default VaultView;
