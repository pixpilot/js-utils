import { defineCatalogPackage } from '../scripts/catalog';

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
