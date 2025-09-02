import React, { useMemo } from 'react';

interface TruthTableProps {
  numVariables: number;
  outputs: (0 | 1)[];
  onOutputChange: (index: number, value: 0 | 1) => void;
}

export const TruthTable: React.FC<TruthTableProps> = ({ numVariables, outputs, onOutputChange }) => {
  const { headers, rows } = useMemo(() => {
    const variables = 'pqrstuvw'.slice(0, numVariables).split('');
    const headers = [...variables, 'Output'];
    const numRows = 2 ** numVariables;
    const rows: (boolean[])[] = [];

    for (let i = 0; i < numRows; i++) {
      const row: boolean[] = [];
      for (let j = 0; j < numVariables; j++) {
        row.push(((i >> (numVariables - 1 - j)) & 1) === 1);
      }
      rows.push(row);
    }
    return { headers, rows };
  }, [numVariables]);

  return (
    <div className="bg-slate-800/50 p-4 sm:p-6 rounded-xl border border-slate-700 shadow-lg h-full overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-100 mb-4 text-center">Define Truth Table</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-center text-sm sm:text-base table-auto">
                <thead>
                <tr className="bg-slate-800/70">
                    {headers.map((header, index) => (
                    <th key={index} className="p-3 sm:p-4 font-semibold text-slate-300 tracking-wider whitespace-nowrap">
                        {header}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-slate-700">
                    {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={`p-3 font-mono ${cell ? 'text-green-400/80' : 'text-red-400/80'}`}>
                        {cell ? '1' : '0'}
                        </td>
                    ))}
                    <td className="p-2">
                        <button
                            onClick={() => onOutputChange(rowIndex, outputs[rowIndex] === 1 ? 0 : 1)}
                            className={`w-10 h-10 font-mono font-bold text-lg rounded-md transition-colors ${
                                outputs[rowIndex] === 1
                                ? 'bg-green-500/30 text-green-300 hover:bg-green-500/40'
                                : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            }`}
                        >
                            {outputs[rowIndex]}
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
