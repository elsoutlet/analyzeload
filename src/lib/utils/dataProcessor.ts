// src/lib/utils/dataProcessor.ts
import type { CSVRow } from './csvParser';

export interface DepartmentCount {
  department: string;
  count: number;
  percentage: number;
}

export interface DepartmentTotal {
  department: string;
  total: number;
  average: number;
  percentage: number;
}

export interface ProcessedData {
  departmentCounts: DepartmentCount[];
  departmentTotals: DepartmentTotal[];
  summary: {
    totalRows: number;
    totalDepartments: number;
    grandTotal: number;
    averagePerTransaction: number;
    averagePerDepartment: number;
  };
}

/**
 * Process CSV data to get department counts and totals
 */
export function processCSVData(data: CSVRow[]): ProcessedData {
  if (!data || data.length === 0) {
    return {
      departmentCounts: [],
      departmentTotals: [],
      summary: {
        totalRows: 0,
        totalDepartments: 0,
        grandTotal: 0,
        averagePerTransaction: 0,
        averagePerDepartment: 0
      }
    };
  }

  const departmentCounts = calculateDepartmentCounts(data);
  const departmentTotals = calculateDepartmentTotals(data);
  const summary = calculateSummary(data, departmentCounts, departmentTotals);

  return {
    departmentCounts,
    departmentTotals,
    summary
  };
}

/**
 * Calculate department counts (replicating value_counts())
 */
function calculateDepartmentCounts(data: CSVRow[]): DepartmentCount[] {
  const counts = new Map<string, number>();
  
  // Count occurrences of each department
  data.forEach(row => {
    const dept = row['Department Name'];
    if (dept) {
      counts.set(dept, (counts.get(dept) || 0) + 1);
    }
  });

  const totalRows = data.length;
  
  // Convert to array and calculate percentages
  const departmentCounts: DepartmentCount[] = Array.from(counts.entries())
    .map(([department, count]) => ({
      department,
      count,
      percentage: totalRows > 0 ? (count / totalRows) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return departmentCounts;
}

/**
 * Calculate department totals (replicating groupby sum())
 */
function calculateDepartmentTotals(data: CSVRow[]): DepartmentTotal[] {
  const totals = new Map<string, { sum: number; count: number }>();
  
  // Sum extended prices by department
  data.forEach(row => {
    const dept = row['Department Name'];
    const price = row['Extended Price'] || 0;
    
    if (dept) {
      const existing = totals.get(dept) || { sum: 0, count: 0 };
      totals.set(dept, {
        sum: existing.sum + price,
        count: existing.count + 1
      });
    }
  });

  // Calculate grand total for percentage calculations
  const grandTotal = Array.from(totals.values())
    .reduce((sum, dept) => sum + dept.sum, 0);

  // Convert to array and calculate averages and percentages
  const departmentTotals: DepartmentTotal[] = Array.from(totals.entries())
    .map(([department, { sum, count }]) => ({
      department,
      total: sum,
      average: count > 0 ? sum / count : 0,
      percentage: grandTotal > 0 ? (sum / grandTotal) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total); // Sort by total descending

  return departmentTotals;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(
  data: CSVRow[], 
  departmentCounts: DepartmentCount[], 
  departmentTotals: DepartmentTotal[]
) {
  const totalRows = data.length;
  const totalDepartments = departmentCounts.length;
  const grandTotal = departmentTotals.reduce((sum, dept) => sum + dept.total, 0);
  const averagePerTransaction = totalRows > 0 ? grandTotal / totalRows : 0;
  const averagePerDepartment = totalDepartments > 0 ? grandTotal / totalDepartments : 0;

  return {
    totalRows,
    totalDepartments,
    grandTotal,
    averagePerTransaction,
    averagePerDepartment
  };
}

/**
 * Filter data by department name
 */
export function filterByDepartment(data: CSVRow[], departmentName: string): CSVRow[] {
  return data.filter(row => 
    row['Department Name']?.toLowerCase().includes(departmentName.toLowerCase())
  );
}

/**
 * Filter data by price range
 */
export function filterByPriceRange(data: CSVRow[], minPrice: number, maxPrice: number): CSVRow[] {
  return data.filter(row => {
    const price = row['Extended Price'] || 0;
    return price >= minPrice && price <= maxPrice;
  });
}

/**
 * Get top N departments by count
 */
export function getTopDepartmentsByCount(data: CSVRow[], n: number = 5): DepartmentCount[] {
  const counts = calculateDepartmentCounts(data);
  return counts.slice(0, n);
}

/**
 * Get top N departments by total spending
 */
export function getTopDepartmentsByTotal(data: CSVRow[], n: number = 5): DepartmentTotal[] {
  const totals = calculateDepartmentTotals(data);
  return totals.slice(0, n);
}

/**
 * Search departments by name
 */
export function searchDepartments(data: CSVRow[], searchTerm: string): string[] {
  const departments = new Set<string>();
  
  data.forEach(row => {
    const dept = row['Department Name'];
    if (dept && dept.toLowerCase().includes(searchTerm.toLowerCase())) {
      departments.add(dept);
    }
  });

  return Array.from(departments).sort();
}

/**
 * Generate comparison data between departments
 */
export function compareDepartments(data: CSVRow[], dept1: string, dept2: string) {
  const dept1Data = filterByDepartment(data, dept1);
  const dept2Data = filterByDepartment(data, dept2);

  const dept1Processed = processCSVData(dept1Data);
  const dept2Processed = processCSVData(dept2Data);

  return {
    department1: {
      name: dept1,
      ...dept1Processed.summary
    },
    department2: {
      name: dept2,
      ...dept2Processed.summary
    },
    comparison: {
      countDifference: dept1Processed.summary.totalRows - dept2Processed.summary.totalRows,
      totalDifference: dept1Processed.summary.grandTotal - dept2Processed.summary.grandTotal,
      averageDifference: dept1Processed.summary.averagePerTransaction - dept2Processed.summary.averagePerTransaction
    }
  };
}

/**
 * Generate text output similar to pandas to_string()
 */
export function generateCountsOutput(departmentCounts: DepartmentCount[]): string {
  if (departmentCounts.length === 0) {
    return 'No data available';
  }

  let output = 'Department Name\n';
  departmentCounts.forEach(item => {
    output += `${item.department.padEnd(30)} ${item.count}\n`;
  });

  return output;
}

/**
 * Generate totals output similar to pandas to_string()
 */
export function generateTotalsOutput(departmentTotals: DepartmentTotal[]): string {
  if (departmentTotals.length === 0) {
    return 'No data available';
  }

  let output = 'Department Name\n';
  departmentTotals.forEach(item => {
    output += `${item.department.padEnd(30)} ${item.total.toFixed(2)}\n`;
  });

  return output;
}

/**
 * Export processed data to different formats
 */
export function exportToCSV(departmentCounts: DepartmentCount[], departmentTotals: DepartmentTotal[]) {
  const countsCSV = [
    'Department Name,Count,Percentage',
    ...departmentCounts.map(item => 
      `"${item.department}",${item.count},${item.percentage.toFixed(2)}`
    )
  ].join('\n');

  const totalsCSV = [
    'Department Name,Total,Average,Percentage',
    ...departmentTotals.map(item => 
      `"${item.department}",${item.total.toFixed(2)},${item.average.toFixed(2)},${item.percentage.toFixed(2)}`
    )
  ].join('\n');

  return { countsCSV, totalsCSV };
}