export const VERTEX_REQUEST_TIMEOUT_MS = 15_000;

/**
 * Creates the small Vertex AI adapter used by the Express application.
 * The SDK timeout stays below the browser client's 20-second fallback deadline.
 */
export function createGenerateContentFn(ai) {
  return async (prompt, systemInstruction, responseSchema) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.1,
        maxOutputTokens: 1024,
        httpOptions: {
          timeout: VERTEX_REQUEST_TIMEOUT_MS
        }
      }
    });

    if (typeof response.text !== 'string' || response.text.trim().length === 0) {
      throw new Error('Vertex AI returned an empty response.');
    }

    return response.text;
  };
}
