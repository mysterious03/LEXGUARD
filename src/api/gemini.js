/**
 * LexGuard API Engine
 * ──────────────────────────────────────────────────────────
 * Provider Chain:  Groq (primary, ultra-fast)
 *               → Gemini Flash (fallback on rate-limit / timeout)
 *
 * Retry Strategy: exponential backoff with jitter (3 attempts per provider)
 * Timeout Guard:  30s per request, 90s total per agent call
 */

// ─── API Keys ──────────────────────────────────────────────
const GROQ_KEY   = import.meta.env?.VITE_GROQ_KEY || process.env.VITE_GROQ_KEY || "";
const GEMINI_KEY = import.meta.env?.VITE_GEMINI_KEY || process.env.VITE_GEMINI_KEY || "";

// ─── Models ────────────────────────────────────────────────
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-2.0-flash";

export const FLASH = GROQ_MODEL;
export const PRO   = GROQ_MODEL;

// ─── CORS Bypass Engine ────────────────────────────────────
const isBrowser = typeof window !== 'undefined';
const GROQ_ENDPOINT = isBrowser 
  ? "/api-groq/openai/v1/chat/completions" 
  : "https://api.groq.com/openai/v1/chat/completions";

// ─── Internal: fetch with hard timeout ─────────────────────
async function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    if (err.name === "AbortError") throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    throw err;
  }
}

// ─── Internal: sleep with jitter ───────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jitter = (base) => base + Math.random() * (base * 0.4);

// ─── Provider 1: Groq ──────────────────────────────────────
async function callGroq(prompt, attempt = 0) {
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "You must always return raw JSON. No markdown formatting, no explanations, no code blocks." },
      { role: "user",   content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" }
  };

  console.log(`[GROQ] Attempt ${attempt + 1}/${3} → ${GROQ_MODEL} (Endpoint: ${GROQ_ENDPOINT})`);
  const t = Date.now();

  const res = await fetchWithTimeout(
    GROQ_ENDPOINT,
    {
      method:  "POST",
      headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body:    JSON.stringify(body)
    },
    28000
  );

  const data = await res.json();


  if (data.error) {
    const msg  = data.error.message || JSON.stringify(data.error);
    const code = data.error.code || "";
    // Rate-limit → signal caller to switch provider
    if (res.status === 429 || code === "rate_limit_exceeded") {
      throw Object.assign(new Error(`GROQ_RATE_LIMIT: ${msg}`), { isRateLimit: true });
    }
    throw new Error(`GROQ_API_ERROR: ${msg}`);
  }

  const output = data.choices?.[0]?.message?.content ?? "";
  if (!output) throw new Error("GROQ_EMPTY_RESPONSE");

  console.log(`[GROQ] ✓ ${Date.now() - t}ms | ${output.length} chars`);
  return output;
}

// ─── Provider 2: Gemini Flash ──────────────────────────────
async function callGeminiFlash(prompt, attempt = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature:     0.3,
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    },
    systemInstruction: {
      parts: [{ text: "You must always return raw JSON. No markdown formatting, no explanations, no code blocks." }]
    }
  };

  console.log(`[GEMINI] Attempt ${attempt + 1}/${3} → ${GEMINI_MODEL}`);
  const t = Date.now();

  const res = await fetchWithTimeout(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body)
  }, 28000);

  const data = await res.json();

  if (data.error) {
    const msg = data.error.message || JSON.stringify(data.error);
    if (res.status === 429) {
      throw Object.assign(new Error(`GEMINI_RATE_LIMIT: ${msg}`), { isRateLimit: true });
    }
    throw new Error(`GEMINI_API_ERROR: ${msg}`);
  }

  const output = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!output) throw new Error("GEMINI_EMPTY_RESPONSE");

  console.log(`[GEMINI] ✓ ${Date.now() - t}ms | ${output.length} chars`);
  return output;
}

// ─── Core: Resilient call with retry + failover ─────────────
/**
 * callGemini(model, prompt)
 * Maintains backward-compatible API used by agents.js
 * Strategy: Groq x3 → Gemini x3 before final throw
 */
export async function callGemini(_model, prompt) {
  const MAX_RETRIES = 3;

  // ── Phase 1: Try Groq ────────────────────────────────────
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      if (i > 0) await sleep(jitter(600 * Math.pow(2, i - 1))); // 600ms, 1.2s backoff
      return await callGroq(prompt, i);
    } catch (err) {
      console.warn(`[GROQ] Attempt ${i + 1} failed: ${err.message}`);
      // On rate-limit don't wait long, switch to Gemini immediately after 1 try
      if (err.isRateLimit && i >= 0) {
        console.log("[ENGINE] Groq rate-limited → switching to Gemini fallback");
        break;
      }
      if (i === MAX_RETRIES - 1) {
        console.warn("[ENGINE] Groq exhausted all retries → switching to Gemini fallback");
      }
    }
  }

  // ── Phase 2: Fallback to Gemini ──────────────────────────
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      if (i > 0) await sleep(jitter(800 * Math.pow(2, i - 1))); // 800ms, 1.6s backoff
      return await callGeminiFlash(prompt, i);
    } catch (err) {
      console.warn(`[GEMINI] Attempt ${i + 1} failed: ${err.message}`);
      if (i === MAX_RETRIES - 1) {
        throw new Error(
          `[LexGuard Engine] All providers exhausted. Last error: ${err.message}`
        );
      }
    }
  }

  throw new Error("[LexGuard Engine] Unexpected exit from provider chain");
}

// ─── JSON Parser ───────────────────────────────────────────
export function parseJSON(text) {
  if (!text) return null;
  // 1. Strip all markdown fences (handles ```json ... ``` and ``` ... ```)
  let cleaned = text
    .replace(/^```(?:json)?[\s\S]*?```$/im, m => m.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''))
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();

  // 2. Direct parse
  try { return JSON.parse(cleaned); } catch { /* try harder */ }

  // 3. Extract array first (greedy), then object
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch { /* try object */ }
  }
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      // Unwrap if object contains an array value
      const inner = Object.values(parsed).find(v => Array.isArray(v));
      return inner ?? parsed;
    } catch { /* fall through */ }
  }

  console.error("[parseJSON] All extraction strategies failed:", cleaned.slice(0, 300));
  return null;
}
