# Department Analyzer

A web-based tool for analyzing CSV files by department, providing summaries, counts, totals, and downloadable reports.

## Features
- Upload and analyze CSV files with department data
- Summary statistics: total rows, departments, grand total, averages
- Department counts and totals with percentage breakdowns
- Download results as CSV or JSON
- Progress indicator while parsing large files

## Usage
1. Open `index.html` in your browser.
2. Click the file input to upload a CSV file (must include "Department Name" and "Extended Price" columns).
3. Wait for the spinner to disappear and view the summary and previews.
4. Download the results using the provided buttons.

## Example CSV Format
```
Department Name,Extended Price
Electronics,120.50
Clothing,45.00
Electronics,80.00
```

## Screenshots
<!-- Add screenshots here -->

## Development
- All logic is in `app.js`, styles in `style.css`.
- No server required; works entirely in the browser. 