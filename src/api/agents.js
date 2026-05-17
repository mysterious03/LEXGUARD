/**
 * LexGuard Agent Chain
 * Every agent calls Gemini API with the REAL output of the previous agent as input.
 * Chain: splitClauses → prosecute → defend(uses prosecutor) → judgeClause(uses both) 
 *        → runWarRoom(uses judge) → simulateFuture(uses everything)
 */

import { callGemini, parseJSON, FLASH } from './gemini';

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
/**
 * Agent 1: Clause Splitter
 * Ingests a raw legal document and extracts individually typed clauses.
 *
 * @param {string} documentText - The raw text of the legal contract.
 * @returns {Promise<Array<{id: number, type: string, text: string}>>} Array of parsed clauses.
 * @throws {Error} If parsing fails or the LLM returns invalid JSON.
 */
// ─────────────────────────────────────────────────────────
export async function splitClauses(documentText) {
  const prompt = `You are an expert Indian legal document parser.
Your ONLY output must be a valid JSON object containing a "clauses" array. No markdown, no explanations.

CLAUSE TYPES you must use (pick the most specific):
IP_OWNERSHIP | NON_COMPETE | DATA_PRIVACY | LIABILITY | TERMINATION | PAYMENT | OTHER

Example of CORRECT output format:
{
  "clauses": [
    {"id":1,"type":"IP_OWNERSHIP","text":"All inventions created during employment..."},
    {"id":2,"type":"NON_COMPETE","text":"Employee agrees not to work for competitors..."}
  ]
}

DOCUMENT TO ANALYZE:
"""
${documentText.slice(0, 3000)}
"""

CRITICAL RULES:
- Output MUST be a valid JSON object with a single "clauses" array.
- Include FULL verbatim text of each clause.
- Do not truncate the text.`;

  const raw = await callGemini(FLASH, prompt);
  let parsed = parseJSON(raw);

  // Safely extract the array whether it's at the root or inside a property
  let finalArray = null;
  if (Array.isArray(parsed)) {
    finalArray = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // Check common wrapper keys
    if (Array.isArray(parsed.clauses)) finalArray = parsed.clauses;
    else if (Array.isArray(parsed.output)) {
      // If LLM returned a stringified array inside output, parse it
      if (typeof parsed.output === 'string') {
        try { finalArray = JSON.parse(parsed.output); } catch (e) { /* ignore */ }
      } else {
        finalArray = parsed.output;
      }
    } else {
      // Find any array value
      finalArray = Object.values(parsed).find(v => Array.isArray(v));
    }
  }

  // Final fallback: if LLM stringified the array inside parsed.output string
  if (!finalArray && parsed && typeof parsed.output === 'string') {
     try { finalArray = JSON.parse(parsed.output); } catch (e) { }
  }

  if (!finalArray || !Array.isArray(finalArray) || finalArray.length === 0) {
    throw new Error(`ClauseSplitter: Failed to parse clauses. Raw response: ${JSON.stringify(raw)?.slice(0, 300)}`);
  }
  
  console.log(`[ClauseSplitter] ✓ Parsed ${finalArray.length} clauses`);
  return finalArray;
}


// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
/**
 * Agent 2: Prosecutor
 * Aggressively attacks the clause from the perspective of an employee-rights lawyer.
 *
 * @param {Object} clause - The clause object from the ClauseSplitter.
 * @param {string} clause.type - The category of the clause (e.g. NON_COMPETE).
 * @param {string} clause.text - The actual text of the clause.
 * @returns {Promise<{toxicKeywords: string[], extremeScenario: string, indianLawConflict: string, prosecutorScore: number}>} Prosecutor analysis.
 */
