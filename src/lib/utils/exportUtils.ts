// src/lib/utils/exportUtils.ts
import type { DepartmentCount, DepartmentTotal, ProcessedData } from './dataProcessor';
import type { CSVRow } from './csvParser';

export interface ExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  dateFormat?: string;
  numberFormat?: 'standard' | 'currency' | 'percentage';
  precision?: number;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * Export department counts to various formats
 */
export function exportDepartmentCounts(
  data: DepartmentCount[],
  format: 'csv' | 'txt' | 'json' = 'txt',
  options: ExportOptions = {}
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  switch (format) {
    case 'csv':
      return {
        content: exportCountsToCSV(data, options),
        filename: `department_counts_${timestamp}.csv`,
        mimeType: 'text/csv'
      };
    case 'json':
      return {
        content: exportCountsToJSON(data, options),
        filename: `department_counts_${timestamp}.json`,
        mimeType: 'application/json'
      };
    case 'txt':
    default:
      return {
        content: exportCountsToText(data, options),
        filename: `department_counts_${timestamp}.txt`,
        mimeType: 'text/plain'
      };
  }
}

/**
 * Export department totals to various formats
 */
export function exportDepartmentTotals(
  data: DepartmentTotal[],
  format: 'csv' | 'txt' | 'json' = 'txt',
  options: ExportOptions = {}
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  switch (format) {
    case 'csv':
      return {
        content: exportTotalsToCSV(data, options),
        filename: `department_totals_${timestamp}.csv`,
        mimeType: 'text/csv'
      };
    case 'json':
      return {
        content: exportTotalsToJSON(data, options),
        filename: `department_totals_${timestamp}.json`,
        mimeType: 'application/json'
      };
    case 'txt':
    default:
      return {
        content: exportTotalsToText(data, options),
        filename: `department_totals_${timestamp}.txt`,
        mimeType: 'text/plain'
      };
  }
}

/**
 * Export complete processed data (counts + totals + summary)
 */
export function exportCompleteReport(
  data: ProcessedData,
  format: 'csv' | 'txt' | 'json' | 'html' = 'txt',
  options: ExportOptions = {}
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  switch (format) {
    case 'csv':
      return {
        content: exportCompleteToCSV(data, options),
        filename: `department_analysis_${timestamp}.csv`,
        mimeType: 'text/csv'
      };
    case 'json':
      return {
        content: exportCompleteToJSON(data, options),
        filename: `department_analysis_${timestamp}.json`,
        mimeType: 'application/json'
      };
    case 'html':
      return {
        content: exportCompleteToHTML(data, options),
        filename: `department_analysis_${timestamp}.html`,
        mimeType: 'text/html'
      };
    case 'txt':
    default:
      return {
        content: exportCompleteToText(data, options),
        filename: `department_analysis_${timestamp}.txt`,
        mimeType: 'text/plain'
      };
  }
}

/**
 * Export original CSV data with filters applied
 */
export function exportFilteredData(
  data: CSVRow[],
  filename: string = 'filtered_data',
  options: ExportOptions = {}
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  return {
    content: exportRawDataToCSV(data, options),
    filename: `${filename}_${timestamp}.csv`,
    mimeType: 'text/csv'
  };
}

// Private helper functions for different export formats

function exportCountsToCSV(data: DepartmentCount[], options: ExportOptions): string {
  const { includeHeaders = true, delimiter = ',', precision = 2 } = options;
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(`Department Name${delimiter}Count${delimiter}Percentage`);
  }

  data.forEach(item => {
    lines.push(`"${item.department}"${delimiter}${item.count}${delimiter}${item.percentage.toFixed(precision)}%`);
  });

  return lines.join('\n');
}

