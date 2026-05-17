import React from 'react';

/**
 * AgentGraph — shows the REAL sequential agent chain as it is coded.
 * Models: llama-3.3-70b-versatile on Groq (primary), gemini-1.5-flash (fallback)
 * Chain:  ClauseSplitter → Prosecutor → Defender → Judge → WarRoom(×3) → FutureSim
 */

const NODE_STYLE = (color) => ({
  border: `2px solid ${color}`,
  background: `${color}12`,
  borderRadius: '10px',
  padding: '12px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  minWidth: '180px',
});

const LABEL = (color, text) => (
  <span style={{ fontSize: '13px', fontWeight: 'bold', color }}>{text}</span>
);

const MODEL_TAG = (text) => (
  <span style={{ fontSize: '9px', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{text}</span>
);

const INPUT_TAG = (text) => (
  <div style={{ fontSize: '9px', color: '#334155', marginTop: '2px', maxWidth: '180px', textAlign: 'center', lineHeight: '1.4' }}>{text}</div>
);

const Arrow = ({ label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', margin: '2px 0' }}>
    <div style={{ width: '1px', height: '20px', background: 'rgba(6,182,212,0.4)' }} />
    {label && (
      <div style={{ fontSize: '8px', color: '#1e40af', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '4px', padding: '2px 6px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    )}
    <div style={{ width: '1px', height: '20px', background: 'rgba(6,182,212,0.4)' }} />
    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '8px solid rgba(6,182,212,0.6)' }} />
  </div>
);

const HorizArrow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
    <div style={{ width: '20px', height: '1px', background: 'rgba(6,182,212,0.4)' }} />
    <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid rgba(6,182,212,0.5)' }} />
  </div>
);

const AgentGraph = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#070d1a', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '16px', width: '100%', maxWidth: '860px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 60px rgba(6,182,212,0.1)' }}>

        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(6,182,212,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6,182,212,0.04)' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff', letterSpacing: '3px' }}>AGENTIC PIPELINE</div>
            <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '2px', marginTop: '2px' }}>Real sequential chain · Groq llama-3.3-70b → Gemini 1.5 Flash fallback</div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#475569', padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e293b', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}
          >
            Close
          </button>
        </div>

        {/* Graph canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* API Keys Banner */}
          <div style={{ marginBottom: '28px', padding: '10px 20px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', display: 'flex', gap: '24px', fontSize: '10px', color: '#6ee7b7', fontFamily: 'monospace' }}>
            <span>🟢 PRIMARY: Groq API · llama-3.3-70b-versatile</span>
            <span>🔵 FALLBACK: Gemini API · gemini-1.5-flash</span>
            <span>⚡ RETRY: 3× each · 30s timeout · exp backoff</span>
          </div>

          {/* START */}
          <div style={{ background: '#0f172a', border: '1px dashed #334155', borderRadius: '20px', padding: '8px 20px', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
            📄 Raw Contract Text (user input)
          </div>

          <Arrow label="full document text" />

          {/* AGENT 1: Clause Splitter */}
          <div style={NODE_STYLE('#a855f7')}>
            {LABEL('#a855f7', '✂️  Agent 1 · ClauseSplitter')}
            {MODEL_TAG('llama-3.3-70b-versatile via Groq')}
            {INPUT_TAG('Segments doc → typed clauses · selects highest-risk clause')}
          </div>

          <Arrow label="activeClause: {id, type, text}" />

          {/* AGENT 2: Prosecutor */}
          <div style={NODE_STYLE('#ef4444')}>
            {LABEL('#ef4444', '⚖️  Agent 2 · ProsecutorAgent')}
            {MODEL_TAG('llama-3.3-70b-versatile via Groq')}
            {INPUT_TAG('INPUT: clause.type + clause.text · checks Indian Contract Act, DPDP Act, Copyright Act')}
          </div>

          <Arrow label="prosecutorOutput: {riskLevel, riskType, riskKeywords[], indianLawNote, worstCase, negotiationLeverage}" />

          {/* AGENT 3: Defender */}
          <div style={NODE_STYLE('#3b82f6')}>
            {LABEL('#3b82f6', '🛡️  Agent 3 · DefenderAgent')}
            {MODEL_TAG('llama-3.3-70b-versatile via Groq')}
            {INPUT_TAG('INPUT: clause + FULL prosecutorOutput JSON · compares Infosys/TCS/Zepto/Razorpay market practice')}
          </div>

          <Arrow label="defenderOutput: {challenge, adjustedRiskLevel, isStandardPractice, indefensiblePhrases[], proposedAmendment}" />

          {/* AGENT 4: Judge */}
          <div style={NODE_STYLE('#f59e0b')}>
            {LABEL('#f59e0b', '🔨  Agent 4 · JudgeAgent')}
            {MODEL_TAG('llama-3.3-70b-versatile via Groq')}
            {INPUT_TAG('INPUT: clause + FULL prosecutorOutput + FULL defenderOutput → binding verdict')}
          </div>

          <Arrow label="judgeOutput: {finalRiskLevel, riskScore/100, actionRequired, specificDemands[], judgesNote}" />

          {/* Condition */}
          <div style={{ padding: '8px 16px', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '6px', fontSize: '9px', color: '#3b82f6', fontFamily: 'monospace' }}>
            if finalRiskLevel ∈ &#123;CRITICAL, HIGH, MEDIUM&#125;
          </div>

          <Arrow label="passes clause + judgeOutput" />

          {/* AGENT 5: War Room (3 rounds) */}
          <div style={{ border: '1px dashed rgba(6,182,212,0.3)', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '600px', background: 'rgba(6,182,212,0.02)' }}>
            <div style={{ fontSize: '9px', color: '#334155', fontFamily: 'monospace', marginBottom: '16px' }}>Agent 5 · WarRoomSim — sequential 3-round negotiation</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Round 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...NODE_STYLE('#06b6d4'), minWidth: 0, flex: 1, padding: '8px 12px' }}>
                  {LABEL('#06b6d4', '📧 Round 1')}
                  {MODEL_TAG('Groq → Gemini fallback')}
                  {INPUT_TAG('clause + judge.specificDemands → employee email draft')}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Arrow label="round1.email fed as input →" />
              </div>

              {/* Round 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...NODE_STYLE('#f97316'), minWidth: 0, flex: 1, padding: '8px 12px' }}>
                  {LABEL('#f97316', '📮 Round 2 — HR Response')}
                  {MODEL_TAG('Groq → Gemini fallback')}
                  {INPUT_TAG('clause + round1.email → HR pushback (reads actual employee email)')}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Arrow label="round1.email + round2.hrResponse fed as input →" />
              </div>

              {/* Round 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...NODE_STYLE('#10b981'), minWidth: 0, flex: 1, padding: '8px 12px' }}>
                  {LABEL('#10b981', '💪 Round 3 — Counter-Argument')}
                  {MODEL_TAG('Groq → Gemini fallback')}
                  {INPUT_TAG('clause + judgeOutput + round1 + round2 → cites Zepto/Razorpay/CRED + Indian law')}
                </div>
              </div>
            </div>
          </div>

          <Arrow label="passes ALL: clause + pros + def + judge + warRoomRounds[0,1,2]" />

          {/* AGENT 6: Future Sim */}
          <div style={NODE_STYLE('#a855f7')}>
            {LABEL('#a855f7', '🔮  Agent 6 · FutureSim')}
            {MODEL_TAG('llama-3.3-70b-versatile via Groq')}
            {INPUT_TAG('INPUT: full chain output from all 5 agents → deterministic consequence timeline')}
          </div>

          <Arrow />

          {/* OUTPUT */}
          <div style={{ padding: '14px 28px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#10b981', letterSpacing: '2px', marginBottom: '6px' }}>FINAL OUTPUT</div>
            <div style={{ fontSize: '11px', color: '#6ee7b7', fontFamily: 'monospace', lineHeight: '1.8' }}>
              financialDamage · escalationProbability · futureTimeline[]<br/>
              courtroomSummary[] · specificRisksIfSigned[] · indianCase<br/>
              finalRecommendation · negotiationSuccessProbability
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AgentGraph;
