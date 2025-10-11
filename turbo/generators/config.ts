import { packageGenerator } from '@pixpilot/workspace-package-generator';

module.exports = function generator(plop: unknown) {
  packageGenerator(plop, {
    orgName: 'pixpilot',
    author: 'Pixpilot <m.doaie@hotmail.com>',
  });
};
