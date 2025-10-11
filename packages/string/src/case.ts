import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  noCase,
  pascalCase,
  pascalSnakeCase,
  pathCase,
  sentenceCase,
  snakeCase,
  trainCase,
} from 'change-case';

/**
 * Convert a string to camel case (`fooBar`).
 */
export function toCamelCase(str: string): string {
  return camelCase(str);
}

/**
 * Convert a string to capital case (`Foo Bar`).
 */
export function toCapitalCase(str: string): string {
  return capitalCase(str);
}

/**
 * Convert a string to constant case (`CONSTANT_CASE`).
 */
export function toConstantCase(str: string): string {
  return constantCase(str);
}

/**
 * Convert a string to dot case (`dot.case`).
 */
export function toDotCase(str: string): string {
  return dotCase(str);
}

/**
 * Convert a string to kebab case (`kebab-case`).
 */
export function toKebabCase(str: string): string {
  return kebabCase(str);
}

/**
 * Convert a string to no case (`no case`).
 */
export function toNoCase(str: string): string {
  return noCase(str);
}

/**
 * Convert a string to pascal case (`PascalCase`).
 */
export function toPascalCase(str: string): string {
  return pascalCase(str);
}

/**
 * Convert a string to pascal snake case (`Pascal_Snake_Case`).
 */
export function toPascalSnakeCase(str: string): string {
  return pascalSnakeCase(str);
}

/**
 * Convert a string to path case (`path/case`).
 */
export function toPathCase(str: string): string {
  return pathCase(str);
}

/**
 * Convert a string to sentence case (`Sentence case`).
 */
export function toSentenceCase(str: string): string {
  return sentenceCase(str);
}

/**
 * Convert a string to snake case (`snake_case`).
 */
export function toSnakeCase(str: string): string {
  return snakeCase(str);
}

/**
 * Convert a string to train case (`Train-Case`).
 */
export function toTrainCase(str: string): string {
  return trainCase(str);
}
