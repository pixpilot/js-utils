import type { UtilityDoc, UtilityKind, UtilityRuntime } from './types';

/** A compact, ranked match returned by {@link searchUtilities}. */
export interface UtilitySearchResult {
  name: string;
  kind: UtilityKind;
  package: string;
  importPath: string;
  runtime: UtilityRuntime;
  /** First signature (functions) or type (constants), shortened for scanning. */
  signature?: string;
  /** First sentence of the description. */
  summary: string;
  deprecated?: true;
  /** Relevance score; higher is a stronger match. `0` in query-less list mode. */
  score: number;
}

/** Filters and limits for {@link searchUtilities}. */
export interface SearchUtilitiesOptions {
  /** Package name (`@pixpilot/date`), short name (`date`), or import path (`@pixpilot/env/node`). */
  package?: string | undefined;
  kind?: UtilityKind | undefined;
  /** Where the code runs. `browser`/`node` also include `universal` utilities. */
  runtime?: UtilityRuntime | undefined;
  limit?: number | undefined;
}

/** Default number of results returned when the caller does not pass a limit. */
export const DEFAULT_SEARCH_LIMIT = 10;

/** Maximum edit distance still treated as a likely typo of a utility name. */
const MAX_TYPO_DISTANCE = 2;

const MAX_SIGNATURE_LENGTH = 160;
const MAX_SUMMARY_LENGTH = 200;

/** Shortest token that gets a plural-stripped variant (`days` -> `day`). */
const MIN_STEM_LENGTH = 4;

/** Types rank below the functions that use them. */
const TYPE_WEIGHT = 0.6;

/** Points awarded for each kind of match, tuned so stronger signals win. */
const SCORE = {
  nameExact: 100,
  namePrefix: 50,
  nameIncludes: 30,
  keywordExact: 40,
  categoryExact: 25,
  tokenName: 10,
  tokenKeyword: 6,
  tokenCategory: 4,
  tokenDescription: 3,
  allTokens: 15,
  fuzzyName: 15,
  deprecatedPenalty: 10,
} as const;

/** Filler words that would otherwise match almost every description. */
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'by',
  'do',
  'for',
  'from',
  'how',
  'i',
  'in',
  'into',
  'it',
  'me',
  'my',
  'need',
  'of',
  'on',
  'or',
  'the',
  'that',
  'this',
  'to',
  'want',
  'with',
]);

interface SearchableUtility {
  utility: UtilityDoc;
  name: string;
  /** camelCase name split into words, e.g. `keys to camel case`. */
  nameWords: string;
  category: string;
  description: string;
  keywords: string[];
}

function splitCamelCase(name: string): string {
  return name
    .replace(/(?<lower>[a-z\d])(?<upper>[A-Z])/gu, '$<lower> $<upper>')
    .replace(/(?<acronym>[A-Z]+)(?<word>[A-Z][a-z])/gu, '$<acronym> $<word>')
    .replace(/_/gu, ' ')
    .toLowerCase();
}

/** The token plus a crude singular form, so `days` also matches `addDay`-style text. */
function tokenVariants(token: string): string[] {
  if (token.length < MIN_STEM_LENGTH) return [token];
  if (token.endsWith('ies')) return [token, token.replace(/ies$/u, 'y')];
  if (token.endsWith('s') && !token.endsWith('ss'))
    return [token, token.replace(/s$/u, '')];
  return [token];
}

function includesAny(haystack: string, variants: readonly string[]): boolean {
  return variants.some((variant) => haystack.includes(variant));
}

function toSearchable(utility: UtilityDoc): SearchableUtility {
  return {
    utility,
    name: utility.name.toLowerCase(),
    nameWords: splitCamelCase(utility.name),
    category: utility.category.toLowerCase(),
    description: utility.description.toLowerCase(),
    keywords: utility.keywords.map((keyword) => keyword.toLowerCase()),
  };
}

function scoreUtility(
  item: SearchableUtility,
  query: string,
  tokens: readonly string[],
): number {
  let score = 0;

  // 1. Whole-query name match, graded by how tight it is.
  if (item.name === query) score += SCORE.nameExact;
  else if (item.name.startsWith(query)) score += SCORE.namePrefix;
  else if (item.name.includes(query) || item.nameWords.includes(query)) {
    score += SCORE.nameIncludes;
  }

  // 2. Whole-query keyword / category match.
  if (item.keywords.includes(query)) score += SCORE.keywordExact;
  if (item.category === query) score += SCORE.categoryExact;

  // 3. Per-token matching so natural-language queries ("end of month",
  //    "camel case keys") still score against every field.
  let matchedTokens = 0;
  for (const token of tokens) {
    const variants = tokenVariants(token);
    let matched = false;

    if (includesAny(item.name, variants)) {
      score += SCORE.tokenName;
      matched = true;
    }
    if (item.keywords.some((keyword) => includesAny(keyword, variants))) {
      score += SCORE.tokenKeyword;
      matched = true;
    }
    if (includesAny(item.category, variants)) {
      score += SCORE.tokenCategory;
      matched = true;
    }
    if (includesAny(item.description, variants)) {
      score += SCORE.tokenDescription;
      matched = true;
    }
    if (matched) matchedTokens += 1;
  }

  // 4. Reward utilities that cover the whole request over ones matching one word.
  if (tokens.length > 1 && matchedTokens === tokens.length) score += SCORE.allTokens;

  // 5. Light typo tolerance on the name ("trunacte" -> "truncate").
  if (score === 0 && levenshtein(query, item.name) <= MAX_TYPO_DISTANCE) {
    score += SCORE.fuzzyName;
  }

  if (score === 0) return 0;
  if (item.utility.kind === 'type') score = Math.round(score * TYPE_WEIGHT);
  if (item.utility.deprecated !== undefined) {
    score = Math.max(1, score - SCORE.deprecatedPenalty);
  }

  return score;
}

