import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Identifier',
  runtime: 'universal',
  keywords: ['guid', 'uuid', 'identifier'],
  utilities: {
    isGuidString: { keywords: ['uuid', 'validate uuid', 'is uuid', 'identifier'] },
  },
});
