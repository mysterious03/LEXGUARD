import React from 'react';

const AgentPanel = ({ agentName, status, output, clauseId, liveText }) => {
  const isRunning = status === 'running';
  const isDone = status === 'done';
  const isSkipped = status === 'skipped';

  let borderClass = 'border-slate-800 bg-slate-900/50';
  let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
  let icon = '⚡';

  if (agentName.includes('Splitter')) icon = '✂️';
  else if (agentName.includes('Prosecutor')) icon = '🔍';
  else if (agentName.includes('Defender')) icon = '🛡️';
  else if (agentName.includes('Judge')) icon = '⚖️';
  else if (agentName.includes('Simulation')) icon = '🔮';
  else if (agentName.includes('Law Checker')) icon = '📚';

  if (isRunning) {
    borderClass = 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-[pulse-glow_2s_ease-in-out_infinite]';
    badgeColor = 'bg-cyan-900/40 text-cyan-400 border-cyan-800/50';
  } else if (isDone) {
    borderClass = 'border-emerald-500/30 bg-slate-900/80';
    badgeColor = 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50';
  } else if (isSkipped) {
    borderClass = 'border-slate-800/50 bg-transparent opacity-60';
  }

  return (
    <div className={`glass-panel border-l-4 rounded-lg p-4 transition-all duration-500 flex flex-col gap-2 ${borderClass}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl opacity-80">{icon}</span>
          <div>
            <h3 className="text-slate-200 font-semibold text-sm tracking-wide">
              {agentName}
            </h3>
            {clauseId && (
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Clause {clauseId}</span>
            )}
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-widest border ${badgeColor} flex items-center gap-1`}>
          {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>}
          {status}
        </span>
      </div>
      
      {isDone && output && (
        <div className="mt-2 text-sm text-slate-300 font-medium pl-8 border-l border-slate-700 ml-2 py-1 animate-[fade-in-up_0.3s_ease-out_forwards]">
          {output}
        </div>
      )}
      
      {isRunning && (
        <div className="mt-2 pl-8 ml-2 flex flex-col gap-2">
          {liveText ? (
            <div className="text-xs font-mono text-cyan-400 bg-[#040814]/80 p-2 rounded border border-cyan-900/30 shadow-inner">
              <span className="opacity-50 select-none mr-2">›</span>
              {liveText}
              <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
            </div>
          ) : (
            <div className="h-1.5 w-16 bg-slate-800 rounded overflow-hidden">
              <div className="h-full bg-cyan-500/50 animate-[flow_1s_linear_infinite]" style={{width: '200%'}}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentPanel;
