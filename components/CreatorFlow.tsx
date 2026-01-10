
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { Race, Class, Appearance, View, Character, Stats, Weapon, HomebrewTraits } from '../types';
import { 
  HAIR_COLORS, HAIR_STYLES, HAIR_TEXTURES, SKIN_TONES, SKIN_TEXTURES, HEIGHTS, CLOTHING_AESTHETICS,
  EYE_COLORS, EYE_SHAPES, BUILDS, GENDERS, FEATURES,
  RACE_DESCRIPTIONS, CLASS_DESCRIPTIONS, STANDARD_ARRAY, ALIGNMENTS, CLASS_WEAPONS,
  HAIR_COLOR_MAP, SKIN_TONE_MAP, EYE_COLOR_MAP
} from '../constants';
import { generateBackstory, forgeWeaponAI } from '../services/geminiService';

interface CreatorFlowProps {
  onNavigate: (view: View) => void;
  onCharacterGenerated: (char: Character) => void;
}

const CreatorFlow: React.FC<CreatorFlowProps> = ({ onNavigate, onCharacterGenerated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race>(Race.HUMAN);
  const [customRaceName, setCustomRaceName] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class>(Class.FIGHTER);
  const [customClassName, setCustomClassName] = useState('');
  const [alignment, setAlignment] = useState(ALIGNMENTS[4]); 
  
  const [homebrewTraits, setHomebrewTraits] = useState<HomebrewTraits>({
    avgHeight: '6 ft.',
    ancestors: 'Ancient Celestial Spirits',
    raceBackstory: 'Born from the collision of starlight and stone...',
    speed: '30 ft.',
    size: 'Medium',
    specialAttacks: 'Radiant Pulse (1d6)',
    resistances: 'Radiant',
    abilities: 'Darkvision, Magic Resistance'
  });

  const [appearance, setAppearance] = useState<Appearance>({
    gender: 'Masculine',
    hairColor: 'Midnight Black',
    hairStyle: 'Short & Messy',
    hairTexture: 'Straight',
    skinTone: 'Pale Alabaster',
    skinTexture: 'Smooth',
    eyeColor: 'Steel Blue',
    eyeShape: 'Round/Gentle',
    build: 'Athletic',
    height: 'Average',
    clothingAesthetic: 'Practical/Traveler',
    features: [],
    narrative: {
      head: '',
      body: '',
      legs: ''
    }
  });

  const [stats, setStats] = useState<Record<keyof Stats, number | null>>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null
  });

  const [weapon, setWeapon] = useState<Weapon>(CLASS_WEAPONS[Class.FIGHTER][0]);
  const [weaponDescription, setWeaponDescription] = useState('');
  const [backstory, setBackstory] = useState('');
  const [backstoryIdea, setBackstoryIdea] = useState('');
  const [inventory] = useState<Record<string, string[]>>({
    'Adventuring Gear': ['Waterskin', 'Rations (5 days)', 'Bedroll'],
    'Weapons': [],
    'Armor': []
  });

  const allStandardWeapons = useMemo(() => Object.values(CLASS_WEAPONS).flat().filter((v, i, a) => a.findIndex(t => t.name === v.name) === i), []);

  const handleStatChange = (stat: keyof Stats, score: number | null) => {
    setStats(prev => ({ ...prev, [stat]: score }));
  };

  const handleAiBackstory = async () => {
    setLoading(true);
    try {
      const generated = await generateBackstory(
        name || 'Unknown Adventurer',
        selectedRace === Race.HOMEBREW ? customRaceName : selectedRace,
        selectedClass === Class.HOMEBREW ? customClassName : selectedClass,
        appearance,
        backstoryIdea
      );
      setBackstory(generated);
    } catch (e) {
      alert("The oracle is silent...");
    } finally {
      setLoading(false);
    }
  };

  const randomizeAppearance = () => {
    const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    setAppearance({
      ...appearance,
      hairColor: random(HAIR_COLORS),
      hairStyle: random(HAIR_STYLES),
      skinTone: random(SKIN_TONES),
      eyeColor: random(EYE_COLORS),
      build: random(BUILDS),
      height: random(HEIGHTS),
      gender: random(GENDERS)
    });
  };

  const handleFinalize = () => {
    if (!name.trim()) return alert("Your champion needs a name!");
    if (selectedRace === Race.HOMEBREW && !customRaceName.trim()) return alert("Name your custom race!");
    if (selectedClass === Class.HOMEBREW && !customClassName.trim()) return alert("Name your custom class!");
    if (Object.values(stats).some(s => s === null)) return alert("Assign all ability scores first!");
    
    onCharacterGenerated({
      id: `char-${Date.now()}`,
      name,
      race: selectedRace,
      customRaceName: selectedRace === Race.HOMEBREW ? customRaceName : undefined,
      class: selectedClass,
      customClassName: selectedClass === Class.HOMEBREW ? customClassName : undefined,
      appearance,
      backstory: backstory || "A legend in the making.",
      stats: stats as Stats,
      weapon,
      alignment,
      level: 1,
      gold: 50,
      homebrewTraits: selectedRace === Race.HOMEBREW ? homebrewTraits : undefined,
      inventory
    });
    onNavigate('SHEET');
  };

  const tabs = useMemo(() => {
    const t = [
      { id: 1, label: 'Identity', icon: '📜' },
      ...(selectedRace === Race.HOMEBREW ? [{ id: 99, label: 'Ancestry', icon: '🧬' }] : []),
      { id: 2, label: 'Visage', icon: '👤' },
      { id: 3, label: 'Fate', icon: '🎲' },
      { id: 4, label: 'Forge', icon: '⚔️' },
      { id: 5, label: 'Chronicle', icon: '🖋️' }
    ];
    return t;
  }, [selectedRace]);

  const currentTabIndex = tabs.findIndex(t => t.id === step);

  const renderStep1 = () => (
    <div className="w-full max-w-5xl space-y-6 animate-in slide-in-from-right duration-500 pb-8">
      <div className="text-center">
        <h2 className="text-4xl font-black text-amber-500 uppercase tracking-widest font-serif drop-shadow-md">Forge Your Identity</h2>
        <p className="text-slate-400 italic text-sm mt-2">"Every legend begins with a name and a purpose."</p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border-2 border-amber-900/40 p-8 rounded-lg shadow-2xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Champion's Designation</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Valerius the Bold"
              className="w-full bg-slate-950/50 border-2 border-amber-900/20 text-amber-50 p-5 rounded-md focus:outline-none focus:border-amber-500 transition-all text-2xl font-black font-serif italic"
            />
          </div>
          <div className="space-y-3">
            <label className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Moral Compass</label>
            <select 
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              className="w-full bg-slate-950/50 border-2 border-amber-900/20 text-amber-50 p-5 rounded-md focus:outline-none focus:border-amber-500 transition-all text-xl font-bold appearance-none font-serif cursor-pointer"
            >
              {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-amber-900/20 pb-2">
              <label className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Racial Lineage</label>
              {selectedRace === Race.HOMEBREW && (
                <input 
                  type="text"
                  placeholder="Manifest Name..."
                  value={customRaceName}
                  onChange={(e) => setCustomRaceName(e.target.value)}
                  className="bg-amber-900/10 border border-amber-500/30 text-amber-50 text-[10px] px-3 py-1 rounded focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(Race).map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRace(r)}
                  className={`group relative p-4 rounded-md border-2 transition-all flex flex-col items-center justify-center gap-1 ${selectedRace === r ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(180,83,9,0.3)]' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-amber-900/50'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedRace === r ? 'text-white' : 'group-hover:text-amber-400 transition-colors'}`}>{r}</span>
                  {selectedRace === r && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900"></div>}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic px-2">{RACE_DESCRIPTIONS[selectedRace]}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-amber-900/20 pb-2">
              <label className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Destined Calling</label>
              {selectedClass === Class.HOMEBREW && (
                <input 
                  type="text"
                  placeholder="Manifest Name..."
                  value={customClassName}
                  onChange={(e) => setCustomClassName(e.target.value)}
                  className="bg-amber-900/10 border border-amber-500/30 text-amber-50 text-[10px] px-3 py-1 rounded focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(Class).map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedClass(c);
                    if (c !== Class.HOMEBREW) setWeapon(CLASS_WEAPONS[c][0]);
                  }}
                  className={`group relative p-4 rounded-md border-2 transition-all flex flex-col items-center justify-center gap-1 ${selectedClass === c ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(180,83,9,0.3)]' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-amber-900/50'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedClass === c ? 'text-white' : 'group-hover:text-amber-400 transition-colors'}`}>{c}</span>
                  {selectedClass === c && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900"></div>}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic px-2">{CLASS_DESCRIPTIONS[selectedClass]}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-6xl space-y-6 animate-in slide-in-from-right duration-500 pb-10">
       <div className="text-center">
        <h2 className="text-4xl font-black text-amber-500 uppercase tracking-widest font-serif drop-shadow-md">Visual Manifestation</h2>
        <p className="text-slate-400 italic text-sm mt-2">"The appearance is the window to the soul."</p>
       </div>

       <div className="flex justify-end mb-4">
         <button 
           onClick={randomizeAppearance}
           className="px-4 py-2 bg-slate-950 border border-amber-900/30 rounded text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-900/20 transition-all flex items-center gap-2"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           Randomize Visage
         </button>
       </div>

       <div className="bg-slate-900/90 backdrop-blur-md border-2 border-amber-900/40 p-10 rounded-lg shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-12">
                <section className="space-y-6">
                   <h3 className="text-amber-500 text-[12px] font-black uppercase tracking-[0.3em] border-b border-amber-900/20 pb-3 flex items-center gap-4">
                     <span className="text-xl">🧬</span> PHYSIQUE & STATURE
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Presentation</label>
                        <div className="flex flex-wrap gap-2">
                          {GENDERS.map(g => (
                            <button key={g} onClick={() => setAppearance({...appearance, gender: g})} className={`text-[10px] px-4 py-2 border-2 rounded transition-all font-black uppercase tracking-tighter ${appearance.gender === g ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-500'}`}>{g}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Body Build</label>
                        <div className="flex flex-wrap gap-2">
                          {BUILDS.map(b => (
                            <button key={b} onClick={() => setAppearance({...appearance, build: b})} className={`text-[10px] px-4 py-2 border-2 rounded transition-all font-black uppercase tracking-tighter ${appearance.build === b ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-500'}`}>{b}</button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Height Tier</label>
                         <div className="grid grid-cols-3 gap-2">
                           {HEIGHTS.map(h => (
                             <button key={h} onClick={() => setAppearance({...appearance, height: h})} className={`text-[9px] py-3 border-2 rounded transition-all font-black uppercase ${appearance.height === h ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-500'}`}>{h}</button>
                           ))}
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Outfit Aesthetic</label>
                         <select value={appearance.clothingAesthetic} onChange={(e) => setAppearance({...appearance, clothingAesthetic: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 text-amber-50 p-4 rounded-md focus:border-amber-500 appearance-none font-bold uppercase tracking-widest text-xs">
                            {CLOTHING_AESTHETICS.map(ca => <option key={ca} value={ca}>{ca}</option>)}
                         </select>
                      </div>
                   </div>
                </section>
                
                <section className="space-y-8">
                   <h3 className="text-amber-500 text-[12px] font-black uppercase tracking-[0.3em] border-b border-amber-900/20 pb-3 flex items-center gap-4">
                     <span className="text-xl">🎨</span> PIGMENTS & FEATURES
                   </h3>
                   <div className="space-y-6">
                      <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Skin Tone</label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                          {SKIN_TONES.map(st => (
                            <button 
                              key={st} 
                              title={st}
                              onClick={() => setAppearance({...appearance, skinTone: st})}
                              className={`aspect-square w-full rounded-md border-2 transition-all hover:scale-110 ${appearance.skinTone === st ? 'border-white ring-2 ring-amber-500' : 'border-slate-800 shadow-inner'}`}
                              style={{backgroundColor: SKIN_TONE_MAP[st]}}
                            />
                          ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Hair Pigment</label>
                        <div className="grid grid-cols-6 gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            {HAIR_COLORS.map(c => (
                              <button 
                                key={c} 
                                title={c}
                                onClick={() => setAppearance({...appearance, hairColor: c})} 
                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${appearance.hairColor === c ? 'border-white ring-2 ring-amber-500' : 'border-slate-900 shadow-inner'}`} 
                                style={{backgroundColor: HAIR_COLOR_MAP[c]}} 
                              />
                            ))}
                        </div>
                        <div className="pt-4">
                          <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Hair Styling</label>
                          <select value={appearance.hairStyle} onChange={(e) => setAppearance({...appearance, hairStyle: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 text-amber-50 p-3 rounded-md appearance-none font-bold text-xs uppercase tracking-widest">
                              {HAIR_STYLES.map(hs => <option key={hs} value={hs}>{hs}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Eye Gaze</label>
                        <div className="grid grid-cols-5 gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            {EYE_COLORS.map(c => (
                              <button 
                                key={c} 
                                title={c}
                                onClick={() => setAppearance({...appearance, eyeColor: c})} 
                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${appearance.eyeColor === c ? 'border-white ring-2 ring-amber-500' : 'border-slate-900 shadow-inner'}`} 
                                style={{background: EYE_COLOR_MAP[c]}} 
                              />
                            ))}
                        </div>
                        <div className="pt-4">
                          <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Eye Shape</label>
                          <select value={appearance.eyeShape} onChange={(e) => setAppearance({...appearance, eyeShape: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 text-amber-50 p-3 rounded-md appearance-none font-bold text-xs uppercase tracking-widest">
                              {EYE_SHAPES.map(es => <option key={es} value={es}>{es}</option>)}
                          </select>
                        </div>
                      </div>
                   </div>
                </section>
             </div>
             
             <div className="lg:col-span-4 space-y-10">
                <section className="space-y-6">
                   <h3 className="text-amber-500 text-[12px] font-black uppercase tracking-[0.3em] border-b border-amber-900/20 pb-3 flex items-center gap-4">
                     <span className="text-xl">✨</span> DISTINCT TRAITS
                   </h3>
                   <div className="space-y-6">
                      <div className="flex flex-wrap gap-2 bg-slate-950/30 p-4 rounded-lg border border-slate-800/50">
                         {FEATURES.map(f => (
                           <button key={f} onClick={() => {
                              const next = appearance.features.includes(f) ? appearance.features.filter(x => x !== f) : [...appearance.features, f];
                              setAppearance({...appearance, features: next});
                           }} className={`text-[8px] px-3 py-1.5 border-2 rounded transition-all font-black uppercase tracking-widest ${appearance.features.includes(f) ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(180,83,9,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-400'}`}>{f}</button>
                         ))}
                      </div>
                      <div className="space-y-3">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Manifestation Scroll</label>
                        <textarea 
                          value={appearance.narrative.head}
                          onChange={(e) => setAppearance({...appearance, narrative: {...appearance.narrative, head: e.target.value}})}
                          placeholder="Etch more specific details... like a jagged scar across the left eye, or glowing arcane runes etched into the forehead..."
                          className="w-full h-80 bg-slate-950/50 border-2 border-amber-900/20 text-amber-50 p-6 rounded-md text-sm font-serif italic focus:outline-none focus:border-amber-500 transition-all leading-relaxed custom-scrollbar"
                        />
                      </div>
                   </div>
                </section>

                <div className="bg-amber-950/20 border border-amber-900/30 p-6 rounded-md shadow-inner space-y-4">
                   <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-900/20 pb-2">Manifest Summary</h4>
                   <ul className="space-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <li className="flex justify-between"><span>Race</span> <span className="text-amber-500">{selectedRace}</span></li>
                      <li className="flex justify-between"><span>Class</span> <span className="text-amber-500">{selectedClass}</span></li>
                      <li className="flex justify-between"><span>Build</span> <span className="text-amber-500">{appearance.build}</span></li>
                      <li className="flex justify-between"><span>Skin</span> <span className="text-amber-500">{appearance.skinTone}</span></li>
                      <li className="flex justify-between"><span>Hair</span> <span className="text-amber-500">{appearance.hairColor}</span></li>
                   </ul>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-black text-amber-500 uppercase tracking-widest font-serif drop-shadow-md">Abilities of Fate</h2>
        <p className="text-slate-400 italic text-sm mt-2">"Your natural talents will shape your journey."</p>
      </div>

      <div className="bg-slate-900/90 backdrop-blur-md border-2 border-amber-900/40 p-10 rounded-lg shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {(Object.keys(stats) as Array<keyof Stats>).map(statKey => (
            <div key={statKey} className="group space-y-3 bg-slate-950/50 p-8 rounded-lg border-2 border-slate-800 transition-all hover:border-amber-900/50 hover:shadow-xl hover:-translate-y-1">
              <label className="block text-[11px] font-black text-amber-600 uppercase tracking-[0.3em] text-center mb-2">{statKey}</label>
              <div className="relative">
                <select 
                  value={stats[statKey] || ''}
                  onChange={(e) => handleStatChange(statKey, e.target.value === '' ? null : parseInt(e.target.value))}
                  className="w-full bg-slate-900 border-2 border-amber-900/20 text-white p-5 rounded-md text-3xl font-black appearance-none text-center focus:border-amber-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value="">--</option>
                  {STANDARD_ARRAY.map(score => (
                    <option key={score} value={score} disabled={Object.values(stats).includes(score) && stats[statKey] !== score}>{score}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 text-center italic mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-widest">Choose a score from your pool</p>
            </div>
          ))}
        </div>
        <div className="mt-10 p-4 bg-amber-900/10 border border-amber-900/30 rounded text-center">
           <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Available Pool: {STANDARD_ARRAY.filter(s => !Object.values(stats).includes(s)).sort((a,b)=>b-a).join(', ') || 'ALL ASSIGNED'}</p>
        </div>
      </div>
    </div>
  );

  const renderTheForge = () => (
    <div className="w-full max-w-6xl space-y-6 animate-in slide-in-from-right duration-500 pb-8">
      <div className="text-center">
        <h2 className="text-4xl font-black text-amber-500 uppercase tracking-widest font-serif drop-shadow-md">The Eldritch Forge</h2>
        <p className="text-slate-400 italic text-sm mt-2">"Wield the tools of your trade, forged in fire and magic."</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-amber-900/30 pb-2 ml-1">Armory Vault</h3>
          <div className="max-h-[550px] overflow-y-auto pr-3 custom-scrollbar space-y-3">
            {allStandardWeapons.map(w => (
              <button 
                key={w.name} 
                onClick={() => setWeapon(w)} 
                className={`w-full p-5 text-left border-2 rounded-md transition-all group ${weapon.name === w.name ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-[1.02]' : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:border-amber-900/50'}`}
              >
                <div className="font-black uppercase tracking-wider text-sm mb-1 group-hover:text-amber-400 transition-colors">{w.name}</div>
                <div className="flex gap-3 text-[9px] opacity-70 font-black tracking-widest uppercase">
                  <span>{w.damage} Dmg</span>
                  <span className="w-px h-3 bg-current opacity-20"></span>
                  <span>{w.type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-md border-2 border-amber-900/40 p-10 rounded-lg shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-amber-500 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3"><span className="w-8 h-px bg-amber-900/50"></span> CUSTOM ARTIFACT <span className="w-8 h-px bg-amber-900/50"></span></h3>
             <span className="text-[9px] text-slate-500 font-bold uppercase italic">Describe your unique weapon...</span>
          </div>
          <textarea 
            value={weaponDescription} 
            onChange={(e) => setWeaponDescription(e.target.value)} 
            placeholder="e.g. A serrated longsword with a pommel shaped like a screaming gargoyle, dripping with ethereal Frost..." 
            className="w-full flex-grow bg-slate-950/50 border-2 border-amber-900/20 text-amber-100 p-8 rounded-md text-xl font-serif italic focus:outline-none focus:border-amber-500 transition-all leading-relaxed" 
          />
          <div className="mt-8 space-y-4">
             <button 
                onClick={async () => {
                    if (!weaponDescription.trim()) return;
                    setLoading(true);
                    try {
                      const forged = await forgeWeaponAI(weaponDescription);
                      setWeapon(forged);
                      setWeaponDescription(''); // Clear after forging
                    } finally { setLoading(false); }
                }}
                className="w-full py-6 bg-amber-900/20 text-amber-400 font-black border-2 border-amber-700 rounded-md hover:bg-amber-900/40 transition-all uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                MANIFEST ARTIFACT
              </button>
              
              <div className="p-6 bg-slate-950/60 border border-amber-900/30 rounded-md">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className="text-[9px] text-amber-600 font-black uppercase tracking-widest">Equipped Weapon</span>
                       <h4 className="text-2xl font-black text-white font-serif uppercase mt-1">{weapon.name}</h4>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-amber-500">{weapon.damage}</span>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{weapon.type}</div>
                    </div>
                 </div>
                 <div className="mt-3 flex flex-wrap gap-2">
                    {weapon.properties.map(p => <span key={p} className="text-[8px] bg-amber-900/30 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 font-black uppercase">{p}</span>)}
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChronicleStep = () => (
    <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-right duration-500 pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-amber-500 uppercase tracking-widest font-serif drop-shadow-md">The Chronicle of Legend</h2>
        <p className="text-slate-400 italic text-sm mt-2">"Your past informs your future. The Oracle will help etch your story."</p>
      </div>

      <div className="bg-slate-900/90 backdrop-blur-md border-2 border-amber-900/40 p-10 rounded-lg shadow-2xl space-y-8 flex flex-col relative min-h-[600px]">
        <div className="flex items-center gap-4 mb-2">
           <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Master Scroll</span>
           <div className="h-px flex-grow bg-amber-900/30"></div>
        </div>
        <textarea 
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="The scroll is blank... speak of your origins, your traumas, and your aspirations..."
            className="flex-grow w-full bg-slate-950/30 p-10 text-slate-100 font-serif italic text-2xl leading-relaxed focus:outline-none resize-none custom-scrollbar shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] border border-amber-900/10 rounded-md"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest ml-1">Inspiration Theme (Optional)</label>
              <input 
                type="text" 
                value={backstoryIdea} 
                onChange={(e) => setBackstoryIdea(e.target.value)} 
                placeholder="e.g. Lost nobility, Vengeance, Accidental magic..."
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-sm italic text-amber-100 focus:border-amber-700 outline-none" 
              />
           </div>
           <div className="flex items-end">
              <button 
                onClick={handleAiBackstory} 
                className="w-full h-[52px] bg-amber-900/20 text-amber-400 border-2 border-dashed border-amber-700 rounded-md uppercase font-black tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-amber-900/40 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                CONSULT ORACLE
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderHomebrewAncestry = () => (
    <div className="w-full max-w-5xl space-y-6 animate-in slide-in-from-right duration-500 pb-8">
      <div className="text-center">
        <h2 className="text-4xl font-black text-emerald-500 uppercase tracking-widest font-serif drop-shadow-md">Ancestral Manifestation</h2>
        <p className="text-slate-400 italic text-sm mt-2">"Define the unique traits of your custom lineage."</p>
      </div>

      <div className="bg-slate-900/90 border-2 border-emerald-900/40 p-10 rounded-lg shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
           <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Ancestors & Heritage</label>
           <input 
              type="text" 
              value={homebrewTraits.ancestors} 
              onChange={(e) => setHomebrewTraits({...homebrewTraits, ancestors: e.target.value})}
              className="w-full bg-slate-950 border border-emerald-900/30 p-4 rounded text-emerald-100 font-serif"
           />
        </div>
        <div className="space-y-4">
           <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Innate Resistances</label>
           <input 
              type="text" 
              value={homebrewTraits.resistances} 
              onChange={(e) => setHomebrewTraits({...homebrewTraits, resistances: e.target.value})}
              className="w-full bg-slate-950 border border-emerald-900/30 p-4 rounded text-emerald-100 font-serif"
           />
        </div>
        <div className="md:col-span-2 space-y-4">
           <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Unique Racial Abilities</label>
           <textarea 
              value={homebrewTraits.abilities} 
              onChange={(e) => setHomebrewTraits({...homebrewTraits, abilities: e.target.value})}
              className="w-full h-32 bg-slate-950 border border-emerald-900/30 p-4 rounded text-emerald-100 font-serif italic"
           />
        </div>
      </div>
    </div>
  );

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=1920">
      {loading && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center gap-6">
           <div className="w-24 h-24 border-8 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-center space-y-2">
              <h3 className="text-4xl font-black text-amber-500 font-serif uppercase tracking-widest animate-pulse">Consulting Oracle</h3>
              <p className="text-slate-500 italic text-sm">"The weave of destiny is being re-written..."</p>
           </div>
        </div>
      )}
      
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-12 gap-8 sticky top-0 z-40 py-4 no-print">
         <button onClick={() => onNavigate('LANDING')} className="group flex items-center gap-3 text-slate-500 hover:text-amber-500 transition-all font-black uppercase text-[11px] tracking-[0.2em]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            BACK TO TAVERN
         </button>
         
         <div className="flex bg-slate-950/80 backdrop-blur-xl p-2 rounded-full border-2 border-amber-900/30 overflow-x-auto max-w-full custom-scrollbar shadow-2xl">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setStep(tab.id)} 
                className={`flex items-center gap-3 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${step === tab.id ? 'bg-amber-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-amber-400'}`}
              >
                <span className="text-lg opacity-80">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-grow w-full flex flex-col items-center">
        {step === 1 && renderStep1()}
        {step === 99 && renderHomebrewAncestry()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderTheForge()}
        {step === 5 && renderChronicleStep()}
      </div>

      <div className="mt-16 flex justify-between w-full max-w-5xl pb-24 px-4">
        <button 
          onClick={() => { if(currentTabIndex > 0) setStep(tabs[currentTabIndex - 1].id); else onNavigate('LANDING'); }} 
          className="group flex items-center gap-4 px-12 py-5 bg-slate-900 border-2 border-slate-800 text-slate-400 rounded-md font-black uppercase tracking-[0.3em] text-xs hover:text-white hover:border-slate-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          {currentTabIndex === 0 ? 'ABANDON' : 'PREVIOUS'}
        </button>
        
        {currentTabIndex < tabs.length - 1 ? (
          <button 
            onClick={() => setStep(tabs[currentTabIndex + 1].id)} 
            className="group flex items-center gap-4 px-16 py-5 bg-amber-600 border-2 border-amber-400 text-white rounded-md font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-amber-900/30 hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all"
          >
            NEXT PHASE
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button 
            onClick={handleFinalize} 
            className="group flex items-center gap-4 px-16 py-5 bg-emerald-600 border-2 border-emerald-400 text-white rounded-md font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-emerald-900/30 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
          >
            FORGE LEGEND
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </button>
        )}
      </div>
    </Layout>
  );
};

export default CreatorFlow;
