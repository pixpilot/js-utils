import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Release',
  runtime: 'node',
  keywords: ['changesets', 'npm', 'publish', 'release'],
  utilities: {
    publish: {
      keywords: ['npm publish', 'release', 'npm token', 'npmrc', 'changesets'],
      notes: [
        'Also installed as the `changeset-publish` CLI: `changeset-publish [--dry-run] [--next]`.',
      ],
    },
  },
});
