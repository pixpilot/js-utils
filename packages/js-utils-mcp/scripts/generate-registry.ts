import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import * as prettier from 'prettier';
import {
  buildRegistry,
  diffRegistries,
  readCommittedRegistry,
  REGISTRY_PATH,
  REPO_ROOT,
} from './build-registry';

/**
 * Regenerates `src/generated/registry.json` from the workspace sources.
 *
 *   pnpm mcp:generate          write the registry
 *   pnpm mcp:generate --check  exit 1 if the committed registry is stale
 */
async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const registry = await buildRegistry();
  const changes = diffRegistries(readCommittedRegistry(), registry);
  const relativePath = path.relative(REPO_ROOT, REGISTRY_PATH);

  if (check) {
    if (changes.length > 0) {
      console.error(
        `${relativePath} is out of date (${changes.length} change(s)):\n  ${changes.join('\n  ')}\n\n` +
          'Run `pnpm mcp:generate` and commit the result.',
      );
      process.exit(1);
    }

    console.log(`${relativePath} is up to date.`);
    return;
  }

  const prettierConfig = await prettier.resolveConfig(REGISTRY_PATH);
  const content = await prettier.format(JSON.stringify(registry), {
    ...prettierConfig,
    filepath: REGISTRY_PATH,
  });

  await mkdir(path.dirname(REGISTRY_PATH), { recursive: true });
  await writeFile(REGISTRY_PATH, content);

  console.log(
    `Wrote ${relativePath}: ${registry.utilities.length} utilities from ${registry.packages.length} packages.`,
  );
  for (const change of changes) {
    console.log(`  ${change}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
