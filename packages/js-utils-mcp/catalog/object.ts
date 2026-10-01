import { defineCatalogPackage } from '../scripts/catalog';

const DOT_PATH = ['dot path', 'nested', 'deep'];

export default defineCatalogPackage({
  category: 'Object',
  runtime: 'universal',
  keywords: ['object', 'record'],
  utilities: {
    cleanObject: {
      keywords: ['remove empty', 'compact', 'strip null', 'remove undefined', 'prune'],
    },
    deepClone: { keywords: ['copy', 'clone deep', 'structuredClone'] },
    deepEqual: { keywords: ['compare', 'isEqual', 'equality'] },
    deepMerge: { keywords: ['merge', 'assign', 'extend', 'combine objects', 'defaults'] },
    deepMergeMany: { keywords: ['merge', 'combine objects', 'merge config'] },
    deleteObjectPropertyByPath: {
      keywords: [...DOT_PATH, 'unset', 'remove nested key'],
      notes: ['Same function as `deleteProperty` from this package.'],
    },
    deleteProperty: {
      keywords: [...DOT_PATH, 'unset', 'remove nested key'],
      notes: ['Also exported as `deleteObjectPropertyByPath`.'],
    },
    escapePath: { keywords: DOT_PATH },
    flatKeys: { keywords: ['flatten', 'deep keys', 'all paths', ...DOT_PATH] },
    getObjectValueByPath: {
      keywords: [...DOT_PATH, 'get by path', 'lodash get'],
      notes: ['Same function as `getProperty` from this package.'],
    },
    getProperty: {
      keywords: [...DOT_PATH, 'get by path', 'lodash get'],
      notes: ['Also exported as `getObjectValueByPath`.'],
    },
    hasObjectValueByPath: {
      keywords: [...DOT_PATH, 'has path', 'key exists'],
      notes: ['Same function as `hasProperty` from this package.'],
    },
    hasProperty: {
      keywords: [...DOT_PATH, 'has path', 'key exists'],
      notes: ['Also exported as `hasObjectValueByPath`.'],
    },
    isEmptyObject: { keywords: ['type guard', 'no keys'] },
    isObject: { keywords: ['type guard'] },
    isPlainObject: { keywords: ['type guard', 'pojo'] },
    keysToCamelCase: {
      keywords: [
        'camelcase keys',
        'snake case to camel case',
        'api response',
        'transform keys',
      ],
    },
    keysToSnakeCase: {
      keywords: [
        'snake case keys',
        'camel case to snake case',
        'api request',
        'transform keys',
      ],
    },
    mapKeys: { keywords: ['rename keys', 'transform keys'] },
    mapValues: { keywords: ['transform values'] },
    omit: { keywords: ['exclude keys', 'remove keys', 'without'] },
    parsePath: { keywords: DOT_PATH },
    pick: { keywords: ['select keys', 'subset'] },
    setObjectValueByPath: {
      keywords: [...DOT_PATH, 'set by path', 'lodash set'],
      notes: [
        'Mutates `object` and returns void. With `{ deleteUndefine: true }`, setting `undefined` deletes the key.',
      ],
    },
    setProperty: {
      keywords: [...DOT_PATH, 'set by path', 'lodash set'],
      notes: ['Mutates and returns `object`.'],
    },
    stringifyPath: { keywords: DOT_PATH },
    unflatten: { keywords: ['dot paths to object', 'expand', ...DOT_PATH] },
  },
});
