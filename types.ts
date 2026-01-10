
export enum Race {
  HUMAN = 'Human',
  ELF = 'Elf',
  DWARF = 'Dwarf',
  HALFLING = 'Halfling',
  DRAGONBORN = 'Dragonborn',
  GNOME = 'Gnome',
  HALF_ELF = 'Half-Elf',
  HALF_ORC = 'Half-Orc',
  TIEFLING = 'Tiefling',
  AASIMAR = 'Aasimar',
  TABAXI = 'Tabaxi',
  GOLIATH = 'Goliath',
  FIRBOLG = 'Firbolg',
  KENKU = 'Kenku',
  LIZARDFOLK = 'Lizardfolk',
  TORTLE = 'Tortle',
  GENASI = 'Genasi',
  GITH = 'Gith',
  ASTRAL_ELF = 'Astral Elf',
  OWLIN = 'Owlin',
  HARENGON = 'Harengon',
  HOMEBREW = 'Homebrew'
}

export enum Class {
  BARBARIAN = 'Barbarian',
  BARD = 'Bard',
  CLERIC = 'Cleric',
  DRUID = 'Druid',
  FIGHTER = 'Fighter',
  MONK = 'Monk',
  PALADIN = 'Paladin',
  RANGER = 'Ranger',
  ROGUE = 'Rogue',
  SORCERER = 'Sorcerer',
  WARLOCK = 'Warlock',
  WIZARD = 'Wizard',
  ARTIFICER = 'Artificer',
  BLOOD_HUNTER = 'Blood Hunter',
  HOMEBREW = 'Homebrew'
}

export interface Appearance {
  gender: string;
  hairColor: string;
  hairStyle: string;
  hairTexture: string;
  skinTone: string;
  skinTexture: string;
  eyeColor: string;
  eyeShape: string;
  build: string;
  height: string;
  clothingAesthetic: string;
  features: string[];
  narrative: {
    head: string;
    body: string;
    legs: string;
  };
}

export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Weapon {
  name: string;
  damage: string; 
  type: string;   
  properties: string[]; 
}

export interface MonsterAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_bonus?: number;
}

export interface MonsterTemplate {
  name: string;
  hp: number;
  ac: number;
  stats: Stats;
  size: string;
  speed: string;
  resistances?: string[];
  vulnerabilities?: string[];
  immunities?: string[];
  actions: MonsterAction[];
  inventory?: string[];
  gold?: number;
}

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  type: 'HERO' | 'ENEMY' | 'NPC' | 'ALLY';
  imageUrl?: string;
  x: number; 
  y: number; 
  stats: Stats;
  initiative?: number;
  size?: string;
  speed?: string;
  resistances?: string[];
  vulnerabilities?: string[];
  immunities?: string[];
  actions?: MonsterAction[];
  inventory?: string[];
  gold?: number;
}

export interface LocationData {
  name: string;
  mapUrl: string;
  environmentState: string; 
}

export interface AdventureSave {
  id: string;
  worldId: string;
  characterId: string;
  history: string[];
  currentLocationName: string;
  combatants: Combatant[];
  locationCache: Record<string, LocationData>; 
  lastUpdated: number;
}

export interface HomebrewTraits {
  avgHeight: string;
  ancestors: string;
  raceBackstory: string;
  speed: string;
  size: string;
  specialAttacks: string;
  resistances: string;
  abilities: string;
}

export interface SpellSlotData {
  max: number;
  used: number;
}

export interface Character {
  id: string;
  name: string;
  race: Race;
  customRaceName?: string;
  class: Class;
  customClassName?: string;
  appearance: Appearance;
  backstory: string;
  stats: Stats;
  manualModifiers?: Partial<Record<keyof Stats, number>>;
  weapon: Weapon;
  alignment: string;
  level: number;
  gold: number;
  homebrewTraits?: HomebrewTraits;
  inventory: Record<string, string[]>;
  spellSlots?: Record<number, SpellSlotData>;
}

export interface World {
  id: string;
  name: string;
  tags: string[];
  description: string;
}

export type RollMode = 'INGAME' | 'IRL';
export type CalculationMode = 'AI_DESTINY' | 'MANUAL';

export interface AdventureConfig {
  rollMode: RollMode;
  calculationMode: CalculationMode;
  storytellingInstruction: string;
  showDamageEffects: boolean;
}

export interface CommunityItem {
  id: string;
  type: 'character' | 'world';
  author: string;
  data: Character | World;
  timestamp: number;
}

export type View = 'LANDING' | 'CREATOR' | 'SHEET' | 'SETTINGS' | 'ADVENTURE' | 'STORY_MAKER' | 'LIBRARY' | 'VAULT';
