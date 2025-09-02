export interface TableData {
  headers: string[];
  rows: boolean[][];
}

export interface ProcessedResult {
    table: TableData;
    variables: string[];
    minterms: number[];
    simplifiedExpression: string;
    simplifiedExpressionTerms: string[][];
}
