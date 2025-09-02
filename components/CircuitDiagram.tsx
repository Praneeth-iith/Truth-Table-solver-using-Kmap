import React from 'react';

const GateStyler = () => (
    <style>{`
      .label { font-family: 'Inter', sans-serif; font-size: 14px; fill: #cbd5e1; user-select: none; }
      .wire { stroke: #64748b; stroke-width: 1.5; fill: none; }
      .gate { stroke: #94a3b8; stroke-width: 2; fill: #1e293b; }
      .connection { fill: #64748b; }
  `}</style>
)

const NotGate = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M 0 0 L 20 10 L 0 20 Z" className="gate" />
        <circle cx="23" cy="10" r="3" className="gate" />
    </g>
);

const AndGate = ({ x, y, height, inputs }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d={`M 0 0 H 15 C 35 0, 35 ${height}, 15 ${height} H 0 Z`} className="gate" />
         {inputs.map((inputY, i) => (
             <line key={i} x1="-10" y1={inputY} x2="0" y2={inputY} className="wire" />
         ))}
    </g>
);

const OrGate = ({ x, y, height, inputs }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d={`M 0 0 Q 15 0, 25 10 T 40 ${height/2} T 25 ${height} Q 15 ${height}, 0 ${height} Q 10 ${height/2}, 0 0 Z`} className="gate" />
        {inputs.map((inputY, i) => (
             <line key={i} x1="-10" y1={inputY} x2="5" y2={inputY} className="wire" />
         ))}
    </g>
);

