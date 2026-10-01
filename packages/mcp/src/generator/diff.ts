import type { UtilityDoc, UtilityRegistry } from '../types';

function utilityKey(utility: UtilityDoc): string {
  return `${utility.importPath} › ${utility.name}`;
}

function changedFields<T extends object>(before: T, after: T): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  return [...keys].filter(
    (key) =>
      JSON.stringify(before[key as keyof T]) !== JSON.stringify(after[key as keyof T]),
  );
}

function signatureLines(utility: UtilityDoc): string {
  return (utility.signatures ?? []).map((signature) => signature.text).join(' | ');
}

/**
 * Human-readable differences between the committed registry and a fresh build.
 * Empty when the committed registry is up to date.
 */
export function diffRegistries(
  committed: UtilityRegistry,
  current: UtilityRegistry,
): string[] {
  const changes: string[] = [];
  const before = new Map(committed.utilities.map((item) => [utilityKey(item), item]));
  const after = new Map(current.utilities.map((item) => [utilityKey(item), item]));

  for (const [key, utility] of after) {
    const previous = before.get(key);

    if (!previous) {
      changes.push(`added ${key}: ${signatureLines(utility) || utility.kind}`);
      continue;
    }

    const fields = changedFields(previous, utility);
    if (fields.includes('signatures')) {
      changes.push(
        `changed ${key} signature:\n      was: ${signatureLines(previous)}\n      now: ${signatureLines(utility)}`,
      );
    }

    const otherFields = fields.filter((field) => field !== 'signatures');
    if (otherFields.length > 0) {
      changes.push(`changed ${key}: ${otherFields.join(', ')}`);
    }
  }

  for (const key of before.keys()) {
    if (!after.has(key)) {
      changes.push(`removed ${key}`);
    }
  }

  const packagesBefore = new Map(committed.packages.map((item) => [item.name, item]));
  for (const pkg of current.packages) {
    const previous = packagesBefore.get(pkg.name);
    const fields = previous ? changedFields(previous, pkg) : ['(new package)'];

    if (fields.length > 0) {
      changes.push(`package ${pkg.name}: ${fields.join(', ')}`);
    }
    packagesBefore.delete(pkg.name);
  }

  for (const name of packagesBefore.keys()) {
    changes.push(`package ${name}: removed`);
  }

  return changes;
}
