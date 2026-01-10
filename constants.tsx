
import { Class, Weapon, World } from './types';

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const GENDERS = ['Masculine', 'Feminine', 'Non-Binary', 'Androgynous', 'Other-worldly', 'Agender'];

export const HAIR_COLORS = [
  'Midnight Black', 'Platinum Blonde', 'Fiery Red', 'Chestnut Brown', 'Silver Grey', 
  'Emerald Green', 'Deep Blue', 'Amethyst Purple', 'Rose Gold', 'Crimson', 'None/Scales',
  'Golden Blonde', 'Ash Brown', 'Snow White', 'Neon Cyan', 'Obsidian', 'Copper'
];

export const HAIR_COLOR_MAP: Record<string, string> = {
  'Midnight Black': '#1a1a1a',
  'Platinum Blonde': '#f5f5dc',
  'Fiery Red': '#b22222',
  'Chestnut Brown': '#5d3a1a',
  'Silver Grey': '#c0c0c0',
  'Emerald Green': '#50c878',
  'Deep Blue': '#00008b',
  'Amethyst Purple': '#9966cc',
  'Rose Gold': '#b76e79',
  'Crimson': '#dc143c',
  'None/Scales': '#4a5568',
  'Golden Blonde': '#e6be8a',
  'Ash Brown': '#634f41',
  'Snow White': '#ffffff',
  'Neon Cyan': '#00ffff',
  'Obsidian': '#080808',
  'Copper': '#b87333'
};

export const HAIR_STYLES = [
  'Short & Messy', 'Long & Flowing', 'Braided Crown', 'Bald', 'Top Knot', 
  'Wild Waves', 'Mohawk', 'Shaved Sides', 'Dreadlocks', 'Ornate Braids', 'Wispy',
  'Side-swept', 'Pompadour', 'Bowl Cut', 'Twin Tails', 'Mullet', 'Undercut'
];

export const HAIR_TEXTURES = [
  'Straight', 'Wavy', 'Curly', 'Coily', 'Braided', 'Dreadlocked', 'Wispy', 'Thick', 'Thin'
];

export const SKIN_TONES = [
  'Pale Alabaster', 'Sun-kissed Bronze', 'Rich Ebony', 'Olive', 'Deep Copper', 
  'Dusky Blue', 'Stone Grey', 'Emerald Green', 'Obsidian Black', 'Lavender', 'Pale Blue',
  'Golden Ochre', 'Deep Umber', 'Frosty White', 'Violaceous', 'Citrine'
];

export const SKIN_TONE_MAP: Record<string, string> = {
  'Pale Alabaster': '#fdf5e6',
  'Sun-kissed Bronze': '#cd853f',
  'Rich Ebony': '#3d2b1f',
  'Olive': '#808000',
  'Deep Copper': '#b87333',
  'Dusky Blue': '#4a5568',
  'Stone Grey': '#718096',
  'Emerald Green': '#2f855a',
  'Obsidian Black': '#1a202c',
  'Lavender': '#b794f4',
  'Pale Blue': '#bee3f8',
  'Golden Ochre': '#c6a664',
  'Deep Umber': '#362312',
  'Frosty White': '#e3f2fd',
  'Violaceous': '#5c2d91',
  'Citrine': '#f4d03f'
};

export const SKIN_TEXTURES = [
  'Smooth', 'Rough', 'Weathered', 'Scaled', 'Scarred', 'Soft', 'Leathery', 'Porcelain'
];

export const HEIGHTS = [
  'Petite', 'Short', 'Average', 'Tall', 'Towering', 'Giant'
];

export const CLOTHING_AESTHETICS = [
  'Noble/Regal', 'Ragged/Poor', 'Practical/Traveler', 'Arcane/Mystic', 'Martial/Soldier', 'Rustic/Farmer', 'Ostentatious', 'Shadowy'
];

export const EYE_COLORS = [
  'Steel Blue', 'Forest Green', 'Golden Amber', 'Deep Violet', 'Blood Red', 
  'Obsidian', 'Glowing White', 'Silver', 'Heterochromic', 'Milky White',
  'Emerald', 'Ruby', 'Sapphire', 'Opal', 'Blind/Clouded'
];

export const EYE_COLOR_MAP: Record<string, string> = {
  'Steel Blue': '#4682b4',
  'Forest Green': '#228b22',
  'Golden Amber': '#ffbf00',
  'Deep Violet': '#9400d3',
  'Blood Red': '#8b0000',
  'Obsidian': '#000000',
  'Glowing White': '#ffffff',
  'Silver': '#c0c0c0',
  'Heterochromic': 'linear-gradient(45deg, #4682b4, #ffbf00)',
  'Milky White': '#f0f8ff',
  'Emerald': '#50c878',
  'Ruby': '#e0115f',
  'Sapphire': '#0f52ba',
  'Opal': 'radial-gradient(circle, #ff00ff, #00ffff, #ffffff)',
  'Blind/Clouded': '#dcdcdc'
};

