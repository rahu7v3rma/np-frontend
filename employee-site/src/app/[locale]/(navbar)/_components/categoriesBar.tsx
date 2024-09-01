'use client';

import { Button, Checkbox, Input, Tab, Tabs } from '@nextui-org/react';
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

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { TABS } from '@/constants/category';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { getCampaignCategories } from '@/services/api';
import { CategoriesSkeleton } from '@/skeletons/skeletons';
import { CategoryType } from '@/types/category';

const isElementVisibleInHorizontalContainer = (
  element: HTMLDivElement,
  container: HTMLDivElement,
) => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    Math.round(elementRect.left) >= Math.round(containerRect.left) &&
    Math.round(elementRect.right) <= Math.round(containerRect.right)
  );
};

type Props = {
  campaignCode: string;
  setTab: any;
  totalCount: number;
  inBudgetCount: number;
  setCategory: (newCategory?: number) => void;
  onSearchTextChange: (newQuery: string) => void;
  onIsOriginalBudgetChange: (newValue: boolean) => void;
  searchInvalid: boolean;
};

const CategoriesBar: FunctionComponent<Props> = ({
  campaignCode,
  setTab,
  totalCount,
  inBudgetCount,
  setCategory,
  onSearchTextChange,
  onIsOriginalBudgetChange,
  searchInvalid,
}: Props) => {
  const currentLocale = useCurrentLocale();
  const t = useI18n();

  const { campaignDetails } = useContext(CampaignContext);

  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showScrollCategoriesButtons, setShowScrollCategoriesButtons] =
    useState<[boolean, boolean]>([false, false]);
  const [errorCategories, setErrorCategories] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const isInitialRender = useRef(true);
  const [tabCounts, setTabCounts] = useState<number[]>(TABS.map((_t) => 0));
  const [isOpenBudget, setIsOpenBudget] = useState(false);
  const [isMessageBox, setMessageBox] = useState(false);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const categoriesStartRef = useRef<HTMLDivElement>(null);
  const categoriesEndRef = useRef<HTMLDivElement>(null);
  const showPopupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hidePopupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onCheckChange = (value: boolean) => {
    setIsOpenBudget(value);
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
    setIsOpenBudget(false);
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    getCampaignCategories(campaignCode, currentLocale)
      .then((data: { categories: CategoryType[] }) => {
        setCategories([
          {
            id: 0,
            name: 'All',
            icon_image: 'all-icon.svg',
            order: Infinity,
          },
          ...data.categories.sort((a, b) => b.order - a.order),
        ]);
        setErrorCategories(false);
        setLoading(false);
      })
      .catch((error) => {
        setErrorCategories(true);
        setLoading(false);
      });
  }, [campaignCode, currentLocale]);

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
    setTab(tabName);
  };

  const getProductsByCategory = (items: any) => {
    setSelectedCategory(items?.id);
    setCategory(items?.id);
  };

  const refreshCategoriesScrollButtons = useCallback(() => {
    const startElement = categoriesStartRef.current;
    const endElement = categoriesEndRef.current;
    const container = categoriesContainerRef.current;

    if (startElement && endElement && container) {
      setShowScrollCategoriesButtons([
        !isElementVisibleInHorizontalContainer(startElement, container),
        !isElementVisibleInHorizontalContainer(endElement, container),
      ]);
    }
  }, []);

  useEffect(() => {
    onIsOriginalBudgetChange(isOpenBudget);
  }, [onIsOriginalBudgetChange, isOpenBudget]);

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex ltr:pl-4 ltr:md:pl-0 rtl:pr-4 rtl:md:pr-0">
          {campaignDetails?.product_selection_mode === 'SINGLE' ? (
            <Tabs
              variant="underlined"
              items={TABS.map((t, i) => ({ label: t, count: tabCounts[i] }))}
              onSelectionChange={(item) => changeTab(item as string)}
            >
              {(item) => (
                <Tab
                  key={item.label}
                  title={
                    <div className="flex items-center group">
                      <span>{t(item.label as Parameters<typeof t>[0])}</span>
                      <span className="bg-[#2B324C29] text-[#2B324C] text-xs rounded-md font-bold px-1.5 py-0.5 ms-1.5 group-data-[selected=true]:bg-[#2B324C] group-data-[selected=true]:text-white">
                        {item.count}
                      </span>
                    </div>
                  }
                />
              )}
            </Tabs>
          ) : (
            <Checkbox
              color="secondary"
              isSelected={isOpenBudget}
              onValueChange={onCheckChange}
            >
              <p>{t('OriginalBudget')}</p>
            </Checkbox>
          )}
        </div>
        <div className="w-full md:w-[26.3%] px-4 md:px-0 pt-4 md:pt-0">
          <Input
            variant="bordered"
            className="[&>div>div]:border-1 [&>div>div:nth-child(2)]:!hidden"
            placeholder={t('common.search')}
            fullWidth={false}
            startContent={
              <CiSearch size="1.5rem" className="text-primary-100" />
            }
            onValueChange={onSearchTextChange}
            errorMessage={t('categoriesBar.searchErrorMessage')}
            isInvalid={searchInvalid}
          />
        </div>
      </div>
      <div
        className="overflow-x-auto flex"
        ref={categoriesContainerRef}
        onScroll={refreshCategoriesScrollButtons}
        onLoad={refreshCategoriesScrollButtons}
      >
        <div className="flex mt-12 gap-10 mx-auto">
          {errorCategories ? (
            <h2>Oops, there is an error!</h2>
          ) : loading ? (
            <CategoriesSkeleton />
          ) : (
            <>
              <div ref={categoriesStartRef} />
              {categories?.map((item) => {
                const selected = item.id === selectedCategory;

                return (
                  <div
                    className="flex flex-col items-center cursor-pointer group w-[60px] min-w-[60px]"
                    key={item.id}
                    onClick={() => getProductsByCategory(item)}
                  >
                    <div className="flex justify-center h-12">
                      <Image
                        src={item.icon_image || '/all-icon.svg'}
                        alt={`${item?.name} Icon`}
                        className={`object-contain ${selected ? 'category-selected-svg' : 'category-default-svg'}`}
                        width={48}
                        height={48}
                      />
                    </div>
                    <span
                      className={`text-xs font-normal whitespace-nowrap ${selected ? 'text-category-selected' : 'text-category-default group-hover:text-category-selected'}`}
                    >
                      {t(item.name as Parameters<typeof t>[0])}
                    </span>
                    <div
                      className={`w-full h-[2px] mt-2 px-1 ${selected ? 'bg-category-selected' : 'group-hover:bg-category-default'}`}
                    />
                  </div>
                );
              })}
              <div ref={categoriesEndRef} />
            </>
          )}
        </div>
        {showScrollCategoriesButtons[0] && (
          <Image
            className={`cursor-pointer lg:block absolute bg-white py-6 mx-4 bottom-0 ${currentLocale === 'en' ? 'left-0' : 'right-0'}`}
            src={`${currentLocale === 'en' ? 'circular-white-left-arrow.svg' : 'circular-white-right-arrow.svg'}`}
            alt="Arrow"
            width={28}
            height={28}
            onClick={() =>
              categoriesContainerRef.current?.scrollBy({
                left: 60 * (currentLocale === 'en' ? -1 : 1),
              })
            }
          />
        )}
        {showScrollCategoriesButtons[1] && (
          <Image
            className={`cursor-pointer absolute bg-white py-6 mx-4 bottom-0 ${currentLocale === 'en' ? 'right-0' : 'left-0'}`}
            src={`${currentLocale === 'en' ? 'circular-white-right-arrow.svg' : 'circular-white-left-arrow.svg'}`}
            alt="Arrow"
            width={28}
            height={28}
            onClick={() =>
              categoriesContainerRef.current?.scrollBy({
                left: 60 * (currentLocale === 'en' ? 1 : -1),
              })
            }
          />
        )}
      </div>
      {isMessageBox && (
        <div className="fixed top-24 right-0 left-0 md:right-2 md:left-auto mx-auto z-10 mr-5 ml-5 md:mr-0 md:ml-0 md:w-[370px] shadow-[-20px_20px_40px_-4px_rgba(145, 158, 171, 0.24)] p-4 rounded-[10px] bg-[#f4f4f4]">
          <div className="text-sm font-normal leading-5 text-left text-[#363839]">
            {t('OpenbudgetMessage')}
          </div>
          <div className="flex justify-end gap-2 mt-5">
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
