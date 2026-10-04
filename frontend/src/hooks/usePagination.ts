import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export interface UsePaginationResult {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  startIndex: number;
  endIndex: number;
  paginateItems: <T>(items: T[]) => T[];
}

/**
 * Standard pagination hook configured for 10 rows per page.
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  pageSize: initialPageSize = 10,
}: UsePaginationOptions): UsePaginationResult {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const safePage = useMemo(() => {
    if (page > totalPages) return totalPages;
    if (page < 1) return 1;
    return page;
  }, [page, totalPages]);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const nextPage = () => {
    if (safePage < totalPages) setPage(safePage + 1);
  };

  const prevPage = () => {
    if (safePage > 1) setPage(safePage - 1);
  };

  const paginateItems = <T,>(items: T[]): T[] => {
    return items.slice(startIndex, startIndex + pageSize);
  };

  return {
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    nextPage,
    prevPage,
    setPage,
    setPageSize,
    startIndex,
    endIndex,
    paginateItems,
  };
}

export default usePagination;
