import type { ProcessedResult } from '../types';

const VAR_NAMES = 'pqrstuvw'.split('');

// Represents a group of minterms (an implicant) and its corresponding boolean term.
type Implicant = { minterms: number[]; term: string[] };

/**
 * Generates all possible implicants (potential K-map groups) for a given number of variables.
 * It works by creating every possible "sub-cube" in the boolean hypercube.
 * @param numVars - The number of variables (2, 3, or 4).
 * @returns An array of all possible implicants, sorted from largest group to smallest.
 */
const generateImplicants = (numVars: number): Implicant[] => {
    const implicants: Implicant[] = [];
    const numMinterms = 1 << numVars;

    // A term is defined by which variables are fixed, and to what value.
    // 'mask' has a 1 for fixed variables. 'value' has the value for those fixed variables.
    for (let mask = 0; mask < numMinterms; mask++) {
        for (let value = 0; value < numMinterms; value++) {
            if ((mask & value) !== value) continue; // Inconsistent state, skip

            const term: string[] = [];
            for (let i = 0; i < numVars; i++) {
                const bitMask = 1 << (numVars - 1 - i);
                if (mask & bitMask) { // This variable is fixed in the term
                    const isNegated = (value & bitMask) === 0;
                    term.push(VAR_NAMES[i] + (isNegated ? "'" : ""));
                }
            }
            
            // Don't generate the empty term that covers everything unless it's for the '1' case
            if (term.length === 0 && numMinterms > 1) continue;

            const minterms: number[] = [];
            const floatingBitsCount = numVars - term.length;
            for (let i = 0; i < (1 << floatingBitsCount); i++) {
                let currentMinterm = value;
                let floatingBitIndex = 0;
                for (let j = 0; j < numVars; j++) {
                    const bitMask = 1 << (numVars - 1 - j);
                    if (!(mask & bitMask)) { // This bit is floating
                        if ((i >> floatingBitIndex) & 1) {
                            currentMinterm |= bitMask;
                        }
                        floatingBitIndex++;
                    }
                }
                minterms.push(currentMinterm);
            }
            implicants.push({ minterms: minterms.sort((a,b)=>a-b), term });
        }
    }
    
    // Add the "1" case (all minterms)
    implicants.push({
        minterms: Array.from({length: numMinterms}, (_, i) => i),
        term: []
    });

    const uniqueImplicants = Array.from(new Map(implicants.map(item => [JSON.stringify(item.minterms), item])).values());
    return uniqueImplicants.sort((a, b) => b.minterms.length - a.minterms.length);
};

// Memoize implicant generation for performance
const IMPLICANTS_CACHE: { [key: number]: Implicant[] } = {};
const getImplicantsFor = (numVars: number) => {
    if (!IMPLICANTS_CACHE[numVars]) {
        IMPLICANTS_CACHE[numVars] = generateImplicants(numVars);
    }
    return IMPLICANTS_CACHE[numVars];
};

export const solveFromOutputs = (numVariables: number, outputs: (0 | 1)[]): ProcessedResult => {
  const variables = VAR_NAMES.slice(0, numVariables);
  const minterms = outputs
    .map((out, i) => (out === 1 ? i : -1))
    .filter(i => i !== -1);
  
  const mintermSet = new Set(minterms);
  
  if (minterms.length === 0) {
      return {
        variables, minterms,
        simplifiedExpression: '0',
        simplifiedExpressionTerms: [],
        table: { headers: [], rows: [] }
      };
  }
  
  if (minterms.length === 2 ** numVariables) {
      return {
          variables, minterms,
          simplifiedExpression: '1',
          simplifiedExpressionTerms: [[]],
          table: { headers: [], rows: [] }
      };
  }

  // 1. Find all valid implicants for the given function
  const allPossibleImplicants = getImplicantsFor(numVariables);
  const validImplicants = allPossibleImplicants.filter(imp => 
    imp.minterms.length > 0 && imp.minterms.every(m => mintermSet.has(m))
  );

  // 2. Find the prime implicants from the valid ones (Quine-McCluskey Step 1)
  const primeImplicants: Implicant[] = [];
  for (const implicantA of validImplicants) {
      let isSubsumed = false;
      for (const implicantB of validImplicants) {
          if (implicantA === implicantB || implicantA.minterms.length >= implicantB.minterms.length) {
              continue;
          }
          if (implicantA.minterms.every(m => implicantB.minterms.includes(m))) {
              isSubsumed = true;
              break;
          }
      }
      if (!isSubsumed) {
          primeImplicants.push(implicantA);
      }
  }
  const uniquePrimeImplicants = Array.from(new Map(primeImplicants.map(item => [JSON.stringify(item.minterms), item])).values());

  // 3. Use a greedy covering algorithm to select a minimal set of PIs
  const finalTerms: Implicant[] = [];
  let uncoveredMinterms = new Set(minterms);

  while (uncoveredMinterms.size > 0) {
      let bestImplicant: Implicant | null = null;
      let maxCovered = 0;

      for (const implicant of uniquePrimeImplicants) {
          const coveredCount = implicant.minterms.filter(m => uncoveredMinterms.has(m)).length;
          if (coveredCount > maxCovered) {
              maxCovered = coveredCount;
              bestImplicant = implicant;
          }
      }
      
      if (bestImplicant) {
          finalTerms.push(bestImplicant);
          bestImplicant.minterms.forEach(m => uncoveredMinterms.delete(m));
      } else {
          // Should not happen if logic is correct, but as a safeguard
          break; 
      }
  }

  const uniqueFinalTerms = Array.from(new Map(finalTerms.map(item => [item.term.join(''), item])).values());
  uniqueFinalTerms.sort((a,b) => a.term.join('').localeCompare(b.term.join('')));

  const simplifiedExpressionTerms = uniqueFinalTerms.map(t => t.term);
  const expressionString = simplifiedExpressionTerms
    .map(term => term.join(''))
    .join(' + ');

  return {
    variables,
    minterms,
    simplifiedExpression: expressionString,
    simplifiedExpressionTerms,
    table: { headers: [], rows: [] } 
  };
};
