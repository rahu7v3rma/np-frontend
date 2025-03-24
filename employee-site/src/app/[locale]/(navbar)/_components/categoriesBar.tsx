'use client';

import { Button, Checkbox, Input, Switch, Tab, Tabs } from '@nextui-org/react';
import Image from 'next/image';
import {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CiSearch } from 'react-icons/ci';
import { IoFilter } from 'react-icons/io5';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { TABS } from '@/constants/category';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { getCampaignCategories } from '@/services/api';
import { CategoriesSkeleton } from '@/skeletons/skeletons';
import { CategoryType } from '@/types/category';
import { isQuickOfferCampaign } from '@/utils/campaign';

import { ProductContext } from '../../context/product';

type Props = {
  campaignCode: string;
  selectedTab?: number;
  setTab: (tabBudgetValue: number) => void;
  totalCount: number;
  inBudgetCount: number;
  selectedCategory?: number;
  setCategory: (newCategory?: number) => void;
  searchText?: string;
  onSearchTextChange: (newQuery: string) => void;
  isOriginalBudget: boolean;
  onIsOriginalBudgetChange: (newValue: boolean) => void;
  showFilterSheet: boolean;
  toggleShowFilter: () => void;
  toggleIncludingTax: () => void;
};

const CategoriesBar: FunctionComponent<Props> = ({
  campaignCode,
  selectedTab,
  setTab,
  totalCount,
  inBudgetCount,
  selectedCategory,
  setCategory,
  searchText,
  onSearchTextChange,
  isOriginalBudget,
  onIsOriginalBudgetChange,
  showFilterSheet,
  toggleShowFilter,
  toggleIncludingTax,
}: Props) => {
  const currentLocale = useCurrentLocale();
  const t = useI18n();

  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const { showOfferList } = useContext(CartContext);
  const { includingTax } = useContext(ProductContext);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [errorCategories, setErrorCategories] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const isInitialRender = useRef(true);
  const [tabCounts, setTabCounts] = useState<number[]>(TABS.map((_t) => 0));
  const [isMessageBox, setMessageBox] = useState(false);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const showPopupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hidePopupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [atScrollStart, setAtScrollStart] = useState(false);
  const [atScrollEnd, setAtScrollEnd] = useState(false);

  const onCheckChange = (value: boolean) => {
    onIsOriginalBudgetChange(value);

    if (value) {
      if (showPopupTimeoutRef.current) {
        clearTimeout(showPopupTimeoutRef.current);
      }
      if (hidePopupTimeoutRef.current) {
        clearTimeout(hidePopupTimeoutRef.current);
      }

      showPopupTimeoutRef.current = setTimeout(() => {
        setMessageBox(true);

        hidePopupTimeoutRef.current = setTimeout(() => {
          setMessageBox(false);
        }, 20000);
      }, 20000);
    } else {
      if (showPopupTimeoutRef.current) {
        clearTimeout(showPopupTimeoutRef.current);
        showPopupTimeoutRef.current = null;
      }
      if (hidePopupTimeoutRef.current) {
        clearTimeout(hidePopupTimeoutRef.current);
        hidePopupTimeoutRef.current = null;
      }
      setMessageBox(false);
    }
  };

  const onCancelMessage = () => {
    setMessageBox(false);
  };

  const onUnCheckMessage = () => {
    setMessageBox(false);
    onIsOriginalBudgetChange(false);
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    getCampaignCategories(campaignCode, currentLocale, campaignType ?? '')
      .then((data: { categories: CategoryType[] }) => {
        setCategories([
          ...data.categories
            .filter((c) => c.order < 0)
            .sort((a, b) => b.order - a.order),
          {
            id: 0,
            name: 'All',
            icon_image: '/all-icon.svg',
            order: Infinity,
          },
          ...data.categories
            .filter((c) => c.order >= 0)
            .sort((a, b) => b.order - a.order),
        ]);
        setErrorCategories(false);
        setLoading(false);
      })
      .catch((error) => {
        setErrorCategories(true);
        setLoading(false);
      });
  }, [campaignCode, currentLocale, campaignType]);

  useEffect(() => {
    const newTabCounts = TABS.map((t) => {
      if (t === 'All') {
        return totalCount;
      } else if (t === 'In Budget') {
        return inBudgetCount;
      } else if (t === 'Upgraded') {
        return totalCount - inBudgetCount;
      } else {
        return 0;
      }
    });

    setTabCounts(newTabCounts);
  }, [totalCount, inBudgetCount]);

  const changeTab = (tabName: string) => {
    if (tabName === 'All') {
      setTab(0);
    } else if (tabName === 'In Budget') {
      setTab(1);
    } else if (tabName === 'Upgraded') {
      setTab(3);
    }
  };

  const defaultSelectedKey = useMemo(() => {
    if (selectedTab === 0) {
      return 'All';
    } else if (selectedTab === 1) {
      return 'In Budget';
    } else if (selectedTab === 3) {
      return 'Upgraded';
    } else {
      return undefined;
    }
  }, [selectedTab]);

  const getProductsByCategory = (items: any) => {
    setCategory(items?.id);
  };

  const refreshCategoriesScrollButtons = useCallback(() => {
    const container = categoriesContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setAtScrollStart(scrollLeft === 0);
    setAtScrollEnd(Math.abs(scrollLeft) + clientWidth >= scrollWidth);
  }, []);

  useEffect(() => {
    const container = categoriesContainerRef.current;
    if (!container) return;
    refreshCategoriesScrollButtons();
    const resizeObserver = new ResizeObserver(refreshCategoriesScrollButtons);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [refreshCategoriesScrollButtons]);

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex ltr:pl-4 ltr:md:pl-0 rtl:pr-4 rtl:md:pr-0">
          {isQuickOfferCampaign(campaignType ?? '') ? (
            <Switch
              color="secondary"
              defaultSelected={includingTax}
              size="sm"
              className="mr-4"
              onValueChange={toggleIncludingTax}
            >
              {t('categoriesBar.includingTax')}
            </Switch>
          ) : campaignDetails?.product_selection_mode === 'SINGLE' ? (
            <Tabs
              variant="underlined"
              items={TABS.map((t, i) => ({ label: t, count: tabCounts[i] }))}
              onSelectionChange={(item) => changeTab(item as string)}
              defaultSelectedKey={defaultSelectedKey}
            >
              {(item) => (
                <Tab
                  key={item.label}
                  title={
                    <div className="flex items-center group">
                      <span>{t(item.label as Parameters<typeof t>[0])}</span>
                      <span className="bg-[#2B324C29] text-[#56618D] text-xs rounded-md font-bold px-1.5 py-0.5 ms-1.5 group-data-[selected=true]:bg-[#2B324C] group-data-[selected=true]:text-white">
                        {item.count}
                      </span>
                    </div>
                  }
                />
              )}
            </Tabs>
          ) : (
            <>
              {!isQuickOfferCampaign(campaignDetails?.campaign_type) && (
                <Checkbox
                  color="secondary"
                  size="sm"
                  isSelected={isOriginalBudget}
                  onValueChange={onCheckChange}
                  classNames={{
                    base: '[&>span]:before:border-[#868788]',
                  }}
                >
                  <p>{t('OriginalBudget')}</p>
                </Checkbox>
              )}
            </>
          )}
        </div>
        <div className="w-full md:w-[26.3%] px-4 md:px-0 pt-4 md:pt-0">
          <Input
            variant="bordered"
            className="[&>div>div]:border-1 [&>div>div:nth-child(2)]:!hidden"
            placeholder={t('common.search')}
            fullWidth={false}
            {...(currentLocale === 'he'
              ? {
                  endContent: (
                    <CiSearch size="1.5rem" className="text-primary-100" />
                  ),
                }
              : {
                  startContent: (
                    <CiSearch size="1.5rem" className="text-primary-100" />
                  ),
                })}
            defaultValue={searchText}
            onValueChange={onSearchTextChange}
            errorMessage={t('categoriesBar.searchErrorMessage')}
          />
        </div>
      </div>
      <div
        className={`transition-[padding] flex items-center gap-2 mt-12 px-4 md:px-0 ${showOfferList ? 'lg:pe-[calc(914px-50vw)] xl:pe-[calc(1042px-50vw)] 2xl:pe-[calc(1154px-50vw)]' : ''}`}
      >
        <div className="flex justify-center w-[87%]">
          {!atScrollStart && (
            <Image
              className={
                atScrollStart
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:opacity-50 transition-all duration-300'
              }
              src={
                currentLocale === 'he'
                  ? '/circular-white-right-arrow.svg'
                  : '/circular-white-left-arrow.svg'
              }
              alt="Scroll Left"
              width={28}
              height={28}
              onClick={(event) => {
                if (!atScrollStart) {
                  if (currentLocale === 'he') {
                    categoriesContainerRef.current?.scrollBy({
                      left: 100,
                      behavior: 'smooth',
                    });
                  } else {
                    categoriesContainerRef.current?.scrollBy({
                      left: -100,
                      behavior: 'smooth',
                    });
                  }
                  const currentElement = event.currentTarget;
                  currentElement.style.scale = '0.8';
                  setTimeout(() => {
                    currentElement.style.scale = '1';
                  }, 200);
                }
              }}
            />
          )}
          <div
            className="flex overflow-scroll gap-4 scrollbar-hide "
            ref={categoriesContainerRef}
            onScroll={refreshCategoriesScrollButtons}
            onLoad={refreshCategoriesScrollButtons}
          >
            {errorCategories ? (
              <h2>Oops, there is an error!</h2>
            ) : loading ? (
              <CategoriesSkeleton />
            ) : (
              <>
                {categories?.map((item) => {
                  const selected = item.id === selectedCategory;

                  return (
                    <div
                      className="flex flex-col items-center cursor-pointer group px-2 min-w-[80px]"
                      key={item.id}
                      onClick={() => getProductsByCategory(item)}
                    >
                      <Image
                        src={item.icon_image || '/all-icon.svg'}
                        alt={`${item?.name} Icon`}
                        className={`object-contain ${selected ? 'category-selected-svg' : 'category-default-svg'}`}
                        width={48}
                        height={48}
                      />
                      <span
                        className={`text-xs font-normal text-center ${selected ? 'text-category-selected' : 'text-category-default group-hover:text-category-selected'}`}
                      >
                        {t(item.name as Parameters<typeof t>[0])}
                      </span>
                      <div
                        className={`w-full h-[2px] mt-2 px-1 ${selected ? 'bg-category-selected' : 'group-hover:bg-category-default'}`}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {!atScrollEnd && (
            <Image
              className={
                atScrollEnd
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:opacity-50 transition-all duration-300'
              }
              src={
                currentLocale === 'he'
                  ? '/circular-white-left-arrow.svg'
                  : '/circular-white-right-arrow.svg'
              }
              alt="Scroll Right"
              width={28}
              height={28}
              onClick={(event) => {
                if (!atScrollEnd) {
                  if (currentLocale === 'he') {
                    categoriesContainerRef.current?.scrollBy({
                      left: -100,
                      behavior: 'smooth',
                    });
                  } else {
                    categoriesContainerRef.current?.scrollBy({
                      left: 100,
                      behavior: 'smooth',
                    });
                  }
                  const currentElement = event.currentTarget;
                  currentElement.style.scale = '0.8';
                  setTimeout(() => {
                    currentElement.style.scale = '1';
                  }, 200);
                }
              }}
            />
          )}
        </div>
        <Button
          color={showFilterSheet ? 'secondary' : 'default'}
          variant="bordered"
          className="justify-self-end"
          startContent={<IoFilter size={20} />}
          onClick={toggleShowFilter}
        >
          {t('common.filter')}
        </Button>
      </div>
      {isMessageBox && (
        <div className="fixed top-24 right-0 left-0 md:right-5 md:left-auto mx-auto z-10 mr-5 ml-5 md:mr-0 md:ml-0 md:w-[370px] shadow-[-20px_20px_40px_-4px_rgba(145, 158, 171, 0.24)] p-4 rounded-[10px] bg-[#f4f4f4]">
          <div className="text-sm font-normal leading-5 text-[#363839]">
            {t('OpenbudgetMessage')}
          </div>
          <div className="flex justify-end gap-2 mt-5" dir="ltr">
            <Button
              variant="faded"
              size="sm"
              className="font-semibold"
              onClick={onCancelMessage}
            >
              {t('button.continue')}
            </Button>
            <Button
              color="primary"
              size="sm"
              className="font-semibold"
              onClick={onUnCheckMessage}
            >
              {t('button.uncheck')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesBar;
