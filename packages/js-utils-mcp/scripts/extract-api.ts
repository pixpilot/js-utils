/* eslint-disable no-bitwise -- TypeScript symbol, type, and format flags are bit masks. */
import type {
  ParameterDoc,
  PropertyDoc,
  ReexportDoc,
  ReturnDoc,
  SignatureDoc,
  UtilityKind,
} from '../src/types';
import path from 'node:path';
import ts from 'typescript';

/** One exported symbol of an entry point, as declared in source. */
export interface ExtractedSymbol {
  name: string;
  kind: UtilityKind;
  description: string;
  signatures?: SignatureDoc[];
  type?: string;
  value?: string;
  properties?: PropertyDoc[];
  examples: string[];
  deprecated?: string;
  reexport?: ReexportDoc;
  /** Absolute path of the file that exports the symbol. */
  sourceFile: string;
}

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

/** Longest initializer kept as a constant's `value`; longer ones are noise for an AI. */
const MAX_VALUE_LENGTH = 200;

// Greedy prefix so the LAST `node_modules` segment wins (pnpm nests packages under `.pnpm`).
const NODE_MODULES_PATTERN =
  /^.*[\\/]node_modules[\\/](?<module>(?:@[^\\/]+[\\/])?[^\\/]+)/u;

function isExternalFile(fileName: string): boolean {
  return NODE_MODULES_PATTERN.test(fileName);
}

function externalModuleName(fileName: string): string | undefined {
  const match = NODE_MODULES_PATTERN.exec(fileName);
  return match?.groups?.['module']?.replaceAll('\\', '/');
}

/** Collapses formatting whitespace so type text is stable and single-line. */
function normalizeTypeText(text: string): string {
  return text
    .replace(/\s+/gu, ' ')
    .replace(/;\s*\}/gu, ' }')
    .replace(/\{\s+\}/gu, '{}')
    .trim();
}

/** Strips the conventional `- ` separator TS keeps after a `@param name`. */
function cleanComment(text: string): string {
  return text.trim().replace(/^-\s+/u, '');
}

/**
 * Reads `@example` blocks from the raw JSDoc text. The TS JSDoc parser drops
 * indentation in comments written without leading asterisks (common in
 * third-party typings), which would flatten multi-line examples.
 */
function rawJsDocExamples(node: ts.Node | undefined): string[] | undefined {
  const doc = node
    ? ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1)
    : undefined;

  if (!doc) {
    return undefined;
  }

  const body = doc
    .getText()
    .replace(/^\/\*\*/u, '')
    .replace(/\*\/$/u, '')
    .split(/\r?\n/u);
  const hasAsterisks = body
    .slice(1)
    .filter((line) => line.trim().length > 0)
    .every((line) => /^\s*\*/u.test(line));
  const lines = hasAsterisks ? body.map((line) => line.replace(/^\s*\* ?/u, '')) : body;

  const examples: string[] = [];
  let current: string[] | undefined;
  let inFence = false;

  for (const line of lines) {
    const tag = inFence ? undefined : /^\s*@(?<name>\w+)(?<rest>\s.*)?$/u.exec(line);

    if (tag) {
      if (current) examples.push(current.join('\n'));
      current =
        tag.groups?.['name'] === 'example'
          ? [tag.groups['rest']?.slice(1) ?? '']
          : undefined;
    } else {
      if (line.trim().startsWith('```')) inFence = !inFence;
      current?.push(line);
    }
  }

  if (current) examples.push(current.join('\n'));

  return examples;
}

function dedent(text: string): string {
  const lines = text.replace(/^\n+|\s+$/gu, '').split('\n');
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => /^\s*/u.exec(line)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(minIndent)).join('\n');
}

/** Returns the code of an `@example` tag, without Markdown fences. */
function normalizeExample(text: string): string {
  const fenced = /```[\w-]*\n(?<code>[\s\S]*?)```/u.exec(text);
  return dedent(fenced?.groups?.['code'] ?? text).trim();
}

/** Examples from the first node that has JSDoc, falling back to parsed tags. */
function extractExamples(
  nodes: readonly (ts.Node | undefined)[],
  tags: readonly ts.JSDocTagInfo[],
): string[] {
  const raw = nodes.map(rawJsDocExamples).find((examples) => examples !== undefined);
  const examples =
    raw && raw.length > 0
      ? raw
      : tags.filter((tag) => tag.name === 'example').map((tag) => tagText(tag));

  return examples.map(normalizeExample).filter((example) => example.length > 0);
}