function exportCountsToText(data: DepartmentCount[], options: ExportOptions): string {
  const { precision = 2 } = options;
  const lines: string[] = [];

  lines.push('DEPARTMENT ANALYSIS - COUNTS');
  lines.push('='.repeat(50));
  lines.push('');

  if (data.length === 0) {
    lines.push('No data available');
    return lines.join('\n');
  }

  // Find the longest department name for formatting
  const maxLength = Math.max(...data.map(item => item.department.length), 15);

  lines.push(`${'Department Name'.padEnd(maxLength)} | Count | Percentage`);
  lines.push('-'.repeat(maxLength + 20));

  data.forEach(item => {
    lines.push(`${item.department.padEnd(maxLength)} | ${item.count.toString().padStart(5)} | ${item.percentage.toFixed(precision)}%`);
  });

  lines.push('');
  lines.push(`Total Departments: ${data.length}`);
  lines.push(`Total Records: ${data.reduce((sum, item) => sum + item.count, 0)}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);

  return lines.join('\n');
}

function exportCountsToJSON(data: DepartmentCount[], options: ExportOptions): string {
  const exportData = {
    type: 'department_counts',
    generated: new Date().toISOString(),
    summary: {
      totalDepartments: data.length,
      totalRecords: data.reduce((sum, item) => sum + item.count, 0)
    },
    data: data
  };

  return JSON.stringify(exportData, null, 2);
}

function exportTotalsToCSV(data: DepartmentTotal[], options: ExportOptions): string {
  const { includeHeaders = true, delimiter = ',', precision = 2 } = options;
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(`Department Name${delimiter}Total${delimiter}Average${delimiter}Percentage`);
  }

  data.forEach(item => {
    lines.push(`"${item.department}"${delimiter}${item.total.toFixed(precision)}${delimiter}${item.average.toFixed(precision)}${delimiter}${item.percentage.toFixed(precision)}%`);
  });

  return lines.join('\n');
}

function exportTotalsToText(data: DepartmentTotal[], options: ExportOptions): string {
  const { precision = 2 } = options;
  const lines: string[] = [];

  lines.push('DEPARTMENT ANALYSIS - TOTALS');
  lines.push('='.repeat(50));
  lines.push('');

  if (data.length === 0) {
    lines.push('No data available');
    return lines.join('\n');
  }

  const maxLength = Math.max(...data.map(item => item.department.length), 15);

  lines.push(`${'Department Name'.padEnd(maxLength)} | Total      | Average    | Percentage`);
  lines.push('-'.repeat(maxLength + 50));

  data.forEach(item => {
    lines.push(`${item.department.padEnd(maxLength)} | ${formatCurrency(item.total).padStart(10)} | ${formatCurrency(item.average).padStart(10)} | ${item.percentage.toFixed(precision)}%`);
  });

  lines.push('');
  lines.push(`Total Departments: ${data.length}`);
  lines.push(`Grand Total: ${formatCurrency(data.reduce((sum, item) => sum + item.total, 0))}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);

  return lines.join('\n');
}

function exportTotalsToJSON(data: DepartmentTotal[], options: ExportOptions): string {
  const exportData = {
    type: 'department_totals',
    generated: new Date().toISOString(),
    summary: {
      totalDepartments: data.length,
      grandTotal: data.reduce((sum, item) => sum + item.total, 0),
      overallAverage: data.reduce((sum, item) => sum + item.average, 0) / data.length
    },
    data: data
  };

  return JSON.stringify(exportData, null, 2);
}

function exportCompleteToCSV(data: ProcessedData, options: ExportOptions): string {
  const { delimiter = ',', precision = 2 } = options;
  const lines: string[] = [];

  // Summary section
  lines.push('SUMMARY');
  lines.push(`Total Rows${delimiter}${data.summary.totalRows}`);
  lines.push(`Total Departments${delimiter}${data.summary.totalDepartments}`);
  lines.push(`Grand Total${delimiter}${data.summary.grandTotal.toFixed(precision)}`);
  lines.push(`Average Per Transaction${delimiter}${data.summary.averagePerTransaction.toFixed(precision)}`);
  lines.push(`Average Per Department${delimiter}${data.summary.averagePerDepartment.toFixed(precision)}`);
  lines.push('');

  // Counts section
  lines.push('DEPARTMENT COUNTS');
  lines.push(exportCountsToCSV(data.departmentCounts, options));
  lines.push('');

  // Totals section
  lines.push('DEPARTMENT TOTALS');
  lines.push(exportTotalsToCSV(data.departmentTotals, options));

  return lines.join('\n');
}

