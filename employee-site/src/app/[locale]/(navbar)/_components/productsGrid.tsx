'use client';

import { debounce } from 'lodash';
import {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import { useCurrentLocale, useI18n } from '@/locales/client';
import { getCampaignProducts } from '@/services/api';
import { Product } from '@/types/product';
import { sortProductImages } from '@/utils/product';

import { CartContext } from '../../context/cart';
import useViewportEntry from '../[campaign_code]/_hooks/useViewportEntry';

import CategoriesBar from './categoriesBar';
import ProductCard from './productCard';

type Props = {
  campaignCode: string;
};

const ProductsGrid: FunctionComponent<Props> = ({ campaignCode }: Props) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  const { addCartItem } = useContext(CartContext);

  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState('All');
  const [queryParams, setQueryParams] = useState<{
    page: number;
    categoryId?: number;
    searchText?: string;
    originalBudget: boolean;
  }>({ page: 1, originalBudget: false });
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProduct, setFilteredProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [inBudgetCount, setInBudgetCount] = useState<number>(0);

  const isInitialRender = useRef(true);

  const gridEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const productsPage: {
          page_data: Product[];
          has_more: boolean;
          total_count: number;
          in_budget_count: number;
        } = await getCampaignProducts(
          campaignCode,
          currentLocale,
          10,
          queryParams.page,
          queryParams.categoryId,
          queryParams.searchText,
          queryParams.originalBudget,
        );

        // sort each product's images array so that the main image is first
        for (const product of productsPage.page_data as Product[]) {
          sortProductImages(product.images);
        }

        setProducts((prevProducts) => {
          if (queryParams.page === 1) {
            return productsPage.page_data;
          }
          return [...prevProducts, ...productsPage.page_data];
        });
        setHasMore(productsPage.has_more);
        setTotalCount(productsPage.total_count);
        setInBudgetCount(productsPage.in_budget_count);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [campaignCode, currentLocale, queryParams]);

  useEffect(() => {
    if (tab === 'In Budget') {
      setFilteredProducts(
        products?.filter((product) => product.extra_price === 0),
      );
    } else if (tab === 'Upgraded') {
      setFilteredProducts(
        products?.filter((product) => product.extra_price > 0),
      );
    } else {
      setFilteredProducts(products && products);
    }
  }, [tab, products]);

  const debouncedSearch = useRef(
    debounce(async (val: string) => {
      // set search text and reset page
      setQueryParams((prevParams) => ({
        ...prevParams,
        searchText: val,
        page: 1,
      }));
    }, 1000),
  ).current;

  const handleSearchTextChange = useCallback(
    (val: string) => {
      debouncedSearch(val);
    },
    [debouncedSearch],
  );

  const handleCategorySet = useCallback((newCategory?: number) => {
    // set selected category and reset page
    setQueryParams((prevParams) => ({
      ...prevParams,
      categoryId: newCategory,
      page: 1,
    }));
  }, []);

  const handleOriginalBudgetChange = useCallback((newValue: boolean) => {
    // set selected category and reset page
    setQueryParams((prevParams) => ({
      ...prevParams,
      originalBudget: newValue,
      page: 1,
    }));
  }, []);

  const handleGridScrolledToEnd = useCallback(() => {
    if (hasMore && !loading) {
      setQueryParams((prevParams) => ({
        ...prevParams,
        page: prevParams.page + 1,
      }));
    }
  }, [hasMore, loading]);

  const addToCartHandler = useCallback(
    async (productId: number) => {
      try {
        addCartItem && (await addCartItem(productId, 1));

        toast.success(t('cart.itemAdded'));
      } catch {
        toast.error(t('cart.itemNotAdded'));
      }
    },
    [t, addCartItem],
  );

  // "subscribe" to events of the component at the end of the products grid
  // coming into the viewport so we can load the next products page if there is
  // one
  useViewportEntry(gridEndRef, handleGridScrolledToEnd);

  return (
    <>
      <div className="mb-10">
        <CategoriesBar
          campaignCode={campaignCode}
          setTab={setTab}
          totalCount={totalCount}
          inBudgetCount={inBudgetCount}
          setCategory={handleCategorySet}
          onSearchTextChange={handleSearchTextChange}
          searchInvalid={!!queryParams.searchText && !products.length}
          onIsOriginalBudgetChange={handleOriginalBudgetChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4 p-4 md:px-0">
        {filteredProduct.map((product: Product) => {
          return (
            <ProductCard
              key={product?.id}
              product={product}
              isOutOfStock={false}
              onAddToCart={addToCartHandler}
            />
          );
        })}
      </div>
      {!loading && <div ref={gridEndRef} className="w-[1px] h-[1px]" />}
    </>
  );
};

export default ProductsGrid;