export const CircuitDiagram = ({ simplifiedExpressionTerms, variables }) => {
    if (!simplifiedExpressionTerms) {
      return <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400">Solve the table to see the circuit.</div>;
    }

    if (simplifiedExpressionTerms.length === 0) { // Y = 0
        return (
            <div className="flex items-center justify-center bg-slate-900 rounded-lg p-4 min-h-[300px]">
                <svg width="200" height="100" viewBox="0 0 200 100">
                    <GateStyler />
                    <line x1="50" y1="50" x2="130" y2="50" className="wire" />
                    <text x="140" y="55" className="label">Y = 0</text>
                    <text x="30" y="55" className="label">GND</text>
                    <line x1="50" y1="45" x2="50" y2="55" className="wire" />
                    <line x1="45" y1="55" x2="55" y2="55" className="wire" />
                    <line x1="47" y1="58" x2="53" y2="58" className="wire" />
                </svg>
            </div>
        )
    }

    if (simplifiedExpressionTerms.length === 1 && simplifiedExpressionTerms[0].length === 0) { // Y = 1
       return (
            <div className="flex items-center justify-center bg-slate-900 rounded-lg p-4 min-h-[300px]">
                <svg width="200" height="100" viewBox="0 0 200 100">
                    <GateStyler />
                    <line x1="50" y1="50" x2="130" y2="50" className="wire" />
                    <text x="140" y="55" className="label">Y = 1</text>
                    <text x="30" y="55" className="label">VCC</text>
                    <line x1="50" y1="45" x2="50" y2="55" className="wire" />
                    <line x1="45" y1="45" x2="55" y2="45" className="wire" />
                </svg>
            </div>
        )
    }

    const vSpace = 50;
    const col1X = 50, col2X = 120, col3X = 250, col4X = 350, outX = 420;
    
    const andGateVSpacing = 60;
    const numAndGates = simplifiedExpressionTerms.filter(t => t.length > 1).length;
    const totalHeight = Math.max(variables.length * vSpace, (numAndGates || 1) * andGateVSpacing, 250) + 50;

    const inputBus = {};
    variables.forEach((v, i) => {
        const y = (totalHeight / (variables.length + 1)) * (i + 1);
        inputBus[v] = y;
    });

    const needsOrGate = simplifiedExpressionTerms.length > 1;
    const multiLiteralTerms = simplifiedExpressionTerms.filter(term => term.length > 1);

    const orGateHeight = Math.max(40, simplifiedExpressionTerms.length * 20);
    const orGateY = (totalHeight / 2) - (orGateHeight / 2);

    return (
        <div className="flex items-center justify-center bg-slate-900 rounded-lg p-4 min-h-[300px] overflow-x-auto">
            <svg width="100%" viewBox={`0 0 ${outX + 50} ${totalHeight}`}>
                <GateStyler />
                
                {variables.map((v) => {
                    const y = inputBus[v];
                    return (
                        <g key={`input-${v}`}>
                            <text x={col1X - 20} y={y + 5} className="label">{v}</text>
                            <line x1={col1X} y1={y} x2={col2X - 10} y2={y} className="wire" />
                            <circle cx={col1X} cy={y} r="3" className="connection" />
                            <NotGate x={col2X} y={y - 10} />
                            <line x1={col2X + 26} y1={y} x2={col3X - 50} y2={y} className="wire" />
                             <circle cx={col2X + 26} cy={y} r="3" className="connection" />
                        </g>
                    )
                })}
                
                {needsOrGate && <OrGate x={col4X} y={orGateY} height={orGateHeight} inputs={simplifiedExpressionTerms.map((_, i) => (orGateHeight / (simplifiedExpressionTerms.length + 1)) * (i + 1))} />}

                {simplifiedExpressionTerms.map((term, termIdx) => {
                    const orGateInputY = orGateY + (orGateHeight / (simplifiedExpressionTerms.length + 1)) * (termIdx + 1);

                    if (term.length > 1) { // AND Gate Path
                        const gateHeight = Math.max(30, (term.length - 1) * 20);
                        const gateY = (totalHeight / (multiLiteralTerms.length + 1)) * (multiLiteralTerms.indexOf(term) + 1) - (gateHeight / 2);
                        const gateOutputY = gateY + gateHeight/2;
                        const inputTermY = term.map((_, i) => (gateHeight / (term.length -1) || 0) * i);
                        
                        return (
                            <g key={`term-${termIdx}`}>
                               <AndGate x={col3X} y={gateY} height={gateHeight} inputs={inputTermY} />
                               {term.map((literal, litIdx) => {
                                   const isNegated = literal.endsWith("'");
                                   const baseVar = isNegated ? literal.slice(0, -1) : literal;
                                   const startY = inputBus[baseVar];
                                   const startX = isNegated ? col2X + 26 : col1X;
                                   const endY = gateY + inputTermY[litIdx];
                                   return <path key={litIdx} d={`M ${startX} ${startY} H ${col3X - 10} V ${endY}`} className="wire" />;
                               })}
                               {needsOrGate && <path d={`M ${col3X + 30} ${gateOutputY} H ${col4X - 10} V ${orGateInputY}`} className="wire" />}
                            </g>
                        )
                    } else if (term.length === 1) { // Direct Wire Path
                        const literal = term[0];
                        const isNegated = literal.endsWith("'");
                        const baseVar = isNegated ? literal.slice(0, -1) : literal;
                        const startY = inputBus[baseVar];
                        const startX = isNegated ? col2X + 26 : col1X;
                        if (needsOrGate) {
                            return <path key={`term-${termIdx}`} d={`M ${startX} ${startY} H ${col4X - 10} V ${orGateInputY}`} className="wire" />;
                        }
                    }
                    return null;
                })}

                {(() => {
                    let startX, startY, endX = outX;
                    if (needsOrGate) {
                        startX = col4X + 35;
                        startY = orGateY + orGateHeight / 2;
                    } else {
                        const term = simplifiedExpressionTerms[0];
                        if (term.length > 1) {
                            const gateHeight = Math.max(30, (term.length - 1) * 20);
                            const gateY = (totalHeight / 2) - (gateHeight / 2);
                            startY = gateY + gateHeight/2;
                            startX = col3X + 30;
                        } else {
                            const literal = term[0];
                            const isNegated = literal.endsWith("'");
                            const baseVar = isNegated ? literal.slice(0, -1) : literal;
                            startY = inputBus[baseVar];
                            startX = isNegated ? col2X + 26 : col1X;
                            endX = outX; // extend wire to output
                        }
                    }
                    return (
                        <>
                            <line x1={startX} y1={startY} x2={endX} y2={startY} className="wire" />
                            <text x={endX + 10} y={startY + 5} className="label">Y</text>
                        </>
                    );
                })()}
            </svg>
        </div>
    );
};
