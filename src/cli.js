import { helpText, runCommand } from './commands.js';
import { pickRowsForOutput, renderTable } from './output.js';

export async function main(argv) {
  const result = await runCommand(argv);
  if (result?.help) {
    console.log(result.help);
    return;
  }

  if (result?.output?.format === 'table') {
    const rows = pickRowsForOutput(result.data || result);
    console.log(renderTable(rows));
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

export { helpText };
