import { describe, it, expect, vi } from 'vitest';
import { callGemini, parseJSON } from './gemini';

describe('LexGuard API Engine', () => {
  it('should define the primary API call interface', () => {
    expect(typeof callGemini).toBe('function');
  });

  it('should parse valid JSON correctly', () => {
    const raw = '```json\n{"score": 85}\n```';
    const parsed = parseJSON(raw);
    expect(parsed).toEqual({ score: 85 });
  });

  it('should handle malformed JSON gracefully by returning null', () => {
    const badJson = '{ score: 85'; // missing quotes
    expect(parseJSON(badJson)).toBeNull();
  });
});
