import { GoogleGenAI, Type } from "@google/genai";
import { Character, Appearance, Weapon, World, Combatant, Stats, MonsterTemplate, LocationData } from "../types";

const parseAIJson = (text: string) => {
  if (!text) return {};
  try {
    const cleaned = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("Direct JSON parse failed, attempting regex fallback:", e);
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (innerE) {
        console.error("Regex fallback JSON parse failed:", innerE);
      }
    }
    return {};
  }
};

export const fetchFullMonsterStats = async (name: string): Promise<MonsterTemplate> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Return a complete D&D 5e stat block for a "${name}" as JSON. Include AC, HP, stats (STR, DEX, CON, INT, WIS, CHA), size, speed, resistances, vulnerabilities, immunities, and major actions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hp: { type: Type.NUMBER },
          ac: { type: Type.NUMBER },
          size: { type: Type.STRING },
          speed: { type: Type.STRING },
          stats: {
            type: Type.OBJECT,
            properties: {
              strength: { type: Type.NUMBER },
              dexterity: { type: Type.NUMBER },
              constitution: { type: Type.NUMBER },
              intelligence: { type: Type.NUMBER },
              wisdom: { type: Type.NUMBER },
              charisma: { type: Type.NUMBER }
            }
          },
          resistances: { type: Type.ARRAY, items: { type: Type.STRING } },
          vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
          immunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                desc: { type: Type.STRING },
                damage_dice: { type: Type.STRING }
              }
            }
          }
        },
        required: ["name", "hp", "ac", "size", "speed", "stats", "actions"]
      }
    }
  });
  return parseAIJson(response.text || "{}") as MonsterTemplate;
};

export const narrateActionAI = async (
  world: World,
  char: Character,
  action: string,
  history: string[],
  currentLocation?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `You are a D&D Dungeon Master in the world of ${world.name}.
  The party is currently at: ${currentLocation || 'A mysterious crossroads'}.
  The character ${char.name} (a ${char.race} ${char.class}) does this: "${action}".
  
  Previous context (last 3 events):
  ${history.slice(0, 3).join('\n')}
  
  Write a short, evocative 1-paragraph description of the result of their action.
  - Keep it under 100 words. Use cinematic prose.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt
  });
  return response.text || "The winds of fate shift, but the path ahead remains unclear.";
};

export const generateBackstory = async (
  name: string,
  race: string,
  charClass: string,
  appearance: Appearance,
  seedIdea?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as a world-class fantasy novelist. Write a profound, immersive 2-paragraph D&D backstory for ${name}, a ${race} ${charClass}. 
  
  Incorporate these exact visual details into the prose to make the character feel alive:
  - Traits: ${appearance.gender}, ${appearance.build}, ${appearance.hairStyle} ${appearance.hairColor} hair, ${appearance.skinTone} skin.
  
  ${seedIdea ? `Central Theme: "${seedIdea}"` : ''}
  
  Return only the story text.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt
  });
  return response.text || "Your legend begins...";
};

export const forgeWeaponAI = async (description: string): Promise<Weapon> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert this description to D&D 5e weapon stats: "${description}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          damage: { type: Type.STRING },
          type: { type: Type.STRING },
          properties: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "damage", "type", "properties"]
      }
    }
  });
  return parseAIJson(response.text || "{}") as Weapon;
};

export const generateMapImage = async (worldName: string, locationType: string, description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A 2D top-down orthographic D&D battle map. 
    World: ${worldName}. 
    Environment: ${locationType}. 
    Description: ${description}. 
    Style: Hand-drawn RPG module style, high-fidelity fantasy illustration, clear terrain boundaries, grid-ready layout. 
    Perspective: Strictly vertical overhead (90 degrees down), NO 3D perspective, NO characters, NO text, NO user interface elements.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return "https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=1920";
};

export const manifestLocationAI = async (world: World, type: string, seed?: string): Promise<LocationData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Search for world-accurate info if this is a known setting
  const researchPrompt = `Find detailed D&D lore about the location "${seed || type}" within the setting of "${world.name}". If it's a homebrew world, describe an environment based on the tags: ${world.tags.join(', ')}. Focus on architectural styles and atmosphere for a top-down battle map.`;
  
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const loreContext = searchResponse.text;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this lore: "${loreContext}", generate a location structure for a D&D app. 
    Return as JSON with: name, environmentState (atmosphere), and a detailed mapPrompt for an image generator. 
    Ensure the mapPrompt specifies TOP-DOWN view and world-appropriate details.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          environmentState: { type: Type.STRING },
          mapPrompt: { type: Type.STRING }
        },
        required: ["name", "environmentState", "mapPrompt"]
      }
    }
  });

  const data = parseAIJson(response.text || "{}");
  const mapUrl = await generateMapImage(world.name, type, data.mapPrompt || data.name);
  
  return {
    name: data.name || (seed || "Unknown Region"),
    environmentState: data.environmentState || "A quiet area.",
    mapUrl: mapUrl
  };
};