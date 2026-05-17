import React from 'react';

const WarRoom = ({ negotiationData, onClose }) => {
  if (!negotiationData) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">
      <div className="w-full md:w-[80%] lg:w-[70%] bg-gray-900 h-full border-l border-gray-700 flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h2 className="text-xl font-bold text-white">Negotiation War Room</h2>
              <p className="text-xs text-gray-500">3-round simulation to prepare your counter</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-gray-500">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-4">
          {/* Round 1 */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Round 1</div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg flex-1 flex flex-col overflow-hidden">
              <div className="bg-gray-950 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Your Email</span>
                <button onClick={() => handleCopy(negotiationData.round1?.email)} className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300">Copy</button>
              </div>
              <div className="p-4 text-sm text-gray-300 whitespace-pre-wrap flex-1 overflow-auto">
                <div className="text-xs text-gray-500 mb-2 border-b border-gray-700 pb-2">Subject: {negotiationData.round1?.subject || 'Request for Modification'}</div>
                {negotiationData.round1?.email || "Generating email..."}
              </div>
            </div>
          </div>

          {/* Round 2 */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">Round 2 (Simulated)</div>
            <div className="bg-gray-800 border border-orange-900/50 rounded-lg flex-1 flex flex-col overflow-hidden">
              <div className="bg-gray-950 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">HR Response</span>
                <button onClick={() => handleCopy(negotiationData.round2?.hrResponse)} className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300">Copy</button>
              </div>
              <div className="p-4 text-sm text-gray-300 whitespace-pre-wrap flex-1 overflow-auto italic text-orange-200/80">
                {negotiationData.round2?.hrResponse || "Simulating HR pushback..."}
              </div>
            </div>
          </div>

          {/* Round 3 */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-xs font-bold text-green-500 uppercase tracking-wider">Round 3</div>
            <div className="bg-gray-800 border border-green-900/50 rounded-lg flex-1 flex flex-col overflow-hidden">
              <div className="bg-gray-950 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Your Counter</span>
                <button onClick={() => handleCopy(negotiationData.round3?.counter)} className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300">Copy</button>
              </div>
              <div className="p-4 text-sm text-gray-300 whitespace-pre-wrap flex-1 overflow-auto font-medium">
                {negotiationData.round3?.counter || "Preparing counter-argument..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarRoom;
