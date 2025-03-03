'use client';

import {
  Accordion,
  AccordionItem,
  CheckboxGroup,
  Checkbox,
  Input,
  Slider,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { isEmpty } from 'lodash';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';
import { getFilters } from '@/services/api';
import IndicatorIcon from '@/shared/Icons/indicator';
import { BrandsType, ProductFilterValue, ProductKind } from '@/types/product';

import { CampaignContext } from '../../context/campaign';
import { ProductContext } from '../../context/product';

import Swatch, { ColorType } from './swatch';

type SubcategoryItem = {
  id: string;
  name: string;
};
type MaxPrice = {
  max_price: number;
};

function FilterAccordion({
  campaignCode,
  triggerToast,
}: {
  campaignCode: string;
  triggerToast(text: string): void;
}) {
  const { filters, handleFilterChange, includingTax } =
    useContext(ProductContext);
  const [productKinds, setProductKinds] = useState<ProductFilterValue[]>([]);
  const [brands, setBrands] = useState<BrandsType[] | null>(null);
  const [fixedMaxPrice, setfixedMaxPrice] = useState<MaxPrice | null>(null);
  const t = useI18n();
  const locale = useCurrentLocale();
  const [selectedColorOption, setSelectedColorOption] =
    useState<ColorType | null>(null);
  const [search, setSearch] = useState<string>('');
  const [subCatOptions, setSubCatOption] = useState<SubcategoryItem[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const { campaignDetails, campaignType } = useContext(CampaignContext);

  const isAllTab = !searchParams.get('b');
  const categoryId = searchParams?.get('c') || undefined;
  const isBudgetTab = Number(searchParams.get('b')) === 1;
  const searchText = searchParams?.get('q') || undefined;
  const isUpgradedTab = Number(searchParams.get('b')) === 3;
  const isOriginalBudget = Number(searchParams.get('b')) === 2;
  const rawBudget = Number(searchParams?.get('b')) || undefined;
  const budgetInNumber =
    rawBudget === 1 || rawBudget === 2 || rawBudget === 3
      ? rawBudget
      : undefined;
  const budget = Number(campaignDetails?.budget_per_employee) || 0;
  const isHe = locale === 'he';
  const isEn = locale === 'en';

  const sortOptions = [
    {
      title: t('sidebar.high-to-low'),
      value: 'desc',
    },
    {
      title: t('sidebar.low-to-high'),
      value: 'asc',
    },
  ];

  const colorSelectionHandler = (colorObj: ColorType) => {
    if (selectedColorOption && selectedColorOption.id === colorObj.id) {
      setSelectedColorOption(null);
    } else {
      setSelectedColorOption(colorObj);
    }
  };

  useEffect(() => {
    Promise.all([
      getFilters(
        campaignCode,
        'product_kinds',
        locale,
        campaignType !== 'quick_offer_code' ? budgetInNumber : undefined,
        undefined,
        searchText,
        categoryId,
        filters,
      ),
      getFilters(
        campaignCode,
        'brands',
        locale,
        campaignType !== 'quick_offer_code' ? budgetInNumber : undefined,
        undefined,
        searchText,
        categoryId,
        filters,
      ),
      getFilters(
        campaignCode,
        'sub_categories',
        locale,
        campaignType !== 'quick_offer_code' ? budgetInNumber : undefined,
        undefined,
        searchText,
        categoryId,
        filters,
      ),
      getFilters(
        campaignCode,
        'max_price',
        locale,
        campaignType !== 'quick_offer_code' ? budgetInNumber : undefined,
        campaignType === 'quick_offer_code' ? includingTax : undefined,
        searchText,
        categoryId,
        filters,
      ),
    ])
      .then(
        ([
          productKindsData,
          brandsData,
          subCategoryData,
          fixedMaxPriceData,
        ]) => {
          setProductKinds(productKindsData);
          setBrands(brandsData);
          setSubCatOption(subCategoryData);
          if (
            typeof fixedMaxPriceData === 'object' &&
            fixedMaxPriceData !== null &&
            'max_price' in fixedMaxPriceData &&
            typeof fixedMaxPriceData.max_price === 'number'
          ) {
            setfixedMaxPrice(fixedMaxPriceData as MaxPrice);
          }
        },
      )
      .catch(() => {
        console.error('');
      });
  }, [
    campaignCode,
    locale,
    isOriginalBudget,
    campaignType,
    includingTax,
    budgetInNumber,
    searchText,
    categoryId,
    filters,
  ]);

  const itemClasses = {
    base: 'py-0 w-full',
    title: 'data-[open=true]:font-semibold text-sm text-[#363839]',
    trigger:
      'px-2 py-0 border-[1px] border-[#919EAB33] rounded-lg data-[hover=true]:bg-[#BDBDBD29] data-[open=true]:bg-[#BDBDBD29] h-[34px] flex items-center [&>span]:data-[open=true]:rotate-0 [&>span]:-rotate-180 [&>span]:rtl:-rotate-180',
    indicator: 'text-medium z-[-10]',
    content: 'text-small px-2',
  };

  const filteredBrands =
    brands?.filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  const productKindName = (productKind: ProductKind): string => {
    if (productKind === 'PHYSICAL') {
      return t('filter.productKindPhysical');
    } else if (productKind === 'MONEY') {
      return t('filter.productKindMoney');
    } else if (productKind === 'BUNDLE') {
      return t('filter.productKindBundle');
    } else if (productKind === 'VARIATION') {
      return t('filter.productKindVariation');
    } else {
      return '';
    }
  };

  let singleSelectRange;
  if (isBudgetTab) {
    singleSelectRange = 0;
  } else if (isUpgradedTab) {
    if ((fixedMaxPrice?.max_price || 0) - budget < 0) {
      singleSelectRange = 0;
    } else {
      singleSelectRange = Math.min(
        filters.priceRange[1] - budget,
        (fixedMaxPrice?.max_price || 0) - budget || Infinity,
      );
    }
  } else if (isAllTab) {
    if ((fixedMaxPrice?.max_price || 0) - budget < 0) {
      singleSelectRange = 0;
    } else {
      singleSelectRange = Math.min(
        filters.priceRange[1] - budget,
        (fixedMaxPrice?.max_price || 0) - budget || Infinity,
      );
    }
  }

  const onSelectionChange = useCallback(() => {
    setShowTooltip(false);
    setTimeout(() => {
      setShowTooltip(true);
    }, 300);
  }, []);

  return (
    <Accordion
      showDivider={false}
      disabledKeys={['1']}
      className="rounded-md flex flex-col gap-1 w-full p-0"
      itemClasses={itemClasses}
      variant="light"
      selectionMode="multiple"
      onSelectionChange={onSelectionChange}
    >
      <AccordionItem
        key="4"
        title={t('sidebar.sort')}
        indicator={<IndicatorIcon />}
      >
        <RadioGroup
          size="sm"
          value={filters.sort}
          className="mt-2 mb-2"
          onValueChange={(value) => handleFilterChange('sort', value)}
        >
          {sortOptions.map((item) => (
            <Radio
              key={item.value}
              value={item.value}
              classNames={{
                label: 'my-0.5',
              }}
            >
              {item.title}
            </Radio>
          ))}
        </RadioGroup>
      </AccordionItem>
      <AccordionItem
        key="3"
        title={t('sidebar.subcategory')}
        indicator={<IndicatorIcon />}
      >
        <CheckboxGroup
          value={filters.subcategory}
          size="sm"
          className="mt-2 mb-2"
          onChange={(value) => {
            handleFilterChange('subcategory', value);
            onSelectionChange();
          }}
        >
          {subCatOptions.map((subcategory) => (
            <Checkbox key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </AccordionItem>
      <AccordionItem
        key="1"
        aria-label={t('filter.color')}
        title={t('filter.color')}
        indicator={<IndicatorIcon />}
      >
        <Swatch
          selectedItem={selectedColorOption}
          onSelectionChange={colorSelectionHandler}
        />
      </AccordionItem>
      <AccordionItem
        key="6"
        aria-label={t('filter.brand')}
        title={t('filter.brand')}
        indicator={<IndicatorIcon />}
      >
        <div className="flex justify-between items-center mb-[16px] mt-[6px]">
          <div className='"flex items-center"'>
            <p className="text-sm font-normal text-[#363839]">
              {filters?.brand?.length} {t('filter.brandSelected')}
            </p>
            <p className="text-xs font-normal text-[#868788] mt-[3px]">
              {filters?.brand?.toString()}
            </p>
          </div>
          <Image
            src={'/ic-solar_restart-bold.svg'}
            alt="Arrow"
            width={23}
            height={23}
            className="cursor-pointer"
            onClick={() => handleFilterChange('brand', [])}
          />
        </div>
        <div className="relative w-full">
          <Input
            fullWidth
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('filter.brandSearch')}
            classNames={{
              inputWrapper: `
            bg-[white]
            hover:bg-[white]
            focus-within:bg-[white]
          `,
            }}
            className="border-1 border-[#363839] rounded-[8px]"
            endContent={
              <Image
                alt="search"
                src="/ic-eva_search-fill.svg"
                width={18}
                height={18}
              />
            }
          />
          <label
            className={`absolute h-[11px] ${locale === 'he' ? 'right-10' : 'left-3'} transition-all bg-[white] duration-300 p-[3px] font-semibold ${'top-[-10px] text-xs text-[#868788]'}`}
          >
            {t('filter.brandSearchbar')}
          </label>
        </div>
        <div className="shadow-[-20px_20px_40px_-4px_rgba(145,158,171,0.24)] rounded-[12px] border-[1px] border-[#919EAB33] mt-[5px]">
          {filteredBrands?.length > 0 ? (
            <CheckboxGroup
              classNames={{
                base: 'px-[4px] py-[10px] [&>div]:gap-5',
              }}
              value={filters.brand}
              size="sm"
              onChange={(value) => {
                handleFilterChange('brand', value);
                onSelectionChange();
              }}
              className="mt-2 mb-2"
            >
              {filteredBrands.map((brand) => (
                <Checkbox
                  value={String(brand.id)}
                  key={brand.id}
                  className="p-2 hover:bg-[#bdbdbd29] max-w-none !w-full rounded-[6px] ml-[0px]"
                >
                  {brand.name}
                </Checkbox>
              ))}
            </CheckboxGroup>
          ) : (
            <p className="p-[10px] font-[600]">{t('filter.brandNoData')}</p>
          )}
        </div>
      </AccordionItem>
      <AccordionItem
        key="2"
        aria-label={t('filter.productKind')}
        title={t('filter.productKind')}
        indicator={<IndicatorIcon />}
      >
        <CheckboxGroup
          value={filters.productKinds}
          size="sm"
          className="mt-2 mb-2"
          onChange={(value) => {
            handleFilterChange('productKinds', value);
            onSelectionChange();
          }}
        >
          {productKinds.map((productKind) => (
            <Checkbox key={productKind.id} value={productKind.id}>
              {productKindName(productKind.id as ProductKind)}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </AccordionItem>
      <AccordionItem
        key="5"
        aria-label={t('filter.price')}
        title={t('filter.price')}
        indicator={<IndicatorIcon />}
      >
        {campaignDetails?.product_selection_mode === 'SINGLE' ? (
          <div>
            <div>
              <span className="text-[14px] leading-[22px] text-[#363839] flex flex-col">
                {isAllTab ? t('filter.all') : t('filter.upgraded')}
              </span>
              <span className="text-[#868788] text-[12px] leading-[18px]">
                {t('currencySymbol')}
                {singleSelectRange}
              </span>
            </div>
            <Slider
              size="sm"
              step={1}
              maxValue={
                (fixedMaxPrice?.max_price || 0) < budget
                  ? 0
                  : (fixedMaxPrice?.max_price || 0) - budget
              }
              minValue={0}
              value={
                isBudgetTab
                  ? 0
                  : isUpgradedTab
                    ? (fixedMaxPrice?.max_price || 0) - budget < 0
                      ? 0
                      : isAllTab
                        ? (fixedMaxPrice?.max_price || 0) < budget
                          ? 0
                          : [
                              0,
                              (fixedMaxPrice?.max_price || 0) - budget ||
                                Infinity,
                            ]
                        : [0, filters.priceRange[1] - budget]
                    : [0, filters.priceRange[1] - budget]
              }
              className="mt-[10px] p-[24px]"
              classNames={{
                track: 'h-[2px] bg-[#B8B8C0] border-none',
                filler: 'bg-[#2B324C]',
                trackWrapper: 'gap-[0px]',
                step: 'h-[2px] w-[2px] !bg-[#363839] rounded-full',
                mark: 'bg-[#E5F9EE] h-[24px] text-[#363839] rounded-[6px] flex justify-center items-center before:content[""] before:h-[10px] before:w-[8px] before:absolute before:-top-[4px] before:bg-[#E5F9EE] before:rotate-45 px-2',
              }}
              renderThumb={(props) => (
                <span
                  {...props}
                  className="rounded-full h-[12px] w-[12px] bg-[#363839] relative top-[1px] z-20"
                />
              )}
              startContent={
                isAllTab
                  ? undefined
                  : isEn && (
                      <div className="rounded-full h-[12px] w-[12px] bg-[#C1E0CE] relative left-[6px] z-10" />
                    )
              }
              endContent={
                isAllTab
                  ? undefined
                  : isHe && (
                      <div className="rounded-full h-[12px] w-[12px] bg-[#C1E0CE] relative left-[6px] z-10" />
                    )
              }
              marks={
                isBudgetTab
                  ? [
                      {
                        value: 0,
                        label: t('filter.free'),
                      },
                    ]
                  : [
                      {
                        value: 0,
                        label: t('filter.free'),
                      },
                    ]
              }
              onChange={(val: number | number[]) => {
                if (
                  Array.isArray(val) &&
                  (fixedMaxPrice?.max_price || 0) >= budget
                ) {
                  const minValue = 0;
                  const newMaxValue = Math.min(
                    val[1],
                    fixedMaxPrice?.max_price || 0,
                  );
                  handleFilterChange('priceRange', [
                    minValue,
                    newMaxValue + budget,
                  ]);
                }
              }}
              onClick={() => {
                if (isBudgetTab) {
                  triggerToast(t('filter.upgradedToast'));
                }
              }}
              showTooltip={showTooltip}
              onChangeEnd={() => {
                if (isUpgradedTab) {
                  triggerToast(t('filter.budgetToast'));
                }
              }}
            />
          </div>
        ) : (
          <div>
            <div>
              <span className="text-[14px] leading-[22px] text-[#363839] flex flex-col">
                {t('filter.rangeSelected')}
              </span>
              <span className="text-[#868788] text-[12px] leading-[18px]">
                {isOriginalBudget
                  ? t('filter.budgetSelected')
                  : isHe
                    ? `${t('currencySymbol')}${filters.priceRange[1] ?? fixedMaxPrice?.max_price} - ${t('currencySymbol')}${filters.priceRange[0] ?? 0}`
                    : `${t('currencySymbol')}${filters.priceRange[0] ?? 0} - ${t('currencySymbol')}${filters.priceRange[1] ?? fixedMaxPrice?.max_price}`}
              </span>
            </div>
            <Slider
              size="sm"
              step={1}
              maxValue={isOriginalBudget ? budget : fixedMaxPrice?.max_price}
              minValue={0}
              value={
                !isEmpty(filters.priceRange)
                  ? filters.priceRange
                  : [0, fixedMaxPrice?.max_price ?? 0]
              }
              className="mt-[10px] p-[24px]"
              classNames={{
                track: 'h-[2px] bg-[#B8B8C0] border-none',
                filler: 'bg-[#2B324C]',
                trackWrapper: 'gap-[0px]',
                step: 'h-[2px] w-[2px] !bg-[#363839] rounded-full',
                mark: 'bg-[#E5F9EE] text-[12px] leading-[18px] text-black flex justify-center items-center before:content[""] before:h-[10px] before:w-[8px] before:absolute before:-top-[4px] before:bg-[#E5F9EE] before:rotate-45 w-max rounded-[6px] px-[5px] py-[3px] after:content[""] after:h-[12px] after:w-[12px] after:absolute after:-top-[22px] after:bg-[#E5F9EE] after:rounded-full',
              }}
              renderThumb={(props) => (
                <span
                  {...props}
                  className="rounded-full h-[12px] w-[12px] bg-[#363839] relative top-[1px] z-20"
                />
              )}
              marks={[
                {
                  value: Math.min(budget, fixedMaxPrice?.max_price ?? 0),
                  label: `${t('filter.yourBudget')}: ${budget}`,
                },
              ]}
              showTooltip={showTooltip}
              onChange={(val: number | number[]) => {
                if (Array.isArray(val)) {
                  if (!isOriginalBudget) {
                    handleFilterChange(
                      'priceRange',
                      val.map((v) => v || 0),
                    );
                  }
                }
              }}
              onClick={() => {
                if (isOriginalBudget) {
                  triggerToast(t('OpenbudgetMessage'));
                }
              }}
              tooltipProps={{
                isOpen: !isOriginalBudget,
              }}
            />
          </div>
        )}
      </AccordionItem>
    </Accordion>
  );
}

export default FilterAccordion;
