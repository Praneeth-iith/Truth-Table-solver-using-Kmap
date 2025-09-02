import React from 'react';

interface CircuitDiagramProps {
  expression: string;
  variables: string[];
}

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({ expression, variables }) => {
  const boxWidth = 200;
  const boxHeight = 100 + variables.length * 15;
  const totalWidth = boxWidth + 200;
  const totalHeight = boxHeight + 50;
  const startX = 50;
  const startY = 25;
  const boxX = startX + 70;

  return (
    <div className="flex items-center justify-center bg-slate-900 rounded-lg p-4 min-h-[300px]">
      <svg width="100%" viewBox={`0 0 ${totalWidth} ${totalHeight}`} className="max-w-lg">
        <style>
          {`
            .label { font-family: 'Inter', sans-serif; font-size: 12px; fill: #cbd5e1; }
            .expression-label { font-family: 'Inter', sans-serif; font-size: 10px; fill: #94a3b8; }
            .wire { stroke: #64748b; stroke-width: 1.5; fill: none; }
            .box { fill: #1e293b; stroke: #475569; stroke-width: 2; }
            .pin { fill: #94a3b8; }
          `}
        </style>

        {/* Logic Box */}
        <rect x={boxX} y={startY} width={boxWidth} height={boxHeight} rx="8" className="box" />
        <text x={boxX + boxWidth / 2} y={startY + 20} textAnchor="middle" className="label">LOGIC</text>
        <text x={boxX + boxWidth / 2} y={startY + 35} textAnchor="middle" className="expression-label" >{expression}</text>

        {/* Input Wires and Labels */}
        {variables.map((v, i) => {
          const y = startY + 30 + i * 20;
          return (
            <g key={`input-${v}`}>
              <line x1={startX} y1={y} x2={boxX} y2={y} className="wire" />
              <circle cx={boxX} cy={y} r="3" className="pin" />
              <text x={startX - 10} y={y + 4} textAnchor="end" className="label">{v}</text>
            </g>
          );
        })}

        {/* Output Wire and Label */}
        <g>
            <line x1={boxX + boxWidth} y1={startY + boxHeight / 2} x2={boxX + boxWidth + 70} y2={startY + boxHeight / 2} className="wire" />
            <circle cx={boxX + boxWidth} cy={startY + boxHeight / 2} r="3" className="pin" />
            <text x={boxX + boxWidth + 75} y={startY + boxHeight / 2 + 4} className="label">Y</text>
        </g>
      </svg>
    </div>
  );
};
