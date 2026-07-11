import { GoogleGenAI } from '@google/genai';
import { createApp } from './app.js';
import dotenv from 'dotenv';

// Load local environment variables (if any) for development.
// In production, environments like Google Cloud Run inject keys from Secret Manager.
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Google Gen AI client.
// It will attempt to read GEMINI_API_KEY from environment variables.
const ai = new GoogleGenAI({ apiKey });

/**
 * Concrete generation function using the official @google/genai client.
 */
const generateContentFn = async (prompt, systemInstruction, responseSchema) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.1,
      maxOutputTokens: 1024
    }
  });
  return response.text;
};

// Instantiate the Express app with the production generator function.
const app = createApp({ generateContentFn });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
