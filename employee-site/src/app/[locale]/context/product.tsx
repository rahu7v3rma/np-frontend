'use client';

import { useParams, useSearchParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useCurrentLocale } from '@/locales/client';
import { getCampaignProducts, getFilters } from '@/services/api';
import { FilterType } from '@/types/filter';
import { Product } from '@/types/product';
import eventEmitter from '@/utils/eventEmitter';
import { sortProductImages } from '@/utils/product';

import { CampaignContext } from './campaign';

type ContextType = {
  productsData: {
    products: Product[];
    hasMore: boolean;
    totalCount: number;
    inBudgetCount: number;
  };
  fetchProducts: (
    page: number,
    categoryId?: number,
    searchText?: string,
    budget?: 1 | 2 | 3,
    filter?: FilterType,
    includingTax?: boolean,
  ) => Promise<void>;
  filters: FilterType;
  handleFilterChange: (key: string, val: any) => void;
  handleResetFilter: () => void;
  includingTax: boolean;
  toggleIncludingTax: () => void;
  hasUserChanged: boolean;
  setHasUserChanged: (value: boolean) => void;
};

const initialFilterValues = {
  productKinds: [],
  brand: [],
  subcategory: [],
  sort: '',
  color: '',
  priceSingle: 0,
  priceRange: [0, 0],
};

export const ProductContext = createContext<ContextType>({
  productsData: {
    products: [],
    hasMore: false,
    totalCount: 0,
    inBudgetCount: 0,
  },
  filters: initialFilterValues,
  fetchProducts: () => new Promise(() => {}),
  handleFilterChange: () => {},
  handleResetFilter: () => {},
  includingTax: true,
  toggleIncludingTax: () => {},
  hasUserChanged: false,
  setHasUserChanged: () => {},
});
export function ProductWrapper({ children }: { children: ReactNode }) {
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const currentLocale = useCurrentLocale();
  const { campaignType } = useContext(CampaignContext);

  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [inBudgetCount, setInBudgetCount] = useState<number>(0);
  const [includingTax, setIncludingTax] = useState(true);

  const maxLoadedPage = useRef<number>(0);
  const loadedFilterHash = useRef<string>('');
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const searchText = searchParams?.get('q') || undefined;
  const categoryId = searchParams?.get('c') || undefined;
  const rawBudget = Number(searchParams?.get('b')) || undefined;
  const budget =
    rawBudget === 1 || rawBudget === 2 || rawBudget === 3
      ? rawBudget
      : undefined;

  const [filters, setFilters] = useState<FilterType>(initialFilterValues);
  const [hasUserChanged, setHasUserChanged] = useState<boolean>(false);
  const toggleIncludingTax = () => {
    setIncludingTax((prev) => {
      const newValue = !prev;
      eventEmitter.emit('resetPage', { page: '1' }); // Reset page when toggled
      return newValue;
    });
  };
  useEffect(() => {
    const stored = localStorage.getItem('hasUserChanged');
    if (stored) {
      setHasUserChanged(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    Promise.all([
      getFilters(
        campaign_code,
        'max_price',
        currentLocale,
        campaignType !== 'quick_offer_code' ? budget : undefined,
        campaignType === 'quick_offer_code' ? includingTax : undefined,
        searchText,
        categoryId,
      ),
    ])
      .then(([fixedMaxPriceData]) => {
        if (
          typeof fixedMaxPriceData === 'object' &&
          'max_price' in fixedMaxPriceData
        ) {
          setFilters((prevFilters) => ({
            ...prevFilters,
          }));
        } else {
          console.error('Unexpected data structure for max price');
        }
      })
      .catch(() => {
        console.error('Error fetching max price');
      });
  }, [
    campaign_code,
    currentLocale,
    campaignType,
    includingTax,
    budget,
    searchText,
    categoryId,
  ]);

  const fetchProducts = useCallback(
    async (
      page: number,
      categoryId?: number,
      searchText?: string,
      budget?: 1 | 2 | 3,
      filter?: FilterType,
      includingTax?: boolean,
    ) => {
      const filterHash = `${budget}_${categoryId}_${searchText}`;
      if (filterHash !== loadedFilterHash.current) {
        maxLoadedPage.current = 0;
        loadedFilterHash.current = filterHash;
      }
      if (filter) {
        if (page === 1) {
          maxLoadedPage.current = 0;
        }
      }
      if (page <= maxLoadedPage.current) {
        return;
      }
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
      fetchTimeout.current = setTimeout(async () => {
        try {
          let loadedProducts: Product[] = [];
          let newMaxLoadedPage = maxLoadedPage.current;
          let hasMore = false;
          let totalCount = 0;
          let inBudgetCount = 0;
          while (page >= newMaxLoadedPage + 1) {
            const productsPage: {
              page_data: Product[];
              has_more: boolean;
              total_count: number;
              in_budget_count: number;
            } = await getCampaignProducts(
              campaign_code,
              currentLocale,
              10,
              newMaxLoadedPage + 1,
              categoryId,
              searchText,
              budget,
              filter,
              includingTax,
              campaignType ?? '',
            );
            loadedProducts.push(...productsPage.page_data);
            newMaxLoadedPage += 1;
            hasMore = productsPage.has_more;
            totalCount = productsPage.total_count;
            inBudgetCount = productsPage.in_budget_count;
          }
          for (const product of loadedProducts) {
            sortProductImages(product.images);
          }
          setProducts((prevProducts) => {
            if (page === 1) {
              return loadedProducts;
            }
            return [...prevProducts, ...loadedProducts];
          });
          setHasMore(hasMore);
          setTotalCount(totalCount);
          setInBudgetCount(inBudgetCount);
          maxLoadedPage.current = newMaxLoadedPage;
        } catch (error) {
          setProducts([]);
        }
      }, 500);
    },
    [campaign_code, currentLocale, campaignType],
  );

  const handleFilterChange = (name: string, value: any) => {
    setProducts([]);
    eventEmitter.emit('resetPage', { page: '1' });
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleResetFilter = () => {
    setProducts([]);
    eventEmitter.emit('resetPage', { page: '1' });
    setFilters(initialFilterValues);
    setHasUserChanged(false);
  };

  return (
    <ProductContext.Provider
      value={{
        productsData: { products, hasMore, totalCount, inBudgetCount },
        fetchProducts,
        filters,
        handleFilterChange,
        handleResetFilter,
        toggleIncludingTax,
        includingTax,
        hasUserChanged,
        setHasUserChanged,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
