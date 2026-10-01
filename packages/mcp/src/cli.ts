#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import {
  CONFIG_FILE_NAMES,
  formatDriftMessage,
  generateRegistry,
  loadMcpConfig,
} from './generator';

const HELP = `Usage: pixpilot-mcp generate [--check] [--config <file>]

Builds the MCP registry of a package monorepo from its sources, JSDoc, and catalog files.

Options:
  --check          Do not write; exit 1 if the registry file is out of date
  --config <file>  Config file or its directory (default: ${CONFIG_FILE_NAMES[0]} in the current directory)
  -h, --help       Show this help`;

function readOption(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

async function main(args: readonly string[]): Promise<void> {
  const [command] = args;

  if (command === undefined || args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    return;
  }

  if (command !== 'generate') {
    console.error(`Unknown command "${command}".\n\n${HELP}`);
    process.exit(1);
  }

  const config = await loadMcpConfig(readOption(args, '--config'));
  const check = args.includes('--check');
  const { registry, changes } = await generateRegistry(config, { check });
  const output = path.relative(process.cwd(), config.output);

  if (check) {
    if (changes.length > 0) {
      console.error(formatDriftMessage(config, changes));
      process.exit(1);
    }

    console.log(`${output} is up to date.`);
    return;
  }

  console.log(
    `Wrote ${output}: ${registry.utilities.length} utilities from ${registry.packages.length} packages.`,
  );
  for (const change of changes) {
    console.log(`  ${change}`);
  }
}

const ARGS_START = 2;

main(process.argv.slice(ARGS_START)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