function shorten(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

function firstSentence(text: string): string {
  // JSDoc wraps lines mid-sentence: only a blank line ends the first paragraph.
  const [paragraph = ''] = text.split(/\n\s*\n/u);
  const [sentence = ''] = paragraph.replace(/\s+/gu, ' ').split(/(?<=\.)\s/u);
  return shorten(sentence.trim(), MAX_SUMMARY_LENGTH);
}

function signatureOf(utility: UtilityDoc): string | undefined {
  const [first] = utility.signatures ?? [];

  if (first) {
    const overloads = (utility.signatures?.length ?? 1) - 1;
    const suffix =
      overloads > 0 ? ` (+${overloads} overload${overloads > 1 ? 's' : ''})` : '';
    return shorten(first.text, MAX_SIGNATURE_LENGTH) + suffix;
  }

  if (utility.kind === 'constant' && utility.type !== undefined) {
    return `${utility.name}: ${utility.type}`;
  }

  return undefined;
}

function toResult(utility: UtilityDoc, score: number): UtilitySearchResult {
  const signature = signatureOf(utility);

  return {
    name: utility.name,
    kind: utility.kind,
    package: utility.package,
    importPath: utility.importPath,
    runtime: utility.runtime,
    ...(signature === undefined ? {} : { signature }),
    summary: firstSentence(utility.description),
    ...(utility.deprecated === undefined ? {} : { deprecated: true as const }),
    score,
  };
}

/** True when `filter` names the utility's package, import path, or short package name. */
export function matchesPackage(utility: UtilityDoc, filter: string): boolean {
  const normalized = filter.trim().toLowerCase();
  const pkg = utility.package.toLowerCase();

  return (
    pkg === normalized ||
    utility.importPath.toLowerCase() === normalized ||
    pkg.split('/').at(-1) === normalized
  );
}

function matchesRuntime(utility: UtilityDoc, runtime: UtilityRuntime): boolean {
  return utility.runtime === runtime || utility.runtime === 'universal';
}

/**
 * Smart, dependency-free search over the utility registry.
 *
 * With an empty query it lists (filtered) utilities alphabetically; otherwise it
 * ranks them by name, keywords, category, and description, with light typo
 * tolerance on the name. Results are capped at `limit`.
 */
export function searchUtilities(
  utilities: readonly UtilityDoc[],
  query: string,
  options: SearchUtilitiesOptions = {},
): UtilitySearchResult[] {
  const max = Math.max(0, Math.trunc(options.limit ?? DEFAULT_SEARCH_LIMIT));
  const candidates = utilities.filter(
    (utility) =>
      (options.package === undefined || matchesPackage(utility, options.package)) &&
      (options.kind === undefined || utility.kind === options.kind) &&
      (options.runtime === undefined || matchesRuntime(utility, options.runtime)),
  );
  const normalizedQuery = query.trim().toLowerCase();

  // No query: list mode. Alphabetical, no scoring needed.
  if (!normalizedQuery) {
    return [...candidates]
      .sort(
        (a, b) =>
          a.importPath.localeCompare(b.importPath) || a.name.localeCompare(b.name),
      )
      .slice(0, max)
      .map((utility) => toResult(utility, 0));
  }

  const tokens = normalizedQuery
    .split(/[\s,;:!?()]+/u)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));

  return (
    candidates
      .map(toSearchable)
      .map((item) => toResult(item.utility, scoreUtility(item, normalizedQuery, tokens)))
      .filter((result) => result.score > 0)
      // Rank by score, then break ties alphabetically for stable output.
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, max)
  );
}

/** Small, dependency-free Levenshtein distance for typo tolerance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Single rolling row instead of a full matrix; `diagonal` carries dp[i-1][j-1].
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0] ?? 0; // dp[i-1][0]
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j] ?? 0; // dp[i-1][j], overwritten below
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        above + 1, // deletion
        (row[j - 1] ?? 0) + 1, // insertion
        diagonal + cost, // substitution
      );
      diagonal = above;
    }
  }

  return row[b.length] ?? 0;
}
