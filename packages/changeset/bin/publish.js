/* eslint-disable node/prefer-global/process */
/* eslint-disable no-console */

import { publish } from '../dist/index.js';

const ARGS_START_INDEX = 2;

const args = process.argv.slice(ARGS_START_INDEX);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isNext = args.includes('--next');
const isHelp = args.includes('--help') || args.includes('-h');

if (isHelp) {
  console.log(
    `

Usage: node publish.js [options]

Options:
  --dry-run, -d    Run changeset publish with --dry-run flag
  --next           Publish to the next tag
  --help, -h       Show this help message

This script automatically reads the NPM_TOKEN from .env
and creates a temporary .npmrc file for authentication.
    `.trim(),
  );
  process.exit(0);
}

publish({ isDryRun, isNext });
