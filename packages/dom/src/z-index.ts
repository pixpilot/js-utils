import { getSum } from '@pixpilot/math';
import { getParents } from './get-parents';

/**
 * Find the highest computed `z-index` among all descendants of an element.
 *
 * Descendants with `z-index: auto` and `<script>` elements are ignored.
 *
 * @param element - Element or document to scan (default: `document.body`)
 * @param defaultZindex - Value returned when no descendant has a numeric z-index (default: 0)
 * @returns The highest z-index found, or `defaultZindex`
 *
 * @example
 * ```typescript
 * // Place a new overlay above everything on the page
 * overlay.style.zIndex = String(getHighestZindex() + 1);
 * ```
 */
export function getHighestZindex(
  element?: HTMLElement | Document,
  defaultZindex = 0,
): number {
  const elm = element ?? document.body;
  let maxZ: number | null = null;

  const elms: HTMLElement[] = Array.from(elm.querySelectorAll('*')).filter(
    (node: Element) => node.nodeName !== 'SCRIPT',
  ) as HTMLElement[];

  elms.forEach((el) => {
    const z = Number(window.getComputedStyle(el).zIndex);
    if (z > (maxZ ?? Number.NEGATIVE_INFINITY)) {
      maxZ = z;
    }
  });

  return maxZ ?? defaultZindex;
}

/**
 * Sum the inline `style.zIndex` of every ancestor of an element (see `getParents`).
 *
 * Only inline styles are read, not stylesheet or computed values. Ancestors without
 * a numeric inline z-index count as `parentDefaultZindex`.
 *
 * @param element - The element whose ancestors to sum
 * @param parentDefaultZindex - Value used for ancestors without a numeric inline z-index (default: 0)
 * @returns The summed z-index of all ancestors
 *
 * @example
 * ```typescript
 * // <div style="z-index: 10"><div style="z-index: 5"><span id="target"></span></div></div>
 * sumOfParentZindex(document.querySelector<HTMLElement>('#target')!); // 15
 * ```
 */
export function sumOfParentZindex(element: HTMLElement, parentDefaultZindex = 0): number {
  const parents = getParents(element);
  const sumOfZindex = getSum(
    parents.map((parent) => {
      if (!parent.style.zIndex) {
        return parentDefaultZindex;
      }

      const zIndex = Number(parent.style.zIndex);
      return Number.isNaN(zIndex) ? parentDefaultZindex : zIndex;
    }),
  );
  return sumOfZindex;
}
