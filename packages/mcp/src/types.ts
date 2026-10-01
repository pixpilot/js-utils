/** What an exported symbol is, so clients can filter and render it correctly. */
export type UtilityKind = 'function' | 'constant' | 'type';

/** Where an entry point can run. Lets an AI avoid Node-only helpers in browser code. */
export type UtilityRuntime = 'universal' | 'node' | 'browser';

/** A property of an object-shaped parameter or return value (options bags, results). */
export interface PropertyDoc {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

/** One parameter of a function signature. */
export interface ParameterDoc {
  name: string;
  type: string;
  optional: boolean;
  rest?: boolean;
  defaultValue?: string;
  description?: string;
  /** Expanded members when the parameter is an options object declared in this repo. */
  properties?: PropertyDoc[];
}

/** Return value of a function signature. */
export interface ReturnDoc {
  type: string;
  description?: string;
  /** Expanded members when the return value is an object type declared in this repo. */
  properties?: PropertyDoc[];
}

/** One call signature (functions with overloads have several). */
export interface SignatureDoc {
  /** Ready-to-read signature, e.g. `truncate(str: string, maxLength: number, ellipsis = '...'): string`. */
  text: string;
  typeParameters?: string[];
  parameters: ParameterDoc[];
  returns: ReturnDoc;
}

/** A third-party symbol re-exported under a @pixpilot package. */
export interface ReexportDoc {
  module: string;
  name: string;
}

/** Everything an AI needs to use one exported utility. Generated from source — never hand-edited. */
export interface UtilityDoc {
  name: string;
  kind: UtilityKind;
  /** Package to install, e.g. `@pixpilot/env`. */
  package: string;
  /** Module specifier to import from, e.g. `@pixpilot/env/node`. */
  importPath: string;
  runtime: UtilityRuntime;
  category: string;
  description: string;
  /** Call signatures (functions only). */
  signatures?: SignatureDoc[];
  /** Type of a constant, or the definition of an exported type. */
  type?: string;
  /** Initializer of a constant, when short enough to be useful. */
  value?: string;
  /** Members of an exported interface. */
  properties?: PropertyDoc[];
  examples: string[];
  keywords: string[];
  notes: string[];
  deprecated?: string;
  reexport?: ReexportDoc;
  /** Repo-relative source file that declares the utility. */
  source: string;
}

/** A module specifier a package exposes. */
export interface EntryPointDoc {
  importPath: string;
  runtime: UtilityRuntime;
  description?: string;
}

/** Package-level summary used for browsing and install guidance. */
export interface PackageDoc {
  name: string;
  description: string;
  category: string;
  keywords: string[];
  entryPoints: EntryPointDoc[];
  utilityCount: number;
}

/** The full generated catalog served by the MCP server. */
export interface UtilityRegistry {
  packages: PackageDoc[];
  utilities: UtilityDoc[];
}
