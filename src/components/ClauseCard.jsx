import React, { useState } from 'react';

const ClauseCard = ({ clause, onFight }) => {
  const [expanded, setExpanded] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);

  // Fallbacks if data is missing
  const { id, text, type, riskLevel, plainEnglish, rsExposure, indianLaw, simulation, prosecutorRaw, defenderRaw, judgeRaw } = clause;

  const getRiskColor = (level) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-900/30 text-red-400 border-red-800';
      case 'HIGH': return 'bg-orange-900/30 text-orange-400 border-orange-800';
      case 'MEDIUM': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
      case 'SAFE': return 'bg-green-900/30 text-green-400 border-green-800';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 mb-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded font-bold border ${getRiskColor(riskLevel)}`}>
            {riskLevel || 'UNKNOWN'}
          </span>
          <h3 className="text-gray-200 font-semibold text-sm">Clause {id}: {type}</h3>
        </div>
        <button 
          onClick={() => setShowThoughts(!showThoughts)}
          className="text-xs bg-gray-900 border border-gray-700 hover:border-blue-500 text-blue-400 px-2 py-1 rounded flex items-center gap-1 transition-colors"
        >
          <span>🧠</span> {showThoughts ? 'Hide Thoughts' : 'View Agent Thoughts'}
        </button>
      </div>

      <div className="text-gray-100 font-medium text-base">
        {plainEnglish}
      </div>

      <div className="text-gray-400 text-xs italic border-l-2 border-gray-600 pl-2">
        "{text}"
      </div>

      {showThoughts && (
        <div className="mt-2 bg-gray-950 border border-gray-800 rounded-lg p-3 flex flex-col gap-3 text-xs font-mono overflow-auto max-h-60 custom-scrollbar">
          <div className="text-gray-500 mb-1 font-sans font-bold uppercase tracking-widest text-[10px]">Internal Multi-Agent Debate Log</div>
          
          <div className="border-l-2 border-amber-500 pl-2">
            <div className="text-amber-500 font-bold mb-1 flex items-center gap-1"><span>🔍</span> Prosecutor Agent (Attacker)</div>
            <pre className="text-amber-200/70 whitespace-pre-wrap break-words">{JSON.stringify(prosecutorRaw || { status: "No data" }, null, 2)}</pre>
          </div>

          <div className="border-l-2 border-blue-500 pl-2">
            <div className="text-blue-500 font-bold mb-1 flex items-center gap-1"><span>🛡️</span> Defender Agent (Pushback)</div>
            <pre className="text-blue-200/70 whitespace-pre-wrap break-words">{JSON.stringify(defenderRaw || { status: "No data" }, null, 2)}</pre>
          </div>

          <div className="border-l-2 border-green-500 pl-2">
            <div className="text-green-500 font-bold mb-1 flex items-center gap-1"><span>⚖️</span> Judge Agent (Verdict)</div>
            <pre className="text-green-200/70 whitespace-pre-wrap break-words">{JSON.stringify(judgeRaw || { status: "No data" }, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-2">
        {rsExposure && (
          <div className="bg-gray-900 rounded p-2 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Rs Exposure</div>
            <div className="text-sm font-semibold text-gray-300">
              {rsExposure.minLabel} - {rsExposure.maxLabel}
            </div>
          </div>
        )}
        {indianLaw && (
          <div className="bg-gray-900 rounded p-2 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Indian Law</div>
            <div className="text-sm font-semibold text-gray-300 truncate" title={indianLaw.verdict}>
              {indianLaw.enforceable === false ? '❌ Void' : indianLaw.enforceable === 'partial' ? '⚠️ Challengeable' : '✅ Enforceable'}
            </div>
          </div>
        )}
      </div>

      {simulation && simulation.story && (
        <div className="mt-3 bg-[#1e293b] border border-blue-900/50 rounded-lg p-3">
          <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1">
            <span>🔮</span> YOUR FUTURE — 15 months from now...
          </div>
          <div className="text-sm text-gray-300 leading-relaxed">
            {simulation.story}
          </div>
          {simulation.indianCase && (
            <div className="mt-2 text-xs text-blue-300/70 border-t border-blue-900/30 pt-2">
              <strong>Case Ref:</strong> {simulation.indianCase}
            </div>
          )}
        </div>
      )}

      {(riskLevel === 'CRITICAL' || riskLevel === 'HIGH') && (
        <div className="mt-2 flex justify-end">
          <button 
            onClick={() => onFight(clause)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded flex items-center gap-2 transition-colors"
          >
            <span>⚔️</span> FIGHT THIS CLAUSE
          </button>
        </div>
      )}
    </div>
  );
};

export default ClauseCard;
