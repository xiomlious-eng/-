import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an expert study assistant named 'Cognita'. 
Your goal is to explain complex topics clearly and concisely for a student. 
Use examples, analogies, and structured formatting like lists or bullet points where helpful. 
Be encouraging and supportive. When asked to format something, use markdown.`;

let aiInstance: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (!aiInstance) {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiInstance;
}

export const startChatSession = (): Chat | null => {
  try {
    const ai = getAiInstance();
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return chat;
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
    return null;
  }
};

export const getGoogleAI = () => {
    try {
        return getAiInstance();
    } catch(error) {
        console.error("Failed to initialize Gemini AI:", error);
        return null;
    }
}