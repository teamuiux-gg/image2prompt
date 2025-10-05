
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PromptMode, UploadedFile } from '../types';

// Helper function to convert File to a Gemini-compatible format
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error("Failed to read file as a data URL."));
      }
    };
    reader.onerror = (error) => {
        reject(error);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const generatePrompts = async (files: UploadedFile[], mode: PromptMode): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (files.length === 0) {
    return "Please upload at least one image.";
  }

  try {
    if (mode === PromptMode.Unified) {
      const prompt = "Analyze all the following images and generate a single, unified, and detailed descriptive prompt that could be used to create a similar cohesive image or scene. Focus on the overall style, mood, color palette, subject matter, and composition.";
      
      const imageParts = await Promise.all(files.map(f => fileToGenerativePart(f.file)));
      
      const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }, ...imageParts] }
      });
      
      return response.text;

    } else { // Separate prompts
      const allPrompts: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const prompt = "Analyze the following image and generate a detailed descriptive prompt that could be used to recreate it. Focus on style, mood, color palette, subject matter, and composition.";

        const imagePart = await fileToGenerativePart(file.file);

        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }, imagePart] }
        });

        allPrompts.push(`Prompt for Image ${i + 1}:\n${response.text}`);
      }
      return allPrompts.join('\n\n---\n\n');
    }
  } catch (error) {
    console.error("Error generating prompts:", error);
    if (error instanceof Error) {
        return `An error occurred while generating prompts: ${error.message}`;
    }
    return "An unknown error occurred while generating prompts.";
  }
};
