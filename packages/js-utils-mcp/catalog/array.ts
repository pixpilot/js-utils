import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Array',
  runtime: 'universal',
  keywords: ['array', 'list'],
  utilities: {
    arrayMove: {
      keywords: ['reorder', 'swap', 'drag and drop', 'sortable', 'move item'],
    },
  },
});
