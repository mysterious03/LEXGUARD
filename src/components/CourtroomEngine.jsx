import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, AlertOctagon, ShieldAlert, Gavel, CheckCircle, ArrowRight, Server } from 'lucide-react';

export default function CourtroomEngine({ clause, prosecutor, defender, judge, rsExposure, onComplete }) {
  const [stage, setStage] = useState(0);

  // Stages: 
  // 0: Init, 1: Evidence, 2: Prosecutor, 3: Defender, 4: Cross-Exam, 5: Deliberation, 6: Verdict

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setStage(1); // Evidence
      await new Promise(r => setTimeout(r, 2000));
      setStage(2); // Prosecutor
      await new Promise(r => setTimeout(r, 3000));
      setStage(3); // Defender
      await new Promise(r => setTimeout(r, 3000));
      setStage(4); // Cross Exam
      await new Promise(r => setTimeout(r, 2500));
      setStage(5); // Deliberation
      await new Promise(r => setTimeout(r, 2500));
      setStage(6); // Verdict
    };
    sequence();
  }, []);

  return (
    <div style={{ flex: 1, backgroundColor: '#000000', display: 'flex', flexDirection: 'column', color: '#ededed', overflow: 'hidden' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 40px', borderBottom: '1px solid #1a1a1a', backgroundColor: '#0a0a0a' }}>
        <div>
          <div style={{ color: '#666', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>CASE #LXG-204</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>EXHIBIT A: {clause.type}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: stage >= 6 ? '#a3a3a3' : '#fafafa', fontSize: '10px', letterSpacing: '2px' }}>
            {stage >= 6 ? 'TRIAL CONCLUDED' : 'HEARING ACTIVE'}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>Threat Level: {judge?.finalRiskLevel || "EVALUATING..."}</div>
        </div>
      </div>

      {/* 3-COLUMN LAYOUT */}
      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* PROSECUTOR COLUMN */}
        <div style={{ flex: 1, borderRight: '1px solid #1a1a1a', padding: '32px', opacity: stage >= 2 ? 1 : 0.2, transition: 'opacity 0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '24px' }}>
            <AlertOctagon size={18} />
            <h2 style={{ fontSize: '12px', letterSpacing: '2px', margin: 0, fontWeight: '600' }}>PROSECUTOR AI</h2>
          </div>
          
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ backgroundColor: '#0f0a0a', border: '1px solid #2a1111', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#e5e5e5', marginBottom: '20px', lineHeight: '1.6' }}>
                  "{prosecutor?.plainEnglish || 'Evaluating...'}"
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <ShieldAlert size={14} color="#dc2626" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#fca5a5' }}>Conflict: {prosecutor?.indianLawNote || 'Checking Indian law...'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <ShieldAlert size={14} color="#dc2626" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#fca5a5' }}>Worst Case: {prosecutor?.worstCase || 'Estimating...'}</span>
                  </div>
                </div>
              </motion.div>
            )}
            {stage === 4 && prosecutor?.negotiationLeverage && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ marginTop: '20px', padding: '16px', backgroundColor: '#1a0a0a', color: '#fca5a5', fontSize: '12px', borderRadius: '6px', borderLeft: '2px solid #dc2626' }}>
                <span style={{ color: '#dc2626', fontWeight: '600', display: 'block', marginBottom: '6px', fontSize: '10px', letterSpacing: '1px' }}>PROSECUTOR DEMANDS</span>
                {prosecutor.negotiationLeverage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* JUDGE COLUMN */}
        <div style={{ flex: 1.2, padding: '32px', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', opacity: stage >= 1 ? 1 : 0.2, transition: 'opacity 0.5s', borderRight: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fafafa', marginBottom: '24px' }}>
            <Scale size={18} />
            <h2 style={{ fontSize: '12px', letterSpacing: '2px', margin: 0, fontWeight: '600' }}>JUDGE AI</h2>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Evidence Phase */}
            {stage >= 1 && stage < 5 && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: '#111', border: '1px solid #222', padding: '20px', borderRadius: '8px', width: '100%', marginBottom: '24px', overflowY: 'auto', maxHeight: '350px' }}>
                <div style={{ fontSize: '10px', color: '#737373', marginBottom: '12px', letterSpacing: '1px' }}>EVIDENCE SUBMITTED</div>
                <div style={{ fontSize: '13px', color: '#a3a3a3', lineHeight: '1.6' }}>
                  {(() => {
                    const keywords = (prosecutor?.riskKeywords || []).map(k => k.toLowerCase());
                    return clause.text.split(/(\s+)/).map((segment, i) => {
                      const cleanWord = segment.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                      const isRisk = cleanWord.length > 2 && keywords.some(k => k.includes(cleanWord) || cleanWord.includes(k));
                      
                      return (
                        <span key={i} style={{ 
                          color: isRisk ? '#ef4444' : 'inherit', 
                          backgroundColor: isRisk ? 'rgba(239,68,68,0.15)' : 'transparent',
                          fontWeight: isRisk ? 'bold' : 'normal',
                          textShadow: isRisk ? '0 0 8px rgba(239,68,68,0.5)' : 'none',
                          padding: isRisk ? '0 2px' : '0',
                          borderRadius: '2px',
                          transition: 'all 0.3s'
                        }}>
                          {segment}
                        </span>
                      );
                    });
                  })()}
                </div>
              </motion.div>
            )}

            {/* Deliberation Phase */}
            {stage === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                <Scale size={48} color="#EF9F27" className="lucide-pulse" />
                <div style={{ color: '#EF9F27', fontSize: '14px', letterSpacing: '2px' }}>DELIBERATING VERDICT...</div>
                <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>Evaluating enforceability...<br/>Computing financial exposure...</div>
              </motion.div>
            )}

            {/* Final Verdict Phase */}
            {stage >= 6 && (
              <motion.div initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', padding: '24px', borderRadius: '8px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.8)', overflowY: 'auto', maxHeight: '400px' }}>
                <div style={{ color: '#fafafa', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>FINAL VERDICT</div>
                
                {/* Risk Level + Score */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: judge?.finalRiskLevel === 'SAFE' ? '#10b981' : judge?.finalRiskLevel === 'CRITICAL' ? '#ef4444' : '#f97316', marginBottom: '4px' }}>
                    {judge?.finalRiskLevel || 'UNKNOWN'} RISK
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Score: <strong style={{ color: '#fff' }}>{judge?.riskScore || '—'}/100</strong></div>
                </div>

                {/* Judge's Verdict Quote */}
                <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: '8px', padding: '16px', marginBottom: '16px', fontSize: '13px', color: '#e5e5e5', textAlign: 'center', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "{judge?.plainEnglishVerdict || 'Verdict generated...'}"
                </div>

                {/* Key Finding */}
                {judge?.keyFinding && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px', padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', lineHeight: '1.5' }}>
                    <span style={{ color: '#475569' }}>KEY FINDING: </span>{judge.keyFinding}
                  </div>
                )}

                {/* Indefensible Elements */}
                {judge?.indefensibleElements?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#ef4444', letterSpacing: '1px', marginBottom: '6px' }}>INDEFENSIBLE ELEMENTS</div>
                    {judge.indefensibleElements.map((el, i) => (
                      <div key={i} style={{ fontSize: '11px', color: '#fca5a5', padding: '4px 8px', background: 'rgba(239,68,68,0.08)', borderRadius: '4px', marginBottom: '4px', border: '1px solid rgba(239,68,68,0.15)' }}>
                        ⚠ {el}
                      </div>
                    ))}
                  </div>
                )}

                {/* Specific Demands */}
                {judge?.specificDemands?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#10b981', letterSpacing: '1px', marginBottom: '6px' }}>DEMAND THESE CHANGES BEFORE SIGNING</div>
                    {judge.specificDemands.map((d, i) => (
                      <div key={i} style={{ fontSize: '11px', color: '#6ee7b7', padding: '4px 8px', background: 'rgba(16,185,129,0.06)', borderRadius: '4px', marginBottom: '4px', border: '1px solid rgba(16,185,129,0.15)' }}>
                        ✓ {d}
                      </div>
                    ))}
                  </div>
                )}

                {/* Exposure + Action */}
                <div style={{ borderTop: '1px solid rgba(239,159,39,0.2)', paddingTop: '12px', display: 'flex', justifyContent: 'space-around', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#888', marginBottom: '4px' }}>EXPOSURE</div>
                    <div style={{ fontSize: '14px', color: '#ef4444', fontWeight: 'bold' }}>{rsExposure?.max || "Unknown"}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#888', marginBottom: '4px' }}>ACTION</div>
                    <div style={{ fontSize: '12px', color: '#EF9F27', fontWeight: 'bold' }}>{judge?.actionRequired?.replace(/_/g, ' ') || "REVIEW CAREFULLY"}</div>
                  </div>
                </div>

                {/* Judge's Warning */}
                {judge?.judgesNote && (
                  <div style={{ padding: '12px', background: '#0f0a0a', borderRadius: '8px', border: '1px solid #3a1515', fontSize: '12px', color: '#fca5a5', lineHeight: '1.6', marginBottom: '24px' }}>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>JUDGE'S WARNING: </span>{judge.judgesNote}
                  </div>
                )}

                <button 
                  onClick={onComplete}
                  style={{ width: '100%', padding: '14px 24px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', letterSpacing: '1px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e5e5e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  VIEW FUTURE SIMULATION <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* DEFENDER COLUMN */}
        <div style={{ flex: 1, borderLeft: '1px solid #1a1a1a', padding: '32px', opacity: stage >= 3 ? 1 : 0.2, transition: 'opacity 0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '24px' }}>
            <Server size={18} />
            <h2 style={{ fontSize: '12px', letterSpacing: '2px', margin: 0, fontWeight: '600' }}>DEFENDER AI</h2>
          </div>

          <AnimatePresence>
            {stage >= 3 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ backgroundColor: '#050a0f', border: '1px solid #111a2a', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#e5e5e5', marginBottom: '20px', lineHeight: '1.6' }}>
                  "{defender?.challenge || 'Preparing defense...'}"
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="#3b82f6" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#93c5fd' }}>Standard Practice: {defender?.isStandardPractice ? 'YES' : 'NO'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="#3b82f6" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#93c5fd' }}>Market Context: {defender?.standardPracticeNote || '...'}</span>
                  </div>
                </div>
              </motion.div>
            )}
            {stage === 4 && defender?.proposedAmendment && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ marginTop: '20px', padding: '16px', backgroundColor: '#050a0f', color: '#93c5fd', fontSize: '12px', borderRadius: '6px', borderLeft: '2px solid #3b82f6' }}>
                <span style={{ color: '#3b82f6', fontWeight: '600', display: 'block', marginBottom: '6px', fontSize: '10px', letterSpacing: '1px' }}>DEFENSE PROPOSES</span>
                {defender.proposedAmendment}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
