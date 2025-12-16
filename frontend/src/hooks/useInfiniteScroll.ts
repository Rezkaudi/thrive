// frontend/src/hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom in pixels to trigger load
  rootMargin?: string; // Margin around the root element
  enabled?: boolean; // Whether infinite scroll is enabled
}

interface UseInfiniteScrollReturn {
  isFetching: boolean;
  setIsFetching: (fetching: boolean) => void;
  targetRef: React.RefObject<HTMLDivElement | null>;
}

// Hook using Intersection Observer API (more performant)
export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  loading: boolean
) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight - 1000
      ) {
        return;
      }
      if (hasMore && !loading && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    if (hasMore && !loading) {
      callback();
    }

    setIsFetching(false);
  }, [isFetching, callback, hasMore, loading]);

  return [isFetching, setIsFetching] as const;
};

// Alternative hook using scroll event (for more control)
export const useInfiniteScrollEvent = (
  callback: () => void | Promise<void>,
  hasMore: boolean,
  loading: boolean,
  threshold: number = 1000
) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (loading || isFetching || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      setIsFetching(true);
    }
  }, [loading, isFetching, hasMore, threshold]);

  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 200);
    
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;

    const executeCallback = async () => {
      try {
        await callback();
      } catch (error) {
        console.error('Infinite scroll callback error:', error);
      } finally {
        setIsFetching(false);
      }
    };

    executeCallback();
  }, [isFetching, callback]);

  return { isFetching, setIsFetching };
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Hook for managing infinite scroll with pagination state
export const useInfiniteScrollPagination = <T>(
  fetchFunction: (page: number, limit: number) => Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>,
  limit: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const hasMore = currentPage < totalPages;

  const fetchData = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await fetchFunction(page, limit);
      
      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchFunction, limit]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchData(currentPage + 1, true);
    }
  }, [fetchData, currentPage, hasMore, loadingMore]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchData(1, false);
  }, [fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotal(0);
    setError(null);
  }, []);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    totalPages,
    total,
    loadMore,
    refresh,
    reset,
    fetchData
  };
};

export default useInfiniteScroll;