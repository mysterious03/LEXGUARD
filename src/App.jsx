import React, { useState } from 'react';
import { analyzeDocumentSystem } from './api/orchestrator';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User, DollarSign, Network } from 'lucide-react';

import OrchestrationRoom from './components/OrchestrationRoom';
import CourtroomEngine from './components/CourtroomEngine';
import FutureSimulation from './components/FutureSimulation';
import AgentGraph from './components/AgentGraph';
import { SAMPLE_DOCUMENTS } from './utils/sampleDocuments';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    @keyframes pulse-cyan { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes glow-pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

    body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background: #000000; color: #ededed; }
    
    .cyber-bg {
      background-color: #000000;
      background-image: 
        radial-gradient(circle at top right, rgba(255, 255, 255, 0.03) 0%, transparent 40%),
        radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.02) 0%, transparent 40%);
    }
    
    .glass-panel {
      background: rgba(15, 15, 15, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.5);
    }

    .input-field {
      background: #0a0a0a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fafafa;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
      transition: all 0.2s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }
    .input-field:focus { 
      border-color: rgba(255, 255, 255, 0.3); 
      background: #111111; 
      box-shadow: 0 0 0 2px rgba(255,255,255,0.05); 
    }

    .btn-primary {
      background: #ffffff;
      color: #000000;
      border: 1px solid transparent;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary:hover { 
      background: #e5e5e5; 
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.1); 
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; border: 2px solid #000; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
  `}</style>
);

export default function App() {
  const [contractText, setContractText] = useState(SAMPLE_DOCUMENTS[0].content);
  const [userRole, setUserRole]         = useState('Software Engineer');
  const [monthlySalary, setMonthlySalary] = useState(150000);

  const [viewMode, setViewMode] = useState('INPUT'); // INPUT | ORCHESTRATION | COURTROOM | SIMULATION
  const [showGraph, setShowGraph] = useState(false);

  const [events, setEvents]     = useState([]);
  const [finalData, setFinalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const startAnalysis = async () => {
    if (!contractText.trim() || isLoading) return;
    setIsLoading(true);
    setViewMode('ORCHESTRATION');
    setEvents([]);
    setFinalData(null);

    try {
      const result = await analyzeDocumentSystem(
        contractText,
        { role: userRole, monthlySalary: Number(monthlySalary) },
        (evt) => setEvents(prev => [...prev, evt])
      );

      if (result) {
        setFinalData(result);
      } else {
        alert('CRITICAL SYSTEM FAILURE: Unable to parse document clauses. Check console for details.');
        resetSystem();
      }
    } catch (err) {
      console.error('[App] Analysis error:', err);
      alert(`ENGINE ERROR: ${err.message?.slice(0, 120) || 'Unknown error'}`);
      resetSystem();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrchestrationComplete = () => setViewMode('COURTROOM');
  const handleCourtroomComplete     = () => setViewMode('SIMULATION');
  const resetSystem = () => { setViewMode('INPUT'); setEvents([]); setFinalData(null); setIsLoading(false); };

  const isOrchestrationDone = events.some(e => e.type === 'SYSTEM' && e.action === 'ORCHESTRATION_COMPLETE');

  return (
    <div className="cyber-bg" style={{ display: 'flex', width: '100vw', height: '100vh', color: '#e8e6e0', margin: 0, overflow: 'hidden', position: 'relative' }}>
      <GlobalStyles />

      {/* Scanline effect */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, rgba(6,182,212,0.8), transparent)', zIndex: 100, animation: 'scanline 8s linear infinite', pointerEvents: 'none' }} />

      {/* Agent Pipeline Graph Modal */}
      <AgentGraph isVisible={showGraph} onClose={() => setShowGraph(false)} />

      <AnimatePresence mode="wait">

        {/* ─────────── INPUT SCREEN ─────────── */}
        {viewMode === 'INPUT' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', overflowY: 'auto' }}
          >
            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '36px' }}>
              <Server size={56} color="#ffffff" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' }} />
              <h1 style={{ fontSize: '44px', fontWeight: '800', color: '#fff', letterSpacing: '8px', margin: '0 0 6px 0' }}>
                LEXGUARD
              </h1>
              <p style={{ color: '#888888', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '11px', margin: 0, fontWeight: '500' }}>
                Agentic Legal Intelligence · 6-Agent Sequential Chain
              </p>
              <button
                onClick={() => setShowGraph(true)}
                style={{ marginTop: '16px', padding: '6px 16px', background: 'transparent', border: '1px solid #333', color: '#aaaaaa', borderRadius: '20px', cursor: 'pointer', fontSize: '10px', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaaaaa'; }}
              >
                <Network size={11} /> VIEW AGENT PIPELINE
              </button>
            </motion.div>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '820px', padding: '36px' }}>

              {/* Sample case selector */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', color: '#888', letterSpacing: '1px', marginBottom: '12px', fontWeight: '500' }}>PRELOADED TEST CASES</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {SAMPLE_DOCUMENTS.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setContractText(doc.content)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '11px', letterSpacing: '0.5px' }}
                    >
                      {doc.title.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contract textarea */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#fafafa', letterSpacing: '1px', fontWeight: '500' }}>RAW DOCUMENT INGESTION</label>
                  <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                    SYSTEM READY
                  </span>
                </div>
                <textarea
                  value={contractText}
                  onChange={e => setContractText(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: '220px', padding: '16px', fontSize: '13px', resize: 'none', lineHeight: '1.6' }}
                  placeholder="Paste employment contract text here..."
                />
              </div>

              {/* User Profile row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '9px', color: '#475569', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                    <User size={10} /> YOUR ROLE
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '9px', color: '#475569', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                    <DollarSign size={10} /> MONTHLY SALARY (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={e => setMonthlySalary(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="e.g. 150000"
                    min="10000"
                    step="10000"
                  />
                </div>
              </div>

              {/* Chain info bar */}
              <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', fontSize: '10px', color: '#a3a3a3', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
                <span style={{ color: '#fff', fontWeight: '600' }}>CHAIN:</span>
                {['ClauseSplitter', '→', 'Prosecutor', '→', 'Defender', '→', 'Judge', '→', 'WarRoom×3', '→', 'FutureSim'].map((n, i) => (
                  <span key={i} style={{ color: n === '→' ? '#333' : '#a3a3a3' }}>{n}</span>
                ))}
                <span style={{ marginLeft: 'auto', color: '#525252', fontSize: '9px' }}>Each agent receives full output of all previous agents</span>
              </div>

              {/* Launch button */}
              <button
                onClick={startAnalysis}
                disabled={isLoading || !contractText.trim()}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontWeight: '600', fontSize: '13px', letterSpacing: '2px', opacity: (isLoading || !contractText.trim()) ? 0.4 : 1 }}
              >
                {isLoading ? 'INITIALIZING AGENT CHAIN...' : 'INITIALIZE AI PROCESSING CORE'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─────────── ORCHESTRATION SCREEN ─────────── */}
        {viewMode === 'ORCHESTRATION' && (
          <motion.div key="orchestration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <OrchestrationRoom events={events} />

            {isOrchestrationDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' }}
              >
                <button
                  onClick={() => setShowGraph(true)}
                  style={{ padding: '12px 20px', background: 'transparent', color: '#a3a3a3', border: '1px solid #333', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#a3a3a3'; }}
                >
                  <Network size={14} /> PIPELINE GRAPH
                </button>
                <button
                  onClick={handleOrchestrationComplete}
                  style={{ padding: '12px 28px', backgroundColor: '#fff', color: '#000', border: '1px solid #fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', letterSpacing: '1px', fontSize: '12px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e5e5e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  ENTER COURTROOM DEBATE ENGINE →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─────────── COURTROOM SCREEN ─────────── */}
        {viewMode === 'COURTROOM' && finalData && (
          <motion.div key="courtroom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex' }}>
            <CourtroomEngine
              clause={finalData.activeClause}
              prosecutor={finalData.prosecutorOutput}
              defender={finalData.defenderOutput}
              judge={finalData.judgeOutput}
              rsExposure={finalData.rsExposure}
              onComplete={handleCourtroomComplete}
            />
          </motion.div>
        )}

        {/* ─────────── SIMULATION SCREEN ─────────── */}
        {viewMode === 'SIMULATION' && finalData && (
          <motion.div key="simulation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex' }}>
            <FutureSimulation
              simulationData={finalData.futureSimulation}
              warRoomRounds={finalData.warRoomRounds}
              onReset={resetSystem}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
