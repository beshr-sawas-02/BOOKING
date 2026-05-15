export interface ExcelRow {
  name: string;
  status: string;
  reason?: string;
  rowNumber: number;
}

export interface ProcessResult {
  matched: number;
  approved: number;
  rejected: number;
  notMatched: string[];
  alreadyProcessed: string[];
  errors: { row: number; reason: string }[];
}