import { getParents } from '../src/get-parents';

describe('getParents', () => {
  let container: HTMLDivElement | null;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="parent1">
        <div id="parent2">
          <div id="child"></div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    if (container) {
      container.remove();
    }
    container = null;
  });

  it('returns an array of parent elements for a given child element', () => {
    const childElement = document.querySelector('#child');
    expect(childElement).not.toBeNull();
    const parents = getParents(childElement!);

    expect(parents[0]!.id).toBe('parent2');
    expect(parents[1]!.id).toBe('parent1');
    expect(parents[2]!.tagName).toEqual('BODY');
  });

  it('stops before adding next parent', () => {
    const childElement = document.querySelector('#child')!;
    const parents = getParents(childElement, {
      breakBefore: (element: HTMLElement | Element) => element.id === 'parent1',
    });

    expect(parents.length).toBe(1);
    expect(parents[0]!.id).toBe('parent2');
  });

  it('stops after adding next parent', () => {
    const childElement = document.querySelector('#child')!;
    const parents = getParents(childElement, {
      breakAfter: (element: HTMLElement | Element) => element.id === 'parent2',
    });

    expect(parents.length).toBe(1);
    expect(parents[0]!.id).toBe('parent2');
  });

  it('returns an empty array if the element has no parents', () => {
    const parents = getParents(document.body);
    expect(parents).toHaveLength(0);
  });

  it('returns an empty array for a detached element', () => {
    const detachedElement = document.createElement('div');

    expect(getParents(detachedElement)).toEqual([]);
  });

  it('stops before adding the first matching parent', () => {
    const childElement = document.querySelector('#child')!;
    const parents = getParents(childElement, {
      breakBefore: (element: HTMLElement | Element) => element.id === 'parent2',
    });

    expect(parents).toEqual([]);
  });
});
