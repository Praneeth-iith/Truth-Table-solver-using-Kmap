import React, { useState, useMemo } from 'react';
import { CopyIcon, CheckIcon } from './Icons.jsx';

const generateVerilog = (simplifiedTerms, variables) => {
  const moduleName = "logic_circuit";
  const inputs = variables.join(', ');
  
  if (simplifiedTerms.length === 0) {
    // This happens if all outputs are 0
    return `
module ${moduleName}(
  input  logic ${inputs},
  output logic Y
);

  // All outputs are 0
  assign Y = 1'b0;

endmodule
    `.trim();
  }

  if (simplifiedTerms.length === 1 && simplifiedTerms[0].length === 0) {
    // This happens if all outputs are 1
     return `
module ${moduleName}(
  input  logic ${inputs},
  output logic Y
);

  // All outputs are 1
  assign Y = 1'b1;

endmodule
    `.trim();
  }

  const termsToVerilog = simplifiedTerms.map(term => {
    const literals = term.map(literal => {
      if (literal.endsWith("'")) {
        return `~${literal.slice(0, -1)}`;
      }
      return literal;
    });
    return `(${literals.join(' & ')})`;
  });

  const sopExpression = termsToVerilog.join(' | ');

  const verilogCode = `
module ${moduleName}(
  input  logic ${inputs},
  output logic Y
);

  // Behavioral model for the simplified expression
  assign Y = ${sopExpression};

endmodule
`;
  return verilogCode.trim();
};

export const VerilogCode = ({ simplifiedTerms, variables }) => {
  const [copied, setCopied] = useState(false);
  const verilogCode = useMemo(() => generateVerilog(simplifiedTerms, variables), [simplifiedTerms, variables]);

  const handleCopy = () => {
    navigator.clipboard.writeText(verilogCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="relative bg-slate-900 rounded-lg">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors"
          aria-label="Copy Verilog code"
        >
          {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
        </button>
        <pre className="p-4 pt-10 text-sm text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap">
          <code className="language-verilog">{verilogCode}</code>
        </pre>
      </div>
    </div>
  );
};
