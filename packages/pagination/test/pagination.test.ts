import { describe, expect, it } from 'vitest';
import { createPaginatedResult, getPaginationOffsets } from '../src';

// ─── getPaginationOffsets ────────────────────────────────────────────────────

describe('getPaginationOffsets', () => {
  describe('happy path', () => {
    it('returns correct offsets for page 1 with default itemsPerPage', () => {
      expect(getPaginationOffsets({})).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('returns correct offsets for page 2', () => {
      expect(getPaginationOffsets({ page: 2 })).toEqual({
        offset: 20,
        limit: 20,
        page: 2,
        itemsPerPage: 20,
      });
    });

    it('returns correct offsets for page 3 with custom itemsPerPage', () => {
      expect(getPaginationOffsets({ page: 3, itemsPerPage: 10 })).toEqual({
        offset: 20,
        limit: 10,
        page: 3,
        itemsPerPage: 10,
      });
    });

    it('respects a custom itemsPerPage', () => {
      expect(getPaginationOffsets({ page: 1, itemsPerPage: 50 })).toEqual({
        offset: 0,
        limit: 50,
        page: 1,
        itemsPerPage: 50,
      });
    });

    it('clamps itemsPerPage to MAX (100)', () => {
      expect(getPaginationOffsets({ page: 1, itemsPerPage: 999 })).toEqual({
        offset: 0,
        limit: 100,
        page: 1,
        itemsPerPage: 100,
      });
    });

    it('clamps itemsPerPage to MIN (1)', () => {
      expect(getPaginationOffsets({ page: 1, itemsPerPage: 0 })).toEqual({
        offset: 0,
        limit: 1,
        page: 1,
        itemsPerPage: 1,
      });
    });

    it('clamps page to MIN (1) when 0 is passed', () => {
      expect(getPaginationOffsets({ page: 0 })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('clamps page to MIN (1) when negative is passed', () => {
      expect(getPaginationOffsets({ page: -5 })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('floors a float page value', () => {
      expect(getPaginationOffsets({ page: 2.9 })).toEqual({
        offset: 20,
        limit: 20,
        page: 2,
        itemsPerPage: 20,
      });
    });

    it('floors a float itemsPerPage value', () => {
      expect(getPaginationOffsets({ page: 1, itemsPerPage: 15.9 })).toEqual({
        offset: 0,
        limit: 15,
        page: 1,
        itemsPerPage: 15,
      });
    });
    it('handles -0 inputs gracefully', () => {
      const result = getPaginationOffsets({ page: -0, itemsPerPage: -0 });
      expect(result.page).toBe(1);
      expect(result.itemsPerPage).toBe(1);
    });
  });

  describe('edge cases — invalid inputs', () => {
    it('falls back to defaults when page is NaN', () => {
      expect(getPaginationOffsets({ page: Number.NaN })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('falls back to defaults when page is Infinity', () => {
      expect(getPaginationOffsets({ page: Infinity })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('falls back to defaults when page is -Infinity', () => {
      expect(getPaginationOffsets({ page: -Infinity })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('falls back to defaults when itemsPerPage is NaN', () => {
      expect(getPaginationOffsets({ itemsPerPage: Number.NaN })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('falls back to defaults when itemsPerPage is Infinity', () => {
      expect(getPaginationOffsets({ itemsPerPage: Infinity })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('handles empty input object', () => {
      expect(getPaginationOffsets({})).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('handles undefined page and itemsPerPage explicitly', () => {
      // @ts-ignore
      expect(getPaginationOffsets({ page: undefined, itemsPerPage: undefined })).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        itemsPerPage: 20,
      });
    });

    it('clamps negative itemsPerPage to 1', () => {
      expect(getPaginationOffsets({ itemsPerPage: -10 })).toEqual({
        offset: 0,
        limit: 1,
        page: 1,
        itemsPerPage: 1,
      });
    });

    it('allows itemsPerPage equal to MAX_ITEMS_PER_PAGE', () => {
      expect(getPaginationOffsets({ itemsPerPage: 100 }).itemsPerPage).toBe(100);
    });
  });

  describe('offset correctness', () => {
    it('offset is always (page - 1) * itemsPerPage', () => {
      for (const [p, ipp] of [
        [1, 10],
        [2, 10],
        [5, 25],
        [10, 100],
      ] as const) {
        const result = getPaginationOffsets({ page: p, itemsPerPage: ipp });
        expect(result.offset).toBe((p - 1) * ipp);
      }
    });
  });
});

// ─── createPaginatedResult ───────────────────────────────────────────────────

describe('createPaginatedResult', () => {
  const items = ['a', 'b', 'c'];

  describe('happy path', () => {
    it('falls back to default itemsPerPage when Infinity is passed', () => {
      const result = createPaginatedResult([], 40, 1, Infinity);

      expect(result.itemsPerPage).toBe(20);
      expect(result.totalPages).toBe(2);
    });

    it('falls back to default itemsPerPage when -Infinity is passed', () => {
      const result = createPaginatedResult([], 40, 1, -Infinity);

      expect(result.itemsPerPage).toBe(20);
      expect(result.totalPages).toBe(2);
    });

    it('handles a page beyond totalPages', () => {
      const result = createPaginatedResult([], 50, 999, 20);

      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(999);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('returns correct shape for a basic result', () => {
      expect(createPaginatedResult(items, 60, 1, 20)).toEqual({
        items,
        total: 60,
        page: 1,
        itemsPerPage: 20,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('hasNextPage is false on the last page', () => {
      const result = createPaginatedResult(items, 60, 3, 20);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('hasPreviousPage is false on page 1', () => {
      const result = createPaginatedResult(items, 60, 1, 20);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('both flags false on page 1 of 1', () => {
      const result = createPaginatedResult(items, 3, 1, 20);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('both flags true on a middle page', () => {
      const result = createPaginatedResult(items, 100, 3, 20);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('calculates totalPages correctly when total divides evenly', () => {
      expect(createPaginatedResult([], 100, 1, 10).totalPages).toBe(10);
    });

    it('calculates totalPages correctly when total does not divide evenly', () => {
      expect(createPaginatedResult([], 101, 1, 10).totalPages).toBe(11);
    });

    it('works with an empty items array', () => {
      expect(createPaginatedResult([], 0, 1, 20)).toEqual({
        items: [],
        total: 0,
        page: 1,
        itemsPerPage: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('preserves generic item type', () => {
      const result = createPaginatedResult([{ id: 1 }, { id: 2 }], 2, 1, 20);
      expect(result.items[0]).toEqual({ id: 1 });
    });
  });

  describe('edge cases — invalid inputs', () => {
    it('clamps negative total to 0', () => {
      const result = createPaginatedResult([], -10, 1, 20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
    });

    it('handles NaN total', () => {
      const result = createPaginatedResult([], Number.NaN, 1, 20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
    });

    it('handles Infinity total', () => {
      const result = createPaginatedResult([], Infinity, 1, 20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
    });

    it('floors a float total', () => {
      const result = createPaginatedResult([], 10.9, 1, 3);
      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(4); // ceil(10 / 3)
    });

    it('clamps page to 1 when NaN is passed', () => {
      expect(createPaginatedResult([], 60, Number.NaN, 20).page).toBe(1);
    });

    it('clamps page to 1 when Infinity is passed', () => {
      expect(createPaginatedResult([], 60, Infinity, 20).page).toBe(1);
    });

    it('clamps page to 1 when 0 is passed', () => {
      expect(createPaginatedResult([], 60, 0, 20).page).toBe(1);
    });

    it('clamps page to 1 when negative is passed', () => {
      expect(createPaginatedResult([], 60, -3, 20).page).toBe(1);
    });

    it('floors a float page value', () => {
      expect(createPaginatedResult([], 60, 2.9, 20).page).toBe(2);
    });

    it('handles NaN itemsPerPage by falling back to default', () => {
      const result = createPaginatedResult([], 40, 1, Number.NaN);
      expect(result.itemsPerPage).toBe(20);
      expect(result.totalPages).toBe(2);
    });

    it('clamps itemsPerPage to 1 when 0 is passed', () => {
      const result = createPaginatedResult([], 10, 1, 0);
      expect(result.itemsPerPage).toBe(1);
      expect(result.totalPages).toBe(10);
    });

    it('floors a float itemsPerPage', () => {
      const result = createPaginatedResult([], 10, 1, 3.9);
      expect(result.itemsPerPage).toBe(3);
      expect(result.totalPages).toBe(4); // ceil(10 / 3)
    });
  });

  describe('totalPages floor — Math.max(1, ...) guarantee', () => {
    it('totalPages is at least 1 even when total is 0', () => {
      expect(createPaginatedResult([], 0, 1, 20).totalPages).toBe(1);
    });

    it('totalPages is at least 1 even when total is negative', () => {
      expect(createPaginatedResult([], -100, 1, 20).totalPages).toBe(1);
    });
  });

  describe('integration with getPaginationOffsets', () => {
    it('round-trips correctly — offsets feed into a valid paginated result', () => {
      const { page, itemsPerPage } = getPaginationOffsets({ page: 3, itemsPerPage: 15 });
      const result = createPaginatedResult(items, 100, page, itemsPerPage);
      expect(result.page).toBe(3);
      expect(result.itemsPerPage).toBe(15);
      expect(result.totalPages).toBe(7); // ceil(100 / 15)
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('round-trips correctly for the last page', () => {
      const { page, itemsPerPage } = getPaginationOffsets({ page: 5, itemsPerPage: 20 });
      const result = createPaginatedResult(items, 100, page, itemsPerPage);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });
  });
});
