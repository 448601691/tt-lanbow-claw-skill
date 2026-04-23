function toDisplayValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function renderTable(rows, columns = undefined) {
  const normalizedRows = Array.isArray(rows) ? rows : [rows];
  if (normalizedRows.length === 0) return '(no rows)';

  const derivedColumns = columns && columns.length
    ? columns
    : Array.from(
        normalizedRows.reduce((set, row) => {
          Object.keys(row || {}).forEach((key) => set.add(key));
          return set;
        }, new Set())
      );

  const widths = derivedColumns.map((column) => {
    const cellWidths = normalizedRows.map((row) => toDisplayValue(row?.[column]).length);
    return Math.max(column.length, ...cellWidths);
  });

  const header = derivedColumns
    .map((column, idx) => column.padEnd(widths[idx]))
    .join(' | ');
  const separator = widths.map((width) => '-'.repeat(width)).join('-|-');
  const body = normalizedRows.map((row) => (
    derivedColumns
      .map((column, idx) => toDisplayValue(row?.[column]).padEnd(widths[idx]))
      .join(' | ')
  ));

  return [header, separator, ...body].join('\n');
}

export function pickRowsForOutput(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data?.list)) return result.data.list;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result?.data)) return result.data;
  if (result && typeof result === 'object') return [result];
  return [];
}
