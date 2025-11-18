/* eslint-disable ts/ban-ts-comment */
/* eslint-disable node/prefer-global/process */
export function isDevelopment(): boolean {
  return (
    (typeof process !== 'undefined' && process.env?.['DEV'] === 'true') ||
    (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') ||
    // @ts-ignore
    // eslint-disable-next-line ts/no-unsafe-member-access
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV === 'true') ||
    // @ts-ignore
    // eslint-disable-next-line ts/no-unsafe-member-access
    (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development')
  );
}
