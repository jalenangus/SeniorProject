import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadAsCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error("No data to download.");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(fieldName => {
        let field = row[fieldName];
        if (field === null || field === undefined) {
          return '';
        }
        // Escape quotes by doubling them, and wrap in quotes if it contains a comma, newline or quote
        const strField = String(field);
        if (strField.includes(',') || strField.includes('\n') || strField.includes('"')) {
          return `"${strField.replace(/"/g, '""')}"`;
        }
        return strField;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
