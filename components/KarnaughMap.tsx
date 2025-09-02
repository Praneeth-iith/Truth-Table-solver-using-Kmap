import React from 'react';

interface KarnaughMapProps {
  variables: string[];
  minterms: number[];
}

export const KarnaughMap: React.FC<KarnaughMapProps> = ({ variables, minterms }) => {
  const varCount = variables.length;

  if (varCount < 2 || varCount > 4) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 text-center p-4">
        <p>Karnaugh maps are supported for 2, 3, and 4 variables only. Your expression has {varCount}.</p>
      </div>
    );
  }

  const grayCode = (n: number): string[] => {
    if (n === 1) return ['0', '1'];
    const prev = grayCode(n - 1);
    return [...prev.map(c => '0' + c), ...[...prev].reverse().map(c => '1' + c)];
  };

  const getMapLayout = () => {
    if (varCount === 2) { // 2x2
      return {
        rows: grayCode(1),
        cols: grayCode(1),
        rowVars: variables.slice(0, 1),
        colVars: variables.slice(1, 2),
      };
    } else if (varCount === 3) { // 2x4
      return {
        rows: grayCode(1),
        cols: grayCode(2),
        rowVars: variables.slice(0, 1),
        colVars: variables.slice(1, 3),
      };
    } else { // 4x4
      return {
        rows: grayCode(2),
        cols: grayCode(2),
        rowVars: variables.slice(0, 2),
        colVars: variables.slice(2, 4),
      };
    }
  };

  const { rows, cols, rowVars, colVars } = getMapLayout();
  const mintermSet = new Set(minterms);

  return (
    <div className="overflow-x-auto p-2">
      <table className="border-collapse border-2 border-slate-600 font-mono text-center mx-auto">
        <thead>
          <tr>
            <th className="border border-slate-600 p-2 text-slate-400 text-xs sm:text-sm">
                {rowVars.join('')}<span className="text-slate-500">\</span>{colVars.join('')}
            </th>
            {cols.map(col => (
              <th key={col} className="border border-slate-600 p-2 text-cyan-400 font-semibold text-base sm:text-lg">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row}>
              <th className="border border-slate-600 p-2 text-cyan-400 font-semibold text-base sm:text-lg">
                {row}
              </th>
              {cols.map(col => {
                const binaryStr = row + col;
                const decimalValue = parseInt(binaryStr, 2);
                const isMinterm = mintermSet.has(decimalValue);
                return (
                  <td
                    key={col}
                    className={`border border-slate-700 w-12 h-12 sm:w-16 sm:h-16 text-2xl sm:text-3xl font-bold transition-colors ${
                      isMinterm ? 'bg-green-500/20 text-green-300' : 'bg-slate-800/30 text-slate-500'
                    }`}
                  >
                    {isMinterm ? '1' : '0'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
