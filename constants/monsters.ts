
import { MonsterTemplate } from '../types';

export const MONSTER_DATABASE: MonsterTemplate[] = [
  {
    name: 'Ancient Red Dragon',
    hp: 546,
    ac: 22,
    size: 'Gargantuan',
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    stats: { strength: 30, dexterity: 10, constitution: 29, intelligence: 18, wisdom: 15, charisma: 23 },
    immunities: ['fire'],
    actions: [
      { name: 'Multiattack', desc: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.' },
      { name: 'Fire Breath', desc: 'The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 91 (26d6) fire damage on a failed save.', damage_dice: '26d6' }
    ],
    inventory: ['Hoard of 10,000 Gold', 'Red Dragon Scale', 'Gem of Fire Command']
  },
  {
    name: 'Aboleth',
    hp: 135,
    ac: 17,
    size: 'Large',
    speed: '10 ft., swim 40 ft.',
    stats: { strength: 21, dexterity: 9, constitution: 15, intelligence: 18, wisdom: 15, charisma: 18 },
    actions: [
      { name: 'Tentacle', desc: 'Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage.', damage_dice: '2d6' },
      { name: 'Enslave', desc: 'The aboleth targets one creature it can see within 30 feet of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed.' }
    ],
    inventory: ['Slime Gland', 'Psychic Residue', 'Ancient Map of the Abyss']
  },
  {
    name: 'Banshee',
    hp: 58,
    ac: 12,
    size: 'Medium',
    speed: '0 ft., fly 40 ft. (hover)',
    stats: { strength: 1, dexterity: 14, constitution: 10, intelligence: 12, wisdom: 11, charisma: 17 },
    resistances: ['acid', 'fire', 'lightning', 'thunder'],
    immunities: ['cold', 'necrotic', 'poison'],
    actions: [
      { name: 'Corrupting Touch', desc: 'Melee Spell Attack: +4 to hit, reach 5 ft., one target. Hit: 12 (3d6 + 2) necrotic damage.', damage_dice: '3d6' },
      { name: 'Wail', desc: 'The banshee releases a mournful wail. This wail has no effect on constructs and undead.' }
    ],
    inventory: ['Spectral Silk', 'Tattered Locket']
  },
  {
    name: 'Lich',
    hp: 135,
    ac: 17,
    size: 'Medium',
    speed: '30 ft.',
    stats: { strength: 11, dexterity: 16, constitution: 16, intelligence: 20, wisdom: 14, charisma: 16 },
    resistances: ['cold', 'lightning', 'necrotic'],
    immunities: ['poison', 'bludgeoning, piercing, and slashing from nonmagical attacks'],
    actions: [
      { name: 'Paralyzing Touch', desc: 'Melee Spell Attack: +12 to hit, reach 5 ft., one creature. Hit: 10 (3d6) cold damage.', attack_bonus: 12, damage_dice: '3d6' }
    ],
    inventory: ['Ring of Protection', 'Spell Scroll (Cloudkill)', 'Jeweled Phylactery Fragment']
  },
  {
    name: 'Chimera',
    hp: 114,
    ac: 14,
    size: 'Large',
    speed: '30 ft., fly 60 ft.',
    stats: { strength: 19, dexterity: 11, constitution: 19, intelligence: 3, wisdom: 14, charisma: 10 },
    actions: [
      { name: 'Multiattack', desc: 'The chimera makes three attacks: one with its bite, one with its horns, and one with its claws.' },
      { name: 'Fire Breath', desc: 'The dragon head exhales fire in a 15-foot cone.', damage_dice: '7d8' }
    ],
    inventory: ['Lion\'s Mane', 'Dragon Fang', 'Goat Horn']
  },
  {
    name: 'Goblin',
    hp: 7,
    ac: 15,
    size: 'Small',
    speed: '30 ft.',
    stats: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
    actions: [
      { name: 'Scimitar', desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.', attack_bonus: 4, damage_dice: '1d6', damage_bonus: 2 }
    ],
    inventory: ['Bent Spoon', 'Rusty Dagger', '3 Copper Pieces']
  },
  {
    name: 'Orc',
    hp: 15,
    ac: 13,
    size: 'Medium',
    speed: '30 ft.',
    stats: { strength: 16, dexterity: 12, constitution: 16, intelligence: 7, wisdom: 11, charisma: 10 },
    actions: [
      { name: 'Greataxe', desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.', attack_bonus: 5, damage_dice: '1d12', damage_bonus: 3 }
    ],
    inventory: ['Wolf Fur Cloak', 'Serrated Greataxe', 'Dried Meat']
  },
  {
    name: 'Beholder',
    hp: 180,
    ac: 18,
    size: 'Large',
    speed: '0 ft., fly 20 ft. (hover)',
    stats: { strength: 10, dexterity: 14, constitution: 18, intelligence: 17, wisdom: 15, charisma: 17 },
    actions: [
      { name: 'Bite', desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 14 (4d6) piercing damage.', attack_bonus: 5, damage_dice: '4d6' },
      { name: 'Eye Rays', desc: 'The beholder shoots three of the following magical eye rays at random...' }
    ],
    inventory: ['Anti-Magic Eye Lens', 'Central Eye Stalk', 'Floating Gemstone']
  },
  {
    name: 'Skeleton',
    hp: 13,
    ac: 13,
    size: 'Medium',
    speed: '30 ft.',
    stats: { strength: 10, dexterity: 14, constitution: 15, intelligence: 6, wisdom: 8, charisma: 5 },
    vulnerabilities: ['bludgeoning'],
    immunities: ['poison', 'exhaustion'],
    actions: [
      { name: 'Shortsword', desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.', attack_bonus: 4, damage_dice: '1d6', damage_bonus: 2 }
    ],
    inventory: ['Ancient Coin', 'Rusty Shortsword']
  },
  {
    name: 'Zombie',
    hp: 22,
    ac: 8,
    size: 'Medium',
    speed: '20 ft.',
    stats: { strength: 13, dexterity: 6, constitution: 16, intelligence: 3, wisdom: 6, charisma: 5 },
    immunities: ['poison'],
    actions: [
      { name: 'Slam', desc: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.', attack_bonus: 3, damage_dice: '1d6', damage_bonus: 1 }
    ],
    inventory: ['Rotting Flesh', 'Shredded Rags']
  },
  {
    name: 'Owlbear',
    hp: 59,
    ac: 13,
    size: 'Large',
    speed: '30 ft.',
    stats: { strength: 20, dexterity: 12, constitution: 17, intelligence: 3, wisdom: 12, charisma: 7 },
    actions: [
      { name: 'Multiattack', desc: 'The owlbear makes two attacks: one with its beak and one with its claws.' },
      { name: 'Beak', desc: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d10 + 5) piercing damage.', attack_bonus: 7, damage_dice: '1d10', damage_bonus: 5 }
    ],
    inventory: ['Owlbear Pelts', 'Beak Fragment']
  },
  {
    name: 'Mimic',
    hp: 58,
    ac: 12,
    size: 'Medium',
    speed: '15 ft.',
    stats: { strength: 17, dexterity: 12, constitution: 15, intelligence: 5, wisdom: 13, charisma: 8 },
    immunities: ['acid'],
    actions: [
      { name: 'Pseudopod', desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage.', attack_bonus: 5, damage_dice: '1d8', damage_bonus: 3 }
    ],
    inventory: ['Adhesive Gland', 'False Gold Piece']
  },
  {
    name: 'Gelatinous Cube',
    hp: 84,
    ac: 6,
    size: 'Large',
    speed: '15 ft.',
    stats: { strength: 14, dexterity: 3, constitution: 20, intelligence: 1, wisdom: 6, charisma: 1 },
    immunities: ['blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'prone'],
    actions: [
      { name: 'Pseudopod', desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 10 (3d6) acid damage.', attack_bonus: 4, damage_dice: '3d6' },
      { name: 'Engulf', desc: 'The cube moves up to its speed. While doing so, it can enter Large or smaller creatures\' spaces...' }
    ],
    inventory: ['Undigested Dagger', 'Ooze Residue', 'Acid-Proof Key']
  }
];

export const NPC_TEMPLATES: MonsterTemplate[] = [
  {
    name: 'Commoner',
    hp: 4,
    ac: 10,
    size: 'Medium',
    speed: '30 ft.',
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    actions: [
      { name: 'Club', desc: 'Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage.', damage_dice: '1d4' }
    ],
    inventory: ['Apple', 'Bag of Marbles']
  },
  {
    name: 'Guard',
    hp: 11,
    ac: 16,
    size: 'Medium',
    speed: '30 ft.',
    stats: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
    actions: [
      { name: 'Spear', desc: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage.', damage_dice: '1d6' }
    ],
    inventory: ['Iron Spear', 'Whistle', 'Jail Keys']
  },
  {
    name: 'Knight',
    hp: 52,
    ac: 18,
    size: 'Medium',
    speed: '30 ft.',
    stats: { strength: 16, dexterity: 11, constitution: 14, intelligence: 11, wisdom: 11, charisma: 15 },
    actions: [
      { name: 'Greatsword', desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage.', damage_dice: '2d6' }
    ],
    inventory: ['Greatsword', 'Signet Ring', 'Scroll of Honor']
  }
];
