import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent, PostTone, ResearchIdea, WeeklyStrategyItem, ContentFormat, UserProfile, LanguageOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SCHEMAS ---

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: "Viral hook. Make it punchy." },
    body: { type: Type.STRING, description: "Post content." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    cta: { type: Type.STRING },
  },
  required: ["headline", "body", "hashtags", "cta"],
};

const topicsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 15-20 single-word or two-word high-level industry domains (e.g., 'SaaS', 'Growth Marketing')."
    }
  }
};

const strategySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING },
      topic: { type: Type.STRING },
      tone: { type: Type.STRING },
      format: { type: Type.STRING },
      rationale: { type: Type.STRING },
      newsContext: { type: Type.STRING },
      language: { type: Type.STRING, description: "Must be 'ES' or 'EN'" }
    },
    required: ["day", "topic", "tone", "format", "rationale", "language"]
  }
};

// --- ONBOARDING SERVICES ---

export const analyzeProfileForTopics = async (resumeBase64: string | undefined, website: string): Promise<string[]> => {
  try {
    const parts: any[] = [];
    
    // Add PDF if exists
    if (resumeBase64) {
        const base64Data = resumeBase64.split(',')[1] || resumeBase64;
        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: "application/pdf"
            }
        });
    }

    const prompt = `Analyze this resume/profile and the website context: "${website}".
    EXTRACT 20 HIGH-LEVEL INDUSTRY PILLARS/DOMAINS.
    Do NOT write sentences. Do NOT write specific "How-to" titles.
    I want broad categories.
    Return strictly JSON.`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: topicsSchema
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return parsed.topics || [];
  } catch (error) {
    console.error("Error analyzing profile:", error);
    return ["Management", "Tech Trends", "Digital Strategy", "Innovation", "Remote Work"];
  }
};

// --- PLANNING SERVICES ---

export const generateSmartWeeklyPlan = async (profile: UserProfile): Promise<WeeklyStrategyItem[]> => {
  try {
    const topTopics = profile.selectedTopics.slice(0, 4).join(", ");
    let trendContext = "";
    
    try {
        const searchRes = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find the top 3 trending business news or viral discussions related to these industries right now: ${topTopics}.`,
            config: { tools: [{ googleSearch: {} }] }
        });
        trendContext = searchRes.text || "No specific trends found.";
    } catch (e) {
        console.warn("Search failed");
    }

    // Determine language instruction
    const languageInstruction = profile.language === 'MIX' 
      ? "IMPORTANT: You MUST alternate languages. Day 1: Spanish (ES), Day 2: English (EN), Day 3: Spanish (ES), etc."
      : `All posts must be in ${profile.language === 'ES' ? 'Spanish (ES)' : 'English (EN)'}.`;

    const prompt = `Create a 5-day LinkedIn content calendar for: ${profile.name} (${profile.role}).
    Core Pillars: ${profile.selectedTopics.join(", ")}.
    Recent Trends Context: ${trendContext}

    ${languageInstruction}

    Strategy Mix Rules:
    1. Monday (News/Trend): Format 'Entorno Profesional'. Connect a pillar to a real news event.
    2. Tuesday (Deep Dive): Format 'Arte Abstracto 3D (Tech)'. Explain a complex concept.
    3. Wednesday (Personal/Authority): Format 'Foto Personal (AI Ref)'. A lesson learned.
    4. Thursday (Contrarian): Format 'Fondo Minimalista'. Challenge an industry norm.
    5. Friday (Lifestyle/Reflection): Format 'Foto Cinemática'. High quality visual.

    Return JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: strategySchema
      }
    });

    return JSON.parse(response.text || "[]") as WeeklyStrategyItem[];
  } catch (error) {
    console.error("Error generating smart plan:", error);
    return [];
  }
};

export const searchTrendingIdeas = async (topic: string): Promise<ResearchIdea[]> => {
  try {
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 5 trending news headlines or viral discussions regarding: "${topic}".`,
      config: { tools: [{ googleSearch: {} }] }
    });

    const contextText = searchResponse.text;
    const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks.map(c => c.web?.uri).filter(u => !!u);

    const formatResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `From this text, extract 5 distinct content ideas: ${contextText}. Format as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    const ideas = JSON.parse(formatResponse.text || "[]");
    return ideas.map((idea: any, index: number) => ({
      title: idea.title,
      description: idea.description,
      sourceUrl: urls[index] || undefined
    }));

  } catch (error) {
    console.error("Error searching trends:", error);
    return [{ title: `Tendencias sobre ${topic}`, description: "Error en búsqueda.", sourceUrl: "" }];
  }
};

