import { defineCatalogPackage } from '../scripts/catalog';

const CASE = ['case conversion', 'change case'];

export default defineCatalogPackage({
  category: 'String',
  runtime: 'universal',
  keywords: ['string', 'text'],
  utilities: {
    capitalize: { keywords: ['uppercase first letter', 'ucfirst'] },
    capitalizeFirst: { keywords: ['ucfirst', 'lowercase rest'] },
    countOccurrences: { keywords: ['count substring', 'frequency'] },
    isAlphanumeric: { keywords: ['letters and digits', 'validate'] },
    isEmail: { keywords: ['validate email', 'email address'] },
    isEmptyString: { keywords: ['blank', 'whitespace only', 'is blank'] },
    isEmptyStringOrNil: { keywords: ['blank', 'null or empty', 'nullish'] },
    isString: { keywords: ['type guard'] },
    isUrl: { keywords: ['validate url', 'link'] },
    normalizeSpaces: { keywords: ['collapse whitespace', 'squish'] },
    padEnd: { keywords: ['pad right'] },
    padStart: { keywords: ['leading zeros', 'pad left'] },
    removeWhitespace: { keywords: ['strip spaces'] },
    toCamelCase: { keywords: CASE },
    toCapitalCase: { keywords: [...CASE, 'title case'] },
    toConstantCase: { keywords: [...CASE, 'screaming snake case', 'upper snake case'] },
    toDotCase: { keywords: CASE },
    toKebabCase: { keywords: [...CASE, 'slug', 'dash case'] },
    toNoCase: { keywords: [...CASE, 'humanize', 'words'] },
    toPascalCase: { keywords: [...CASE, 'upper camel case', 'class name'] },
    toPascalSnakeCase: { keywords: CASE },
    toPathCase: { keywords: [...CASE, 'slash'] },
    toSentenceCase: { keywords: [...CASE, 'humanize'] },
    toSnakeCase: { keywords: [...CASE, 'underscore'] },
    toTrainCase: { keywords: [...CASE, 'header case'] },
    truncate: { keywords: ['ellipsis', 'shorten', 'clip', 'excerpt'] },
    words: { keywords: ['split words', 'tokenize'] },
  },
});
