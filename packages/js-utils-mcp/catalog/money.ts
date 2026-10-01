import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Money',
  runtime: 'universal',
  keywords: ['money', 'currency', 'price'],
  utilities: {
    formatMoney: {
      keywords: ['currency', 'price', 'cents', 'format price', 'intl', 'stripe amount'],
    },
  },
});
