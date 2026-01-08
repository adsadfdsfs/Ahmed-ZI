
import { GoogleGenAI, Type } from "@google/genai";
import { Character, Race, Class, Appearance, Stats, Weapon } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBackstory = async (
  name: string,
  race: string,
  charClass: string,
  appearance: Appearance,
  seedIdea?: string
): Promise<string> => {
  const prompt = `Write a compelling 2-paragraph Dungeons & Dragons backstory for a character named ${name}.
  Race: ${race}
  Class: ${charClass}
  Appearance: ${appearance.gender}, ${appearance.hairStyle} ${appearance.hairColor} hair, ${appearance.skinTone} skin, ${appearance.eyeShape} ${appearance.eyeColor} eyes, ${appearance.build} build. ${appearance.features.length > 0 ? 'Notable features: ' + appearance.features.join(', ') : ''}
  ${seedIdea ? `Additional instruction: Incorporate this core idea: "${seedIdea}"` : ''}
  Make it heroic yet personal. Return only the backstory text.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "Your legend is yet to be written...";
};

export const describeAppearanceAI = async (description: string): Promise<Partial<Appearance>> => {
  const prompt = `Extract D&D character appearance traits from this description: "${description}". 
  Map them to the following fields: gender, hairColor, hairStyle, skinTone, eyeColor, eyeShape, build, and features (array).
  Be descriptive. Only return a JSON object with these fields.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gender: { type: Type.STRING },
          hairColor: { type: Type.STRING },
          hairStyle: { type: Type.STRING },
          skinTone: { type: Type.STRING },
          eyeColor: { type: Type.STRING },
          eyeShape: { type: Type.STRING },
          build: { type: Type.STRING },
          features: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const forgeWeaponAI = async (description: string): Promise<Weapon> => {
  const prompt = `Convert the following description into a Dungeons & Dragons 5e weapon stat block in JSON format: "${description}".
  Ensure the damage dice is reasonable (e.g., 1d4 to 1d12 or 2d6).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          damage: { type: Type.STRING },
          type: { type: Type.STRING },
          properties: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["name", "damage", "type", "properties"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as Weapon;
};
