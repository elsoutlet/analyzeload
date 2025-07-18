<script lang="ts">
	import { onMount } from 'svelte';
	import { parseCSVText } from '$lib/utils/csvParser';
	import { processCSVData, type ProcessedData } from '$lib/utils/dataProcessor';
	import { exportAllFormats, downloadFile } from '$lib/utils/exportUtils';

	let file: File | null = null;
	let rawText = '';
	let error = '';
	let processed: ProcessedData | null = null;

	const handleFileUpload = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		file = input.files[0];
		error = '';
		processed = null;

		try {
			rawText = await file.text();
			const parsed = parseCSVText(rawText);
			processed = processCSVData(parsed.data);
		} catch (e) {
			error = 'Failed to parse or process CSV file.';
			console.error(e);
		}
	};

	const handleDownload = () => {
		if (processed) {
			exportAllFormats(processed);
		}
	};
</script>

<div class="container">
	<h1>Department Analyzer</h1>

	<input type="file" accept=".csv" on:change={handleFileUpload} />

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if processed}
		<h2>Summary</h2>
		<ul>
			<li><strong>Total Rows:</strong> {processed.summary.totalRows}</li>
			<li><strong>Total Departments:</strong> {processed.summary.totalDepartments}</li>
			<li><strong>Grand Total:</strong> ${processed.summary.grandTotal.toFixed(2)}</li>
			<li>
				<strong>Avg Per Transaction:</strong> ${processed.summary.averagePerTransaction.toFixed(2)}
			</li>
			<li>
				<strong>Avg Per Department:</strong> ${processed.summary.averagePerDepartment.toFixed(2)}
			</li>
		</ul>

		<button on:click={handleDownload}>Export All Formats</button>

		<h3>Preview: Department Counts</h3>
		<pre>
{processed.departmentCounts
				.map((d) => `${d.department}: ${d.count} (${d.percentage.toFixed(2)}%)`)
				.join('\n')}
    </pre>

		<h3>Preview: Department Totals</h3>
		<pre>
{processed.departmentTotals
				.map(
					(d) =>
						`${d.department}: $${d.total.toFixed(2)} | Avg: $${d.average.toFixed(2)} | ${d.percentage.toFixed(2)}%`
				)
				.join('\n')}
    </pre>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: auto;
		padding: 1rem;
		font-family: sans-serif;
	}

	pre {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 4px;
		white-space: pre-wrap;
	}

	.error {
		color: red;
		font-weight: bold;
	}
</style>
