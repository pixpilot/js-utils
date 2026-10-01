import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Math',
  runtime: 'universal',
  keywords: ['math', 'arithmetic'],
  utilities: {
    getSum: { keywords: ['total', 'add numbers', 'sum array', 'ignore nan'] },
  },
});
