import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Gavel, FileText, ServerCrash, RefreshCw, AlertTriangle, TrendingDown, Shield, Zap, ChevronRight, Mail, MessageSquare, Swords } from 'lucide-react';

export default function FutureSimulation({ simulationData, warRoomRounds, onReset }) {
  const [showWarRoom, setShowWarRoom] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (!simulationData) return;
    setVisibleSteps(0);
    const timer = setInterval(() => {
      setVisibleSteps(s => {
        const max = (simulationData.futureTimeline?.length || 5) + 3;
        if (s >= max) { clearInterval(timer); return s; }
        return s + 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, [simulationData]);

  if (!simulationData) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#a3a3a3', gap: '16px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={32} color="#fff" />
        </motion.div>
        <div style={{ fontSize: '12px', letterSpacing: '4px', fontWeight: '500', color: '#fff' }}>COMPUTING FUTURE CONSEQUENCES...</div>
        <div style={{ fontSize: '11px', color: '#666', letterSpacing: '2px' }}>AI projecting legal & financial timeline</div>
      </div>
    );
  }

  const riskLevel = simulationData.escalationProbability > 70 ? 'CRITICAL'
    : simulationData.escalationProbability > 50 ? 'HIGH'
    : simulationData.escalationProbability > 30 ? 'MEDIUM' : 'LOW';

  const riskColor = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#10b981' }[riskLevel];

  return (
    <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', flexDirection: 'column', color: '#ededed', overflowY: 'auto', position: 'relative' }}>
      
      {/* Background static */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.02, background: '#fff', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* ─── HEADER ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '10px', color: '#666', letterSpacing: '4px', marginBottom: '8px', fontWeight: '500' }}>LEXGUARD · STAGE 4 OF 4</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '6px', margin: '0 0 8px 0', color: '#fff', fontWeight: '800' }}>
            CONSEQUENCE PREDICTION ENGINE
          </h1>
          <div style={{ fontSize: '12px', color: '#737373', letterSpacing: '2px' }}>
            Generated from live chain: ClauseSplitter → Prosecutor → Defender → Judge → WarRoom → FutureSim
          </div>
        </motion.div>

        {/* ─── TOP METRICS ROW ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          
          <div style={{ padding: '24px', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '12px', fontWeight: '600' }}>ESCALATION PROBABILITY</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: riskColor, lineHeight: 1 }}>
              {simulationData.escalationProbability}<span style={{ fontSize: '18px', color: '#666' }}>%</span>
            </div>
            <div style={{ marginTop: '12px', height: '2px', borderRadius: '1px', background: '#222' }}>
              <div style={{ height: '100%', width: `${simulationData.escalationProbability}%`, background: riskColor, borderRadius: '1px' }} />
            </div>
          </div>

          <div style={{ padding: '24px', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '12px', fontWeight: '600' }}>FINANCIAL EXPOSURE</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#e5e5e5', lineHeight: 1 }}>
              {simulationData.financialDamage}
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '12px' }}>estimated total loss</div>
          </div>

          <div style={{ padding: '24px', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '12px', fontWeight: '600' }}>NEGOTIATION SUCCESS CHANCE</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
              {simulationData.negotiationSuccessProbability}<span style={{ fontSize: '18px', color: '#666' }}>%</span>
            </div>
            <div style={{ marginTop: '12px', height: '2px', borderRadius: '1px', background: '#222' }}>
              <div style={{ height: '100%', width: `${simulationData.negotiationSuccessProbability}%`, background: '#fff', borderRadius: '1px' }} />
            </div>
          </div>
        </motion.div>

        {/* ─── MAIN CONTENT GRID ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px', marginBottom: '32px' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Courtroom Findings */}
            <AnimatePresence>
              {visibleSteps >= 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ padding: '24px', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Gavel size={16} color="#fafafa" />
                    <div style={{ fontSize: '10px', color: '#a3a3a3', letterSpacing: '2px', fontWeight: '600' }}>COURTROOM FINDINGS</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {simulationData.courtroomSummary?.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                        style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <ChevronRight size={12} color="#737373" style={{ marginTop: '3px', flexShrink: 0 }} />
                        <div style={{ fontSize: '12px', color: '#d4d4d4', lineHeight: '1.6' }}>{s}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* War Room Failure */}
            <AnimatePresence>
              {visibleSteps >= 2 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ padding: '24px', borderRadius: '8px', border: '1px solid #3a1515', background: '#0f0a0a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ServerCrash size={16} color="#ef4444" />
                    <div style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '2px', fontWeight: '600' }}>WAR ROOM FAILURE IMPACT</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#fca5a5', lineHeight: '1.6' }}>{simulationData.warRoomFailureImpact}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WAR ROOM — 3-Round AI Negotiation (Real Data) */}
            <AnimatePresence>
              {visibleSteps >= 3 && warRoomRounds?.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', overflow: 'hidden' }}>
                  <button
                    onClick={() => setShowWarRoom(!showWarRoom)}
                    style={{ width: '100%', padding: '16px 24px', background: 'transparent', border: 'none', color: '#e5e5e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '2px', fontWeight: '600' }}
                  >
                    <Swords size={14} />
                    HR NEGOTIATION WAR ROOM — {warRoomRounds.length} ROUND{warRoomRounds.length > 1 ? 'S' : ''} (AI-GENERATED)
                    <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>{showWarRoom ? '▼' : '▶'}</span>
                  </button>

                  {showWarRoom && (
                    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Round 1: Employee Email */}
                      {warRoomRounds.find(r => r.round === 1)?.data && (
                        <div style={{ padding: '16px', borderRadius: '6px', border: '1px solid #222', background: '#111' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Mail size={12} color="#a3a3a3" />
                            <span style={{ fontSize: '9px', color: '#a3a3a3', fontWeight: '600', letterSpacing: '1px' }}>ROUND 1 — YOUR NEGOTIATION EMAIL</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#737373', marginBottom: '8px' }}>Subject: {warRoomRounds.find(r => r.round === 1).data.subject}</div>
                          <div style={{ fontSize: '12px', color: '#d4d4d4', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{warRoomRounds.find(r => r.round === 1).data.email}</div>
                        </div>
                      )}

                      {/* Round 2: HR Response */}
                      {warRoomRounds.find(r => r.round === 2)?.data && (
                        <div style={{ padding: '16px', borderRadius: '6px', border: '1px solid #2a1a1a', background: '#1a1111' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <MessageSquare size={12} color="#ef4444" />
                            <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: '600', letterSpacing: '1px' }}>ROUND 2 — HR PUSHBACK (AI-SIMULATED)</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{warRoomRounds.find(r => r.round === 2).data.hrResponse}</div>
                        </div>
                      )}

                      {/* Round 3: Counter-argument */}
                      {warRoomRounds.find(r => r.round === 3)?.data && (
                        <div style={{ padding: '16px', borderRadius: '6px', border: '1px solid #1a2a22', background: '#0e1511' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Swords size={12} color="#10b981" />
                            <span style={{ fontSize: '9px', color: '#10b981', fontWeight: '600', letterSpacing: '1px' }}>ROUND 3 — YOUR COUNTER-ARGUMENT</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6ee7b7', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontWeight: '500' }}>{warRoomRounds.find(r => r.round === 3).data.counter}</div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Specific Risks If Signed */}
            <AnimatePresence>
              {visibleSteps >= 3 && simulationData.specificRisksIfSigned?.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ padding: '24px', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertTriangle size={16} color="#fafafa" />
                    <div style={{ fontSize: '10px', color: '#a3a3a3', letterSpacing: '2px', fontWeight: '600' }}>SPECIFIC RISKS IF SIGNED</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {simulationData.specificRisksIfSigned.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#a855f7', marginTop: '6px', flexShrink: 0 }} />
                        <div style={{ fontSize: '12px', color: '#d8b4fe', lineHeight: '1.5' }}>{r}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indian Precedent — Real-time SerpAPI results */}
            <AnimatePresence>
              {visibleSteps >= 4 && simulationData.indianCase && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ padding: '24px', borderRadius: '8px', border: '1px solid #112', background: '#0a0f14' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FileText size={16} color="#fafafa" />
                    <div style={{ fontSize: '10px', color: '#a3a3a3', letterSpacing: '2px', fontWeight: '600' }}>INDIAN LEGAL PRECEDENT</div>
                    {simulationData.indianCase?.startsWith('[LIVE]') && (
                      <span style={{ fontSize: '8px', padding: '4px 8px', background: 'transparent', color: '#10b981', border: '1px solid #10b981', borderRadius: '4px', letterSpacing: '1px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        LIVE · SERP
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#93c5fd', lineHeight: '1.6' }}>
                    {simulationData.indianCaseUrl ? (
                      <a
                        href={simulationData.indianCaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#60a5fa', textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}
                      >
                        {simulationData.indianCase.replace('[LIVE] ', '')}
                      </a>
                    ) : (
                      <span style={{ fontStyle: 'italic' }}>"{simulationData.indianCase}"</span>
                    )}
                  </div>
                  {simulationData.indianCaseAlt && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(59,130,246,0.15)', fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                      <span style={{ color: '#334155', fontWeight: 'bold', fontSize: '9px', letterSpacing: '1px' }}>RELATED: </span>
                      {simulationData.indianCaseAlt.replace('[LIVE] ', '')}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Clock size={16} color="#e5e5e5" />
              <div style={{ fontSize: '10px', color: '#a3a3a3', letterSpacing: '2px', fontWeight: '600' }}>COMPUTED FUTURE TIMELINE</div>
            </div>

            <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: `1px solid #333` }}>
              {simulationData.futureTimeline?.map((t, i) => {
                const isLast = i === (simulationData.futureTimeline.length - 1);
                const nodeColor = isLast ? riskColor : i === 0 ? '#10b981' : '#555';
                return (
                  <AnimatePresence key={i}>
                    {visibleSteps > i && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ position: 'relative', marginBottom: '32px' }}
                      >
                        {/* Timeline dot */}
                        <div style={{ position: 'absolute', left: '-33px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: nodeColor, border: '2px solid #000' }} />
                        
                        <div style={{ fontSize: '10px', color: '#737373', letterSpacing: '1px', marginBottom: '6px', fontFamily: 'monospace' }}>{t.time}</div>
                        <div style={{
                          fontSize: '13px',
                          color: isLast ? riskColor : '#d4d4d4',
                          fontWeight: isLast ? '600' : '400',
                          lineHeight: '1.6',
                          padding: '12px 16px',
                          background: isLast ? 'transparent' : '#0a0a0a',
                          borderRadius: '8px',
                          border: `1px solid ${isLast ? riskColor : '#222'}`,
                        }}>
                          {t.event}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── FINAL VERDICT BANNER ─── */}
        <AnimatePresence>
          {visibleSteps >= (simulationData.futureTimeline?.length || 5) + 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ padding: '32px 40px', borderRadius: '8px', border: `1px solid ${riskColor}`, background: '#0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}
            >
              <div>
                <div style={{ fontSize: '9px', color: riskColor, letterSpacing: '3px', marginBottom: '8px' }}>FINAL VERDICT · LEXGUARD AI</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>{simulationData.finalRecommendation}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={onReset}
                  style={{ padding: '16px 32px', background: 'transparent', border: '1px solid #333', color: '#a3a3a3', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '2px', transition: 'all 0.2s', fontWeight: '600' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#a3a3a3'; }}
                >
                  <RefreshCw size={14} /> ANALYZE ANOTHER CLAUSE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
