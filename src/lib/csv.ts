"use client";

/**
 * Client-side CSV export.
 *
 * Every table in the dashboard offers "Export CSV"; the file is assembled in
 * the browser from data already on screen, so no round trip and no server
 * state is needed. Values are RFC 4180 quoted and a UTF-8 BOM is prepended so
 * Excel on Windows renders Kenyan names and the KES symbol correctly.
 */

type Cell = string | number | boolean | null | undefined;

function escapeCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Neutralise spreadsheet formula injection (=, +, -, @ leading characters).
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) lines.push(row.map(escapeCell).join(","));
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(filename: string, headers: string[], rows: Cell[][]): void {
  downloadCsv(filename, toCsv(headers, rows));
}
