'use client';

import { debounce } from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useI18n } from '@/locales/client';
import { Product, ProductCart } from '@/types/product';
import { CHECKOUT_LOCATION_GLOBAL } from '@/utils/const';
import eventEmitter from '@/utils/eventEmitter';

import { CampaignContext } from '../../context/campaign';
import { CartContext } from '../../context/cart';
import { ProductContext } from '../../context/product';
import useViewportEntry from '../[campaign_code]/_hooks/useViewportEntry';

import CategoriesBar from './categoriesBar';
import FilterSheet from './filterSheet';
import ProductCard from './productCard';

type Props = {
  campaignCode: string;
};

const ProductsGrid: FunctionComponent<Props> = ({ campaignCode }: Props) => {
  const t = useI18n();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const {
    productsData,
    fetchProducts,
    filters,
    includingTax,
    toggleIncludingTax,
  } = useContext(ProductContext);
  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const { cart, addCartItem, showCart, showList, showOfferList } =
    useContext(CartContext);

  const { products, hasMore, totalCount, inBudgetCount } = productsData;

  const page = Number(searchParams?.get('p')) || 1;
  const categoryId = Number(searchParams?.get('c')) || 0;
  const searchText = searchParams?.get('q') || undefined;
  const rawBudget = Number(searchParams?.get('b')) || undefined;
  const budget =
    rawBudget === 1 || rawBudget === 2 || rawBudget === 3
      ? rawBudget
      : undefined;

  const isInitialRender = useRef(true);
  const loading = useRef<boolean>(false);

  const gridEndRef = useRef<HTMLDivElement>(null);

  const [lastRow, setLastRow] = useState<HTMLDivElement | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const cartTotalPrice = useMemo(
    () =>
      cart.reduce(
        (x: number, y: ProductCart) =>
          x + y.product.calculated_price * y.quantity,
        0,
      ),
    [cart],
  );

  const giftBudget = campaignDetails?.budget_per_employee || 0;
  const isCheckoutLocationGlobal =
    campaignDetails?.check_out_location === CHECKOUT_LOCATION_GLOBAL;

  const resetpageNumber = useCallback(
    (page: string) => {
      document
        .getElementById('category-bar')
        ?.scrollIntoView({ behavior: 'instant' });
      const params = new URLSearchParams(searchParams.toString());

      params.set('p', page);

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathName, router],
  );

  useEffect(() => {
    const handleMyEvent = (data: { page: string }) => {
      resetpageNumber(data.page);
    };

    eventEmitter.on('resetPage', handleMyEvent);

    return () => {
      eventEmitter.off('resetPage', handleMyEvent);
    };
  }, [resetpageNumber]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (fetchProducts) {
      loading.current = true;
      fetchProducts(
        page,
        categoryId,
        searchText,
        budget,
        filters,
        includingTax,
      ).finally(() => {
        loading.current = false;
      });
    }
  }, [
    fetchProducts,
    page,
    categoryId,
    searchText,
    budget,
    filters,
    includingTax,
  ]);

  const handleTabSet = useCallback(
    (tabBudgetValue: number) => {
      // set budget and reset page
      const params = new URLSearchParams(searchParams.toString());

      if (tabBudgetValue && tabBudgetValue > 0) {
        params.set('b', tabBudgetValue.toString());
      } else {
        params.delete('b');
      }

      params.delete('p');

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    },
    [router, pathName, searchParams],
  );

  const debouncedSearch = useRef(
    debounce(
      (
        val: string,
        currentPathName: string,
        currentSearchParamsStr: string,
      ) => {
        // set search text and reset page
        const params = new URLSearchParams(currentSearchParamsStr);

        if (val) {
          params.set('q', val);
        } else {
          params.delete('q');
        }

        params.delete('p');

        router.replace(`${currentPathName}?${params.toString()}`, {
          scroll: false,
        });
      },
      1000,
    ),
  ).current;

  const handleSearchTextChange = useCallback(
    (val: string) => {
      // send the debounced function the current route values, otherwise it
      // will use stale ones
      debouncedSearch(val, pathName, searchParams.toString());
    },
    [debouncedSearch, pathName, searchParams],
  );

  const handleCategorySet = useCallback(
    (newCategory?: number) => {
      // set selected category and reset page
      const params = new URLSearchParams(searchParams.toString());

      if (newCategory) {
        params.set('c', newCategory.toString());
      } else {
        params.delete('c');
      }

      params.delete('p');

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathName],
  );

  const handleOriginalBudgetChange = useCallback(
    (newValue: boolean) => {
      // set budget and reset page
      const params = new URLSearchParams(searchParams.toString());

      if (newValue) {
        // '2' means products that cost exactly as much as the budget is
        params.set('b', '2');
      } else {
        params.delete('b');
      }

      params.delete('p');

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathName],
  );

  const handleGridScrolledToEnd = useCallback(() => {
    if (hasMore && !loading.current && products.length) {
      loading.current = true;
      const params = new URLSearchParams(searchParams.toString());

      params.set('p', (page + 1).toString());

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    }
  }, [hasMore, loading, searchParams, page, router, pathName, products]);
  const addToCartHandler = useCallback(
    async (productId: number, variations?: Record<string, string>) => {
      try {
        await addCartItem?.(productId, 1, variations);
        showCart(true);
      } catch {}
    },
    [addCartItem, showCart],
  );

  const addToQuickOfferHandler = useCallback(
    async (productId: number, variation?: Record<string, string>) => {
      try {
        addCartItem && (await addCartItem(productId, 1, variation));
        showList(true);
      } catch {}
    },
    [addCartItem, showList],
  );

  const handleProductCardPress = useCallback(
    (productId: number) => {
      // push the scroll location as the hash so that if the browser navigates
      // back to this page we can use it to scroll back to the same location

      // now we can navigate to the product page
      router.push(`${pathName}/products/${productId}`);

      const nextUIProvider = document.getElementById('nextUIProvider');
      if (nextUIProvider) {
        sessionStorage.setItem(
          'products_screen_scrollPosition',
          nextUIProvider.scrollTop.toString(),
        );
      }
    },
    [router, pathName],
  );

  useEffect(() => {
    if (showFilterSheet === true) {
      showList(false);
    }
  }, [showFilterSheet, showList]);

  const toggleShowFilterHandler = useCallback(() => {
    setShowFilterSheet((prevVal) => !prevVal);
  }, []);

  // "subscribe" to events of the component at the end of the products grid
  // coming into the viewport so we can load the next products page if there is
  // one
  // useViewportEntry(gridEndRef, handleGridScrolledToEnd);

  useEffect(() => {
    if (!lastRow || loading.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading.current) {
          loading.current = true;
          const params = new URLSearchParams(searchParams.toString());
          params.set('p', (page + 1).toString());
          router.replace(`${pathName}?${params.toString()}`, { scroll: false });
        }
      },
      {
        rootMargin: '100%',
        threshold: 0,
      },
    );
    observer.observe(lastRow);
    return () => observer.disconnect();
  }, [lastRow, hasMore, loading, searchParams, page, router, pathName]);

  return (
    <div
      className={`transition-[padding] ${showFilterSheet ? 'lg:ps-[400px] xl:ps-[300px]' : 'ps-0'}`}
    >
      <div className="mb-10" id="category-bar">
        <CategoriesBar
          campaignCode={campaignCode}
          selectedTab={budget}
          setTab={handleTabSet}
          totalCount={totalCount}
          inBudgetCount={inBudgetCount}
          selectedCategory={categoryId}
          setCategory={handleCategorySet}
          searchText={searchText}
          onSearchTextChange={handleSearchTextChange}
          isOriginalBudget={budget === 2}
          onIsOriginalBudgetChange={handleOriginalBudgetChange}
          showFilterSheet={showFilterSheet}
          toggleShowFilter={toggleShowFilterHandler}
          toggleIncludingTax={toggleIncludingTax}
        />
      </div>
      <div
        className={`transition-[padding] grid grid-cols-2 gap-4 ${showOfferList ? 'lg:pe-[calc(914px-50vw)] xl:pe-[calc(1042px-50vw)] 2xl:pe-[calc(1154px-50vw)]' : ''} ${showFilterSheet || showOfferList ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} lg:gap-6 p-4 md:px-0 md:grid-cols-3 md:gap-5`}
      >
        {products.map((product: Product, idx) => {
          const refProp = idx === products.length - 10 ? setLastRow : undefined;
          return (
            <ProductCard
              key={product?.id}
              ref={refProp}
              product={product}
              addToCartDisabled={
                isCheckoutLocationGlobal &&
                giftBudget - cartTotalPrice < product.calculated_price
              }
              onAddToCart={addToCartHandler}
              onAddToList={addToQuickOfferHandler}
              onPress={handleProductCardPress}
            />
          );
        })}
      </div>
      {!loading.current && <div ref={gridEndRef} className="w-[1px] h-[1px]" />}
      <FilterSheet
        isOpen={showFilterSheet}
        toggleShowFilter={toggleShowFilterHandler}
        campaignCode={campaignCode}
      />
    </div>
  );
};

export default ProductsGrid;
