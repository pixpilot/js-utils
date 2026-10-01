import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Pagination',
  runtime: 'universal',
  keywords: ['pagination', 'paging', 'offset', 'limit'],
  utilities: {
    createPaginatedResult: {
      keywords: ['paginated response', 'total pages', 'has next page', 'api response'],
    },
    getPaginationOffsets: {
      keywords: ['offset', 'limit', 'skip', 'take', 'sql', 'page size'],
    },
  },
});
