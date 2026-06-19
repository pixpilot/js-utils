export interface PaginationInput {
  page?: number;
  itemsPerPage?: number;
}

export interface PaginationOffsets {
  offset: number;
  limit: number;
  page: number;
  itemsPerPage: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  itemsPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_ITEMS_PER_PAGE = 20;
const MAX_ITEMS_PER_PAGE = 100;

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
