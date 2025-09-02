import React from 'react';

export const SimplifiedExpression = ({ result }) => {
  const renderExpression = () => {
    if (!result) {
      return <span className="text-slate-500">...</span>;
    }
    if (result.simplifiedExpression === '0') {
      return <span className="font-mono text-3xl text-red-400">0</span>;
    }
    if (result.simplifiedExpression === '1') {
      return <span className="font-mono text-3xl text-green-400">1</span>;
    }
    if (!result.simplifiedExpression) {
         return <span className="text-slate-500">Not solved</span>;
    }
    return (
       <span className="font-mono text-xl sm:text-2xl md:text-3xl text-cyan-300 tracking-wide">
        {result.simplifiedExpression}
      </span>
    );
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Simplified Expression (SOP)</h3>
      <div className="flex items-center justify-center bg-slate-900/70 p-4 rounded-lg min-h-[60px]">
         <p>
            <span className="font-mono text-xl sm:text-2xl md:text-3xl text-slate-200">Y = </span>
            {renderExpression()}
         </p>
      </div>
    </div>
  );
};
