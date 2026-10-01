import { defineCatalogPackage } from '../scripts/catalog';

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
