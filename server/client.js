import { GoogleGenAI } from '@google/genai';

/**
 * Instantiates the GoogleGenAI SDK client configured for Google Cloud Vertex AI.
 * Requires the GOOGLE_CLOUD_PROJECT environment variable.
 */
export function createVertexClient() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project || project.trim() === '') {
    throw new Error('Vertex AI Configuration Error: GOOGLE_CLOUD_PROJECT is required but not set.');
  }

  return new GoogleGenAI({
    vertexai: true,
    project,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'global'
  });
}
