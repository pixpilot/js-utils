/* eslint-disable node/prefer-global/process */
/* eslint-disable no-console */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadEnvFiles } from '@pixpilot/env/node';

const SECRETS_FILE = '.env.local';

/**
 * Run `pnpm changeset publish`, authenticating with the `NPM_TOKEN` from `.env.local`
 * through a temporary `.npmrc` that is deleted afterwards.
 *
 * Exits the process with code 1 when `NPM_TOKEN` is missing. Also available as the
 * `changeset-publish` CLI (`--dry-run`, `--next`).
 *
 * @param options - Publish options
 * @param options.isDryRun - Pass `--dry-run` to `changeset publish`
 * @param options.isNext - Publish under the `next` dist-tag
 *
 * @example
 * ```typescript
 * publish({ isDryRun: true, isNext: false });
 * ```
 */
export function publish(options: { isDryRun: boolean; isNext: boolean }): void {
  const { isDryRun, isNext } = options;

  // Load environment variables from .env file
  loadEnvFiles({ files: [SECRETS_FILE], keys: ['NPM_TOKEN'] });

  // Check if NPM_TOKEN is available
  const npmToken = process.env['NPM_TOKEN']?.trim();
  if (npmToken == null || npmToken === '') {
    console.error('❌ Error: NPM_TOKEN not found or empty in .env.local');
    console.error('Please create .env.local file with: NPM_TOKEN=YOUR_TOKEN_HERE');
    process.exit(1);
  }

  console.log('✓ Found NPM token in .env.local');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-publish-'));
  const tempNpmrcPath = path.join(tempDir, '.npmrc');

  // Create a temporary .npmrc file with the auth token
  try {
    console.log('✓ Creating temporary .npmrc file...');
    let npmrcContent = `//registry.npmjs.org/:_authToken=${npmToken}\n`;

    // Check if main .npmrc exists and merge its content
    const mainNpmrcPath = path.join(process.cwd(), '.npmrc');
    if (fs.existsSync(mainNpmrcPath)) {
      const mainNpmrcContent = fs.readFileSync(mainNpmrcPath, 'utf8');
      npmrcContent = `${mainNpmrcContent}\n${npmrcContent}`;
      console.log('✓ Merged with existing .npmrc');
    }

    fs.writeFileSync(tempNpmrcPath, npmrcContent);

    // Run publish command with the temporary .npmrc
    const publishCommand = isDryRun
      ? `pnpm changeset publish --dry-run${isNext ? ' --tag next' : ''}`
      : `pnpm changeset publish${isNext ? ' --tag next' : ''}`;

    console.log(`🚀 Running: ${publishCommand}`);

    if (isDryRun) {
      console.log('🔍 Running in dry-run mode...');
    }

    // Set NPM_CONFIG_USERCONFIG to use our temp file
    const env = {
      ...process.env,
      NPM_CONFIG_USERCONFIG: tempNpmrcPath,
    };

    execSync(publishCommand, {
      stdio: 'inherit',
      env,
      cwd: process.cwd(),
    });

    console.log('✅ Publish completed successfully!');

    // Clean up: delete the temporary file
    console.log('🧹 Cleaning up temporary .npmrc file...');
    fs.unlinkSync(tempNpmrcPath);
    console.log('✓ Temporary file removed safely');
  } catch (error) {
    console.error(
      '❌ Error during publish:',
      error instanceof Error ? error.message : String(error),
    );
    throw error; // Re-throw to trigger finally block
  } finally {
    // Clean up: delete the temporary file (always runs)
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
