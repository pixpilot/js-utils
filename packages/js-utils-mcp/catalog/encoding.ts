import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Encoding',
  runtime: 'universal',
  description: 'Utilities for encoding raw bytes as strings.',
  keywords: ['encoding', 'bytes', 'hex'],
  exclude: ['name'],
  utilities: {
    toHex: {
      keywords: ['hexadecimal', 'binary', 'ArrayBuffer'],
    },
  },
});
