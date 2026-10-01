import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Hashing',
  runtime: 'universal',
  keywords: ['hash', 'checksum'],
  utilities: {
    simpleHash: {
      keywords: ['checksum', 'cache key', 'fingerprint', 'hashcode', 'string hash'],
    },
  },
});
