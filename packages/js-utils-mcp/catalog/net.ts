import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Network',
  runtime: 'node',
  keywords: ['network', 'tcp', 'port', 'localhost', 'server'],
  utilities: {
    findAvailablePort: {
      keywords: ['find free port', 'unused port', 'automatic port', 'port conflict'],
    },
    isPortAvailable: {
      keywords: ['check port', 'port in use', 'port taken', 'listening'],
    },
  },
});
