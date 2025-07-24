const input = document.getElementById('csvInput');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');
const summaryList = document.getElementById('summaryList');
const countsPreview = document.getElementById('countsPreview');
const totalsPreview = document.getElementById('totalsPreview');
const downloadTotalsBtn = document.getElementById('downloadTotalsBtn');
const downloadSummaryBtn = document.getElementById('downloadSummaryBtn');
const downloadCountsBtn = document.getElementById('downloadCountsBtn');
const spinner = document.getElementById('spinner');

// File handling logic
input.addEventListener('change', handleFileInput);

function handleFileInput(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    errorEl.textContent = '';
    resultsEl.style.display = 'none';
    showSpinner();

    readFile(file)
        .then(data => processCSVData(data))
        .then(processed => {
            renderResults(processed);
            hideSpinner();
        })
        .catch(e => {
            console.error(e);
            errorEl.textContent = 'Failed to parse or process file.';
            hideSpinner();
        });
}

// File reading logic (supports CSV and XLSX)
function readFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    } else {
        // Default to CSV
        return file.text().then(text => parseCSV(text));
    }
}

// CSV parsing logic
function parseCSV(text) {
    const { data } = Papa.parse(text.trim(), { header: true });
    return data;
}

downloadTotalsBtn.addEventListener('click', () => {
    if (!window.lastProcessed) return;

    const data = window.lastProcessed;
    downloadFile('summary.json', JSON.stringify(data.summary, null, 2), 'application/json');

    const countsCSV = data.departmentCounts.map(d => `${d.department},${d.count},${d.percentage.toFixed(2)}`).join('\n');
    downloadFile('department_counts.csv', 'Department,Count,Percentage\n' + countsCSV, 'text/csv');

    const totalsCSV = data.departmentTotals.map(d => `${d.department},${d.total.toFixed(2)},${d.average.toFixed(2)},${d.percentage.toFixed(2)}`).join('\n');
    downloadFile('department_totals.csv', 'Department,Total,Average,Percentage\n' + totalsCSV, 'text/csv');
});
downloadCountsBtn.addEventListener('click', () => {
    if (!window.lastProcessed) return;
    const countsCSV = data.departmentCounts.map(d => `${d.department},${d.count},${d.percentage.toFixed(2)}`).join('\n');
    downloadFile('department_counts.csv', 'Department,Count,Percentage\n' + countsCSV, 'text/csv');
});
downloadSummaryBtn.addEventListener('click', () => {
    if (!window.lastProcessed) return;

    const data = window.lastProcessed;
    downloadFile('summary.json', JSON.stringify(data.summary, null, 2), 'application/json');
});

function renderResults(processed) {
    window.lastProcessed = processed;
    resultsEl.style.display = 'block';

    summaryList.innerHTML = `
    <li><strong>Total Rows:</strong> ${processed.summary.totalRows}</li>
    <li><strong>Total Departments:</strong> ${processed.summary.totalDepartments}</li>
    <li><strong>Grand Total:</strong> $${processed.summary.grandTotal.toFixed(2)}</li>
    <li><strong>Avg Per Transaction:</strong> $${processed.summary.averagePerTransaction.toFixed(2)}</li>
    <li><strong>Avg Per Department:</strong> $${processed.summary.averagePerDepartment.toFixed(2)}</li>
  `;

    countsPreview.textContent = processed.departmentCounts
        .sort((a, b) => b.percentage - a.percentage)
        .map(d => `${d.department}: ${d.count} (${d.percentage.toFixed(2)}%)`)
        .join('\n');

    totalsPreview.textContent = processed.departmentTotals
        .sort((a, b) => b.percentage - a.percentage)
        .map(d => `${d.department}: $${d.total.toFixed(2)} | Avg: $${d.average.toFixed(2)} | ${d.percentage.toFixed(2)}%`)
        .join('\n');
}

function processCSVData(rows) {
    const summary = {
        totalRows: rows.length,
        totalDepartments: 0,
        grandTotal: 0,
        averagePerTransaction: 0,
        averagePerDepartment: 0
    };

    const counts = {};
    const totals = {};

    for (const row of rows) {
        console.log(row)
        const dept = row["Department Name"]?.trim();
        const value = parseFloat(row["Ext Liquidation Prc"] || '0');
        if (!dept || isNaN(value)) continue;

        counts[dept] = (counts[dept] || 0) + parseInt(row["Quantity"]);
        totals[dept] = (totals[dept] || 0) + value;

        summary.grandTotal += value;
    }

    const departmentCounts = Object.keys(counts).map(dept => {
        return {
            department: dept,
            count: counts[dept],
            percentage: (counts[dept] / summary.totalRows) * 100
        };
    });

    const departmentTotals = Object.keys(totals).map(dept => {
        const count = counts[dept];
        const total = totals[dept];
        return {
            department: dept,
            total,
            average: total / count,
            percentage: (total / summary.grandTotal) * 100
        };
    });

    summary.totalDepartments = departmentCounts.length;
    summary.averagePerTransaction = summary.grandTotal / summary.totalRows;
    summary.averagePerDepartment = summary.grandTotal / summary.totalDepartments;

    return {
        summary,
        departmentCounts,
        departmentTotals
    };
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function showSpinner() {
    spinner.style.display = 'flex';
}
function hideSpinner() {
    spinner.style.display = 'none';
}
