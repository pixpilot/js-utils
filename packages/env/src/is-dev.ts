/* eslint-disable node/prefer-global/process */
export function isDevelopment(): boolean {
  return (
    (typeof process !== 'undefined' && process.env?.['DEV'] === 'true') ||
    (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.['DEV'] === 'true') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.['MODE'] === 'development')
  );
}