// ─────────────────────────────────────────────────────────
export async function prosecute(clause) {
  const prompt = `You are a fierce Indian employment lawyer protecting the EMPLOYEE.
Your job: attack this contract clause and expose every hidden risk, trap, and exploitation.

CLAUSE TYPE: ${clause.type}
CLAUSE TEXT:
"""
${clause.text}
"""

Analyze against:
- Indian Contract Act 1872 (S.27 for non-competes, S.23 for void agreements)
- Copyright Act 1957 (S.17 for employer IP ownership)  
- DPDP Act 2023 (digital personal data protection)
- IT Act 2000 (S.43, S.66 for data breach liability)
- Industrial Disputes Act 1947 (termination protections)
- Payment of Wages Act (salary clawbacks)

Return ONLY raw JSON (absolutely no markdown, no code blocks):
{
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE",
  "riskType": "specific name of the legal risk (e.g. Unlimited IP Assignment, Unconscionable Liability)",
  "riskKeywords": ["exact phrase from clause text that is dangerous", "another dangerous phrase"],
  "plainEnglish": "What this clause really means in plain language (max 15 words)",
  "indianLawNote": "Which specific Indian law this violates and how (1-2 sentences)",
  "enforceableInIndia": true | false | "partial",
  "worstCase": "Exactly what happens to the employee if they sign and this is enforced (2 sentences)",
  "negotiationLeverage": "What specific language the employee should demand be removed or changed"
}

riskKeywords MUST be exact words/phrases copied verbatim from the clause text above.`;

  const raw = await callGemini(FLASH, prompt);
  const result = parseJSON(raw);
  if (!result || !result.riskLevel) {
    throw new Error(`ProsecutorAgent: Invalid JSON response. Raw: ${raw.slice(0, 300)}`);
  }
  console.log('[ProsecutorAgent] Result:', result.riskLevel, result.riskType);
  return result;
}

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
/**
 * Agent 3: Defender
 * Defends the clause from the perspective of corporate counsel, offering reasonable amendments.
 *
 * @param {Object} clause - The original clause.
 * @param {Object} prosecution - The output from the Prosecutor agent.
 * @returns {Promise<{marketStandardJustification: string, reasonableAmendment: string, defenderScore: number}>} Defender arguments and amendments.
 */
// ─────────────────────────────────────────────────────────
export async function defend(clause, prosecutorOutput) {
  const prompt = `You are a senior corporate lawyer defending this contract clause for an Indian company.
The Prosecutor just made specific arguments — you must respond to EACH ONE directly.

CLAUSE TYPE: ${clause.type}
CLAUSE TEXT (first 600 chars):
"""
${(clause.text || '').slice(0, 600)}
"""

PROSECUTOR'S CASE AGAINST THIS CLAUSE:
- Risk Level Claimed: ${prosecutorOutput.riskLevel}
- Risk Type: ${prosecutorOutput.riskType}
- Toxic Phrases Flagged: ${(prosecutorOutput.riskKeywords || []).join(', ')}
- Indian Law Violation Claimed: ${prosecutorOutput.indianLawNote}
- Worst Case Claimed: ${prosecutorOutput.worstCase}
- Plain English Summary: ${prosecutorOutput.plainEnglish}

YOUR DEFENSE TASK:
1. Is this risk OVERSTATED? Compare to actual market practice at Infosys, TCS, Wipro, Zepto, Razorpay, Swiggy.
2. Which of the prosecutor's "toxic phrases" are actually standard boilerplate?
3. What is the LEGITIMATE business reason this clause exists?
4. Does Indian case law actually support enforcement of this clause?

Return ONLY raw JSON (no markdown):
{
  "challenge": "Your direct rebuttal to the prosecutor's main argument (2-3 sentences, specific)",
  "adjustedRiskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE",
  "isStandardPractice": true | false,
  "standardPracticeNote": "Which specific Indian companies use similar clauses and in what context",
  "defensiblePhrases": ["phrase from clause that is actually standard", "another defensible phrase"],
  "indefensiblePhrases": ["phrase even the defense cannot justify", "another overreach"],
  "proposedAmendment": "The exact language change that would make this clause acceptable to both parties"
}`;

  const raw = await callGemini(FLASH, prompt);
  const result = parseJSON(raw);
  if (!result || !result.challenge) {
    throw new Error(`DefenderAgent: Invalid JSON response. Raw: ${raw.slice(0, 300)}`);
  }
  console.log('[DefenderAgent] Standard practice:', result.isStandardPractice, '| Adjusted risk:', result.adjustedRiskLevel);
  return result;
}

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
/**
 * Agent 4: Judge
 * Weighs both arguments and issues a final, impartial verdict on the safety of the clause.
 *
 * @param {Object} clause - The original clause.
 * @param {Object} prosecution - The Prosecutor's analysis.
 * @param {Object} defense - The Defender's analysis.
 * @returns {Promise<{dangerScore: number, finalVerdict: string, theTrap: string}>} Judicial verdict and computed danger score (0-100).
 */
