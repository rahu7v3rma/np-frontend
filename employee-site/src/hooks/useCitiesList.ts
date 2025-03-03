import React from 'react';

import { CITIES } from '@/constants/cities';
import { useCurrentLocale } from '@/locales/client';

export function useCitiesList() {
  const [items, setItems] = React.useState<{ idx: number; name: string }[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const limit = 100; // Number of items per page, adjust as necessary
  const currentLocale = useCurrentLocale();

  const loadItems = React.useCallback(
    (offset: number, searchQuery: string) => {
      setIsLoading(true);
      const allCities = CITIES[currentLocale];
      const filteredCities = allCities.filter((city) =>
        city.toLowerCase().startsWith(searchQuery.toLowerCase()),
      );

      const newItems = filteredCities
        .slice(offset, offset + limit)
        .map((city, idx) => ({ idx: idx + offset, name: city }));

      setItems((prevItems) =>
        offset === 0 ? newItems : [...prevItems, ...newItems],
      );
      setHasMore(offset + limit < filteredCities.length);
      setIsLoading(false);
    },
    [currentLocale, limit],
  );

  React.useEffect(() => {
    loadItems(0, '');
    setOffset(0);
  }, [currentLocale, loadItems]);

  const onLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    loadItems(newOffset, searchQuery);
  };

  return {
    items,
    hasMore,
    isLoading,
    onLoadMore,
  };
}
