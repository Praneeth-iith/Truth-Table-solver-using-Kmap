import React, { useState, useCallback, useEffect } from 'react';
import { TruthTable } from './components/TruthTable.jsx';
import { KarnaughMap } from './components/KarnaughMap.jsx';
import { VerilogCode } from './components/VerilogCode.jsx';
import { VerilogTestbench } from './components/VerilogTestbench.jsx';
import { CircuitDiagram } from './components/CircuitDiagram.jsx';
import { SimplifiedExpression } from './components/SimplifiedExpression.jsx';
import { TableIcon, MapIcon, CodeIcon, CircuitIcon, TestbenchIcon } from './components/Icons.jsx';
import { solveFromOutputs } from './logic/parser.js';

const App = () => {
  const [numVariables, setNumVariables] = useState(3);
  const [outputs, setOutputs] = useState(Array(2**3).fill(0));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('kmap');

  useEffect(() => {
    const newSize = 2 ** numVariables;
    setOutputs(Array(newSize).fill(0));
    setResult(null);
    setError(null);
  }, [numVariables]);
  
  const handleOutputChange = (index, value) => {
    const newOutputs = [...outputs];
    newOutputs[index] = value;
    setOutputs(newOutputs);
    setResult(null); // Invalidate old results when outputs change
  };

  const handleSolve = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    setTimeout(() => {
      try {
        const processedResult = solveFromOutputs(numVariables, outputs);
        setResult(processedResult);
        setActiveTab('kmap');
      } catch (e) {
        setError(e.message || 'An unexpected error occurred during processing.');
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [numVariables, outputs]);
  
  const renderContent = () => {
     if (error) {
      return (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg h-full flex items-center justify-center min-h-[300px]">
          <p className="font-semibold text-lg">{error}</p>
        </div>
      );
    }
    if (!result) {
       return (
        <div className="bg-slate-800/50 border border-slate-700 text-slate-400 p-4 rounded-lg h-full flex items-center justify-center min-h-[300px]">
          <p>Set the output values in the truth table and click "Solve" to see the results.</p>
        </div>
       );
    }
    
    switch (activeTab) {
      case 'kmap':
        return <KarnaughMap variables={result.variables} minterms={result.minterms} />;
      case 'verilog':
        return <VerilogCode simplifiedTerms={result.simplifiedExpressionTerms} variables={result.variables} />;
      case 'testbench':
        return <VerilogTestbench variables={result.variables} />;
      case 'circuit':
        return <CircuitDiagram simplifiedExpressionTerms={result.simplifiedExpressionTerms} variables={result.variables} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <TableIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">
              Truth Table Solver
            </h1>
          </div>
          <p className="text-slate-400 mt-2 text-lg">Created by Praneeth</p>
        </header>

        <main className="space-y-6">
           <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 sticky top-4 z-10 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <label htmlFor="variable-select" className="text-slate-300 font-medium">Number of Variables:</label>
                    <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg p-1">
                        {[2, 3, 4].map(num => (
                            <button key={num} onClick={() => setNumVariables(num)} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${numVariables === num ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
                 <button
                    onClick={handleSolve}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-cyan-600 text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Solving...' : 'Solve'}
                </button>
            </div>
           </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
                <TruthTable numVariables={numVariables} outputs={outputs} onOutputChange={handleOutputChange} />
            </div>
            <div className="lg:col-span-3">
               <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg mb-6">
                  <SimplifiedExpression result={result} />
               </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                    <div className="border-b border-slate-700 px-2 sm:px-4">
                        <nav className="flex -mb-px">
                            <TabButton icon={<MapIcon />} label="K-Map" isActive={activeTab === 'kmap'} onClick={() => setActiveTab('kmap')} />
                            <TabButton icon={<CodeIcon />} label="Verilog" isActive={activeTab === 'verilog'} onClick={() => setActiveTab('verilog')} />
                            <TabButton icon={<TestbenchIcon />} label="Testbench" isActive={activeTab === 'testbench'} onClick={() => setActiveTab('testbench')} />
                            <TabButton icon={<CircuitIcon />} label="Circuit" isActive={activeTab === 'circuit'} onClick={() => setActiveTab('circuit')} />
                        </nav>
                    </div>
                    <div className="p-4 sm:p-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        role="tab"
        aria-selected={isActive}
        className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
        }`}
    >
        {React.cloneElement(icon, { className: 'h-5 w-5' })}
        <span className="hidden sm:inline">{label}</span>
    </button>
);


export default App;