// ─────────────────────────────────────────────────────────
export async function judgeClause(clause, prosecutorOutput, defenderOutput) {
  const prompt = `You are a retired Chief Justice of the Madras High Court, now an arbitrator specializing in Indian employment law disputes.
You have heard both sides. You must now deliver a FINAL, BINDING verdict.

═══════════════════════════════════
CLAUSE UNDER REVIEW (${clause.type}):
"""
${(clause.text || '').slice(0, 400)}
"""

═══════════════════════════════════
PROSECUTION ARGUED:
• Risk Level: ${prosecutorOutput.riskLevel}
• Risk Type: ${prosecutorOutput.riskType}
• Toxic Phrases: ${(prosecutorOutput.riskKeywords || []).join(' | ')}
• Indian Law Violation: ${prosecutorOutput.indianLawNote}
• Worst Case for Employee: ${prosecutorOutput.worstCase}
• Negotiation Leverage: ${prosecutorOutput.negotiationLeverage || 'Not specified'}

═══════════════════════════════════
DEFENSE ARGUED:
• Challenge: ${defenderOutput.challenge}
• Adjusted Risk: ${defenderOutput.adjustedRiskLevel}
• Is Standard Practice: ${defenderOutput.isStandardPractice}
• Market Comparison: ${defenderOutput.standardPracticeNote}
• Defensible Phrases: ${(defenderOutput.defensiblePhrases || []).join(' | ')}
• Indefensible Phrases: ${(defenderOutput.indefensiblePhrases || []).join(' | ')}
• Proposed Amendment: ${defenderOutput.proposedAmendment || 'None proposed'}

═══════════════════════════════════
YOUR VERDICT — weigh both sides and give a FINAL ruling for an Indian employee:

Return ONLY raw JSON (no markdown):
{
  "finalRiskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE",
  "riskScore": <integer 0-100>,
  "plainEnglishVerdict": "Your final ruling in plain language (max 25 words)",
  "keyFinding": "The single most important legal finding that decided this verdict (1 sentence)",
  "actionRequired": "REFUSE_TO_SIGN" | "NEGOTIATE_THIS" | "SIGN_WITH_CAUTION" | "SAFE_TO_SIGN",
  "specificDemands": ["Exact clause change the employee must demand before signing", "Another specific demand"],
  "indefensibleElements": ["Parts of clause the defense could not justify", "Another overreach"],
  "judgesNote": "A direct warning to the employee in plain language (1-2 sentences)"
}

riskScore guide: CRITICAL = 76-100, HIGH = 51-75, MEDIUM = 26-50, SAFE = 0-25`;

  const raw = await callGemini(FLASH, prompt);
  const result = parseJSON(raw);
  if (!result || !result.finalRiskLevel) {
    throw new Error(`JudgeAgent: Invalid JSON response. Raw: ${raw.slice(0, 300)}`);
  }
  console.log('[JudgeAgent] Final verdict:', result.finalRiskLevel, '| Score:', result.riskScore, '| Action:', result.requiredAction);
  return result;
}

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
/**
 * Agent 5: HR War Room Simulator
 * Simulates a multi-round email negotiation between the employee and HR.
 *
 * @param {Object} clause - The original clause.
 * @param {Object} judgeData - The verdict from the Judge agent.
 * @returns {Promise<Array<{round: number, actor: string, data: Object}>>} Array of negotiation rounds.
 */
