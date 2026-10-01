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
 *
 * @example
 * ```typescript
 * toCamelCase('hello world'); // 'helloWorld'
 * toCamelCase('user_id'); // 'userId'
 * ```
 */
export function toCamelCase(str: string): string {
  return camelCase(str);
}

/**
 * Convert a string to capital case (`Foo Bar`).
 *
 * @example
 * ```typescript
 * toCapitalCase('hello world'); // 'Hello World'
 * toCapitalCase('userId'); // 'User Id'
 * ```
 */
export function toCapitalCase(str: string): string {
  return capitalCase(str);
}

/**
 * Convert a string to constant case (`CONSTANT_CASE`).
 *
 * @example
 * ```typescript
 * toConstantCase('hello world'); // 'HELLO_WORLD'
 * toConstantCase('userId'); // 'USER_ID'
 * ```
 */
export function toConstantCase(str: string): string {
  return constantCase(str);
}

/**
 * Convert a string to dot case (`dot.case`).
 *
 * @example
 * ```typescript
 * toDotCase('hello world'); // 'hello.world'
 * toDotCase('userId'); // 'user.id'
 * ```
 */
export function toDotCase(str: string): string {
  return dotCase(str);
}

/**
 * Convert a string to kebab case (`kebab-case`).
 *
 * @example
 * ```typescript
 * toKebabCase('hello world'); // 'hello-world'
 * toKebabCase('userId'); // 'user-id'
 * ```
 */
export function toKebabCase(str: string): string {
  return kebabCase(str);
}

/**
 * Convert a string to no case (`no case`).
 *
 * @example
 * ```typescript
 * toNoCase('hello world'); // 'hello world'
 * toNoCase('userId'); // 'user id'
 * ```
 */
export function toNoCase(str: string): string {
  return noCase(str);
}

/**
 * Convert a string to pascal case (`PascalCase`).
 *
 * @example
 * ```typescript
 * toPascalCase('hello world'); // 'HelloWorld'
 * toPascalCase('user_id'); // 'UserId'
 * ```
 */
export function toPascalCase(str: string): string {
  return pascalCase(str);
}

/**
 * Convert a string to pascal snake case (`Pascal_Snake_Case`).
 *
 * @example
 * ```typescript
 * toPascalSnakeCase('hello world'); // 'Hello_World'
 * toPascalSnakeCase('userId'); // 'User_Id'
 * ```
 */
export function toPascalSnakeCase(str: string): string {
  return pascalSnakeCase(str);
}

/**
 * Convert a string to path case (`path/case`).
 *
 * @example
 * ```typescript
 * toPathCase('hello world'); // 'hello/world'
 * toPathCase('userId'); // 'user/id'
 * ```
 */
export function toPathCase(str: string): string {
  return pathCase(str);
}

/**
 * Convert a string to sentence case (`Sentence case`).
 *
 * @example
 * ```typescript
 * toSentenceCase('hello world'); // 'Hello world'
 * toSentenceCase('userId'); // 'User id'
 * ```
 */
export function toSentenceCase(str: string): string {
  return sentenceCase(str);
}

/**
 * Convert a string to snake case (`snake_case`).
 *
 * @example
 * ```typescript
 * toSnakeCase('hello world'); // 'hello_world'
 * toSnakeCase('userId'); // 'user_id'
 * ```
 */
export function toSnakeCase(str: string): string {
  return snakeCase(str);
}

/**
 * Convert a string to train case (`Train-Case`).
 *
 * @example
 * ```typescript
 * toTrainCase('hello world'); // 'Hello-World'
 * toTrainCase('userId'); // 'User-Id'
 * ```
 */
export function toTrainCase(str: string): string {
  return trainCase(str);
}
