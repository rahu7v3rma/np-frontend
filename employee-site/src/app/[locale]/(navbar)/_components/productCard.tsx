'use client';

import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@nextui-org/react';
import clsx from 'clsx';
import Image from 'next/image';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { Product } from '@/types/product';
import { isQuickOfferCampaign } from '@/utils/campaign';
import { isProductOutOfStock } from '@/utils/product';

import { CampaignContext } from '../../context/campaign';
import { CartContext } from '../../context/cart';

import Swatch from './swatch';

type props = {
  product: Product;
  addToCartDisabled: boolean;
  onAddToCart: (productId: number, variations?: Record<string, string>) => void;
  onAddToList: (productId: number, variations?: Record<string, string>) => void;
  onPress: (productId: number) => void;
};

export default function ProductCard({
  product,
  addToCartDisabled,
  onAddToCart,
  onAddToList,
  onPress,
}: props) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { cart } = useContext(CartContext);
  const productInCart = cart.find((item) => item.product.id === product.id);
  const { campaignDetails, campaignType } = useContext(CampaignContext);

  const cardRef = useRef<HTMLDivElement>(null);
  const isOutOfStock = isProductOutOfStock(product);

  const onClickCard = useCallback(() => {
    onPress(product.id);
    if (cardRef?.current) {
      const card = cardRef?.current;
      card.style.scale = '0.96';
      setTimeout(() => (card.style.scale = '1.0'), 200);
    }
  }, [cardRef, onPress, product]);

  const colorVariation = useMemo(
    () =>
      product.variations?.find(
        (v) => v.variation_kind === 'COLOR' && v.color_variation.length,
      ),
    [product],
  );
  const [selectedColorVariation, setSelectedColorVariation] = useState<{
    site_name: string;
    color_code: string;
    name: string;
  }>();
  const isColorVariationProduct = product.variations?.some(
    (variation) =>
      variation.variation_kind === 'COLOR' &&
      variation.color_variation?.length > 0,
  );

  const productImage: string | undefined = product.images?.[0]?.image;
  // const fallbackImage = '/image-not-found.png';
  const defaultImage = productImage;
  const [displayImage, setDisplayImage] = useState(defaultImage);
  useEffect(() => setDisplayImage(defaultImage), [defaultImage]);

  return (
    <div
      onClick={isOutOfStock ? undefined : onClickCard}
      ref={cardRef}
      style={{
        opacity: isOutOfStock ? 0.7 : 1,
        zIndex: 1,
      }}
      className={clsx(
        'shadow-[0px_12px_24px_-4px_#919EAB1F,0px_0px_2px_0px_#919EAB33] rounded-[16px] transition-all duration-400',
        isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <div className="text-start p-2">
        {/* viewport-width based height is here due to the fact we don't know
         * the size of product images, but we want them to all be displayed
         * the same (and also responsive)
         */}
        <div className="w-full relative rounded-2xl h-[39vw] md:h-[18.75vw]">
          <Image
            src={displayImage}
            alt="product image"
            fill
            className="rounded-2xl object-cover"
            // onError={() => setDisplayImage(fallbackImage)}
          />
          <div dir="ltr">
            {product.product_kind === 'MONEY' ? (
              <>
                {
                  <span
                    className={`${locale === 'he' ? 'font-normal text-xs-1' : 'font-medium text-xs-2 md:text-xs-1'} font-bold block bottom-0 mb-[8.5px] md:hidden absolute flex justify-center items-center rounded-lg border border-black leading-5-1 leading-5-1 !text-[#2B324C] z-10 rounded-tr-lg rounded-br-lg pl-4 pr-3 -ml-[2px] bg-white`}
                  >
                    {`${campaignType === 'quick_offer_code' ? t('cart.discount') : t('products.money_value')} ${Math.floor(product.voucher_value)}${
                      campaignDetails?.displayed_currency !== 'POINT'
                        ? campaignType === 'quick_offer_code'
                          ? t('moneySymbol')
                          : t('currencySymbol')
                        : ''
                    }`}
                  </span>
                }
              </>
            ) : (
              <>
                {!!product?.exchange_value && (
                  <span
                    className={`${locale === 'he' ? 'font-normal text-xs-1' : 'font-medium text-xs-2 md:text-xs-1'} font-bold block bottom-0 mb-[8.5px] md:hidden absolute flex justify-center items-center rounded-lg border border-black leading-5-1 leading-5-1 !text-[#2B324C] z-10 rounded-tr-lg rounded-br-lg pl-4 pr-3 -ml-[2px] bg-white`}
                  >
                    {`${t('products.value')} 
                    ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : ''}${product.exchange_value}`}
                  </span>
                )}
              </>
            )}
          </div>

          {isOutOfStock && (
            <div className="top-0 w-full h-full absolute opacity-80 bg-white rounded-2xl">
              <span
                className={`${locale === 'he' ? 'font-normal' : ' font-medium'} h-6 py-0-3 px-2 rounded-lg bg-black text-white text-xs-1 leading-5-1 flex justify-center absolute top-0 items-center left-0`}
              >
                {t('products.out_of_stock')}
              </span>
            </div>
          )}

          {product.special_offer && (
            <div className="absolute bottom-0 bg-[#D0EADB] px-2 py-1 rounded-r-lg rounded-bl-lg">
              <span className="text-sm text-[#566F61] uppercase">
                {product.special_offer}
              </span>
            </div>
          )}
        </div>
        <div className="md:px-2 flex flex-col">
          <div
            className="flex w-full py-2 justify-between"
            // the brand logo and value container orientation should stay the
            // same regardless of the selected language
            dir="ltr"
          >
            <div className="w-17 h-6 md:w-20 md:h-6-1">
              {product?.brand?.logo_image && (
                <Image
                  className="object-contain w-auto h-full"
                  src={product.brand.logo_image}
                  height={24}
                  width={80}
                  alt="Brand Logo"
                />
              )}
            </div>
            {product.product_kind === 'MONEY' ? (
              <>
                {
                  <span
                    className={`${locale === 'he' ? 'font-normal text-xs-1' : ' font-medium text-xs-2 md:text-xs-1'} px-1 hidden md:block flex justify-center items-center rounded-lg border border-black leading-5-1`}
                  >
                    {`${campaignType === 'quick_offer_code' ? t('cart.discount') : t('products.money_value')} ${campaignType === 'quick_offer_code' ? Math.floor(product.discount_rate) : Math.floor(product.voucher_value)}${
                      campaignDetails?.displayed_currency !== 'POINT'
                        ? campaignType === 'quick_offer_code'
                          ? t('moneySymbol')
                          : t('currencySymbol')
                        : ''
                    }`}
                  </span>
                }
              </>
            ) : (
              <>
                {!!product?.exchange_value && (
                  <span
                    className={`${locale === 'he' ? 'font-normal text-xs-1' : ' font-medium text-xs-2 md:text-xs-1'} px-1 hidden md:block flex justify-center items-center rounded-lg border border-black leading-5-1`}
                  >
                    {`${t('products.value')}
                    ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : ''}${product.exchange_value}`}
                  </span>
                )}
              </>
            )}
          </div>
          <p
            // clamp at two lines and also set the height to be 2 lines always
            // (based on line height being 1.25rem aka 5 units. if this ever
            // changes h-10 below should be changed)
            className={`${locale === 'he' ? 'font-light' : 'font-normal'} text-sm line-clamp-2 h-10`}
          >
            {product?.name}
          </p>
          <div className="mt-2 flex items-center justify-between" dir="ltr">
            <div className="">
              {!!product?.extra_price &&
                campaignDetails?.product_selection_mode === 'SINGLE' && (
                  <div className="flex gap-1">
                    <div className="border border-extra-cost-background-2 bg-extra-cost-background-1 rounded-lg flex justify-center w-full sm:w-max">
                      <span className="bg-extra-cost-background-2 text-extra-cost-text-color !text-[13px] font-medium leading-6 flex justify-center items-center px-2 rounded-[7px]">
                        {t('products.additional')}
                      </span>
                      <span className="!text-[15px] font-semibold leading-6 flex justify-center items-center gap-0.5 px-2">
                        {t('currencySymbol')}
                        {product.extra_price}
                      </span>
                    </div>
                  </div>
                )}
              {(isQuickOfferCampaign(campaignType ?? '') ||
                campaignDetails?.product_selection_mode === 'MULTIPLE') && (
                <>
                  {campaignType === 'quick_offer_code' &&
                  product.product_kind === 'MONEY'
                    ? null
                    : !!product?.calculated_price && (
                        <span className="!text-[15px] font-semibold leading-6 flex justify-center items-center gap-0.5">
                          <MultiSelectPrice
                            price={product.calculated_price}
                            point
                          />
                        </span>
                      )}
                </>
              )}
            </div>
            <div className="">
              <div className="flex justify-end ">
                {isQuickOfferCampaign(campaignType ?? '') && (
                  <Button
                    isIconOnly
                    className="bg-transparent w-[26px] h-[26px] translate-x-[7px]"
                    isDisabled={
                      isColorVariationProduct ? !selectedColorVariation : false
                    }
                    onClick={() =>
                      onAddToList(
                        product.id,
                        selectedColorVariation
                          ? {
                              [selectedColorVariation.site_name]:
                                selectedColorVariation.name,
                            }
                          : undefined,
                      )
                    }
                  >
                    <Image
                      src={
                        !!productInCart
                          ? '/added-to-list.svg'
                          : '/add-to-list.svg'
                      }
                      alt={`Add To List Icon`}
                      width={26}
                      height={26}
                    />
                  </Button>
                )}
                {!isQuickOfferCampaign(campaignType ?? '') &&
                  campaignDetails?.product_selection_mode === 'MULTIPLE' && (
                    <>
                      <Tooltip
                        color="primary"
                        content={t('cart.addToCart')}
                        delay={1000}
                      >
                        <Button
                          variant="light"
                          isIconOnly
                          id="addToCartButton"
                          onClick={() =>
                            onAddToCart(
                              product.id,
                              selectedColorVariation
                                ? {
                                    [selectedColorVariation.site_name]:
                                      selectedColorVariation.name,
                                  }
                                : undefined,
                            )
                          }
                          isDisabled={
                            campaignDetails.campaign_type === 'WALLET'
                              ? addToCartDisabled ||
                                isOutOfStock ||
                                isColorVariationProduct
                                ? !selectedColorVariation
                                : false
                              : addToCartDisabled ||
                                  campaignDetails?.employee_order_reference !==
                                    null ||
                                  isOutOfStock ||
                                  isColorVariationProduct
                                ? !selectedColorVariation
                                : false
                          }
                        >
                          <Icon
                            style={{ pointerEvents: 'none' }}
                            icon="solar:cart-plus-bold"
                            fontSize={24}
                          />
                        </Button>
                      </Tooltip>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {colorVariation?.color_variation && (
        <div
          className="mt-2 px-4 py-2 rounded-b-2xl"
          dir="ltr"
          onClick={(e) => e.stopPropagation()}
        >
          <Swatch
            colors={
              colorVariation?.color_variation.map((c) => ({
                id: c.color_code,
                bg: c.color_code,
                name: c.name,
              })) || []
            }
            selectedItem={
              selectedColorVariation
                ? {
                    id: selectedColorVariation.color_code,
                    bg: selectedColorVariation.color_code,
                    name: selectedColorVariation.name,
                  }
                : null
            }
            onSelectionChange={(c) => {
              if (colorVariation) {
                setSelectedColorVariation((p) => {
                  if (p?.color_code === c.id) {
                    setDisplayImage(defaultImage);
                    return undefined;
                  }

                  setDisplayImage(
                    colorVariation.color_variation.find(
                      (v) => v.color_code === c.bg,
                    )?.image || defaultImage,
                  );

                  return {
                    site_name: colorVariation.site_name,
                    color_code: c.id,
                    name: c.name,
                  };
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
