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
