import { getHighestZindex, sumOfParentZindex } from '../src';

describe('getHighestZindex', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined', () => {
    expect(getHighestZindex).toBeDefined();
  });

  it('should return default zindex', () => {
    expect(getHighestZindex(undefined, 1)).toBe(1);
  });

  it('should return highest zindex', () => {
    const elm = document.createElement('div');
    elm.style.zIndex = '1';
    document.body.append(elm);
    expect(getHighestZindex()).toBe(1);
  });

  it('should ignore script elements when finding the highest zindex', () => {
    const container = document.createElement('div');
    const script = document.createElement('script');
    const childElm = document.createElement('div');

    script.style.zIndex = '999';
    childElm.style.zIndex = '3';

    container.append(script, childElm);
    document.body.append(container);

    expect(getHighestZindex(container)).toBe(3);
  });

  it('should return zero when the highest zindex is explicitly zero', () => {
    const elm = document.createElement('div');
    elm.style.zIndex = '0';
    document.body.append(elm);

    expect(getHighestZindex(document.body, 7)).toBe(0);
  });

  it('should return highest zindex from container', () => {
    const elm = document.createElement('div');
    const childElm = document.createElement('div');
    childElm.style.zIndex = '3';
    elm.style.zIndex = '1';

    elm.append(childElm);
    document.body.append(elm);

    expect(getHighestZindex(elm)).toBe(3);
  });
});

describe('sumOfParentZindex', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return zindex', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.style.zIndex = '1';
    parent.append(child);
    document.body.append(parent);
    expect(sumOfParentZindex(child)).toBe(1);
  });

  it('should add default with default', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.append(child);
    document.body.append(parent);
    expect(sumOfParentZindex(child, 1)).toBe(2);
  });

  it('should preserve zero zindex values', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.style.zIndex = '0';
    parent.append(child);
    document.body.append(parent);

    expect(sumOfParentZindex(child, 1)).toBe(1);
  });

  it('should fall back for nonnumeric zindex values', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.style.zIndex = 'auto';
    parent.append(child);
    document.body.append(parent);

    expect(sumOfParentZindex(child, 1)).toBe(2);
  });
});
