import React, { useState, useMemo } from 'react';
import { CopyIcon, CheckIcon } from './Icons.jsx';

const generateTestbench = (variables) => {
    const moduleName = "logic_circuit";
    const testbenchModuleName = `${moduleName}_tb`;
    const inputs = variables.join(', ');
    const numInputs = variables.length;
    const numCombinations = 1 << numInputs;

    const inputDeclarations = variables.map(v => `  reg ${v};`).join('\n');
    const dutPorts = variables.map(v => `    .${v}(${v})`).join(',\n');

    const testVectors = [];
    for (let i = 0; i < numCombinations; i++) {
        const assignments = [];
        for (let j = 0; j < numInputs; j++) {
            const val = (i >> (numInputs - 1 - j)) & 1;
            assignments.push(`${variables[j]} = 1'b${val};`);
        }
        testVectors.push(`      #10 ${assignments.join(' ')}`);
    }

    return `
\`timescale 1ns/1ps

module ${testbenchModuleName};

  // Inputs to the DUT
${inputDeclarations}

  // Output from the DUT
  wire Y;

  // Instantiate the Unit Under Test (UUT)
  ${moduleName} dut (
${dutPorts},
    .Y(Y)
  );

  initial begin
    // Initialize Inputs
    ${variables.map(v => `${v} = 0;`).join(' ')}

    // Apply test vectors
    $display("Starting testbench for ${moduleName}...");
    $monitor("Time=%0t ${variables.map(v => `${v}=%b`).join(' ')}, Y=%b", $time, ${inputs}, Y);

    // Cycle through all possible input combinations
${testVectors.join('\n')}

      #10;
      $display("Testbench finished.");
      $finish;
  end

endmodule
    `.trim();
};


export const VerilogTestbench = ({ variables }) => {
  const [copied, setCopied] = useState(false);
  const testbenchCode = useMemo(() => generateTestbench(variables), [variables]);

  const handleCopy = () => {
    navigator.clipboard.writeText(testbenchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="relative bg-slate-900 rounded-lg">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors"
          aria-label="Copy Verilog testbench code"
        >
          {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
        </button>
        <pre className="p-4 pt-10 text-sm text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap">
          <code className="language-verilog">{testbenchCode}</code>
        </pre>
      </div>
    </div>
  );
};
