import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'File system',
  runtime: 'node',
  keywords: ['filesystem', 'fs', 'path', 'directory'],
  utilities: {
    findRoot: {
      keywords: [
        'package.json',
        'project root',
        'find up',
        'walk up directories',
        'monorepo',
      ],
    },
  },
});
