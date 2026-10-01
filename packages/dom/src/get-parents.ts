/**
 * Collect the ancestors of an element, nearest first, up to and including `document.body`.
 *
 * @param elm - The element whose ancestors to collect
 * @param options - Optional stop conditions
 * @param options.breakBefore - Stop before adding the first ancestor that matches
 * @param options.breakAfter - Stop after adding the first ancestor that matches
 * @returns The ancestor elements, from the direct parent outwards
 *
 * @example
 * ```typescript
 * getParents(button); // [form, section, main, body]
 * getParents(button, { breakAfter: (el) => el.matches('form') }); // [form]
 * ```
 */
export function getParents(
  elm: HTMLElement | Element,
  options?: {
    breakBefore?: (element: HTMLElement | Element) => boolean;
    breakAfter?: (element: HTMLElement | Element) => boolean;
  },
): HTMLElement[] {
  const { breakBefore, breakAfter } = options || {};

  const parents: HTMLElement[] = [];
  let currentElement: Element | null = elm;
  const { body } = elm.ownerDocument;

  while (currentElement !== null && currentElement !== body) {
    const { parentElement } = currentElement as HTMLElement;
    if (!parentElement) {
      break;
    }
    if (breakBefore && breakBefore(parentElement)) {
      break;
    }
    parents.push(parentElement);
    if (breakAfter && breakAfter(parentElement)) {
      break;
    }
    currentElement = parentElement;
  }
  return parents;
}
