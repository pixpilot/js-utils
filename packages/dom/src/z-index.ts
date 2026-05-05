import { getSum } from '@pixpilot/math';
import { getParents } from './get-parents';

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