export const EYE_SHAPES = ['Sharp/Eagle', 'Round/Gentle', 'Slanted/Cunning', 'Wide/Curious', 'Glowy/Monstrous', 'Piercing'];
export const BUILDS = ['Athletic', 'Slender', 'Burly', 'Wiry', 'Stocky', 'Towering', 'Diminutive'];
export const FEATURES = [
  'Facial Scar', 'Mystic Tattoos', 'Eye Patch', 'Pointed Ears', 'Freckles', 
  'Glowing Runes', 'Mechanical Limb', 'Piercings', 'Beard/Facial Hair', 'War Paint',
  'Horns', 'Tail', 'Third Eye', 'Animalistic Ears', 'Spectacles', 'Burn Scars'
];
export const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];

export const DAMAGE_TYPES = ['Slashing', 'Piercing', 'Bludgeoning', 'Force', 'Fire', 'Cold', 'Lightning', 'Thunder', 'Acid', 'Poison', 'Radiant', 'Necrotic', 'Psychic'];
export const WEAPON_PROPERTIES = ['Finesse', 'Heavy', 'Light', 'Loading', 'Range', 'Reach', 'Special', 'Thrown', 'Two-handed', 'Versatile'];
export const CREATURE_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
export const SPEEDS = ['20 ft.', '25 ft.', '30 ft.', '35 ft.', '40 ft.'];
export const WORLD_TAGS = ['High Fantasy', 'Low Fantasy', 'Grimdark', 'Steampunk', 'Eldritch Horror', 'Cyberpunk', 'Post-Apocalyptic', 'Nautical', 'Desert', 'Frozen Waste'];

export const PREMADE_WORLDS: World[] = [
  {
    id: 'pre-001',
    name: 'Forgotten Realms',
    tags: ['High Fantasy', 'Classic'],
    description: 'A world of incredible magic, ancient civilizations, and legendary heroes. Home to the Sword Coast and the city of Waterdeep.'
  },
  {
    id: 'pre-002',
    name: 'Eberron',
    tags: ['Steampunk', 'Pulp Adventure'],
    description: 'A world where magic is used as technology. Lightning rails, airships, and warforged soldiers characterize this setting.'
  },
  {
    id: 'pre-003',
    name: 'Ravenloft',
    tags: ['Grimdark', 'Eldritch Horror'],
    description: 'A domain of dread where gothic horror reigns supreme. Ruled by Darklords like Strahd von Zarovich.'
  }
];

export const RACE_DESCRIPTIONS: Record<string, string> = {
  Human: "Adaptable and ambitious, humans are the most diverse of the common races.",
  Elf: "Magical people of long lifespans, preferring nature or ancient cities.",
  Dwarf: "Bold and hardy, masters of stone, metal, and long-held grudges.",
  Halfling: "Small, nimble, and optimistic, famous for their luck and love of home.",
  Dragonborn: "Proud draconic humanoids with breath weapons of elemental power.",
  Gnome: "Small, eccentric inventors and illusionists with a love for life.",
  "Half-Elf": "Combining the best of human and elven traits, often wandering diplomats.",
  "Half-Orc": "Strong and resilient warriors, often driven by intense emotion.",
  Tiefling: "Marked by a diabolic heritage, they possess horns, tails, and a sharp wit.",
  Homebrew: "A custom race of your own design. Define your unique heritage and traits."
};

export const CLASS_DESCRIPTIONS: Record<string, string> = {
  Barbarian: "A fierce warrior who can enter a battle rage to crush foes.",
  Bard: "An inspiring magician whose power comes from music and stories.",
  Cleric: "A priestly champion who wields divine magic in service of a higher power.",
  Druid: "A priest of the Old Faith, wielding the powers of nature and animals.",
  Fighter: "A master of martial combat, skilled with a variety of weapons and armor.",
  Rogue: "A scoundrel who uses stealth and trickery to overcome obstacles.",
  Sorcerer: "A spellcaster who draws on inherent magic from a gift or bloodline.",
  Wizard: "A scholarly magic-user capable of manipulating the fabric of reality.",
  Homebrew: "Create your own unique class with specific mechanics and flavors."
};

export const CLASS_WEAPONS: Record<string, Weapon[]> = {
  'Barbarian': [{ name: 'Greataxe', damage: '1d12', type: 'Slashing', properties: ['Heavy', 'Two-handed'] }],
  'Bard': [{ name: 'Rapier', damage: '1d8', type: 'Piercing', properties: ['Finesse'] }],
  'Cleric': [{ name: 'Mace', damage: '1d6', type: 'Bludgeoning', properties: [] }],
  'Druid': [{ name: 'Quarterstaff', damage: '1d6', type: 'Bludgeoning', properties: ['Versatile (1d8)'] }],
  'Fighter': [{ name: 'Longsword', damage: '1d8', type: 'Slashing', properties: ['Versatile (1d10)'] }],
  'Rogue': [{ name: 'Daggers (x2)', damage: '1d4', type: 'Piercing', properties: ['Finesse', 'Light', 'Thrown'] }],
  'Sorcerer': [{ name: 'Light Crossbow', damage: '1d8', type: 'Piercing', properties: ['Ammunition', 'Loading', 'Range (80/320)'] }],
  'Wizard': [{ name: 'Quarterstaff', damage: '1d6', type: 'Bludgeoning', properties: ['Versatile (1d8)'] }],
  'Homebrew': [{ name: 'Handaxe', damage: '1d6', type: 'Slashing', properties: ['Light', 'Thrown'] }]
};
