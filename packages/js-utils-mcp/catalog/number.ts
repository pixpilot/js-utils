import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'Number',
  runtime: 'universal',
  keywords: ['number', 'numeric', 'math'],
  // `name` is a leftover package-name constant, not a utility.
  exclude: ['name'],
  utilities: {
    average: { keywords: ['mean', 'avg'] },
    clamp: { keywords: ['limit', 'bound', 'constrain', 'min max'] },
    formatWithSeparator: {
      keywords: ['thousands separator', 'comma', 'format number', 'digit grouping'],
    },
    inRange: { keywords: ['between', 'within range'] },
    isEven: { keywords: ['parity'] },
    isFiniteNumber: { keywords: ['type guard', 'infinity'] },
    isInteger: { keywords: ['type guard', 'whole number'] },
    isNumber: { keywords: ['type guard', 'nan'] },
    isOdd: { keywords: ['parity'] },
    isSafeInteger: { keywords: ['type guard', 'max safe integer'] },
    max: { keywords: ['largest', 'highest', 'maximum'] },
    min: { keywords: ['smallest', 'lowest', 'minimum'] },
    parseNumberOrNull: {
      keywords: ['parse number', 'string to number', 'safe parse', 'parseFloat'],
    },
    random: { keywords: ['random float', 'random number'] },
    randomInt: { keywords: ['random integer', 'dice'] },
    round: { keywords: ['decimal places', 'precision', 'toFixed'] },
    sum: { keywords: ['total', 'add numbers'] },
    toDegrees: { keywords: ['angle', 'convert angle', 'trigonometry'] },
    toRadians: { keywords: ['angle', 'convert angle', 'trigonometry'] },
  },
});
