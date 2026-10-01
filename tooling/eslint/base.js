import makeConfig from '@pixpilot/eslint-config';

const baseConfig = makeConfig({
  pnpm: true,
  turbo: true,
});

/** @type {import('eslint').Linter.Config[]} */
// eslint-disable-next-line antfu/no-top-level-await
const resolvedConfig = await baseConfig;

export default resolvedConfig;
