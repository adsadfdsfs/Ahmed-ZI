import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Layout from './Layout';
import { View, World, Character, Combatant, Stats, AdventureSave, LocationData, MonsterTemplate, AdventureConfig, Race, Class } from '../types';
import { PREMADE_WORLDS } from '../constants';
import { MONSTER_DATABASE, NPC_TEMPLATES } from '../constants/monsters';
import { fetchFullMonsterStats, narrateActionAI, manifestLocationAI } from '../services/geminiService';

interface AdventureViewProps {
  onNavigate: (view: View) => void;
}

type AdventureStep = 'SELECT_WORLD' | 'SELECT_CHARACTER' | 'SITUATION' | 'GAME_OVER';

interface DamageEffect {
  id: string;
  combatantId: string;
  delta: number;
  timestamp: number;
}

const AdventureView: React.FC<AdventureViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<AdventureStep>('SELECT_WORLD');
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [myWorlds, setMyWorlds] = useState<World[]>([]);
  const [myChars, setMyChars] = useState<Character[]>([]);
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showLocationGen, setShowLocationGen] = useState(false);
  const [locationSeed, setLocationSeed] = useState('');
  const [bestiaryTab, setBestiaryTab] = useState<'MONSTERS' | 'NPCS' | 'SCRY'>('MONSTERS');
  const [bestiarySearch, setBestiarySearch] = useState('');
  const [inspectingMonster, setInspectingMonster] = useState<MonsterTemplate | null>(null);
  const [isBestiaryLoading, setIsBestiaryLoading] = useState(false);
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  const [viewingCombatantId, setViewingCombatantId] = useState<string | null>(null);
  const [lootingCombatantId, setLootingCombatantId] = useState<string | null>(null);
  const [playerAction, setPlayerAction] = useState('');

  const [damageEffects, setDamageEffects] = useState<DamageEffect[]>([]);
  const [flashingCombatantIds, setFlashingCombatantIds] = useState<Set<string>>(new Set());

  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingDieType, setRollingDieType] = useState<number | string>('');
  const [lastRollResult, setLastRollResult] = useState<{type: string, value: number} | null>(null);
  
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [combatRound, setCombatRound] = useState(0);

  const [hpAdjustments, setHpAdjustments] = useState<Record<string, string>>({});

  const mapRef = useRef<HTMLDivElement>(null);
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);

  const sortedInitiativeList = useMemo(() => {
    return [...combatants]
      .filter(c => c.hp > 0 && c.initiative !== undefined)
      .sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
  }, [combatants]);

  useEffect(() => {
    setMyWorlds(JSON.parse(localStorage.getItem('my_worlds') || '[]'));
    setMyChars(JSON.parse(localStorage.getItem('my_characters') || '[]'));
  }, []);

  useEffect(() => {
    if (damageEffects.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setDamageEffects(prev => prev.filter(e => now - e.timestamp < 1500));
    }, 100);
    return () => clearInterval(interval);
  }, [damageEffects]);

  const calculateModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleManualRoll = (sides: number) => {
    if (isRolling) return;
    setIsRolling(true);
    setLastRollResult(null);
    setRollingDieType(sides === 100 ? '%' : sides);
    
    setTimeout(() => {
      const value = rollDice(sides);
      const type = sides === 100 ? 'd%' : `d${sides}`;
      setLastRollResult({ type, value });
      setHistory(prev => [`[ROLL] ${type}: ${value}`, ...prev.slice(0, 49)]);
      setIsRolling(false);
    }, 900);
  };

  const handleManualHpChange = (id: string, delta: number) => {
    setFlashingCombatantIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setFlashingCombatantIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 500);

    setDamageEffects(prev => [...prev, {
      id: `dmg-${Date.now()}-${Math.random()}`,
      combatantId: id,
      delta,
      timestamp: Date.now()
    }]);

    setCombatants(prev => prev.map(c => {
      if (c.id === id) {
        const newHp = Math.min(c.maxHp, Math.max(0, c.hp + delta));
        return { ...c, hp: newHp };
      }
      return c;
    }));
  };

  const applyHpAdjustment = (id: string) => {
    const val = parseInt(hpAdjustments[id]);
    if (!isNaN(val)) {
      handleManualHpChange(id, val);
      setHpAdjustments(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleRollAllInitiative = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRollingDieType(20);
    setLastRollResult(null);

    setTimeout(() => {
      setCombatants(prev => prev.map(c => {
        const d20 = rollDice(20);
        const dexMod = Math.floor((c.stats.dexterity - 10) / 2);
        return { ...c, initiative: d20 + dexMod };
      }));
      setHistory(prev => [`[SYSTEM] Battle sequence initialized! Roll call complete.`, ...prev.slice(0, 49)]);
      setIsRolling(false);
    }, 900);
  };

  const toggleHostility = (id: string) => {
    setCombatants(prev => prev.map(c => {
      if (c.id === id) {
        const order: Combatant['type'][] = ['HERO', 'ALLY', 'NPC', 'ENEMY'];
        const nextIdx = (order.indexOf(c.type) + 1) % order.length;
        const nextType = order[nextIdx];
        setHistory(prevH => [`[SYSTEM] ${c.name} shift: ${c.type} -> ${nextType}`, ...prevH.slice(0, 49)]);
        return { ...c, type: nextType };
      }
      return c;
    }));
  };

  const startCombat = () => {
    const active = sortedInitiativeList;
    if (active.length === 0) {
      handleRollAllInitiative();
      return;
    }
    setCombatRound(1);
    setCurrentTurnId(active[0].id);
    setHistory(prev => [`[COMBAT] ROUND 1 BEGINS`, `[TURN] ${active[0].name} initiates action!`, ...prev.slice(0, 49)]);
  };

  const nextTurn = () => {
    if (!currentTurnId) {
      startCombat();
      return;
    }
    const active = sortedInitiativeList;
    if (active.length === 0) return;
    
    const currentIdx = active.findIndex(c => c.id === currentTurnId);
    const nextIdx = (currentIdx + 1) % active.length;
    
    if (nextIdx === 0) {
      setCombatRound(prev => prev + 1);
      setHistory(prev => [`[COMBAT] ROUND ${combatRound + 1}`, ...prev.slice(0, 49)]);
    }

    setCurrentTurnId(active[nextIdx].id);
    setHistory(prev => [`[TURN] ${active[nextIdx].name}'s turn has arrived.`, ...prev.slice(0, 49)]);
  };

  const spawnMonster = (monster: MonsterTemplate, type: 'ENEMY' | 'NPC' | 'ALLY' = 'ENEMY') => {
    const newCreature: Combatant = {
      id: `${type.toLowerCase()}-${Date.now()}-${monster.name}`,
      name: monster.name,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      type: type,
      x: 30 + (Math.random() * 40),
      y: 20 + (Math.random() * 40),
      stats: monster.stats,
      size: monster.size,
      speed: monster.speed,
      actions: monster.actions,
      inventory: monster.inventory ? [...monster.inventory] : [],
      gold: monster.gold || rollDice(20) * 10
    };
    setCombatants(prev => [...prev, newCreature]);
    setHistory(prev => [`[SUMMON] A ${monster.name} manifested as ${type}.`, ...prev.slice(0, 49)]);
  };

  const handleScryMonster = async () => {
    if (!bestiarySearch.trim()) return;
    setIsBestiaryLoading(true);
    setInspectingMonster(null);
    try {
      const monster = await fetchFullMonsterStats(bestiarySearch);
      setInspectingMonster(monster);
    } catch (e) {
      setHistory(prev => [`[SCRY] Planar interference failed to locate "${bestiarySearch}".`, ...prev.slice(0, 49)]);
    } finally {
      setIsBestiaryLoading(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerAction.trim() || !selectedWorld || !selectedChar) return;
    
    const userAction = playerAction;
    setPlayerAction('');
    setHistory(prev => [`[ACTION] ${selectedChar.name}: ${userAction}`, ...prev.slice(0, 49)]);
    
    setIsNarrationLoading(true);
    try {
      const narration = await narrateActionAI(selectedWorld, selectedChar, userAction, history, currentLocation?.name);
      setHistory(prev => [`[ORACLE] ${narration}`, ...prev.slice(0, 49)]);
    } catch (e) {
      setHistory(prev => [`[SYSTEM] The DM is pondering... (AI error)`, ...prev.slice(0, 49)]);
    } finally {
      setIsNarrationLoading(false);
    }
  };

  const handleManifestLocation = async (type: string, seedInput?: string) => {
    if (!selectedWorld) return;
    setIsLocationLoading(true);
    setShowLocationGen(false);
    const finalSeed = seedInput || locationSeed;
    setLocationSeed('');
    try {
      const newLoc = await manifestLocationAI(selectedWorld, type, finalSeed);
      setCurrentLocation(newLoc);
      setLocationHistory(prev => {
        const exists = prev.find(p => p.name === newLoc.name);
        return exists ? prev : [newLoc, ...prev];
      });
      setHistory(prev => [`[TRAVEL] Entering: ${newLoc.name}. ${newLoc.environmentState}`, ...prev.slice(0, 49)]);
    } catch (e) {
      alert("Planar navigation failed. The lore archives are unreachable.");
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleStartAdventure = () => {
    if (!selectedWorld || !selectedChar) return;
    const hero: Combatant = {
      id: selectedChar.id,
      name: selectedChar.name,
      hp: 15 + Math.floor((selectedChar.stats.constitution - 10) / 2),
      maxHp: 15 + Math.floor((selectedChar.stats.constitution - 10) / 2),
      ac: 10 + Math.floor((selectedChar.stats.dexterity - 10) / 2),
      type: 'HERO',
      x: 50,
      y: 85,
      stats: selectedChar.stats,
      inventory: (Object.values(selectedChar.inventory) as string[][]).flat(),
      gold: selectedChar.gold
    };
    setCombatants([hero]);
    const initialLoc: LocationData = {
      name: "The Gates of Adventure",
      mapUrl: "https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=1920",
      environmentState: "The start of your legend."
    };
    setCurrentLocation(initialLoc);
    setLocationHistory([initialLoc]);
    setStep('SITUATION');
    setHistory([`Narrative Thread: ${selectedWorld.name} welcomes ${selectedChar.name}.`]);
  };

  const onTokenDown = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggedTokenId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedCombatantId(id);
  };

  const onTokenMove = (e: React.PointerEvent) => {
    if (!draggedTokenId || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCombatants(prev => prev.map(c => 
      c.id === draggedTokenId ? { ...c, x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) } : c
    ));
  };

  const onTokenUp = () => {
    if (!draggedTokenId) return;
    setCombatants(prev => {
        const dt = prev.find(c => c.id === draggedTokenId);
        if (!dt) return prev;
        const G = 5;
        return prev.map(c => c.id === draggedTokenId ? { ...c, x: Math.floor(dt.x/G)*G+(G/2), y: Math.floor(dt.y/G)*G+(G/2) } : c);
    });
    setDraggedTokenId(null);
  };

  const lootAll = (fromId: string) => {
    const fromC = combatants.find(c => c.id === fromId);
    if (!fromC) return;
    setCombatants(prev => prev.map(c => {
      if (c.id === fromId) return { ...c, inventory: [], gold: 0 };
      if (c.type === 'HERO') return { ...c, inventory: [...(c.inventory || []), ...(fromC.inventory || [])], gold: (c.gold || 0) + (fromC.gold || 0) };
      return c;
    }));
    setHistory(prev => [`[LOOT] ${selectedChar?.name} claimed everything from ${fromC.name}.`, ...prev.slice(0, 49)]);
    setLootingCombatantId(null);
  };

  const renderSituation = () => (
    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 pb-12 relative">
      <div className="lg:w-2/3 space-y-6">
        <div className="flex justify-between items-center bg-slate-950/60 p-4 border-2 border-amber-900/30 rounded-sm mb-2">
           <div>
              <h3 className="text-xl font-black text-amber-500 font-serif uppercase tracking-tight">{currentLocation?.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentLocation?.environmentState}</p>
           </div>
           <div className="flex gap-2">
              <button onClick={() => setShowLocationGen(true)} className="px-4 py-2 bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 rounded text-[9px] font-black uppercase hover:bg-emerald-900/60 transition-all flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                 Planar Navigation
              </button>
           </div>
        </div>

        <div ref={mapRef} onPointerMove={onTokenMove} onPointerUp={onTokenUp} className="bg-slate-900 border-4 border-amber-900 rounded-sm shadow-2xl relative overflow-hidden aspect-video select-none">
          {currentLocation?.mapUrl && <img src={currentLocation.mapUrl} className="w-full h-full object-cover pointer-events-none transition-opacity duration-1000" style={{ opacity: isLocationLoading ? 0.3 : 1 }} />}
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '5% 8.8%' }}></div>

          {isLocationLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-50">
               <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mt-4 animate-pulse">Summoning Reality...</p>
               <p className="text-slate-400 italic text-[9px] mt-2">"Consulting the archives of {selectedWorld?.name}..."</p>
            </div>
          )}

          {combatants.map(c => (
            <React.Fragment key={c.id}>
              <div onPointerDown={onTokenDown(c.id)} style={{ left: `${c.x}%`, top: `${c.y}%` }} className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 shadow-2xl cursor-grab active:cursor-grabbing z-10 flex items-center justify-center transition-all ${selectedCombatantId === c.id ? 'border-amber-400 ring-4 ring-amber-500/50 scale-110' : 'border-slate-800'} ${currentTurnId === c.id ? 'ring-4 ring-emerald-500 animate-pulse' : ''} ${c.type === 'HERO' ? 'bg-blue-600' : c.type === 'ENEMY' ? 'bg-red-600' : 'bg-emerald-600'} ${c.hp <= 0 ? 'grayscale opacity-30 bg-black' : ''} ${flashingCombatantIds.has(c.id) ? 'brightness-200' : ''}`}>
                <span className="text-[10px] font-black text-white">{c.hp <= 0 ? 'RIP' : c.name.substring(0, 2).toUpperCase()}</span>
              </div>
              {damageEffects.filter(e => e.combatantId === c.id).map(e => (
                <div key={e.id} style={{ left: `${c.x}%`, top: `${c.y - 10}%` }} className={`absolute pointer-events-none z-50 font-black text-lg animate-bounce ${e.delta < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{e.delta > 0 ? `+${e.delta}` : e.delta}</div>
              ))}
            </React.Fragment>
          ))}

          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setShowBestiary(true)} className="p-3 bg-slate-900/80 border border-amber-900/50 rounded-full text-amber-500 hover:bg-amber-800 shadow-xl" title="Summon Entity"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></button>
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end">
            {showDiceRoller && (
              <div className="flex flex-col gap-2 items-end">
                {isRolling && (
                   <div className="bg-amber-600 text-white px-4 py-2 rounded-full text-[10px] font-black animate-pulse shadow-xl border-2 border-amber-400 uppercase tracking-widest">
                      Rolling d{rollingDieType}...
                   </div>
                )}
                {!isRolling && lastRollResult && (
                   <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-[10px] font-black animate-in zoom-in shadow-xl border-2 border-emerald-400 uppercase tracking-widest">
                      {lastRollResult.type}: {lastRollResult.value}
                   </div>
                )}
                <div className="flex gap-2 bg-slate-950/90 border border-amber-900/50 p-2 rounded shadow-2xl animate-in slide-in-from-right">
                  {[4, 6, 8, 10, 12, 20, 100].map(s => (
                    <button 
                      key={s} 
                      disabled={isRolling}
                      onClick={() => handleManualRoll(s)} 
                      className={`w-10 h-10 border border-amber-900/50 rounded font-black transition-all ${isRolling ? 'bg-slate-900 text-slate-600 opacity-50' : 'bg-slate-800 text-amber-400 hover:bg-amber-700 hover:text-white'}`}
                    >
                      {s === 100 ? '%' : `d${s}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setShowDiceRoller(!showDiceRoller)} className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all shadow-2xl ${showDiceRoller ? 'bg-amber-500 border-amber-300 text-white' : 'bg-slate-900 border-amber-900 text-amber-500'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {combatants.map(c => (
             <div key={c.id} className={`bg-slate-900 border-2 p-4 rounded-sm transition-all ${selectedCombatantId === c.id ? 'border-amber-500 bg-slate-800 shadow-xl' : 'border-slate-800'} ${c.hp <= 0 ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-700 text-[10px] font-black text-amber-500">{c.hp > 0 ? (c.initiative !== undefined ? c.initiative : '?') : 'X'}</div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h4 className={`font-black uppercase tracking-wider text-sm ${c.type === 'HERO' ? 'text-blue-400' : c.type === 'ENEMY' ? 'text-red-400' : 'text-emerald-400'}`}>{c.name}</h4>
                           <button onClick={() => toggleHostility(c.id)} className="text-[8px] bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-slate-500 font-black uppercase hover:text-white transition-colors">{c.type}</button>
                        </div>
                        <div className="flex gap-2 mt-1">
                           {[
                             {l: 'STR', v: calculateModifier(c.stats.strength)},
                             {l: 'DEX', v: calculateModifier(c.stats.dexterity)},
                             {l: 'CON', v: calculateModifier(c.stats.constitution)},
                             {l: 'AC', v: c.ac, special: true}
                           ].map(m => (
                             <div key={m.l} className={`px-1.5 py-0.5 rounded text-[8px] font-black ${m.special ? 'bg-amber-900/40 text-amber-400 border border-amber-700/50' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>{m.l} {m.v}</div>
                           ))}
                        </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-1 items-center">
                         {c.hp > 0 && (
                           <>
                              <input 
                                type="number" 
                                placeholder="+/-" 
                                value={hpAdjustments[c.id] || ''} 
                                onChange={(e) => setHpAdjustments({...hpAdjustments, [c.id]: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && applyHpAdjustment(c.id)}
                                className="w-14 bg-slate-950 border border-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded focus:outline-none focus:border-amber-500 text-center placeholder:opacity-30"
                              />
                              <button onClick={() => applyHpAdjustment(c.id)} className="px-2 py-0.5 bg-amber-900/40 border border-amber-700/50 text-amber-500 rounded text-[9px] font-black hover:bg-amber-800 hover:text-white transition-all uppercase">Apply</button>
                              <button onClick={() => setViewingCombatantId(c.id)} className="px-2 py-0.5 bg-blue-950/40 border border-blue-700/50 text-blue-400 rounded text-[9px] font-black hover:bg-blue-800 hover:text-white transition-all">INV</button>
                           </>
                         )}
                         {c.hp <= 0 && <button onClick={() => setLootingCombatantId(c.id)} className="px-3 py-1 bg-amber-600 text-white rounded text-[9px] font-black uppercase hover:bg-amber-500 shadow-lg">Loot</button>}
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-black text-white uppercase tracking-widest">{Math.max(0, c.hp)} / {c.maxHp} HP</div>
                         <div className="w-28 h-1.5 bg-black rounded-full overflow-hidden mt-1 border border-slate-700"><div className={`h-full transition-all duration-500 ${c.type === 'HERO' ? 'bg-blue-600' : 'bg-red-600'}`} style={{ width: `${(Math.max(0, c.hp) / c.maxHp) * 100}%` }}></div></div>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="lg:w-1/3 space-y-4">
        {/* Cartography Archive / Map History */}
        <div className="bg-slate-900 border-2 border-emerald-900/40 p-5 rounded-sm shadow-2xl flex flex-col h-[300px]">
           <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b border-emerald-900/20 pb-2">Cartography Archive</h3>
           <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {locationHistory.map((loc, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    setCurrentLocation(loc);
                    setHistory(prev => [`[TRAVEL] Recalling map: ${loc.name}`, ...prev.slice(0, 49)]);
                  }}
                  className={`w-full p-3 text-left border rounded transition-all group flex items-center gap-3 ${currentLocation?.name === loc.name ? 'bg-emerald-950/40 border-emerald-500' : 'bg-black/40 border-slate-800 hover:border-emerald-900/60'}`}
                >
                  <img src={loc.mapUrl} className="w-10 h-10 object-cover rounded border border-slate-800 group-hover:border-emerald-500 transition-colors" />
                  <div>
                    <div className="text-[10px] font-black text-white uppercase group-hover:text-emerald-400">{loc.name}</div>
                    <div className="text-[8px] text-slate-500 font-bold uppercase truncate max-w-[150px]">{loc.environmentState}</div>
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="bg-slate-900 border-2 border-amber-900/40 p-5 rounded-sm shadow-2xl flex flex-col h-[300px]">
           <div className="flex justify-between items-center mb-4 border-b border-amber-900/30 pb-2">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">Battle Order</h3>
              <div className="flex gap-2">
                 <button onClick={handleRollAllInitiative} className="px-2 py-1 bg-slate-950 text-amber-500 border border-amber-900/30 rounded text-[8px] font-black uppercase">Roll All</button>
                 <button onClick={nextTurn} className="px-3 py-1 bg-emerald-600 text-white rounded text-[9px] font-black uppercase hover:bg-emerald-500">Next Turn</button>
              </div>
           </div>
           <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {sortedInitiativeList.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-2.5 rounded border transition-all ${currentTurnId === c.id ? 'bg-emerald-950/40 border-emerald-500 scale-[1.03] shadow-lg shadow-emerald-900/30' : 'bg-black/40 border-slate-800 opacity-80'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded flex items-center justify-center bg-slate-950 border border-slate-800 text-[10px] font-black text-amber-500">{c.initiative}</div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${c.type === 'HERO' ? 'text-blue-400' : 'text-red-400'}`}>{c.name}</span>
                  </div>
                  {currentTurnId === c.id && <div className="text-[8px] font-black text-emerald-500 animate-pulse tracking-widest uppercase">Acting</div>}
                </div>
              ))}
              {sortedInitiativeList.length === 0 && <p className="text-[10px] text-slate-600 italic text-center py-20">Awaiting the clash of blades...</p>}
           </div>
        </div>

        <div className="bg-slate-900 border-2 border-amber-900/40 rounded-sm shadow-2xl flex flex-col h-[400px] overflow-hidden relative">
           <div className="p-4 border-b border-amber-900/30 bg-black/40">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">Adventure Chronicle</h3>
           </div>
           <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {history.map((h, i) => (
                <div key={i} className={`text-xs font-serif leading-relaxed italic animate-in slide-in-from-bottom duration-300 ${h.startsWith('[COMBAT]') ? 'text-amber-500 font-bold' : h.startsWith('[ROLL]') ? 'text-blue-400' : h.startsWith('[ORACLE]') ? 'text-emerald-400 font-bold border-l-2 border-emerald-900/50 pl-2 py-1' : 'text-slate-300'}`}>{h}</div>
              ))}
              {isNarrationLoading && <div className="text-emerald-500/50 animate-pulse text-[10px] font-black uppercase tracking-widest">The Oracle is divining the outcome...</div>}
           </div>
           <form onSubmit={handleActionSubmit} className="p-3 bg-black/60 border-t border-amber-900/30 flex gap-2">
              <input type="text" value={playerAction} onChange={(e) => setPlayerAction(e.target.value)} placeholder="Declare an action..." className="flex-grow bg-slate-950 border border-amber-900/30 p-3 rounded text-xs text-amber-100 font-serif focus:outline-none focus:border-amber-600 italic shadow-inner" />
              <button type="submit" disabled={isNarrationLoading} className="px-4 py-2 bg-amber-700 text-white rounded text-[10px] font-black uppercase hover:bg-amber-600 transition-all disabled:opacity-50">Speak</button>
           </form>
        </div>
      </div>

      {showLocationGen && (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="w-full max-w-2xl bg-slate-950 border-4 border-emerald-900 p-10 rounded shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                 <h3 className="text-3xl font-black text-emerald-500 font-serif uppercase tracking-tight">Planar Cartography</h3>
                 <p className="text-slate-500 italic text-sm">"Manifest a region from lore or custom vision."</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1">Specific Lore or Location Name</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={locationSeed} 
                    onChange={(e) => setLocationSeed(e.target.value)} 
                    placeholder="e.g. The Blushing Mermaid Tavern, Waterdeep" 
                    className="flex-grow bg-slate-900 border border-emerald-900/30 p-4 rounded text-emerald-100 font-serif italic focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    onClick={() => handleManifestLocation('CUSTOM')}
                    disabled={!locationSeed.trim() || isLocationLoading}
                    className="px-6 bg-emerald-600 text-white font-black uppercase text-[10px] rounded hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Manifest
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 italic px-2">The Oracle uses actual lore if it recognizes the name.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <button onClick={() => handleManifestLocation('CITY')} className="p-8 bg-slate-900 border-2 border-emerald-900/30 rounded-sm hover:border-emerald-500 transition-all flex flex-col items-center gap-4 group">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🏘️</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400">Random City</span>
                 </button>
                 <button onClick={() => handleManifestLocation('WILDERNESS')} className="p-8 bg-slate-900 border-2 border-emerald-900/30 rounded-sm hover:border-emerald-500 transition-all flex flex-col items-center gap-4 group">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🌲</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400">Random Wilds</span>
                 </button>
                 <button onClick={() => handleManifestLocation('DUNGEON')} className="p-8 bg-slate-900 border-2 border-emerald-900/30 rounded-sm hover:border-emerald-500 transition-all flex flex-col items-center gap-4 group">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🏰</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400">Random Dungeon</span>
                 </button>
              </div>
              <div className="pt-6 border-t border-emerald-900/20 flex justify-center">
                 <button onClick={() => setShowLocationGen(false)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Abort Navigation</button>
              </div>
           </div>
        </div>
      )}

      {showBestiary && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="w-full max-w-4xl bg-slate-950 border-4 border-amber-900 rounded-sm shadow-2xl flex flex-col h-[85vh]">
              <div className="p-6 border-b border-amber-900/30 flex justify-between items-center bg-black/60">
                 <div className="flex gap-4">
                    {['MONSTERS', 'NPCS', 'SCRY'].map(t => (
                      <button key={t} onClick={() => setBestiaryTab(t as any)} className={`text-xs font-black uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${bestiaryTab === t ? 'text-amber-500 border-amber-500' : 'text-slate-500 border-transparent hover:text-amber-700'}`}>{t}</button>
                    ))}
                 </div>
                 <button onClick={() => setShowBestiary(false)} className="text-slate-500 hover:text-white transition-colors"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 bg-slate-950/40 custom-scrollbar">
                {bestiaryTab === 'SCRY' ? (
                   <div className="max-w-xl mx-auto space-y-8 py-10">
                      <div className="space-y-4">
                         <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">Entity Definition</label>
                         <div className="flex gap-2">
                           <input type="text" value={bestiarySearch} onChange={(e) => setBestiarySearch(e.target.value)} placeholder="e.g. Frost-forged Automaton" className="flex-grow bg-slate-900 border border-blue-900/50 p-4 rounded text-blue-100 font-serif italic focus:outline-none focus:border-blue-500" />
                           <button onClick={handleScryMonster} className="px-6 bg-blue-600 text-white font-black uppercase text-[10px] rounded hover:bg-blue-500">Manifest</button>
                         </div>
                      </div>
                      {isBestiaryLoading && <div className="text-center text-blue-400 animate-pulse text-[10px] font-black tracking-widest">RIPPLING THE PLANAR BARRIERS...</div>}
                      {inspectingMonster && (
                        <div className="bg-slate-900 border-2 border-blue-900 p-8 rounded space-y-6 animate-in zoom-in">
                           <h3 className="text-3xl font-black text-blue-400 font-serif uppercase text-center border-b border-blue-900/30 pb-4">{inspectingMonster.name}</h3>
                           <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase text-slate-400">
                              <div className="bg-blue-900/10 p-2 rounded text-center">HP: <span className="text-blue-300 block text-lg">{inspectingMonster.hp}</span></div>
                              <div className="bg-blue-900/10 p-2 rounded text-center">AC: <span className="text-blue-300 block text-lg">{inspectingMonster.ac}</span></div>
                              <div className="bg-blue-900/10 p-2 rounded text-center">SZ: <span className="text-blue-300 block text-lg">{inspectingMonster.size}</span></div>
                              <div className="bg-blue-900/10 p-2 rounded text-center">SPD: <span className="text-blue-300 block text-lg">{inspectingMonster.speed}</span></div>
                           </div>
                           <button onClick={() => { spawnMonster(inspectingMonster); setShowBestiary(false); }} className="w-full py-4 bg-blue-600 text-white font-black uppercase text-xs rounded hover:bg-blue-500 transition-all shadow-xl">SUMMON TO FIELD</button>
                        </div>
                      )}
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(bestiaryTab === 'MONSTERS' ? MONSTER_DATABASE : NPC_TEMPLATES).map(m => (
                      <button key={m.name} onClick={() => { spawnMonster(m); setShowBestiary(false); }} className="text-left bg-slate-950 border-2 border-amber-900/30 p-5 rounded hover:border-amber-500 transition-all group shadow-lg">
                        <h4 className="font-black text-amber-500 uppercase group-hover:text-amber-300">{m.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">HP {m.hp} • AC {m.ac}</p>
                        <p className="text-[9px] text-slate-600 italic mt-3 line-clamp-2 leading-relaxed">{m.actions[0]?.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {(viewingCombatantId || lootingCombatantId) && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-8">
           <div className="w-full max-w-lg bg-slate-950 border-4 border-amber-900 p-8 rounded shadow-2xl space-y-6 flex flex-col h-[70vh]">
              <div className="flex justify-between items-center border-b border-amber-900/30 pb-4">
                 <h2 className="text-3xl font-black text-amber-500 uppercase font-serif">{lootingCombatantId ? 'Looting Remains' : 'Satchel of ' + combatants.find(c => c.id === viewingCombatantId)?.name}</h2>
                 <button onClick={() => { setViewingCombatantId(null); setLootingCombatantId(null); }} className="text-amber-800 hover:text-white transition-colors"><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="bg-amber-950/40 p-4 border border-amber-900/30 rounded text-amber-500 font-black uppercase text-xs flex justify-between items-center">
                 <span>Wealth Stash:</span>
                 <span className="text-xl">{(lootingCombatantId ? combatants.find(c => c.id === lootingCombatantId)?.gold : combatants.find(c => c.id === viewingCombatantId)?.gold) || 0} GP</span>
              </div>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {(lootingCombatantId ? combatants.find(c => c.id === lootingCombatantId) : combatants.find(c => c.id === viewingCombatantId))?.inventory?.map((item, idx) => (
                  <div key={idx} className="bg-black/40 border border-amber-900/20 p-4 rounded text-amber-100 font-serif italic text-sm flex justify-between items-center group">
                    <span>{item}</span>
                    {lootingCombatantId && <button onClick={() => {
                        const fromId = lootingCombatantId;
                        setCombatants(prev => prev.map(c => {
                          if (c.id === fromId) { const ni = [...(c.inventory || [])]; ni.splice(idx, 1); return { ...c, inventory: ni }; }
                          if (c.type === 'HERO') return { ...c, inventory: [...(c.inventory || []), item] };
                          return c;
                        }));
                        setHistory(prev => [`[LOOT] Claimed "${item}" from the remains.`, ...prev.slice(0, 49)]);
                    }} className="opacity-0 group-hover:opacity-100 text-[9px] bg-emerald-700 text-white px-3 py-1 rounded transition-opacity font-black uppercase">Claim</button>}
                  </div>
                ))}
                {(!lootingCombatantId && !combatants.find(c => c.id === viewingCombatantId)?.inventory?.length) && <p className="text-slate-700 italic text-center py-20 font-serif">This satchel is empty.</p>}
              </div>
              {lootingCombatantId && <button onClick={() => lootAll(lootingCombatantId)} className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded hover:bg-emerald-500 shadow-xl transition-all">CLAIM ALL BOUNTY</button>}
           </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout onNavigate={onNavigate} backgroundImage="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920" showNav={step !== 'SELECT_WORLD'}>
      {step === 'SELECT_WORLD' && (
        <div className="w-full max-w-6xl space-y-12 animate-in fade-in duration-500 px-4">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-7xl font-black text-amber-500 uppercase tracking-tighter font-serif drop-shadow-2xl">Chronicles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[...myWorlds, ...PREMADE_WORLDS].map(w => (
              <button key={w.id} onClick={() => { setSelectedWorld(w); setStep('SELECT_CHARACTER'); }} className="bg-slate-950/90 border-2 border-amber-900/30 p-8 md:p-10 rounded-sm hover:border-amber-500 transition-all text-left group">
                <h3 className="text-2xl font-black text-amber-500 font-serif uppercase mb-4 group-hover:text-amber-400">{w.name}</h3>
                <p className="text-sm text-slate-400 italic font-serif leading-relaxed line-clamp-3">{w.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 'SELECT_CHARACTER' && (
        <div className="w-full max-w-6xl space-y-12 animate-in slide-in-from-right duration-500 px-4">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-7xl font-black text-amber-500 uppercase tracking-tighter font-serif drop-shadow-2xl">Manifestation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {myChars.map(c => (
                <button key={c.id} onClick={() => setSelectedChar(c)} className={`relative bg-slate-950/90 border-2 p-8 rounded-sm transition-all text-left ${selectedChar?.id === c.id ? 'border-amber-500 bg-amber-900/10 shadow-2xl scale-[1.02]' : 'border-amber-900/30 opacity-70 hover:opacity-100'}`}>
                  <h3 className="text-2xl font-black text-amber-500 font-serif uppercase">{c.name}</h3>
                  <p className="text-[10px] text-amber-600/80 font-black uppercase tracking-widest mt-1">{c.race} • {c.class}</p>
                  <p className="text-xs text-slate-500 italic mt-4 line-clamp-3 font-serif leading-relaxed">"{c.backstory}"</p>
                </button>
            ))}
            {myChars.length === 0 && <div className="col-span-full py-32 text-center text-slate-500 italic font-serif text-xl bg-black/40 border-2 border-dashed border-slate-800 rounded">No legends found in the vault. Forge a legend first.</div>}
          </div>
          <div className="flex justify-center pt-12">
             {selectedChar && <button onClick={handleStartAdventure} className="px-16 py-6 bg-amber-600 text-white font-black rounded-sm uppercase tracking-[0.5em] shadow-[0_15px_40px_rgba(180,83,9,0.4)] border-2 border-amber-400 hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all">ENTER THE FRAY</button>}
          </div>
        </div>
      )}
      {step === 'SITUATION' && renderSituation()}
    </Layout>
  );
};

export default AdventureView;