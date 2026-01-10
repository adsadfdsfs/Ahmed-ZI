
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { View, CommunityItem, Character, World } from '../types';

interface CommunityLibraryProps {
  onNavigate: (view: View) => void;
  onImportCharacter: (char: Character) => void;
  onImportWorld: (world: World) => void;
}

const CommunityLibrary: React.FC<CommunityLibraryProps> = ({ onNavigate, onImportCharacter, onImportWorld }) => {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'character' | 'world'>('all');

  useEffect(() => {
    const library = JSON.parse(localStorage.getItem('community_library') || '[]');
    setItems(library.sort((a: CommunityItem, b: CommunityItem) => b.timestamp - a.timestamp));
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  const handleImport = (item: CommunityItem) => {
    if (item.type === 'character') {
      onImportCharacter(item.data as Character);
      onNavigate('SHEET');
    } else {
      // For worlds, we just alert for now or you could navigate to a world viewer
      alert(`Imported world: ${(item.data as World).name}. This would normally load into your active adventure setting!`);
    }
  };

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1920">
      <div className="w-full max-w-6xl space-y-8 animate-in fade-in duration-700 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-blue-500 uppercase tracking-tighter drop-shadow-md font-serif">The Archive of Souls</h2>
          <p className="text-slate-400 italic medieval-font">"Legends shared from across the multiverse."</p>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-blue-400'}`}
          >
            All Chronicles
          </button>
          <button 
            onClick={() => setFilter('character')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${filter === 'character' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-amber-400'}`}
          >
            Characters
          </button>
          <button 
            onClick={() => setFilter('world')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${filter === 'world' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-emerald-400'}`}
          >
            Worlds
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-black/40 border-2 border-dashed border-slate-800 rounded-lg">
              <p className="text-slate-600 italic">The archives are currently empty. Be the first to share a legend!</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-slate-900/80 border border-slate-700 rounded-sm overflow-hidden shadow-2xl flex flex-col hover:border-blue-500 transition-colors group">
                <div className={`h-2 ${item.type === 'character' ? 'bg-amber-600' : 'bg-emerald-600'}`}></div>
                <div className="p-6 flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-100 uppercase font-serif tracking-tight">
                      {item.type === 'character' ? (item.data as Character).name : (item.data as World).name}
                    </h3>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.type === 'character' ? 'bg-amber-900/50 text-amber-500' : 'bg-emerald-900/50 text-emerald-500'}`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 italic line-clamp-3 leading-relaxed">
                    {item.type === 'character' ? (item.data as Character).backstory : (item.data as World).description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {item.type === 'world' && (item.data as World).tags.map(t => (
                      <span key={t} className="text-[7px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold">{t}</span>
                    ))}
                    {item.type === 'character' && (
                      <>
                        <span className="text-[7px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold">{(item.data as Character).race}</span>
                        <span className="text-[7px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold">{(item.data as Character).class}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-black/40 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 font-bold uppercase italic">By: {item.author}</span>
                  <button 
                    onClick={() => handleImport(item)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold uppercase rounded-sm transition-all"
                  >
                    View & Import
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-start pt-8">
          <button 
            onClick={() => onNavigate('LANDING')}
            className="px-8 py-3 bg-slate-800 text-slate-400 rounded-sm font-bold border border-slate-700 uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-colors"
          >
            Return to Tavern
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityLibrary;
