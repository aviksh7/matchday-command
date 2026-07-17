import { describe, expect, it, vi } from 'vitest';
import {
  createGenerateContentFn,
  VERTEX_REQUEST_TIMEOUT_MS
} from '../generator.js';

describe('Vertex AI generator adapter', () => {
  it('forwards the prompt, system instruction, schema, model, and a sub-20-second SDK timeout', async () => {
    const responseText = JSON.stringify({ summary: 'Grounded response.' });
    const generateContent = vi.fn().mockResolvedValue({ text: responseText });
    const ai = { models: { generateContent } };
    const prompt = 'Use only the supplied simulated venue context.';
    const systemInstruction = 'Return grounded JSON only.';
    const responseSchema = {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING' }
      },
      required: ['summary']
    };

    const result = await createGenerateContentFn(ai)(
      prompt,
      systemInstruction,
      responseSchema
    );

    expect(result).toBe(responseText);
    expect(VERTEX_REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
    expect(VERTEX_REQUEST_TIMEOUT_MS).toBeLessThan(20_000);
    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateContent).toHaveBeenCalledWith({
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
  });

  it.each([undefined, null, 42, ' \n\t '])(
    'rejects a missing, non-string, or blank model response %#',
    async (responseText) => {
      const ai = {
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: responseText })
        }
      };

      await expect(
        createGenerateContentFn(ai)('prompt', 'system instruction', {})
      ).rejects.toThrow('Vertex AI returned an empty response.');
    }
  );
});
