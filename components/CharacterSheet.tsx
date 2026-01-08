
import React, { useState } from 'react';
import Layout from './Layout';
import { Character, View, Stats, Race, Class } from '../types';

interface CharacterSheetProps {
  character: Character;
  onNavigate: (view: View) => void;
}

const STAT_EXPLANATIONS: Record<string, string> = {
  STRENGTH: "Physical power. Affects heavy weapons and Athletics. Bonus is added to melee damage.",
  DEXTERITY: "Agility & Reflexes. Affects Armor Class (AC), Stealth, and ranged weapon accuracy.",
  CONSTITUTION: "Endurance & Vitality. Determines your Maximum Hit Points (HP) and stamina.",
  INTELLIGENCE: "Mental acuity. Critical for Wizard spells, Investigation, and general knowledge.",
  WISDOM: "Intuition & Awareness. Vital for Perception, Cleric spells, and reading intentions.",
  CHARISMA: "Social influence. Affects Persuasion, Deception, and Sorcerer/Bard spellcasting."
};

interface StatBoxProps {
  label: string;
  score: number;
  modifier: string;
  isEditing: boolean;
  onScoreChange: (val: number) => void;
}

const StatBox: React.FC<StatBoxProps> = ({ 
  label, 
  score, 
  modifier, 
  isEditing, 
  onScoreChange 
}) => (
  <div className={`bg-slate-800 border-2 ${isEditing ? 'border-emerald-500 shadow-lg shadow-emerald-900/20' : 'border-amber-900/50'} p-4 rounded text-center relative group transition-all`}>
    <div className={`text-[10px] font-black ${isEditing ? 'text-emerald-500' : 'text-amber-500'} mb-1 tracking-widest uppercase`}>{label}</div>
    <div className="text-3xl font-black text-white">{modifier}</div>
    {isEditing ? (
      <select 
        className="mt-2 bg-slate-900 text-emerald-400 font-bold border border-emerald-600 rounded p-1 text-sm appearance-none text-center w-12 focus:outline-none"
        value={score}
        onChange={(e) => onScoreChange(parseInt(e.target.value))}
      >
        {Array.from({length: 30}, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    ) : (
      <div className="text-sm bg-amber-900/50 rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-2 border border-amber-700/50 text-amber-100 font-bold shadow-inner">
        {score}
      </div>
    )}
    <div className="absolute inset-x-0 bottom-full mb-2 bg-slate-900 text-amber-100 text-[10px] p-3 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border-2 border-amber-800 shadow-2xl w-56 left-1/2 -translate-x-1/2 text-left backdrop-blur-md no-print">
      <div className="font-black text-amber-500 mb-1 border-b border-amber-900/50 pb-1 uppercase tracking-tighter">{label}</div>
      <p className="font-medium leading-relaxed italic">{STAT_EXPLANATIONS[label] || "A core ability score determining your hero's basic potential."}</p>
    </div>
  </div>
);

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character: initialCharacter, onNavigate }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [isEditing, setIsEditing] = useState(false);

  const calculateModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  };

  const handleStatChange = (stat: keyof Stats, value: number) => {
    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: value }
    }));
  };

  const handlePrint = () => {
    // Force edit mode off before printing for a cleaner look
    const wasEditing = isEditing;
    if (wasEditing) setIsEditing(false);
    
    // Tiny delay to allow the DOM to update (remove select boxes, etc.)
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=1920">
      <div className="w-full max-w-6xl space-y-4 animate-in zoom-in duration-700 pb-12 print:pb-0">
        <div className={`bg-slate-900 border-4 ${isEditing ? 'border-emerald-500 shadow-2xl' : 'border-amber-900'} p-6 rounded-sm shadow-2xl relative transition-all print-container`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-amber-900/50 pb-4">
            <div className="w-full max-w-xl">
              <h2 className="text-5xl font-black text-amber-500 uppercase tracking-tighter drop-shadow-lg">{character.name}</h2>
              <p className="text-xl text-slate-400 font-bold uppercase tracking-widest medieval-font">
                Level {character.level} {character.race === Race.HOMEBREW ? character.customRaceName : character.race} {character.class === Class.HOMEBREW ? character.customClassName : character.class}
              </p>
            </div>
            <div className="text-right flex items-center gap-3 no-print">
              <div className="text-[9px] text-slate-500 uppercase font-black text-right hidden lg:block">
                Legendary <br/> Status: Active
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className={`px-6 py-2 rounded-sm text-[10px] uppercase font-bold border transition-all ${isEditing ? 'bg-emerald-600 border-emerald-400 text-white' : 'border-amber-900/50 text-amber-500 hover:border-amber-500'}`}>
                {isEditing ? 'SAVE CHANGES' : 'EDIT SHEET'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-3 grid grid-cols-2 gap-3 h-fit">
              {(Object.keys(character.stats) as Array<keyof Stats>).map(statKey => (
                <StatBox 
                  key={statKey}
                  label={statKey.toUpperCase()} 
                  score={character.stats[statKey]} 
                  modifier={calculateModifier(character.stats[statKey])} 
                  isEditing={isEditing}
                  onScoreChange={(val) => handleStatChange(statKey, val)}
                />
              ))}
              
              <div className="col-span-2 mt-2 p-3 bg-black/40 border border-amber-900/20 rounded-sm">
                <h4 className="text-[9px] font-black text-amber-600 uppercase mb-1">Combat Tip</h4>
                <p className="text-[10px] text-slate-400 leading-tight italic">Roll a 20-sided die (d20) and add your modifier to attempt an action.</p>
              </div>
            </div>

            <div className="lg:col-span-9 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-sm shadow-lg">
                  <h3 className="text-amber-500 text-xs font-bold mb-2 border-b border-amber-900/30 pb-1 uppercase tracking-widest">WEAPON</h3>
                  <p className="text-xl font-black text-amber-100 uppercase">{character.weapon.name}</p>
                  <p className="text-sm font-bold text-amber-500">{character.weapon.damage} {character.weapon.type}</p>
                  <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">{character.weapon.properties.join(' • ')}</p>
                </div>
                
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-sm md:col-span-2 shadow-lg">
                  <h3 className="text-amber-500 text-xs font-bold mb-2 border-b border-amber-900/30 pb-1 uppercase tracking-widest">VISUAL TRAITS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-[10px]">
                    <p><span className="text-slate-500 uppercase">Gender:</span> <span className="text-amber-100 font-bold ml-1">{character.appearance.gender}</span></p>
                    <p><span className="text-slate-500 uppercase">Build:</span> <span className="text-amber-100 font-bold ml-1">{character.appearance.build}</span></p>
                    <p><span className="text-slate-500 uppercase">Eyes:</span> <span className="text-amber-100 font-bold ml-1">{character.appearance.eyeColor} ({character.appearance.eyeShape})</span></p>
                    <p><span className="text-slate-500 uppercase">Hair:</span> <span className="text-amber-100 font-bold ml-1">{character.appearance.hairColor} ({character.appearance.hairStyle})</span></p>
                    <p><span className="text-slate-500 uppercase">Skin:</span> <span className="text-amber-100 font-bold ml-1">{character.appearance.skinTone}</span></p>
                  </div>
                  {character.appearance.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {character.appearance.features.map(f => (
                        <span key={f} className="px-2 py-0.5 bg-amber-950/40 text-amber-400 border border-amber-900/30 text-[8px] font-bold uppercase rounded-sm">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {character.homebrewTraits && (
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-sm shadow-xl">
                  <h3 className="text-emerald-500 text-xs font-bold mb-2 border-b border-emerald-900/30 pb-1 uppercase tracking-widest">HOMEBREW LINEAGE</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                    <div><span className="text-emerald-700 uppercase block">Height</span><p className="text-emerald-100 font-bold">{character.homebrewTraits.avgHeight || 'N/A'}</p></div>
                    <div><span className="text-emerald-700 uppercase block">Speed</span><p className="text-emerald-100 font-bold">{character.homebrewTraits.speed}</p></div>
                    <div><span className="text-emerald-700 uppercase block">Size</span><p className="text-emerald-100 font-bold">{character.homebrewTraits.size}</p></div>
                    <div><span className="text-emerald-700 uppercase block">Ancestry</span><p className="text-emerald-100 font-bold">{character.homebrewTraits.ancestors || 'Unknown'}</p></div>
                  </div>
                  {(character.homebrewTraits.abilities || character.homebrewTraits.resistances || character.homebrewTraits.specialAttacks) && (
                    <div className="mt-4 p-3 bg-black/20 border border-emerald-900/20 rounded-sm space-y-2 text-[10px]">
                      {character.homebrewTraits.abilities && <p><span className="text-emerald-700 font-black uppercase mr-2">Abilities:</span> <span className="text-emerald-100 italic">{character.homebrewTraits.abilities}</span></p>}
                      {character.homebrewTraits.resistances && <p><span className="text-emerald-700 font-black uppercase mr-2">Resistances:</span> <span className="text-emerald-100 italic">{character.homebrewTraits.resistances}</span></p>}
                      {character.homebrewTraits.specialAttacks && <p><span className="text-emerald-700 font-black uppercase mr-2">Attacks:</span> <span className="text-emerald-100 italic">{character.homebrewTraits.specialAttacks}</span></p>}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-800 border border-slate-700 p-4 rounded-sm shadow-lg">
                <h3 className="text-amber-500 text-xs font-bold mb-2 border-b border-amber-900/30 pb-1 uppercase tracking-widest">BACKSTORY</h3>
                <div className="text-slate-300 leading-relaxed italic text-sm space-y-3 font-serif">
                  {character.backstory.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 py-4 no-print">
          <button onClick={() => onNavigate('LANDING')} className="px-6 py-2 bg-slate-800 text-amber-100 rounded-sm font-bold border border-slate-700 uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-colors">RETURN</button>
          <button onClick={handlePrint} className="px-8 py-2 bg-amber-600 text-white rounded-sm font-bold border-2 border-amber-800 uppercase tracking-widest text-[10px] shadow-lg hover:bg-amber-500 transition-all">PRINT PDF</button>
        </div>
      </div>
    </Layout>
  );
};

export default CharacterSheet;
