import { createVertexClient } from './client.js';
import { createApp } from './app.js';
import dotenv from 'dotenv';

// Load local environment variables for development.
// In production, GOOGLE_CLOUD_PROJECT is automatically set on Cloud Run.
dotenv.config();

let ai;
try {
  ai = createVertexClient();
} catch (error) {
  // Fail fast: Log the error and exit before starting the web server.
  console.error(`Startup Failure: ${error.message}`);
  process.exit(1);
}

/**
 * Generation function mapping to the Vertex AI GoogleGenAI client.
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

// Instantiate and start Express application
const app = createApp({ generateContentFn });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
