
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

export interface HomebrewTraits {
  avgHeight?: string;
  ancestors?: string;
  raceBackstory?: string;
  speed?: string;
  size?: string;
  specialAttacks?: string;
  resistances?: string;
  abilities?: string;
}

export interface Appearance {
  gender: string;
  hairColor: string;
  hairStyle: string;
  skinTone: string;
  eyeColor: string;
  eyeShape: string;
  build: string;
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

export interface Character {
  name: string;
  race: Race;
  customRaceName?: string;
  class: Class;
  customClassName?: string;
  appearance: Appearance;
  backstory: string;
  stats: Stats;
  weapon: Weapon;
  alignment: string;
  level: number;
  homebrewTraits?: HomebrewTraits;
}

export type View = 'LANDING' | 'CREATOR' | 'SHEET' | 'SETTINGS';
