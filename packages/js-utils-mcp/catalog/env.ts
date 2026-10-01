import { defineCatalogPackage } from '../scripts/catalog';

export default defineCatalogPackage({
  category: 'Environment',
  runtime: 'universal',
  keywords: ['environment variables', 'dotenv', 'env', 'process.env', 'import.meta.env'],
  entryPoints: {
    '.': {
      runtime: 'universal',
      description: 'Helpers that are safe in Node.js, browsers, and edge runtimes.',
    },
    './node': {
      runtime: 'node',
      description:
        'Node.js-only helpers that read the file system (.env files, repository root).',
    },
  },
  utilities: {
    DEFAULT_ROOT_ENV_FILES: { keywords: ['.env.local', '.env'] },
    findRepoRoot: {
      keywords: ['monorepo root', 'workspace root', 'git root', 'pnpm workspace'],
    },
    getEnv: {
      keywords: [
        'process.env',
        'import.meta.env',
        'environment variable',
        'vite',
        'read env',
      ],
    },
    isDevelopment: { keywords: ['dev mode', 'node_env', 'development'] },
    loadEnvFiles: { keywords: ['dotenv', '.env', 'load env', 'environment variables'] },
    loadRootEnvFiles: {
      keywords: [
        'dotenv',
        'monorepo',
        'shared env',
        'next.config',
        'vite.config',
        '.env',
      ],
    },
    watchRootEnvFiles: {
      keywords: ['hot reload', 'file watcher', 'dotenv', 'restart on change'],
    },
  },
});