/** Rewrites a third-party example so it uses the name the @pixpilot package exports. */
function adaptReexportExample(
  example: string,
  reexport: ReexportDoc,
  name: string,
): string {
  const withoutImports = example
    .split('\n')
    .filter((line) => !/^\s*import\s.+from\s+['"].+['"];?\s*$/u.test(line))
    .join('\n')
    .trim();

  if (reexport.name === name) {
    return withoutImports;
  }

  return withoutImports.replace(new RegExp(`\\b${reexport.name}\\b`, 'gu'), name);
}

function tagText(tag: ts.JSDocTagInfo): string {
  return ts.displayPartsToString(tag.text).trim();
}

function printDeclaration(node: ts.Node): string {
  const printer = ts.createPrinter({ removeComments: true });
  const text = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile());

  return text.replace(/^(?:export\s+)?(?:declare\s+)?/u, '').trim();
}

export class ApiExtractor {
  private readonly program: ts.Program;
  private readonly checker: ts.TypeChecker;

  constructor(entryFiles: readonly string[], tsconfigPath: string) {
    const parsed = ts.getParsedCommandLineOfConfigFile(tsconfigPath, undefined, {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    });

    if (!parsed) {
      throw new Error(`Could not read ${tsconfigPath}`);
    }

    this.program = ts.createProgram({
      rootNames: [...entryFiles],
      options: {
        ...parsed.options,
        noEmit: true,
        incremental: false,
        // Ambient test/runtime typings are irrelevant to exported signatures.
        types: [],
      },
    });
    this.checker = this.program.getTypeChecker();
  }

  /** Lists every export of an entry file, following `export *` and re-exports. */
  extractEntry(entryFile: string): ExtractedSymbol[] {
    const sourceFile = this.program.getSourceFile(entryFile);

    if (!sourceFile) {
      throw new Error(`Entry file not found in program: ${entryFile}`);
    }

    const moduleSymbol = this.checker.getSymbolAtLocation(sourceFile);

    if (!moduleSymbol) {
      return [];
    }

    return this.checker
      .getExportsOfModule(moduleSymbol)
      .map((symbol) => this.extractSymbol(symbol))
      .filter((symbol): symbol is ExtractedSymbol => symbol !== undefined);
  }

  private extractSymbol(exported: ts.Symbol): ExtractedSymbol | undefined {
    const target =
      exported.flags & ts.SymbolFlags.Alias
        ? this.checker.getAliasedSymbol(exported)
        : exported;
    const declaration = target.valueDeclaration ?? target.declarations?.[0];

    if (!declaration) {
      return undefined;
    }

    const exportDeclaration = exported.declarations?.[0] ?? declaration;
    const sourceFile = exportDeclaration.getSourceFile().fileName;
    const isTypeOnly =
      (target.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) !== 0 &&
      (target.flags & ts.SymbolFlags.Value) === 0;

    if (isTypeOnly) {
      return this.extractType(exported.name, target, declaration, sourceFile);
    }

    const type = this.checker.getTypeOfSymbolAtLocation(target, declaration);
    const signatures = type.getCallSignatures();

    if (signatures.length > 0) {
      return this.extractFunction(exported.name, target, signatures, sourceFile);
    }

    return this.extractConstant(exported.name, target, declaration, type, sourceFile);
  }

  private extractFunction(
    name: string,
    symbol: ts.Symbol,
    signatures: readonly ts.Signature[],
    sourceFile: string,
  ): ExtractedSymbol {
    const [firstSignature] = signatures;
    const signatureDeclaration = firstSignature?.getDeclaration();
    const reexport = this.findReexport(name, signatureDeclaration);

    let description = ts.displayPartsToString(
      symbol.getDocumentationComment(this.checker),
    );
    let tags = symbol.getJsDocTags(this.checker);

    // `export const alias = fn` carries no JSDoc of its own: fall back to the target's.
    if (description.length === 0 && firstSignature) {
      description = ts.displayPartsToString(
        firstSignature.getDocumentationComment(this.checker),
      );
    }
    if (tags.length === 0 && firstSignature) {
      tags = firstSignature.getJsDocTags();
    }

    const examples = extractExamples(
      [symbol.valueDeclaration, signatureDeclaration],
      tags,
    ).map((example) =>
      reexport ? adaptReexportExample(example, reexport, name) : example,
    );

    return {
      name,
      kind: 'function',
      description: description.trim(),
      signatures: signatures.map((signature) => this.extractSignature(name, signature)),
      examples,
      ...this.deprecation(tags),
      ...(reexport ? { reexport } : {}),
      sourceFile,
    };
  }

  private extractSignature(name: string, signature: ts.Signature): SignatureDoc {
    const declaration = signature.getDeclaration() as ts.SignatureDeclaration | undefined;
    const paramTags = signature
      .getJsDocTags()
      .filter((tag) => tag.name === 'param')
      .map(tagText);

    const parameters = signature.parameters.map((parameter) =>
      this.extractParameter(parameter, declaration, paramTags),
    );
    const returns = this.extractReturn(signature, declaration);
    const typeParameters = declaration?.typeParameters?.map((typeParameter) =>
      normalizeTypeText(typeParameter.getText()),
    );

    const parameterText = parameters
      .map((parameter) => {
        const rest = parameter.rest === true ? '...' : '';
        const optional =
          parameter.optional && parameter.defaultValue === undefined ? '?' : '';
        const defaultValue =
          parameter.defaultValue === undefined ? '' : ` = ${parameter.defaultValue}`;

        return `${rest}${parameter.name}${optional}: ${parameter.type}${defaultValue}`;
      })
      .join(', ');
    const typeParameterText =
      typeParameters && typeParameters.length > 0 ? `<${typeParameters.join(', ')}>` : '';

    return {
      text: `${name}${typeParameterText}(${parameterText}): ${returns.type}`,
      ...(typeParameters && typeParameters.length > 0 ? { typeParameters } : {}),
      parameters,
      returns,
    };
  }

  private extractParameter(
    parameter: ts.Symbol,
    signatureDeclaration: ts.SignatureDeclaration | undefined,
    paramTags: readonly string[],
  ): ParameterDoc {
    const declaration = parameter.valueDeclaration as ts.ParameterDeclaration | undefined;
    const location = declaration ?? signatureDeclaration;
    const type = location
      ? this.checker.getTypeOfSymbolAtLocation(parameter, location)
      : undefined;
    const name =
      declaration && !ts.isIdentifier(declaration.name) ? 'options' : parameter.name;
    const typeText = this.typeText(declaration?.type, type, location);
    const description = cleanComment(
      ts.displayPartsToString(parameter.getDocumentationComment(this.checker)),
    );
    const properties = type
      ? this.extractProperties(type, (propertyName) =>
          this.nestedParamDescription(paramTags, name, propertyName),
        )
      : undefined;

    return {
      name,
      type: typeText,
      optional: declaration ? this.checker.isOptionalParameter(declaration) : false,
      ...(declaration?.dotDotDotToken ? { rest: true } : {}),
      ...(declaration?.initializer
        ? { defaultValue: normalizeTypeText(declaration.initializer.getText()) }
        : {}),
      ...(description.length > 0 ? { description } : {}),
      ...(properties ? { properties } : {}),
    };
  }

  /** Reads `@param options.files - ...` style docs for inline option objects. */
  private nestedParamDescription(
    paramTags: readonly string[],
    parameterName: string,
    propertyName: string,
  ): string | undefined {
    const prefix = `${parameterName}.${propertyName}`;
    const tag = paramTags.find(
      (text) => text === prefix || text.startsWith(`${prefix} `),
    );

    return tag === undefined ? undefined : cleanComment(tag.slice(prefix.length));
  }

  private extractReturn(
    signature: ts.Signature,
    declaration: ts.SignatureDeclaration | undefined,
  ): ReturnDoc {
    const returnType = signature.getReturnType();
    const predicate = this.checker.getTypePredicateOfSignature(signature);
    let type: string;

    if (declaration?.type) {
      type = normalizeTypeText(declaration.type.getText());
    } else if (predicate?.type && predicate.parameterName !== undefined) {
      type = `${predicate.parameterName} is ${this.checker.typeToString(predicate.type, declaration, TYPE_FORMAT_FLAGS)}`;
    } else {
      type = this.checker.typeToString(returnType, declaration, TYPE_FORMAT_FLAGS);
    }

    const returnsTag = signature
      .getJsDocTags()
      .find((tag) => tag.name === 'returns' || tag.name === 'return');
    const description = returnsTag ? cleanComment(tagText(returnsTag)) : '';
    const properties = this.extractProperties(returnType);

    return {
      type,
      ...(description.length > 0 ? { description } : {}),
      ...(properties ? { properties } : {}),
    };
  }

  /**
   * Expands the members of an object type declared in this repo (options bags,
   * result objects). Library, DOM, and third-party types are left as names.
   */
  private extractProperties(
    type: ts.Type,
    fallbackDescription?: (propertyName: string) => string | undefined,
  ): PropertyDoc[] | undefined {
    const objectType = this.checker.getNonNullableType(type);

    if (
      (objectType.flags & ts.TypeFlags.Object) === 0 ||
      objectType.getCallSignatures().length > 0 ||
      this.checker.isArrayType(objectType) ||
      this.checker.isTupleType(objectType)
    ) {
      return undefined;
    }

    const declarations = (objectType.aliasSymbol ?? objectType.getSymbol())?.declarations;
    const isLocal =
      declarations !== undefined &&
      declarations.length > 0 &&
      declarations.every((node) => !isExternalFile(node.getSourceFile().fileName));

    if (!isLocal) {
      return undefined;
    }

    const properties = this.checker.getPropertiesOfType(objectType);

    if (properties.length === 0) {
      return undefined;
    }

    return properties.map((property) => {
      const declaration = property.valueDeclaration ?? property.declarations?.[0];
      const typeNode =
        declaration &&
        (ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration))
          ? declaration.type
          : undefined;
      const propertyType = declaration
        ? this.checker.getTypeOfSymbolAtLocation(property, declaration)
        : undefined;
      const typeText = this.typeText(typeNode, propertyType, declaration);
      const description =
        ts.displayPartsToString(property.getDocumentationComment(this.checker)).trim() ||
        fallbackDescription?.(property.name);

      return {
        name: property.name,
        type: typeText,
        optional: (property.flags & ts.SymbolFlags.Optional) !== 0,
        ...(description !== undefined && description.length > 0 ? { description } : {}),
      };
    });
  }

  private extractConstant(
    name: string,
    symbol: ts.Symbol,
    declaration: ts.Declaration,
    type: ts.Type,
    sourceFile: string,
  ): ExtractedSymbol {
    const variable = ts.isVariableDeclaration(declaration) ? declaration : undefined;
    const typeText = variable?.type
      ? normalizeTypeText(variable.type.getText())
      : this.checker.typeToString(type, declaration, TYPE_FORMAT_FLAGS);
    const value = variable?.initializer
      ? normalizeTypeText(variable.initializer.getText())
      : undefined;
    const tags = symbol.getJsDocTags(this.checker);

    return {
      name,
      kind: 'constant',
      description: ts
        .displayPartsToString(symbol.getDocumentationComment(this.checker))
        .trim(),
      type: typeText,
      ...(value !== undefined && value.length <= MAX_VALUE_LENGTH ? { value } : {}),
      examples: extractExamples([declaration], tags),
      ...this.deprecation(tags),
      sourceFile,
    };
  }

  private extractType(
    name: string,
    symbol: ts.Symbol,
    declaration: ts.Declaration,
    sourceFile: string,
  ): ExtractedSymbol {
    const tags = symbol.getJsDocTags(this.checker);
    const declaredType = this.checker.getDeclaredTypeOfSymbol(symbol);
    const properties = ts.isInterfaceDeclaration(declaration)
      ? this.extractProperties(declaredType)
      : undefined;

    return {
      name,
      kind: 'type',
      description: ts
        .displayPartsToString(symbol.getDocumentationComment(this.checker))
        .trim(),
      type: printDeclaration(declaration),
      ...(properties ? { properties } : {}),
      examples: extractExamples([declaration], tags),
      ...this.deprecation(tags),
      sourceFile,
    };
  }

  private findReexport(
    name: string,
    declaration: ts.SignatureDeclaration | undefined,
  ): ReexportDoc | undefined {
    if (!declaration) {
      return undefined;
    }

    const module = externalModuleName(declaration.getSourceFile().fileName);

    if (module === undefined) {
      return undefined;
    }

    const originalName =
      declaration.name && ts.isIdentifier(declaration.name)
        ? declaration.name.text
        : name;

    return { module, name: originalName };
  }

  /** Prefers the type as written in source; falls back to the checker for inferred types. */
  private typeText(
    typeNode: ts.TypeNode | undefined,
    type: ts.Type | undefined,
    location: ts.Node | undefined,
  ): string {
    if (typeNode) {
      return normalizeTypeText(typeNode.getText());
    }

    return type
      ? this.checker.typeToString(type, location, TYPE_FORMAT_FLAGS)
      : 'unknown';
  }

  private deprecation(tags: readonly ts.JSDocTagInfo[]): { deprecated?: string } {
    const tag = tags.find((item) => item.name === 'deprecated');

    if (!tag) {
      return {};
    }

    const text = tagText(tag);

    return { deprecated: text.length > 0 ? text : 'Deprecated.' };
  }
}

/** Repo-relative POSIX path, used for stable `source` fields. */
export function toRepoPath(repoRoot: string, filePath: string): string {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}