// ─────────────────────────────────────────────────────────
export async function runWarRoom(clause, judgeOutput, userRole, onRoundComplete) {
  // Round 1: Employee's negotiation email (uses judge verdict as basis)
  let round1 = null;
  const prompt1 = `You are a ${userRole} who just received a legal analysis of your employment contract.
The Judge's ruling: ${judgeOutput.finalRiskLevel} RISK — "${judgeOutput.plainEnglishVerdict}"
Action required: ${judgeOutput.actionRequired?.replace(/_/g, ' ')}
Specific demands the judge says you must make:
${(judgeOutput.specificDemands || []).map((d, i) => `${i+1}. ${d}`).join('\n')}

Write a professional, firm negotiation email to HR requesting specific changes to this clause:
"""
${clause.text.slice(0, 500)}
"""

The email must:
- Reference the specific problematic language (e.g. "irrevocable", "unlimited liability")
- Propose EXACT replacement language based on the judge's demands
- Be professional but non-negotiable in tone
- Under 150 words

Return ONLY raw JSON: { "subject": "email subject line", "email": "full email body text" }`;

  round1 = await callGemini(FLASH, prompt1).then(raw => parseJSON(raw));
  if (round1) onRoundComplete(1, round1);

  // Round 2: HR pushback (uses employee email as input)
  let round2 = null;
  if (round1?.email) {
    const prompt2 = `You are the Senior HR Manager at a mid-sized Indian tech company.
A candidate sent you this negotiation email:
"""
Subject: ${round1.subject}
${round1.email}
"""

They are asking about this specific contract clause:
"""
${clause.text.slice(0, 300)}
"""

Respond as a REAL HR manager would — professional, defensive, try to dismiss their concerns.
Use typical corporate deflections: "this is industry standard", "our legal team has reviewed this", "we cannot modify standard agreements".
BUT also grudgingly acknowledge if one of their points is valid.
Under 100 words.

Return ONLY raw JSON: { "hrResponse": "full HR response text" }`;

    round2 = await callGemini(FLASH, prompt2).then(raw => parseJSON(raw));
    if (round2) onRoundComplete(2, round2);
  }

  // Round 3: Employee counter (uses HR response + original email as input)
  let round3 = null;
  if (round1?.email && round2?.hrResponse) {
    const prompt3 = `You are helping this ${userRole} write their FINAL counter-argument to HR.
Context:
- Original contract clause risk: ${judgeOutput.finalRiskLevel} — "${judgeOutput.keyFinding || judgeOutput.plainEnglishVerdict}"
- Judge's ruling: ${judgeOutput.actionRequired?.replace(/_/g, ' ')}
- Indefensible elements: ${(judgeOutput.indefensibleElements || []).join('; ')}

Your original email said:
"""
${round1.email}
"""

HR responded:
"""
${round2.hrResponse}
"""

Write a STRONG, fact-based counter-argument that:
1. Calls out HR's deflections by name ("'industry standard' is not a valid legal defense")
2. Cites 2-3 specific Indian companies (Zepto, Razorpay, CRED, Freshworks, PhonePe) that handle this differently
3. Quotes the specific Indian law that makes this clause problematic
4. Sets a clear deadline for response
Under 130 words.

Return ONLY raw JSON: { "counter": "full counter-argument text" }`;

    round3 = await callGemini(FLASH, prompt3).then(raw => parseJSON(raw));
    if (round3) onRoundComplete(3, round3);
  }

  return { round1, round2, round3 };
}

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
/**
 * Agent 6: Future Simulation Engine
 * Predicts the long-term consequences of signing the contract as-is.
 *
 * @param {Object} clause - The original clause.
 * @param {Object} judgeData - The verdict from the Judge agent.
 * @param {Array} warRoomData - The transcript from the War Room.
 * @returns {Promise<{courtroomSummary: string[], specificRisksIfSigned: string[], warRoomFailureImpact: string, finalRecommendation: string, futureTimeline: Array<{time: string, event: string}>}>} Future simulation payload.
 */
