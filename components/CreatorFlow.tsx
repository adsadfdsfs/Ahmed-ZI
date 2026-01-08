
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { Race, Class, Appearance, View, Character, Stats, Weapon, HomebrewTraits } from '../types';
import { 
  HAIR_COLORS, HAIR_STYLES, SKIN_TONES, EYE_COLORS, EYE_SHAPES, BUILDS, GENDERS, FEATURES,
  RACE_DESCRIPTIONS, CLASS_DESCRIPTIONS, STANDARD_ARRAY, ALIGNMENTS, CLASS_WEAPONS,
  DAMAGE_TYPES, WEAPON_PROPERTIES, CREATURE_SIZES, SPEEDS
} from '../constants';
import { generateBackstory, forgeWeaponAI, describeAppearanceAI } from '../services/geminiService';

interface CreatorFlowProps {
  onNavigate: (view: View) => void;
  onCharacterGenerated: (char: Character) => void;
}

const CreatorFlow: React.FC<CreatorFlowProps> = ({ onNavigate, onCharacterGenerated }) => {
  const [step, setStep] = useState(1);
  const [appearanceSubStep, setAppearanceSubStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [manualWeaponMode, setManualWeaponMode] = useState(false);
  
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race>(Race.HUMAN);
  const [customRaceName, setCustomRaceName] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class>(Class.FIGHTER);
  const [customClassName, setCustomClassName] = useState('');
  const [alignment, setAlignment] = useState(ALIGNMENTS[4]); 
  
  const [homebrewTraits, setHomebrewTraits] = useState<HomebrewTraits>({
    avgHeight: '',
    ancestors: '',
    raceBackstory: '',
    speed: '30 ft.',
    size: 'Medium',
    specialAttacks: '',
    resistances: '',
    abilities: ''
  });

  const [appearance, setAppearance] = useState<Appearance>({
    gender: 'Unknown',
    hairColor: 'Unknown',
    hairStyle: 'Unknown',
    skinTone: 'Unknown',
    eyeColor: 'Unknown',
    eyeShape: 'Unknown',
    build: 'Unknown',
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

  const processAppearanceAI = async () => {
    const fullText = `${appearance.narrative.head} ${appearance.narrative.body} ${appearance.narrative.legs}`;
    if (!fullText.trim()) return;
    setLoading(true);
    try {
      const result = await describeAppearanceAI(fullText);
      setAppearance(prev => ({
        ...prev,
        ...result,
        features: result.features && result.features.length > 0 ? result.features : prev.features
      }));
    } catch (e) {
      console.error("AI Visualization failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleForgeAI = async () => {
    if (!weaponDescription.trim()) return alert("Explain your weapon to the oracle first!");
    setLoading(true);
    try {
      const forged = await forgeWeaponAI(weaponDescription);
      setWeapon(forged);
      setManualWeaponMode(false);
    } catch (e) {
      alert("The forge failed to interpret your vision...");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = () => {
    if (!name.trim()) return alert("Your champion needs a name!");
    if (selectedRace === Race.HOMEBREW && !customRaceName.trim()) return alert("Name your custom race!");
    if (selectedClass === Class.HOMEBREW && !customClassName.trim()) return alert("Name your custom class!");
    if (Object.values(stats).some(s => s === null)) return alert("Assign all ability scores first!");
    if (!weapon.name.trim()) return alert("Your weapon needs a name!");
    
    onCharacterGenerated({
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
      homebrewTraits: selectedRace === Race.HOMEBREW ? homebrewTraits : undefined
    });
    onNavigate('SHEET');
  };

  const tabs = useMemo(() => {
    const t = [
      { id: 1, label: 'Identity' },
      ...(selectedRace === Race.HOMEBREW ? [{ id: 99, label: 'Homebrew Traits' }] : []),
      { id: 2, label: 'Appearance' },
      { id: 3, label: 'Abilities' },
      { id: 4, label: 'The Forge' },
      ...(manualWeaponMode ? [{ id: 10, label: 'Custom Forge' }] : []),
      { id: 5, label: 'Chronicle' }
    ];
    return t;
  }, [selectedRace, manualWeaponMode]);

  const currentTabIndex = tabs.findIndex(t => t.id === step);

  const renderStep1 = () => (
    <div className="w-full max-w-5xl space-y-4 animate-in slide-in-from-right duration-500 pb-8">
      <h2 className="text-3xl font-bold text-amber-500 text-center uppercase tracking-widest">Identify Your Legend</h2>
      <div className="bg-slate-900 border border-amber-900/50 p-5 rounded shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-amber-100 text-[10px] font-bold uppercase tracking-widest">Champion's Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alistair the Brave"
              className="w-full bg-slate-800 border border-amber-900/30 text-amber-100 p-3 rounded focus:outline-none focus:border-amber-600 transition-colors text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-amber-100 text-[10px] font-bold uppercase tracking-widest">Moral Alignment</label>
            <select 
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              className="w-full bg-slate-800 border border-amber-900/30 text-amber-100 p-3 rounded focus:outline-none focus:border-amber-600 transition-colors text-lg font-semibold appearance-none"
            >
              {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-amber-900/30 pb-1">
              <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Select Race</label>
              {selectedRace === Race.HOMEBREW && (
                <input 
                  type="text"
                  placeholder="Homebrew Race Name"
                  value={customRaceName}
                  onChange={(e) => setCustomRaceName(e.target.value)}
                  className="bg-amber-900/20 border border-amber-500/30 text-amber-100 text-[10px] px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-1 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(Race).map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRace(r)}
                  className={`p-1.5 rounded border text-[10px] font-bold uppercase tracking-tighter transition-all ${selectedRace === r ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-900'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-slate-400 italic text-[10px]">{RACE_DESCRIPTIONS[selectedRace]}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-amber-900/30 pb-1">
              <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Select Class</label>
              {selectedClass === Class.HOMEBREW && (
                <input 
                  type="text"
                  placeholder="Homebrew Class Name"
                  value={customClassName}
                  onChange={(e) => setCustomClassName(e.target.value)}
                  className="bg-amber-900/20 border border-amber-500/30 text-amber-100 text-[10px] px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-1 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.values(Class).map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedClass(c);
                    if (c !== Class.HOMEBREW) setWeapon(CLASS_WEAPONS[c][0]);
                  }}
                  className={`p-1.5 rounded border text-[10px] font-bold uppercase tracking-tighter transition-all ${selectedClass === c ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-900'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-slate-400 italic text-[10px]">{CLASS_DESCRIPTIONS[selectedClass]}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomebrewTraits = () => (
    <div className="w-full max-w-5xl space-y-4 animate-in slide-in-from-right duration-500 pb-8">
      <h2 className="text-3xl font-bold text-amber-500 text-center uppercase tracking-widest">Homebrew Race Traits</h2>
      <div className="bg-slate-900 border-2 border-amber-900/50 p-8 rounded shadow-2xl space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="p-4 bg-slate-800 border border-amber-900/30 rounded-sm space-y-3 shadow-inner">
              <label className="block text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Average Height</label>
              <input 
                type="text" 
                placeholder="e.g. 5'6\" to 6'2\""
                value={homebrewTraits.avgHeight} 
                onChange={(e) => setHomebrewTraits({...homebrewTraits, avgHeight: e.target.value})} 
                className="w-full bg-slate-900 border border-amber-900/30 text-amber-100 p-3 rounded text-lg font-semibold focus:outline-none focus:border-amber-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
              />
              <p className="text-[10px] text-slate-500 italic uppercase leading-tight">Specify the typical physical range for your people.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800 border border-amber-900/30 rounded-sm space-y-2">
                <label className="block text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Base Speed</label>
                <select 
                  value={homebrewTraits.speed} 
                  onChange={(e) => setHomebrewTraits({...homebrewTraits, speed: e.target.value})} 
                  className="w-full bg-slate-900 border border-amber-900/30 text-amber-100 p-3 rounded text-sm font-bold focus:outline-none appearance-none"
                >
                  {SPEEDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="p-4 bg-slate-800 border border-amber-900/30 rounded-sm space-y-2">
                <label className="block text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Size</label>
                <select 
                  value={homebrewTraits.size} 
                  onChange={(e) => setHomebrewTraits({...homebrewTraits, size: e.target.value})} 
                  className="w-full bg-slate-900 border border-amber-900/30 text-amber-100 p-3 rounded text-sm font-bold focus:outline-none appearance-none"
                >
                  {CREATURE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800 border border-amber-900/30 rounded-sm space-y-2 h-full flex flex-col">
              <label className="block text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Ancestors / Lineage</label>
              <textarea 
                placeholder="Describe the origins... e.g. Crafted from star-dust by the first gods." 
                value={homebrewTraits.ancestors} 
                onChange={(e) => setHomebrewTraits({...homebrewTraits, ancestors: e.target.value})} 
                className="flex-grow w-full bg-slate-900 border border-amber-900/30 text-amber-100 p-3 rounded text-sm font-medium focus:outline-none focus:border-amber-500 resize-none font-serif italic"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Special Attacks / Abilities</label>
            <textarea placeholder="Claws, breath weapon, sting, darkvision..." value={homebrewTraits.abilities} onChange={(e) => setHomebrewTraits({...homebrewTraits, abilities: e.target.value})} className="w-full h-32 bg-slate-800 border border-amber-900/30 text-amber-100 p-4 rounded text-sm font-serif italic focus:outline-none focus:border-amber-500"/>
          </div>
          <div className="space-y-2">
            <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Resistances & Traits</label>
            <textarea placeholder="Poison, cold, necrotic, magic resistance..." value={homebrewTraits.resistances} onChange={(e) => setHomebrewTraits({...homebrewTraits, resistances: e.target.value})} className="w-full h-32 bg-slate-800 border border-amber-900/30 text-amber-100 p-4 rounded text-sm font-serif italic focus:outline-none focus:border-amber-500"/>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (appearanceSubStep === 0) {
      return (
        <div className="w-full max-w-5xl space-y-4 animate-in slide-in-from-right duration-500">
           <h2 className="text-3xl font-bold text-amber-500 text-center uppercase tracking-widest">Appearance Choices</h2>
           <div className="bg-slate-900 border border-amber-900/50 p-6 rounded shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Gender Expression', field: 'gender', options: GENDERS },
                { label: 'Skin Tone', field: 'skinTone', options: SKIN_TONES },
                { label: 'Build', field: 'build', options: BUILDS },
                { label: 'Hair Color', field: 'hairColor', options: HAIR_COLORS },
                { label: 'Hair Style', field: 'hairStyle', options: HAIR_STYLES },
                { label: 'Eye Color', field: 'eyeColor', options: EYE_COLORS },
                { label: 'Eye Shape', field: 'eyeShape', options: EYE_SHAPES },
              ].map(item => (
                <div key={item.field} className="space-y-2">
                  <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">{item.label}</label>
                  <select 
                    value={appearance[item.field as keyof Appearance] as string}
                    onChange={(e) => setAppearance({...appearance, [item.field]: e.target.value})}
                    className="w-full bg-slate-800 border border-amber-900/30 text-amber-100 p-2 rounded text-sm focus:outline-none focus:border-amber-500 appearance-none"
                  >
                    {item.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="lg:col-span-2 space-y-2">
                 <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Special Features</label>
                 <div className="flex flex-wrap gap-2">
                    {FEATURES.map(f => (
                      <button 
                        key={f}
                        onClick={() => {
                          const newFeatures = appearance.features.includes(f) 
                            ? appearance.features.filter(x => x !== f) 
                            : [...appearance.features, f];
                          setAppearance({...appearance, features: newFeatures});
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${appearance.features.includes(f) ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        {f}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="lg:col-span-3 flex justify-center pt-4">
                 <button 
                  onClick={() => setAppearanceSubStep(1)}
                  className="px-12 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded uppercase tracking-widest transition-all shadow-xl"
                 >
                  Proceed to Narrative
                 </button>
              </div>
           </div>
        </div>
      );
    }

    const questions = [
      { id: 'head', title: 'The Visage', label: 'Describe the head details...', placeholder: "Deep-set amber eyes...", current: appearance.narrative.head },
      { id: 'body', title: 'The Stature', label: 'Describe the torso and build...', placeholder: "Broad-shouldered...", current: appearance.narrative.body },
      { id: 'legs', title: 'The Gait', label: 'Describe the lower body...', placeholder: "Muscular legs...", current: appearance.narrative.legs },
    ];

    const q = questions[appearanceSubStep - 1];

    return (
      <div className="w-full max-w-4xl space-y-4 animate-in slide-in-from-right duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-amber-500 uppercase tracking-widest">Verbal Visualization</h2>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
            <button onClick={() => setAppearanceSubStep(0)} className="hover:text-amber-400">0. Core</button>
            <span className={appearanceSubStep === 1 ? 'text-amber-400' : ''}>I. Head</span>
            <span className={appearanceSubStep === 2 ? 'text-amber-400' : ''}>II. Torso</span>
            <span className={appearanceSubStep === 3 ? 'text-amber-400' : ''}>III. Legs</span>
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-amber-900/50 p-8 rounded-sm shadow-2xl space-y-6 relative">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-amber-100 fantasy-font italic">{q.title}</h3>
            <label className="block text-amber-600/70 text-xs font-bold uppercase tracking-widest">{q.label}</label>
            <textarea 
              autoFocus
              value={q.current}
              onChange={(e) => setAppearance({...appearance, narrative: {...appearance.narrative, [q.id]: e.target.value}})}
              placeholder={q.placeholder}
              className="w-full h-48 bg-black/40 border border-amber-900/30 text-amber-50 p-6 rounded text-lg focus:outline-none focus:border-amber-500 transition-all font-serif italic"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-amber-900/20">
            <button 
              onClick={() => setAppearanceSubStep(appearanceSubStep - 1)}
              className="text-amber-700 hover:text-amber-500 text-xs font-bold uppercase"
            >
              Back
            </button>
            
            {appearanceSubStep < 3 ? (
              <button 
                onClick={() => setAppearanceSubStep(appearanceSubStep + 1)}
                className="px-6 py-2 bg-amber-900/40 text-amber-400 border border-amber-800 rounded font-bold uppercase text-xs hover:bg-amber-900/60 transition-all"
              >
                Proceed
              </button>
            ) : (
              <button 
                onClick={async () => {
                   await processAppearanceAI();
                   setStep(3);
                }}
                className="px-8 py-3 bg-amber-600 text-white border-2 border-amber-800 rounded font-bold uppercase text-xs hover:bg-amber-500 transition-all shadow-lg"
              >
                Seal Visage
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="w-full max-w-4xl space-y-4 animate-in slide-in-from-right duration-500">
      <h2 className="text-3xl font-bold text-amber-500 text-center uppercase tracking-widest">Ability Scores</h2>
      <div className="bg-slate-900 border border-amber-900/50 p-6 rounded shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <p className="text-amber-100/70 text-xs italic uppercase tracking-widest">Assign the Standard Array</p>
          <div className="flex justify-center gap-2 mt-2">
            {STANDARD_ARRAY.map(score => (
              <div key={score} className={`w-10 h-10 flex items-center justify-center rounded border font-bold ${Object.values(stats).includes(score) ? 'bg-slate-800 border-slate-700 text-slate-600 opacity-30' : 'bg-amber-950/40 border-amber-600 text-amber-400'}`}>
                {score}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(Object.keys(stats) as Array<keyof Stats>).map(statKey => (
            <div key={statKey} className="space-y-1 group bg-black/20 p-4 rounded border border-transparent hover:border-amber-900/50 transition-all">
              <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">{statKey}</label>
              <select 
                value={stats[statKey] || ''}
                onChange={(e) => handleStatChange(statKey, e.target.value === '' ? null : parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-amber-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-all font-bold text-xl appearance-none text-center"
              >
                <option value="">--</option>
                {STANDARD_ARRAY.map(score => (
                  <option 
                    key={score} 
                    value={score} 
                    disabled={Object.values(stats).includes(score) && stats[statKey] !== score}
                  >
                    {score}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeaponSummary = () => (
    <div className="mt-8 pt-8 border-t border-amber-900/30 flex flex-col items-center">
      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-[0.3em] mb-3">Currently Equipped</span>
      <div className="bg-black/30 border-2 border-amber-900/30 p-4 rounded-lg flex gap-6 items-center">
        <div>
          <h4 className="text-xl font-black text-amber-100 uppercase italic fantasy-font">{weapon.name}</h4>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{weapon.properties.join(' • ') || 'BASIC IMPLEMENT'}</p>
        </div>
        <div className="h-12 w-px bg-amber-900/20"></div>
        <div className="text-center">
          <div className="text-[9px] text-slate-500 uppercase font-bold">Damage</div>
          <div className="text-2xl font-black text-amber-500">{weapon.damage}</div>
        </div>
      </div>
    </div>
  );

  const renderTheForge = () => {
    return (
      <div className="w-full max-w-6xl space-y-4 animate-in slide-in-from-right duration-500 pb-8">
        <h2 className="text-3xl font-bold text-amber-500 text-center uppercase tracking-widest">The Forge</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-amber-100 font-bold uppercase tracking-widest text-xs border-b border-amber-900/30 pb-2">The Vault</h3>
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {allStandardWeapons.map(w => (
                <button
                  key={w.name}
                  onClick={() => {
                    setWeapon(w);
                    setManualWeaponMode(false);
                  }}
                  className={`w-full p-3 text-left border rounded transition-all ${!manualWeaponMode && weapon.name === w.name ? 'bg-amber-600 border-amber-400 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-amber-900'}`}
                >
                  <div className="font-bold text-sm uppercase tracking-wider">{w.name}</div>
                  <div className="text-[10px] opacity-70">{w.damage} {w.type}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-amber-900/50 p-6 rounded shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-amber-100 font-bold uppercase tracking-widest text-xs border-b border-amber-900/30 pb-1">AI Enchantment Forge</h3>
              <p className="text-xs text-slate-500 italic">"Whisper your weapon's legend, and the forge shall give it form."</p>
              <textarea 
                value={weaponDescription}
                onChange={(e) => setWeaponDescription(e.target.value)}
                placeholder="Describe a mythical weapon... e.g. A blade made of starlight."
                className="w-full h-40 bg-black/40 border border-amber-900/30 text-slate-100 p-6 rounded text-sm focus:outline-none focus:border-amber-600 font-serif italic"
              />
              <button 
                onClick={handleForgeAI}
                className="w-full py-4 bg-amber-900 text-amber-400 font-bold border border-amber-800 rounded hover:bg-amber-800 transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                FORGE WITH AI
              </button>
            </div>
            
            <div className="mt-6 pt-4 text-center">
              <button 
                onClick={() => {
                  setManualWeaponMode(true);
                  setStep(10);
                }}
                className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] hover:text-emerald-400 transition-colors"
              >
                [ OR FORGE MANUALLY BY HAND ]
              </button>
            </div>

            {renderWeaponSummary()}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomForge = () => (
    <div className="w-full max-w-4xl space-y-4 animate-in slide-in-from-right duration-500 pb-8">
      <h2 className="text-3xl font-bold text-emerald-500 text-center uppercase tracking-widest">Custom Forge</h2>
      <div className="bg-slate-900 border border-emerald-900/50 p-8 rounded shadow-2xl space-y-6">
        <p className="text-xs text-slate-500 text-center italic">Craft every detail of your unique armament.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Weapon Name</label>
            <input 
              type="text" 
              placeholder="e.g. Shadow's Whisper" 
              value={weapon.name} 
              onChange={(e) => setWeapon({...weapon, name: e.target.value})} 
              className="w-full bg-slate-800 border border-emerald-900/30 text-white p-3 rounded text-sm focus:outline-none focus:border-emerald-500 font-bold" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Damage Die</label>
              <input 
                type="text" 
                placeholder="1d8" 
                value={weapon.damage} 
                onChange={(e) => setWeapon({...weapon, damage: e.target.value})} 
                className="w-full bg-slate-800 border border-emerald-900/30 text-white p-3 rounded text-sm focus:outline-none focus:border-emerald-500 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Damage Type</label>
              <select 
                value={weapon.type} 
                onChange={(e) => setWeapon({...weapon, type: e.target.value})} 
                className="w-full bg-slate-800 border border-emerald-900/30 text-white p-3 rounded text-sm focus:outline-none focus:border-emerald-500 appearance-none font-bold"
              >
                {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Weapon Properties</label>
          <div className="flex flex-wrap gap-2">
            {WEAPON_PROPERTIES.map(p => (
              <button 
                key={p} 
                onClick={() => {
                  const newP = weapon.properties.includes(p) ? weapon.properties.filter(x => x !== p) : [...weapon.properties, p];
                  setWeapon({...weapon, properties: newP});
                }}
                className={`text-[10px] px-3 py-1.5 rounded border transition-all font-bold tracking-wider uppercase ${weapon.properties.includes(p) ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {renderWeaponSummary()}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="w-full max-w-4xl space-y-4 animate-in slide-in-from-right duration-500">
      <h2 className="text-3xl font-bold text-amber-500 text-center uppercase tracking-widest">Chronicle Your Legend</h2>
      <div className="bg-slate-900 border border-amber-900/50 p-6 rounded shadow-2xl space-y-4">
        <div className="space-y-2">
          <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Seeds of the Past</label>
          <input 
            type="text"
            value={backstoryIdea}
            onChange={(e) => setBackstoryIdea(e.target.value)}
            placeholder="e.g. A fallen noble looking for redemption..."
            className="w-full bg-black/40 border border-amber-900/30 text-amber-100 p-3 rounded text-sm focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Final Chronicle</label>
          <button 
            onClick={handleAiBackstory}
            className="text-[9px] bg-amber-900/40 text-amber-400 px-3 py-1 border border-amber-800 rounded hover:bg-amber-900/60 transition-all flex items-center gap-2"
          >
            CONSULT ORACLE
          </button>
        </div>
        <textarea 
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
          placeholder="Write your story..."
          className="w-full h-48 bg-black/40 border border-amber-900/30 text-slate-200 p-6 rounded focus:outline-none focus:border-amber-600 leading-relaxed italic medieval-font text-base"
        />
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center space-y-6 p-4 text-center">
      <div className="w-32 h-32 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <h3 className="text-3xl font-bold text-amber-500 fantasy-font animate-pulse">Consulting Cosmic Archives...</h3>
    </div>
  );

  return (
    <Layout backgroundImage="https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=1920">
      {loading && renderLoading()}
      
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
         <button onClick={() => onNavigate('LANDING')} className="text-amber-700 hover:text-amber-500 font-bold flex items-center gap-2 transition-colors uppercase text-[10px] tracking-widest">
            Abandon
         </button>

         <div className="flex bg-slate-900/50 p-1 rounded-sm border border-amber-900/30 overflow-x-auto max-w-full custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStep(tab.id)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  step === tab.id 
                    ? 'bg-amber-600 text-white shadow-lg' 
                    : 'text-amber-100/50 hover:text-amber-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-grow w-full flex flex-col items-center">
        {step === 1 && renderStep1()}
        {step === 99 && renderHomebrewTraits()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderTheForge()}
        {step === 10 && renderCustomForge()}
        {step === 5 && renderStep5()}
      </div>

      <div className="mt-8 flex justify-between w-full max-w-5xl pb-8">
        {(currentTabIndex > 0) && (
          <button onClick={() => setStep(tabs[currentTabIndex - 1].id)} className="px-6 py-2 bg-slate-800 text-amber-100 rounded-sm font-bold border border-slate-700 uppercase tracking-widest text-[10px]">
            PREVIOUS
          </button>
        )}
        <div className="flex-grow"></div>
        {(currentTabIndex < tabs.length - 1) && (
          <button onClick={() => setStep(tabs[currentTabIndex + 1].id)} className="px-8 py-3 bg-amber-600 text-white rounded-sm font-bold border-2 border-amber-800 hover:bg-amber-500 transition-all uppercase tracking-widest text-[10px]">
            NEXT: {tabs[currentTabIndex + 1].label}
          </button>
        )}
        {(currentTabIndex === tabs.length - 1) && (
          <button onClick={handleFinalize} className="px-8 py-3 bg-emerald-600 text-white rounded-sm font-bold border-2 border-emerald-800 hover:bg-emerald-500 uppercase tracking-widest text-[10px]">
            FORGE LEGEND
          </button>
        )}
      </div>
    </Layout>
  );
};

export default CreatorFlow;
