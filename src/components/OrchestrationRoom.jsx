import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, Network, Server, ArrowRight, CheckCircle, AlertOctagon, Terminal, Gavel, Zap, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
  'SCANNING':       { color: '#a3a3a3', bg: 'transparent',  border: '#333'   },
  'ANALYZING':      { color: '#e5e5e5', bg: 'transparent',  border: '#555'  },
  'CROSS-CHECKING': { color: '#fafafa', bg: 'transparent',  border: '#777'   },
  'COMPLETE':       { color: '#10b981', bg: 'transparent',  border: 'rgba(16,185,129,0.3)'  },
  'ESCALATED':      { color: '#ef4444', bg: 'transparent',  border: 'rgba(239,68,68,0.3)'   },
};

const AGENT_ICONS = {
  'ClauseSplitter':   <Database size={18} />,
  'ProsecutorAgent':  <AlertOctagon size={18} />,
  'DefenderAgent':    <Server size={18} />,
  'JudgeAgent':       <Gavel size={18} />,
  'WarRoomSim':       <Network size={18} />,
  'FutureSim':        <Activity size={18} />,
};

function LiveDataPanel({ agentName, data }) {
  if (!data) return null;

  // ClauseSplitter: show clause preview
  if (agentName === 'ClauseSplitter') return (
    <div style={{ marginTop: '12px', padding: '12px', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #222' }}>
      <div style={{ fontSize: '10px', color: '#737373', marginBottom: '8px', letterSpacing: '1px', fontWeight: '500' }}>EXTRACTED CLAUSE PREVIEW</div>
      <div style={{ fontSize: '11px', color: '#a3a3a3', fontFamily: 'monospace', lineHeight: '1.6' }}>
        {data.clausePreview}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid #222', paddingTop: '10px' }}>
        <span style={{ fontSize: '10px', color: '#e5e5e5' }}>Type: <strong>{data.clauseType}</strong></span>
        <span style={{ fontSize: '10px', color: '#737373' }}>Total clauses: <strong>{data.totalClauses}</strong></span>
      </div>
    </div>
  );

  // ProsecutorAgent: show keywords + worst case
  if (agentName === 'ProsecutorAgent') return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.keywords?.length > 0 && (
        <div style={{ padding: '12px', background: '#0f0a0a', borderRadius: '8px', border: '1px solid #3a1515' }}>
          <div style={{ fontSize: '10px', color: '#ef4444', marginBottom: '8px', letterSpacing: '1px', fontWeight: '500' }}>TOXIC PHRASES IDENTIFIED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.keywords.map((kw, i) => (
              <span key={i} style={{ padding: '4px 8px', background: 'transparent', color: '#ef4444', fontSize: '11px', borderRadius: '4px', border: '1px solid #3a1515' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.worstCase && (
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>WORST CASE SCENARIO</div>
          <div style={{ fontSize: '12px', color: '#fbbf24', lineHeight: '1.4' }}>{data.worstCase}</div>
        </div>
      )}
      {data.indianLaw && (
        <div style={{ padding: '8px', background: 'rgba(168,85,247,0.06)', borderRadius: '6px', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div style={{ fontSize: '10px', color: '#a855f7', marginBottom: '4px' }}>INDIAN LAW CONFLICT</div>
          <div style={{ fontSize: '11px', color: '#c4b5fd', lineHeight: '1.4' }}>{data.indianLaw}</div>
        </div>
      )}
    </div>
  );

  // DefenderAgent: show challenge + market context
  if (agentName === 'DefenderAgent') return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ padding: '10px', background: 'rgba(59,130,246,0.06)', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div style={{ fontSize: '10px', color: '#3b82f6', marginBottom: '4px', letterSpacing: '1px' }}>CORPORATE REBUTTAL</div>
        <div style={{ fontSize: '12px', color: '#93c5fd', lineHeight: '1.4' }}>{data.challenge}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ padding: '8px 12px', background: data.isStandard ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '6px', border: `1px solid ${data.isStandard ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: '11px', color: data.isStandard ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
          Standard Practice: {data.isStandard ? 'YES' : 'NO'}
        </div>
        <div style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px', color: '#94a3b8' }}>
          {data.marketNote?.slice(0, 80)}...
        </div>
      </div>
    </div>
  );

  // JudgeAgent: show verdict + score
  if (agentName === 'JudgeAgent') {
    const riskColor = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', SAFE: '#10b981' }[data.riskLevel] || '#94a3b8';
    return (
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
          <div style={{ padding: '12px 20px', background: `${riskColor}15`, borderRadius: '6px', border: `1px solid ${riskColor}40`, textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>RISK LEVEL</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: riskColor }}>{data.riskLevel}</div>
          </div>
          <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid #1e293b', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>SCORE</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: riskColor }}>{data.riskScore}<span style={{ fontSize: '12px', color: '#475569' }}>/100</span></div>
          </div>
          <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>ACTION</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: riskColor }}>{data.action?.replace(/_/g,' ')}</div>
          </div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(239,159,39,0.06)', borderRadius: '6px', border: '1px solid rgba(239,159,39,0.2)' }}>
          <div style={{ fontSize: '10px', color: '#d97706', marginBottom: '4px' }}>JUDGE VERDICT</div>
          <div style={{ fontSize: '13px', color: '#fde68a', lineHeight: '1.4', fontStyle: 'italic' }}>"{data.verdict}"</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.06)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#ef4444', marginBottom: '2px' }}>MIN EXPOSURE</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fca5a5' }}>{data.exposure?.min}</div>
          </div>
          <div style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#ef4444', marginBottom: '2px' }}>MAX EXPOSURE</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ef4444' }}>{data.exposure?.max}</div>
          </div>
        </div>
      </div>
    );
  }

  // FutureSim: show consequences
  if (agentName === 'FutureSim') return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.08)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#ef4444', marginBottom: '4px' }}>FINANCIAL DAMAGE</div>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#ef4444' }}>{data.financialDamage}</div>
        </div>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(234,179,8,0.08)', borderRadius: '6px', border: '1px solid rgba(234,179,8,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#eab308', marginBottom: '4px' }}>ESCALATION %</div>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#eab308' }}>{data.escalation}%</div>
        </div>
      </div>
      <div style={{ padding: '10px', background: 'rgba(239,68,68,0.06)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontSize: '10px', color: '#ef4444', marginBottom: '4px' }}>FINAL RECOMMENDATION</div>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fca5a5' }}>{data.recommendation}</div>
      </div>
    </div>
  );

  return null;
}

function AgentCard({ agent }) {
  const theme = STATUS_COLORS[agent.status] || STATUS_COLORS['SCANNING'];
  const icon = AGENT_ICONS[agent.agentName] || <Terminal size={18} />;
  const isProcessing = !['COMPLETE', 'ESCALATED'].includes(agent.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      style={{
        background: agent.status === 'ESCALATED'
          ? 'rgba(30,0,0,0.6)'
          : agent.status === 'COMPLETE'
          ? 'rgba(0,20,10,0.4)'
          : 'rgba(10,15,30,0.6)',
        border: `1px solid ${theme.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: `0 0 24px ${theme.color}18`,
      }}
    >
      {/* Header Row */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${theme.bg}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: theme.color, display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#f1f5f9', letterSpacing: '0.5px' }}>{agent.agentName}</div>
            <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', marginTop: '2px' }}>
              CLAUSE #{agent.clauseId}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', background: `${theme.color}20`, color: theme.color, border: `1px solid ${theme.color}40` }}>
            {agent.status}
          </span>
          {agent.runtime && (
            <span style={{ fontSize: '10px', color: '#475569' }}>{agent.runtime}ms</span>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Current Task */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' }}>CURRENT TASK</div>
          <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isProcessing && (
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.color, flexShrink: 0 }}
              />
            )}
            {agent.currentTask}
          </div>
        </div>

        {/* Live Thought Stream */}
        <div style={{ background: '#020617', padding: '10px', borderRadius: '6px', border: '1px solid #0f172a', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', color: '#334155', marginBottom: '8px', letterSpacing: '1px' }}>LIVE THOUGHT STREAM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {agent.thoughtSteps?.map((step, i) => (
              <motion.div
                key={`${step}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  color: step.startsWith('[✓]') ? '#10b981'
                    : step.startsWith('[⚠]') ? '#ef4444'
                    : step.startsWith('[>]') ? '#06b6d4'
                    : '#94a3b8',
                  lineHeight: '1.5'
                }}
              >
                {step}
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ fontSize: '11px', color: theme.color, fontFamily: 'monospace' }}
              >█</motion.div>
            )}
          </div>
        </div>

        {/* Live Data Panel — Real AI output */}
        <AnimatePresence>
          {agent.liveData && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
              <LiveDataPanel agentName={agent.agentName} data={agent.liveData} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Summary + Handoff */}
        {(agent.outputSummary || agent.handoffTo) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '1px', marginBottom: '3px' }}>OUTPUT</div>
              <div style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '600' }}>{agent.outputSummary || 'Processing...'}</div>
            </div>
            {agent.handoffTo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#06b6d4', padding: '4px 10px', background: 'rgba(6,182,212,0.1)', borderRadius: '4px', border: '1px solid rgba(6,182,212,0.2)', marginLeft: '12px', flexShrink: 0 }}>
                HANDOFF <ArrowRight size={10} /> {agent.handoffTo}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function OrchestrationRoom({ events }) {
  // Build agent map — most recent event per agent wins
  const agents = events.reduce((acc, event) => {
    if (event.agentName) {
      acc[event.agentName] = event;
    }
    return acc;
  }, {});

  const agentList = Object.values(agents);

  // Live pipeline events log (bottom bar)
  const pipelineLog = events
    .filter(e => e.agentName && e.status)
    .slice(-8);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#020617', color: '#f8fafc', overflow: 'hidden' }}>
      
      {/* HEADER */}
      <div style={{ padding: '16px 32px', borderBottom: '1px solid rgba(6,182,212,0.15)', background: 'rgba(6,182,212,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color="#06b6d4" />
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '4px', color: '#fff', fontWeight: '900' }}>TACTICAL AI PIPELINE</h2>
            <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '2px', marginTop: '2px' }}>Live Agentic Orchestration Monitor</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['ClauseSplitter', 'ProsecutorAgent', 'DefenderAgent', 'JudgeAgent', 'WarRoomSim', 'FutureSim'].map(name => {
            const agent = agents[name];
            const color = agent ? STATUS_COLORS[agent.status]?.color || '#475569' : '#1e293b';
            return (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: agent ? `0 0 8px ${color}` : 'none' }} />
                <div style={{ fontSize: '8px', color: '#334155', letterSpacing: '0.5px' }}>{name.replace('Agent','').replace('Sim','')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AGENT CARDS GRID */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {agentList.map(agent => (
              <AgentCard key={agent.agentName} agent={agent} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* LIVE PIPELINE LOG */}
      <div style={{ padding: '10px 32px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', alignItems: 'center' }}>
          <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '2px', flexShrink: 0 }}>PIPELINE LOG</div>
          {pipelineLog.map((evt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{ color: '#334155', fontSize: '9px', fontFamily: 'monospace' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
              <span style={{ fontSize: '10px', color: STATUS_COLORS[evt.status]?.color || '#64748b' }}>
                {evt.agentName}: {evt.status}
              </span>
              {i < pipelineLog.length - 1 && <ArrowRight size={10} color="#1e293b" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