// ─────────────────────────────────────────────────────────
export async function simulateFuture(clause, prosecutorOutput, defenderOutput, judgeOutput, warRoomRounds, userRole, monthlySalaryRs) {
  const salary = Number(monthlySalaryRs) || 100000;

  // Build chain summary from all previous agents
  const chainContext = `
AGENT 1 (CLAUSE SPLITTER) OUTPUT:
- Clause Type: ${clause.type}
- Clause Text: "${clause.text.slice(0, 400)}..."

AGENT 2 (PROSECUTOR) OUTPUT:
- Risk Level: ${prosecutorOutput.riskLevel}
- Risk Type: ${prosecutorOutput.riskType}
- Toxic Phrases: ${(prosecutorOutput.riskKeywords || []).join(', ')}
- Indian Law Violation: ${prosecutorOutput.indianLawNote}
- Worst Case: ${prosecutorOutput.worstCase}

AGENT 3 (DEFENDER) OUTPUT:
- Defense Stance: ${defenderOutput.challenge}
- Is Standard Practice: ${defenderOutput.isStandardPractice ? 'YES' : 'NO'}
- Indefensible Elements: ${(defenderOutput.indefensiblePhrases || defenderOutput.indefensibleElements || []).join(', ')}
- Proposed Amendment: ${defenderOutput.proposedAmendment || 'None'}

AGENT 4 (JUDGE) OUTPUT:
- Final Risk Level: ${judgeOutput.finalRiskLevel}
- Risk Score: ${judgeOutput.riskScore}/100
- Judge's Verdict: "${judgeOutput.plainEnglishVerdict}"
- Key Finding: "${judgeOutput.keyFinding || 'See verdict'}"
- Action Required: ${judgeOutput.actionRequired?.replace(/_/g, ' ')}
- Judge's Warning: "${judgeOutput.judgesNote || 'Exercise extreme caution'}"

AGENT 5 (WAR ROOM) OUTPUT:
- Employee Email Sent: ${warRoomRounds[0]?.data?.subject || 'Sent'}
- HR Response: ${warRoomRounds[1]?.data?.hrResponse?.slice(0, 150) || 'HR dismissed concerns'}
- Negotiation Outcome: ${warRoomRounds[2] ? 'Employee counter-argument sent, HR remained firm' : 'Negotiation failed'}`;

  const prompt = `You are a Legal Consequence Prediction Engine powered by Indian employment law data.
Based on the FULL agentic analysis chain below, compute a realistic deterministic timeline of what happens to this employee if they sign this contract.

EMPLOYEE PROFILE:
- Role: ${userRole}
- Monthly Salary: Rs ${salary.toLocaleString()}
- Location: India

FULL ANALYSIS CHAIN:
${chainContext}

Compute a REALISTIC timeline of consequences. Be specific — use actual rupee amounts based on their salary.
Reference real Indian legal processes (Labour Court, High Court, arbitration timelines).

Return ONLY raw JSON (no markdown):
{
  "courtroomSummary": [
    "Key finding 1 from the entire analysis (specific, not generic)",
    "Key finding 2 with specific law reference",
    "Key finding 3 with financial implication"
  ],
  "futureTimeline": [
    { "time": "DAY 1", "event": "Specific event based on the actual clause analysis" },
    { "time": "3 MONTHS", "event": "What triggers first, based on this specific clause type" },
    { "time": "6 MONTHS", "event": "Next consequence" },
    { "time": "1 YEAR", "event": "Escalation point" },
    { "time": "2 YEARS", "event": "Final legal resolution" }
  ],
  "warRoomFailureImpact": "Specifically how the failed HR negotiation (their response: '${warRoomRounds[1]?.data?.hrResponse?.slice(0, 80) || 'dismissed concerns'}') directly led to this outcome",
  "financialDamage": "Rs X (calculated: e.g. 18 months salary = Rs ${(salary * 18).toLocaleString()} + legal fees)",
  "escalationProbability": <integer 1-99, based on risk score ${judgeOutput.riskScore}>,
  "negotiationSuccessProbability": <integer 1-99>,
  "finalRecommendation": "Specific action in 5-8 words",
  "specificRisksIfSigned": [
    "Risk 1 specific to ${clause.type} clause",
    "Risk 2 with timeline",
    "Risk 3 with rupee amount"
  ],
  "indianCase": "One real or highly representative Indian court case about ${clause.type} disputes and its outcome in one sentence"
}`;

  const raw = await callGemini(FLASH, prompt);
  const result = parseJSON(raw);
  if (!result || !result.futureTimeline) {
    throw new Error(`FutureSim: Invalid JSON. Raw: ${raw.slice(0, 300)}`);
  }
  console.log('[FutureSim] Recommendation:', result.finalRecommendation, '| Escalation:', result.escalationProbability + '%');

  // ── SERP API: Fetch real Indian court cases in real-time ──────────
  const SERP_KEY = "e308d24f710bcef82ce75df292e254fe519ec89c89679782c5cb363e42e3297f";
  try {
    const clauseLabel = clause.type.replace(/_/g, '+');
    const q = encodeURIComponent(`${clause.type.replace(/_/g, ' ')} employment contract dispute India Supreme Court High Court`);
    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${q}&gl=in&hl=en&num=3&api_key=${SERP_KEY}`;
    console.log(`[SerpAPI] Searching real cases for ${clause.type}...`);
    const serpRes = await fetch(serpUrl);
    const serpData = await serpRes.json();
    if (serpData.organic_results && serpData.organic_results.length > 0) {
      const top = serpData.organic_results[0];
      result.indianCase = `[LIVE] ${top.title} — ${top.snippet?.slice(0, 120) || ''}`;
      result.indianCaseUrl = top.link || null;
      // Also pull second result for richer context
      if (serpData.organic_results[1]) {
        const second = serpData.organic_results[1];
        result.indianCaseAlt = `[LIVE] ${second.title} — ${second.snippet?.slice(0, 100) || ''}`;
      }
      console.log('[SerpAPI] ✓ Real case found:', top.title);
    } else {
      console.warn('[SerpAPI] No organic results returned');
    }
  } catch (serpErr) {
    console.error('[SerpAPI] Search failed (using AI-generated case):', serpErr.message);
  }

  return result;
}

// ─────────────────────────────────────────────────────────
// HELPER: Calculate financial exposure from salary
// ─────────────────────────────────────────────────────────
export function calculateRs(clauseType, monthlySalaryRs) {
  const salary = Number(monthlySalaryRs) || 100000;
  const table = {
    IP_OWNERSHIP:  [salary * 12, salary * 40],
    NON_COMPETE:   [salary * 6,  salary * 24],
    DATA_PRIVACY:  [500000, 25000000],
    LIABILITY:     [salary * 3,  salary * 12],
    PAYMENT:       [salary * 2,  salary * 8],
    TERMINATION:   [salary,      salary * 3],
    OTHER:         [salary * 2,  salary * 6],
  };
  const [min, max] = table[clauseType] ?? table.OTHER;
  const fmt = (n) => n >= 10000000 ? `Rs ${(n / 10000000).toFixed(1)} Cr` : `Rs ${(n / 100000).toFixed(1)} L`;
  return { min: fmt(min), max: fmt(max) };
}