function exportCompleteToText(data: ProcessedData, options: ExportOptions): string {
  const lines: string[] = [];

  lines.push('COMPLETE DEPARTMENT ANALYSIS REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push('-'.repeat(30));
  lines.push(`Total Rows: ${data.summary.totalRows}`);
  lines.push(`Total Departments: ${data.summary.totalDepartments}`);
  lines.push(`Grand Total: ${formatCurrency(data.summary.grandTotal)}`);
  lines.push(`Average Per Transaction: ${formatCurrency(data.summary.averagePerTransaction)}`);
  lines.push(`Average Per Department: ${formatCurrency(data.summary.averagePerDepartment)}`);
  lines.push('');

  // Counts
  lines.push(exportCountsToText(data.departmentCounts, options));
  lines.push('');
  lines.push('');

  // Totals
  lines.push(exportTotalsToText(data.departmentTotals, options));

  return lines.join('\n');
}

function exportCompleteToJSON(data: ProcessedData, options: ExportOptions): string {
  const exportData = {
    type: 'complete_department_analysis',
    generated: new Date().toISOString(),
    ...data
  };

  return JSON.stringify(exportData, null, 2);
}

function exportCompleteToHTML(data: ProcessedData, options: ExportOptions): string {
  const { precision = 2 } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Department Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        .number { text-align: right; }
        .generated { font-style: italic; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Department Analysis Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Rows:</strong> ${data.summary.totalRows}</p>
        <p><strong>Total Departments:</strong> ${data.summary.totalDepartments}</p>
        <p><strong>Grand Total:</strong> ${formatCurrency(data.summary.grandTotal)}</p>
        <p><strong>Average Per Transaction:</strong> ${formatCurrency(data.summary.averagePerTransaction)}</p>
        <p><strong>Average Per Department:</strong> ${formatCurrency(data.summary.averagePerDepartment)}</p>
    </div>
    
    <h2>Department Counts</h2>
    <table>
        <thead>
            <tr>
                <th>Department Name</th>
                <th>Count</th>
                <th>Percentage</th>
            </tr>
        </thead>
        <tbody>
            ${data.departmentCounts.map(item => `
                <tr>
                    <td>${item.department}</td>
                    <td class="number">${item.count}</td>
                    <td class="number">${item.percentage.toFixed(precision)}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Department Totals</h2>
    <table>
        <thead>
            <tr>
                <th>Department Name</th>
                <th>Total</th>
                <th>Average</th>
                <th>Percentage</th>
            </tr>
        </thead>
        <tbody>
            ${data.departmentTotals.map(item => `
                <tr>
                    <td>${item.department}</td>
                    <td class="number">${formatCurrency(item.total)}</td>
                    <td class="number">${formatCurrency(item.average)}</td>
                    <td class="number">${item.percentage.toFixed(precision)}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="generated">
        Generated: ${new Date().toLocaleString()}
    </div>
</body>
</html>
`;
}

function exportRawDataToCSV(data: CSVRow[], options: ExportOptions): string {
  const { includeHeaders = true, delimiter = ',' } = options;
  const lines: string[] = [];

  if (data.length === 0) {
    return 'No data available';
  }

  // Get all unique column names
  const columns = Array.from(new Set(data.flatMap(row => Object.keys(row))));

  if (includeHeaders) {
    lines.push(columns.map(col => `"${col}"`).join(delimiter));
  }

  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col];
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value?.toString() || '';
    });
    lines.push(values.join(delimiter));
  });

  return lines.join('\n');
}

/**
 * Download file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Bulk export all formats
 */
export function exportAllFormats(data: ProcessedData): void {
  const completeJSON = exportCompleteReport(data, 'json');
  downloadFile(completeJSON.content, completeJSON.filename, completeJSON.mimeType);
}