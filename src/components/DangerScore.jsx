import React from 'react';

const DangerScore = ({ score, verdict, counts }) => {
  if (score === undefined || score === null) return null;

  const getVerdictConfig = () => {
    if (score >= 70 || verdict === 'DO NOT SIGN') {
      return {
        bg: 'bg-red-950/50',
        border: 'border-red-600',
        text: 'text-red-500',
        label: 'DO NOT SIGN',
        icon: '🛑'
      };
    } else if (score >= 40 || verdict === 'NEGOTIATE') {
      return {
        bg: 'bg-yellow-950/50',
        border: 'border-yellow-500',
        text: 'text-yellow-500',
        label: 'NEGOTIATE FIRST',
        icon: '⚠️'
      };
    } else {
      return {
        bg: 'bg-green-950/50',
        border: 'border-green-500',
        text: 'text-green-500',
        label: 'SAFE TO SIGN',
        icon: '✅'
      };
    }
  };

  const config = getVerdictConfig();

  return (
    <div className={`mt-6 p-6 rounded-xl border-2 ${config.border} ${config.bg} flex flex-col gap-4 text-center shadow-lg shadow-black/50`}>
      <div className="text-sm font-bold text-gray-400 tracking-[0.2em] uppercase">Overall Verdict</div>
      
      <div className={`text-4xl md:text-5xl font-black ${config.text} tracking-wider flex items-center justify-center gap-3`}>
        <span>{config.icon}</span>
        {config.label}
      </div>
      
      <div className="flex flex-col items-center justify-center gap-1 mt-2">
        <div className="text-gray-400 text-sm font-semibold uppercase">Danger Score</div>
        <div className={`text-5xl font-black ${config.text}`}>
          {score} <span className="text-2xl text-gray-500">/ 100</span>
        </div>
      </div>

      {counts && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap justify-center gap-4 text-sm font-medium">
          <div className="text-red-400">{counts.critical || 0} CRITICAL</div>
          <div className="text-orange-400">{counts.high || 0} HIGH</div>
          <div className="text-yellow-400">{counts.medium || 0} MEDIUM</div>
          <div className="text-green-400">{counts.safe || 0} SAFE</div>
        </div>
      )}
    </div>
  );
};

export default DangerScore;
