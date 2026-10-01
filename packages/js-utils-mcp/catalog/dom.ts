import { defineCatalogPackage } from '../scripts/catalog';

export default defineCatalogPackage({
  category: 'DOM',
  runtime: 'browser',
  keywords: ['dom', 'html', 'element', 'browser'],
  utilities: {
    getHighestZindex: {
      keywords: ['z-index', 'zindex', 'stacking', 'overlay', 'modal', 'bring to front'],
    },
    getParents: { keywords: ['ancestors', 'parent elements', 'closest', 'walk up dom'] },
    sumOfParentZindex: { keywords: ['z-index', 'zindex', 'stacking context'] },
  },
});
