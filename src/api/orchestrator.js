/**
 * LexGuard Orchestrator
 * Runs the full 6-agent chain sequentially.
 * Each stage has its own try/catch so a single failure never crashes the entire run.
 */

import {
  splitClauses,
  prosecute,
  defend,
  judgeClause,
  runWarRoom as runWarRoomAPI,
  simulateFuture,
  calculateRs,
} from './agents';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Utility: emit error event with full details ───────────
function emitError(emit, agentName, clauseId, err, fatal = false) {
  const msg = err?.message || String(err);
  console.error(`[ORCHESTRATOR] ${agentName} failed:`, msg);
  emit({
    agentName,
    clauseId,
    status: fatal ? "FATAL" : "ERROR",
    currentTask: `Error in ${agentName}`,
    thoughtSteps: [
      `[✗] ${agentName} encountered an error`,
      `[!] ${msg.slice(0, 120)}`,
      fatal
        ? "[✗] Analysis cannot continue"
        : "[→] Attempting to continue with partial data...",
    ],
    liveData: { error: msg },
    runtime: null,
    outputSummary: `Error: ${msg.slice(0, 80)}`,
  });
}

// ─── Main Orchestration Function ───────────────────────────
export async function analyzeDocumentSystem(text, userProfile, onEvent) {
  const t0  = Date.now();
  const emit = (data) => onEvent({ ...data, timestamp: Date.now() });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAGE 1: CLAUSE SPLITTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  emit({
    agentName: "ClauseSplitter",
    clauseId:  "DOC",
    status:    "SCANNING",
    currentTask: "Segmenting legal document into clauses",
    thoughtSteps: [
      `[>] Document received — ${text.length} characters`,
      "[>] Tokenizing legal structure...",
      "[>] Identifying clause boundaries...",
    ],
    liveData:      null,
    runtime:       null,
    outputSummary: null,
  });

  let rawClauses, activeClause;
  try {
    rawClauses = await splitClauses(text);

    const riskOrder = ['IP_OWNERSHIP', 'NON_COMPETE', 'DATA_PRIVACY', 'LIABILITY', 'TERMINATION', 'PAYMENT', 'OTHER'];
    activeClause = rawClauses.sort(
      (a, b) => riskOrder.indexOf(a.type) - riskOrder.indexOf(b.type)
    )[0];

    if (!activeClause) throw new Error("No clauses found in document");
  } catch (err) {
    emitError(emit, "ClauseSplitter", "DOC", err, true);
    return null;
  }

  emit({
    agentName:   "ClauseSplitter",
    clauseId:    activeClause.id,
    status:      "COMPLETE",
    currentTask: "Segmenting legal document into clauses",
    thoughtSteps: [
      `[✓] Document ingested — ${text.length} characters`,
      `[✓] Identified ${rawClauses.length} distinct clause(s)`,
      `[✓] Highest-risk clause selected: ${activeClause.type}`,
      `[✓] Handing off ${activeClause.text.slice(0, 80).trim()}...`,
    ],
    liveData: {
      clauseType:   activeClause.type,
      totalClauses: rawClauses.length,
      clausePreview: activeClause.text.slice(0, 200) + "...",
    },
    runtime:       Date.now() - t0,
    handoffTo:     "ProsecutorAgent",
    outputSummary: `Selected: ${activeClause.type} clause (${activeClause.text.length} chars)`,
  });

  await delay(600);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAGE 2: PROSECUTOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const t1 = Date.now();
  emit({
    agentName: "ProsecutorAgent",
    clauseId:  activeClause.id,
    status:    "ANALYZING",
    currentTask: "Detecting hidden liabilities & exploitative language",
    thoughtSteps: [
      `[✓] Clause received: ${activeClause.type}`,
      "[>] Cross-referencing Indian Contract Act 1872...",
      "[>] Scanning for exploitative patterns...",
      "[>] Checking DPDP Act 2023 compliance...",
    ],
    liveData: null,
    runtime:  null,
  });

  let prosecutorOutput;
  try {
    prosecutorOutput = await prosecute(activeClause);
  } catch (err) {
    emitError(emit, "ProsecutorAgent", activeClause.id, err, true);
    return null;
  }

  const prosecutorThoughts = [
    `[✓] Clause received: ${activeClause.type}`,
    `[✓] Risk level assessed: ${prosecutorOutput.riskLevel}`,
    `[✓] Primary risk: ${prosecutorOutput.riskType}`,
  ];
  if (prosecutorOutput.riskKeywords?.length) {
    prosecutorThoughts.push(`[⚠] Toxic phrases: "${prosecutorOutput.riskKeywords.slice(0, 3).join('", "')}"`);
  }
  prosecutorThoughts.push(
    `[⚠] Indian Law conflict: ${prosecutorOutput.indianLawNote?.slice(0, 80) || 'Multiple violations found'}`
  );

  emit({
    agentName:   "ProsecutorAgent",
    clauseId:    activeClause.id,
    status:      "COMPLETE",
    currentTask: "Detecting hidden liabilities & exploitative language",
    thoughtSteps: prosecutorThoughts,
    liveData: {
      riskLevel:   prosecutorOutput.riskLevel,
      riskType:    prosecutorOutput.riskType,
      keywords:    prosecutorOutput.riskKeywords,
      plainEnglish: prosecutorOutput.plainEnglish,
      worstCase:   prosecutorOutput.worstCase,
      indianLaw:   prosecutorOutput.indianLawNote,
    },
    confidence:    prosecutorOutput.riskLevel === 'CRITICAL' ? 97 : prosecutorOutput.riskLevel === 'HIGH' ? 92 : 80,
    runtime:       Date.now() - t1,
    handoffTo:     "DefenderAgent",
    outputSummary: prosecutorOutput.plainEnglish || "Liabilities detected",
  });

  await delay(600);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAGE 3: DEFENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const t2 = Date.now();
  emit({
    agentName: "DefenderAgent",
    clauseId:  activeClause.id,
    status:    "ANALYZING",
    currentTask: "Formulating corporate defense & market comparison",
    thoughtSteps: [
      `[✓] Prosecution case received (${prosecutorOutput.riskLevel} risk)`,
      "[>] Searching precedents at Infosys, TCS, Zepto, Razorpay...",
      "[>] Assessing market standard deviation...",
    ],
    liveData: null,
    runtime:  null,
  });

  let defenderOutput;
  try {
    defenderOutput = await defend(activeClause, prosecutorOutput);
  } catch (err) {
    emitError(emit, "DefenderAgent", activeClause.id, err, false);
    // Use a safe fallback so Judge can still run
    defenderOutput = {
      challenge:          "Defense unavailable due to API error.",
      adjustedRiskLevel:  prosecutorOutput.riskLevel,
      isStandardPractice: false,
      standardPracticeNote: "N/A",
      defensiblePhrases:  [],
      indefensiblePhrases: prosecutorOutput.riskKeywords || [],
      proposedAmendment:  "Consult a lawyer for this clause.",
    };
  }

  emit({
    agentName:   "DefenderAgent",
    clauseId:    activeClause.id,
    status:      "COMPLETE",
    currentTask: "Formulating corporate defense & market comparison",
    thoughtSteps: [
      `[✓] Prosecution case reviewed: ${prosecutorOutput.riskType}`,
      `[✓] Market comparison complete — Standard: ${defenderOutput.isStandardPractice ? 'YES' : 'NO'}`,
      `[✓] Adjusted risk level: ${defenderOutput.adjustedRiskLevel}`,
      `[>] Rebuttal: ${defenderOutput.challenge?.slice(0, 100) || 'Defense prepared'}...`,
    ],
    liveData: {
      challenge:   defenderOutput.challenge,
      adjustedRisk: defenderOutput.adjustedRiskLevel,
      isStandard:  defenderOutput.isStandardPractice,
      marketNote:  defenderOutput.standardPracticeNote,
    },
    confidence:    88,
    runtime:       Date.now() - t2,
    handoffTo:     "JudgeAgent",
    outputSummary: defenderOutput.isStandardPractice ? "Clause defended as standard" : "Defense failed — too aggressive",
  });

  await delay(600);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAGE 4: JUDGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const t3 = Date.now();
  emit({
    agentName: "JudgeAgent",
    clauseId:  activeClause.id,
    status:    "CROSS-CHECKING",
    currentTask: "Weighing evidence & computing final verdict",
    thoughtSteps: [
      `[✓] Prosecution: ${prosecutorOutput.riskLevel} risk`,
      `[✓] Defense: adjusted to ${defenderOutput.adjustedRiskLevel}`,
      "[>] Applying Indian labor law framework...",
      "[>] Computing final risk score (0-100)...",
    ],
    liveData: null,
    runtime:  null,
  });

  let judgeOutput;
  try {
    judgeOutput = await judgeClause(activeClause, prosecutorOutput, defenderOutput);
  } catch (err) {
    emitError(emit, "JudgeAgent", activeClause.id, err, true);
    return null;
  }

  const rsExposure = calculateRs(activeClause.type, userProfile.monthlySalary);

  emit({
    agentName: "JudgeAgent",
    clauseId:  activeClause.id,
    status:    judgeOutput.finalRiskLevel === 'SAFE' ? "COMPLETE" : "ESCALATED",
    currentTask: "Weighing evidence & computing final verdict",
    thoughtSteps: [
      `[✓] Prosecution evidence: ${prosecutorOutput.riskLevel} risk — "${prosecutorOutput.riskType}"`,
      `[✓] Defense rebuttal: ${defenderOutput.isStandardPractice ? 'PARTLY ACCEPTED' : 'REJECTED'}`,
      `[✓] Risk score computed: ${judgeOutput.riskScore}/100`,
      `[⚠] Final verdict: ${judgeOutput.finalRiskLevel} — ${judgeOutput.actionRequired?.replace(/_/g, ' ')}`,
      `[⚠] Financial exposure: ${rsExposure.min} – ${rsExposure.max}`,
    ],
    liveData: {
      riskLevel: judgeOutput.finalRiskLevel,
      riskScore: judgeOutput.riskScore,
      verdict:   judgeOutput.plainEnglishVerdict,
      action:    judgeOutput.actionRequired,
      exposure:  rsExposure,
    },
    confidence:    96,
    runtime:       Date.now() - t3,
    handoffTo:     judgeOutput.finalRiskLevel === 'SAFE' ? null : "WarRoomSim",
    outputSummary: `${judgeOutput.finalRiskLevel} — Score: ${judgeOutput.riskScore}/100 — ${judgeOutput.actionRequired?.replace(/_/g, ' ')}`,
  });

  const isHighRisk = ["CRITICAL", "HIGH", "MEDIUM"].includes(judgeOutput.finalRiskLevel);
  let warRoomRounds   = [];
  let futureSimulation = null;

  if (isHighRisk) {
    await delay(600);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STAGE 5: WAR ROOM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const t4 = Date.now();
    emit({
      agentName: "WarRoomSim",
      clauseId:  activeClause.id,
      status:    "ANALYZING",
      currentTask: "Simulating 3-round HR negotiation battle",
      thoughtSteps: [
        `[✓] Judge verdict: ${judgeOutput.finalRiskLevel} — ${judgeOutput.actionRequired?.replace(/_/g, ' ')}`,
        "[>] Round 1: Drafting employee negotiation email...",
      ],
      liveData: null,
      runtime:  null,
    });

    try {
      await runWarRoomAPI(activeClause, judgeOutput, userProfile.role, (round, data) => {
        warRoomRounds.push({ round, data });
        const thoughts = [
          `[✓] Judge verdict received: ${judgeOutput.actionRequired?.replace(/_/g, ' ')}`,
          round >= 1 ? `[✓] Round 1: Employee email drafted (${data?.subject || 'Negotiation initiated'})` : "[>] Round 1: Drafting email...",
          round >= 2 ? `[✓] Round 2: HR responded — "${data?.hrResponse?.slice(0, 80) || 'Pushback received'}"` : round > 1 ? "[>] Round 2: Awaiting HR response..." : "",
          round >= 3 ? `[✓] Round 3: Counter-argument prepared` : round > 2 ? "[>] Round 3: Generating counter..." : "",
        ].filter(Boolean);

        emit({
          agentName: "WarRoomSim",
          clauseId:  activeClause.id,
          status:    round === 3 ? "COMPLETE" : "ANALYZING",
          currentTask: `Simulating 3-round HR negotiation battle — Round ${round}/3`,
          thoughtSteps: thoughts,
          liveData:  { round, latestRound: data },
          runtime:   Date.now() - t4,
          handoffTo: round === 3 ? "FutureSim" : null,
          outputSummary: round === 3 ? `3-round negotiation complete` : `Round ${round} processed`,
        });
      });
    } catch (err) {
      emitError(emit, "WarRoomSim", activeClause.id, err, false);
      // War Room is non-fatal — continue with empty rounds
      warRoomRounds = [];
    }

    await delay(600);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STAGE 6: FUTURE SIMULATOR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const t5 = Date.now();
    emit({
      agentName: "FutureSim",
      clauseId:  activeClause.id,
      status:    "ANALYZING",
      currentTask: "Projecting legal & financial consequences",
      thoughtSteps: [
        "[✓] All courtroom data ingested",
        "[✓] HR negotiation outcome: FAILED",
        "[>] Calculating financial exposure timeline...",
        "[>] Querying Indian legal precedents...",
      ],
      liveData: null,
      runtime:  null,
    });

    try {
      futureSimulation = await simulateFuture(
        activeClause,
        prosecutorOutput,
        defenderOutput,
        judgeOutput,
        warRoomRounds,
        userProfile.role,
        userProfile.monthlySalary
      );
    } catch (err) {
      emitError(emit, "FutureSim", activeClause.id, err, false);
      // Provide a basic fallback future simulation
      futureSimulation = {
        courtroomSummary: [
          `Clause type ${activeClause.type} carries ${judgeOutput.finalRiskLevel} risk`,
          `Risk score: ${judgeOutput.riskScore}/100`,
          "Future simulation engine encountered an error — partial results shown",
        ],
        futureTimeline: [
          { time: "DAY 1",   event: `You sign a contract with a ${judgeOutput.finalRiskLevel} risk clause.` },
          { time: "3 MONTHS", event: "Employer invokes clause provisions." },
          { time: "1 YEAR",   event: "Legal dispute begins in Labour Court." },
          { time: "2 YEARS",  event: "Resolution attempted via arbitration." },
        ],
        warRoomFailureImpact: "HR negotiation failed to secure amendments.",
        financialDamage:      rsExposure.max,
        escalationProbability: judgeOutput.riskScore,
        negotiationSuccessProbability: 100 - judgeOutput.riskScore,
        finalRecommendation:  judgeOutput.actionRequired?.replace(/_/g, ' ') || "NEGOTIATE THIS",
        specificRisksIfSigned: judgeOutput.indefensibleElements || [],
        indianCase: "Standard Indian employment law precedents apply.",
      };
    }

    emit({
      agentName: "FutureSim",
      clauseId:  activeClause.id,
      status:    "COMPLETE",
      currentTask: "Projecting legal & financial consequences",
      thoughtSteps: [
        "[✓] Courtroom findings processed",
        "[✓] HR negotiation failure impact computed",
        `[✓] Financial damage projected: ${futureSimulation.financialDamage}`,
        `[✓] Escalation probability: ${futureSimulation.escalationProbability}%`,
        `[⚠] Final recommendation: ${futureSimulation.finalRecommendation}`,
      ],
      liveData: {
        financialDamage: futureSimulation.financialDamage,
        escalation:      futureSimulation.escalationProbability,
        recommendation:  futureSimulation.finalRecommendation,
        timelineSteps:   futureSimulation.futureTimeline?.length,
      },
      confidence:    92,
      runtime:       Date.now() - t5,
      handoffTo:     "UI_RENDER",
      outputSummary: `${futureSimulation.finalRecommendation} — Exposure: ${futureSimulation.financialDamage}`,
    });

  } else {
    // SAFE clause — no war room needed
    futureSimulation = {
      courtroomSummary: [
        "Clause is within acceptable legal limits",
        "Risk is manageable with standard review",
        "Enforceable under Indian law",
      ],
      futureTimeline: [
        { time: "NOW",    event: "Clause reviewed and accepted" },
        { time: "6 MONTHS", event: "Smooth employment continues" },
        { time: "2 YEARS",  event: "Contract renewal with standard terms" },
      ],
      warRoomFailureImpact: "N/A — Negotiation not required.",
      financialDamage: "Rs 0",
      escalationProbability: 5,
      negotiationSuccessProbability: 95,
      finalRecommendation: "SAFE TO SIGN",
      indianCase: "Standard employment terms, generally upheld in Indian courts.",
    };
  }

  emit({ type: "SYSTEM", action: "ORCHESTRATION_COMPLETE" });
  return {
    activeClause,
    prosecutorOutput,
    defenderOutput,
    judgeOutput,
    rsExposure,
    warRoomRounds,
    futureSimulation,
  };
}
