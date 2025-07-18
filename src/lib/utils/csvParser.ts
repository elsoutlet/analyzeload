// src/lib/utils/csvParser.ts
import Papa from 'papaparse';

export interface CSVRow {
  'Department Name': string;
  'Extended Price': number;
  [key: string]: any; // Allow for additional columns
}

export interface ParseResult {
  data: CSVRow[];
  errors: string[];
  meta: {
    fields: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
  };
}

export interface ParseOptions {
  skipEmptyLines?: boolean;
  dynamicTyping?: boolean;
  transform?: (value: string, field: string) => any;
}

/**
 * Parse CSV file and return structured data
 */
export function parseCSVFile(file: File, options: ParseOptions = {}): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const defaultOptions: ParseOptions = {
      skipEmptyLines: true,
      dynamicTyping: true,
      ...options
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: defaultOptions.skipEmptyLines,
      dynamicTyping: defaultOptions.dynamicTyping,
      transform: defaultOptions.transform,
      complete: (results) => {
        try {
          const validatedData = validateAndCleanData(results.data as any[]);
          resolve({
            data: validatedData,
            errors: results.errors.map(err => err.message),
            meta: {
              ...results.meta,
              fields: results.meta.fields ?? []
            }
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

/**
 * Parse CSV from text string
 */
export function parseCSVText(csvText: string, options: ParseOptions = {}): ParseResult {
  const defaultOptions: ParseOptions = {
    skipEmptyLines: true,
    dynamicTyping: true,
    ...options
  };

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: defaultOptions.skipEmptyLines,
    dynamicTyping: defaultOptions.dynamicTyping,
    transform: defaultOptions.transform,
  });

  const validatedData = validateAndCleanData(results.data as any[]);

  return {
    data: validatedData,
    errors: results.errors.map(err => err.message),
    meta: {
      ...results.meta,
      fields: results.meta.fields ?? []
    }
  };
}

/**
 * Validate and clean CSV data
 */
function validateAndCleanData(rawData: any[]): CSVRow[] {
  const cleanedData: CSVRow[] = [];
  const errors: string[] = [];

  rawData.forEach((row, index) => {
    try {
      const cleanedRow = cleanRow(row, index);
      if (cleanedRow) {
        cleanedData.push(cleanedRow);
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
    }
  });

  if (errors.length > 0) {
    console.warn('Data validation warnings:', errors);
  }

  return cleanedData;
}

/**
 * Clean and validate individual row
 */
function cleanRow(row: any, rowIndex: number): CSVRow | null {
  // Skip completely empty rows
  if (!row || Object.keys(row).length === 0) {
    return null;
  }

  // Clean up department name
  const deptName = cleanDepartmentName(row['Department Name']);
  if (!deptName) {
    throw new Error(`Missing or invalid Department Name`);
  }

  // Clean up extended price
  const extendedPrice = cleanExtendedPrice(row['Extended Price']);
  if (extendedPrice === null) {
    throw new Error(`Missing or invalid Extended Price`);
  }

  // Create cleaned row with original structure plus any additional fields
  const cleanedRow: CSVRow = {
    'Department Name': deptName,
    'Extended Price': extendedPrice
  };

  // Preserve any additional columns
  Object.keys(row).forEach(key => {
    if (key !== 'Department Name' && key !== 'Extended Price') {
      cleanedRow[key] = row[key];
    }
  });

  return cleanedRow;
}

/**
 * Clean department name field
 */
function cleanDepartmentName(value: any): string | null {
  if (!value) return null;
  
  const cleaned = String(value).trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Clean extended price field
 */
function cleanExtendedPrice(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Handle string values (remove currency symbols, commas, etc.)
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Handle numeric values
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  return null;
}

/**
 * Validate CSV structure before processing
 */
export function validateCSVStructure(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('CSV file is empty or invalid');
    return { isValid: false, errors };
  }

  const firstRow = data[0];
  if (!firstRow) {
    errors.push('CSV file has no data rows');
    return { isValid: false, errors };
  }

  // Check for required columns
  const requiredFields = ['Department Name', 'Extended Price'];
  const availableFields = Object.keys(firstRow);

  requiredFields.forEach(field => {
    if (!availableFields.includes(field)) {
      errors.push(`Missing required column: "${field}"`);
    }
  });

  // Check if we have any valid data rows
  const validRows = data.filter(row => 
    row && 
    row['Department Name'] && 
    row['Extended Price'] !== null && 
    row['Extended Price'] !== undefined
  );

  if (validRows.length === 0) {
    errors.push('No valid data rows found');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Get summary statistics about the parsed data
 */
export function getDataSummary(data: CSVRow[]) {
  const totalRows = data.length;
  const uniqueDepartments = new Set(data.map(row => row['Department Name'])).size;
  const totalValue = data.reduce((sum, row) => sum + (row['Extended Price'] || 0), 0);
  const averageValue = totalRows > 0 ? totalValue / totalRows : 0;

  return {
    totalRows,
    uniqueDepartments,
    totalValue,
    averageValue,
    dateProcessed: new Date().toISOString()
  };
}