// Updated to accept explicit language target
export const generatePostText = async (topic: string, tone: PostTone, profile: UserProfile, newsContext?: string, targetLanguage?: 'ES' | 'EN'): Promise<GeneratedContent> => {
  
  // Default logic if no specific target is given (fallback)
  let langCode = targetLanguage;
  if (!langCode) {
      if (profile.language === 'MIX') langCode = 'ES'; // Default Mix to Spanish if not specified
      else langCode = profile.language;
  }

  const prompt = `Write a high-impact LinkedIn post about "${topic}".
  Author: ${profile.name} (${profile.role}).
  Tone: ${tone}.
  Language: Write ONLY in ${langCode === 'EN' ? 'English' : 'Spanish'}. DO NOT MIX LANGUAGES.
  ${newsContext ? `Integrate this real news: "${newsContext}"` : ''}
  
  Structure:
  - Viral Hook (No "Hello connections", start directly with the value)
  - Body (Short paragraphs, valuable insights)
  - CTA (Question)
  
  Return JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    },
  });

  const text = response.text;
  if (!text) throw new Error("No text returned");
  return JSON.parse(text);
};

export const generateSmartImage = async (topic: string, format: ContentFormat, profile: UserProfile): Promise<string> => {
  
  const model = "gemini-3-pro-image-preview"; 
  const aspectRatio = "16:9";
  
  let promptText = "";
  const parts: any[] = [];

  // Helper to extract clean base64
  const getCleanBase64 = (url: string) => url.split(',')[1] || url;

  switch (format) {
    case ContentFormat.DATA_VISUALIZATION:
      // FIXED: Moved away from "charts" to "Abstract Tech Art". 
      // This avoids garbled text.
      promptText = `Abstract 3D glass shapes floating in a clean environment. 
      Concept: ${topic}. 
      Style: Microsoft Fluent Design, frosted glass, neon accents, soft studio lighting. 
      Colors: Blue, White, Silver. 
      NO TEXT, NO NUMBERS, NO CHARTS. Just abstract art.`;
      break;

    case ContentFormat.PERSONAL_PHOTO:
      if (profile.headshotUrl) {
         parts.push({
             inlineData: {
                 data: getCleanBase64(profile.headshotUrl),
                 mimeType: "image/jpeg"
             }
         });
         promptText = `A high-quality professional photo of this person working in a modern office with large windows.
         Lighting: Natural daylight, soft shadows.
         Action: Typing on a laptop or drinking coffee.
         Context: ${topic}.
         The person in the image must resemble the reference face.`;
      } else {
         promptText = `A high-quality stock photo of a professional working on a laptop in a modern bright office.
         Style: Unsplash business style, shallow depth of field.
         Context: ${topic}.`;
      }
      break;

    case ContentFormat.CAROUSEL_DESIGN:
      // FIXED: Just background textures.
      promptText = `A clean, minimalist geometric background texture. 
      Concept: ${topic}.
      Style: Swiss Graphic Design.
      Colors: Corporate Navy Blue and White.
      NO TEXT.`;
      break;
      
    case ContentFormat.REALISTIC_OFFICE:
      promptText = `A photography of a modern Silicon Valley office interior. 
      Empty meeting room with glass walls, or a busy open plan space.
      Style: Architectural photography, 8k resolution, symmetrical.`;
      break;

    case ContentFormat.CINEMATIC_PHOTO:
    default:
      promptText = `A cinematic close-up photograph representing: ${topic}. 
      Example: A close up of a hand holding a futuristic device, or a silhouette against a city skyline.
      Style: Dramatic lighting, high contrast, movie scene quality.`;
      break;
  }

  // Add text prompt to parts
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: { imageConfig: { aspectRatio: aspectRatio } }
    });

    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      return `data:image/png;base64,${response.candidates[0].content.parts[0].inlineData.data}`;
    }
    return `https://picsum.photos/800/800?random=${Math.random()}`;
  } catch (e) {
    console.error("Image gen error", e);
    return `https://picsum.photos/800/800?random=${Math.random()}`;
  }
};