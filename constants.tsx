
import { Class, Weapon } from './types';

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const GENDERS = ['Masculine', 'Feminine', 'Non-Binary', 'Androgynous', 'Other-worldly', 'Unknown'];
export const HAIR_COLORS = ['Midnight Black', 'Platinum Blonde', 'Fiery Red', 'Chestnut Brown', 'Silver Grey', 'Emerald Green', 'Deep Blue', 'None/Scales', 'Unknown'];
export const HAIR_STYLES = ['Short & Messy', 'Long & Flowing', 'Braided', 'Bald', 'Top Knot', 'Wild Waves', 'Mohawk', 'Shaved Sides', 'Unknown'];
export const SKIN_TONES = ['Pale Alabaster', 'Sun-kissed Bronze', 'Rich Ebony', 'Olive', 'Deep Copper', 'Dusky Blue', 'Stone Grey', 'Emerald Green', 'Obsidian Black', 'Unknown'];
export const EYE_COLORS = ['Steel Blue', 'Forest Green', 'Golden Amber', 'Deep Violet', 'Blood Red', 'Obsidian', 'Glowing White', 'Silver', 'Unknown'];
export const EYE_SHAPES = ['Sharp/Eagle', 'Round/Gentle', 'Slanted/Cunning', 'Wide/Curious', 'Glowy/Monstrous', 'Unknown'];
export const BUILDS = ['Athletic', 'Slender', 'Burly', 'Wiry', 'Stocky', 'Towering', 'Unknown'];
export const FEATURES = ['Facial Scar', 'Mystic Tattoos', 'Eye Patch', 'Pointed Ears', 'Freckles', 'Glowing Runes', 'Mechanical Limb', 'Piercings', 'Beard/Facial Hair', 'War Paint'];
export const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];

export const CREATURE_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
export const SPEEDS = ['20 ft.', '25 ft.', '30 ft.', '35 ft.', '40 ft.', 'Fly 30 ft.', 'Swim 30 ft.'];

export const DAMAGE_TYPES = ['Slashing', 'Piercing', 'Bludgeoning', 'Force', 'Fire', 'Cold', 'Radiant', 'Necrotic', 'Psychic'];
export const WEAPON_PROPERTIES = ['Finesse', 'Light', 'Heavy', 'Reach', 'Thrown', 'Two-handed', 'Versatile', 'Loading', 'Ammunition', 'Magic'];

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
  Aasimar: "Beings with a spark of the divine, often serving as guardians of light.",
  Tabaxi: "Feline humanoids driven by curiosity and a love for artifacts.",
  Goliath: "Strong mountain-dwellers who value competition and physical prowess.",
  Firbolg: "Gentle giants who serve as guardians of the forest.",
  Kenku: "Wingless bird-folk who are masters of mimicry and forgery.",
  Lizardfolk: "Pragmatic reptilian survivors who see the world in simple terms.",
  Tortle: "Nomadic turtle-folk who carry their homes on their backs.",
  Genasi: "Beings touched by the power of the elemental planes.",
  Gith: "Astral travelers with psionic powers, often enemies of mind flayers.",
  Homebrew: "A custom race of your own design. Define your unique heritage and traits."
};

export const CLASS_DESCRIPTIONS: Record<string, string> = {
  Barbarian: "A fierce warrior who can enter a battle rage to crush foes.",
  Bard: "An inspiring magician whose power comes from music and stories.",
  Cleric: "A priestly champion who wields divine magic in service of a higher power.",
  Druid: "A priest of the Old Faith, wielding the powers of nature and animals.",
  Fighter: "A master of martial combat, skilled with a variety of weapons and armor.",
  Monk: "A master of martial arts, harnessing the energy of the body for combat.",
  Paladin: "A holy warrior bound by a sacred oath to smite evil.",
  Ranger: "A master of the wilderness, tracking foes and fighting with bow or blade.",
  Rogue: "A scoundrel who uses stealth and trickery to overcome obstacles.",
  Sorcerer: "A spellcaster who draws on inherent magic from a gift or bloodline.",
  Warlock: "A wielder of magic that is derived from a bargain with an extraplanar entity.",
  Wizard: "A scholarly magic-user capable of manipulating the fabric of reality.",
  Artificer: "Masters of invention who use magic to enhance mundane objects.",
  "Blood Hunter": "Warriors who use forbidden blood magic to hunt their prey.",
  Homebrew: "Create your own unique class with specific mechanics and flavors."
};

export const CLASS_WEAPONS: Record<Class, Weapon[]> = {
  [Class.BARBARIAN]: [{ name: 'Greataxe', damage: '1d12', type: 'Slashing', properties: ['Heavy', 'Two-handed'] }],
  [Class.BARD]: [{ name: 'Rapier', damage: '1d8', type: 'Piercing', properties: ['Finesse'] }],
  [Class.CLERIC]: [{ name: 'Mace', damage: '1d6', type: 'Bludgeoning', properties: [] }],
  [Class.DRUID]: [{ name: 'Quarterstaff', damage: '1d6', type: 'Bludgeoning', properties: ['Versatile (1d8)'] }],
  [Class.FIGHTER]: [{ name: 'Longsword', damage: '1d8', type: 'Slashing', properties: ['Versatile (1d10)'] }],
  [Class.MONK]: [{ name: 'Shortsword', damage: '1d6', type: 'Piercing', properties: ['Finesse', 'Light'] }],
  [Class.PALADIN]: [{ name: 'Warhammer', damage: '1d8', type: 'Bludgeoning', properties: ['Versatile (1d10)'] }],
  [Class.RANGER]: [{ name: 'Longbow', damage: '1d8', type: 'Piercing', properties: ['Ammunition', 'Heavy', 'Range (150/600)'] }],
  [Class.ROGUE]: [{ name: 'Daggers (x2)', damage: '1d4', type: 'Piercing', properties: ['Finesse', 'Light', 'Thrown'] }],
  [Class.SORCERER]: [{ name: 'Light Crossbow', damage: '1d8', type: 'Piercing', properties: ['Ammunition', 'Loading', 'Range (80/320)'] }],
  [Class.WARLOCK]: [{ name: 'Dagger', damage: '1d4', type: 'Piercing', properties: ['Finesse', 'Light', 'Thrown'] }],
  [Class.WIZARD]: [{ name: 'Quarterstaff', damage: '1d6', type: 'Bludgeoning', properties: ['Versatile (1d8)'] }],
  [Class.ARTIFICER]: [{ name: 'Handaxe', damage: '1d6', type: 'Slashing', properties: ['Light', 'Thrown'] }],
  [Class.BLOOD_HUNTER]: [{ name: 'Scimitar', damage: '1d6', type: 'Slashing', properties: ['Finesse', 'Light'] }],
  [Class.HOMEBREW]: []
};
