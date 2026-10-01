export interface PaginationInput {
  /** 1-based page number (default: 1). */
  page?: number;
  /** Page size, clamped to 1–100 (default: 20). */
  itemsPerPage?: number;
}

export interface PaginationOffsets {
  /** Number of items to skip. */
  offset: number;
  /** Number of items to take (equal to `itemsPerPage`). */
  limit: number;
  /** Normalized 1-based page number. */
  page: number;
  /** Normalized page size. */
  itemsPerPage: number;
}

export interface PaginatedResult<TItem> {
  /** Items on the current page. */
  items: TItem[];
  /** Total number of items across all pages. */
  total: number;
  /** Current 1-based page number. */
  page: number;
  /** Page size. */
  itemsPerPage: number;
  /** Number of pages, at least 1. */
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_ITEMS_PER_PAGE = 20;
const MAX_ITEMS_PER_PAGE = 100;

/**
 * Normalize page-based pagination input into `offset`/`limit` values for a query.
 *
 * `page` is clamped to at least 1 and `itemsPerPage` to 1–100; missing or
 * non-finite values fall back to page 1 and 20 items per page.
 *
 * @param input - Requested page and page size
 * @returns The offset and limit plus the normalized page and page size
 *
 * @example
 * ```typescript
 * getPaginationOffsets({ page: 3, itemsPerPage: 10 });
 * // { offset: 20, limit: 10, page: 3, itemsPerPage: 10 }
 *
 * getPaginationOffsets({}); // { offset: 0, limit: 20, page: 1, itemsPerPage: 20 }
 * ```
 */
export function getPaginationOffsets(input: PaginationInput): PaginationOffsets {
  const page =
    typeof input.page === 'number' && Number.isFinite(input.page)
      ? Math.max(1, Math.floor(input.page))
      : 1;

  const itemsPerPage =
    typeof input.itemsPerPage === 'number' && Number.isFinite(input.itemsPerPage)
      ? Math.max(1, Math.min(MAX_ITEMS_PER_PAGE, Math.floor(input.itemsPerPage)))
      : DEFAULT_ITEMS_PER_PAGE;

  return {
    offset: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
    page,
    itemsPerPage,
  };
}

/**
 * Wrap a page of items with pagination metadata (total pages, next/previous flags).
 *
 * `total` is clamped to at least 0, `page` and `itemsPerPage` to at least 1.
 *
 * @param items - Items on the current page
 * @param total - Total number of items across all pages
 * @param page - Current 1-based page number
 * @param itemsPerPage - Page size
 * @returns The items plus pagination metadata
 *
 * @example
 * ```typescript
 * const { offset, limit, page, itemsPerPage } = getPaginationOffsets({ page: 2 });
 * const rows = await db.select().from(users).limit(limit).offset(offset);
 *
 * createPaginatedResult(rows, 45, page, itemsPerPage);
 * // { items: rows, total: 45, page: 2, itemsPerPage: 20, totalPages: 3, hasNextPage: true, hasPreviousPage: true }
 * ```
 */
export function createPaginatedResult<TItem>(
  items: TItem[],
  total: number,
  page: number,
  itemsPerPage: number,
): PaginatedResult<TItem> {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;

  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;

  const safeItemsPerPage = Number.isFinite(itemsPerPage)
    ? Math.max(1, Math.floor(itemsPerPage))
    : DEFAULT_ITEMS_PER_PAGE;

  const totalPages = Math.max(1, Math.ceil(safeTotal / safeItemsPerPage));

  return {
    items,
    total: safeTotal,
    page: safePage,
    itemsPerPage: safeItemsPerPage,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}
