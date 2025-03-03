import { Button, Input } from '@nextui-org/react';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import DiscountIcon from '@/shared/Icons/discount';
import ConfirmationModal from '@/shared/modal';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductCart } from '@/types/product';
import { isQuickOfferCampaign } from '@/utils/campaign';
import { CHECKOUT_LOCATION_GLOBAL } from '@/utils/const';

import { CampaignContext } from '../../context/campaign';

interface Props {
  // product: ProductCart;
  budgetLeft: number;
  quantity?: number;
  cartItem: ProductCart;
  includedTax?: boolean;
  showDelete?: boolean;
  containerClassName?: React.ComponentProps<'div'>['className'];
  updateQuantityClassName?: React.ComponentProps<'div'>['className'];
  imageWidth?: Number;
}

function ProductCartCard({
  cartItem,
  budgetLeft,
  quantity = 1,
  includedTax = true,
  showDelete = false,
  containerClassName = '',
  updateQuantityClassName = '',
  imageWidth = 120,
}: Props) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  const { campaignDetails } = useContext(CampaignContext);
  const { updateCartItemQuantity } = useContext(CartContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(
    cartItem?.quantity.toString() || '0',
  );

  useEffect(() => {
    setInputValue(cartItem?.quantity.toString() || '');
  }, [cartItem?.quantity]);

  const isCheckoutLocationGlobal =
    campaignDetails?.check_out_location === CHECKOUT_LOCATION_GLOBAL;

  const handleDeleteProduct = async (id: number) => {
    try {
      updateCartItemQuantity && (await updateCartItemQuantity(id, 0, {}));
    } catch {}
    setIsOpen(false);
  };

  const updateQuantity = async (newQuantity: number) => {
    try {
      updateCartItemQuantity &&
        (await updateCartItemQuantity(
          cartItem.product.id,
          newQuantity,
          cartItem.variations,
        ));
    } catch {}
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateQuantity = useCallback(
    debounce(updateQuantity, 1500),
    [],
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setInputValue(parsedValue.toString());
      debouncedUpdateQuantity(parsedValue);
    }
    if (value === '' || isNaN(parsedValue)) {
      setInputValue('0');
      debouncedUpdateQuantity(0);

      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full relative flex gap-4">
      <div className="w-[120px] h-full">
        {cartItem?.product?.images?.length > 0 && (
          <Image
            src={cartItem?.product.images[0]?.image}
            fill
            alt="product Image"
            className="!relative rounded-[10px] object-cover cursor-pointer"
            onClick={() =>
              router.push(
                `/${campaignDetails?.code}/products/${cartItem?.product?.id}`,
              )
            }
          />
        )}
      </div>
      <div className="h-full flex-1 flex flex-col justify-between gap-[6px]">
        <div className="flex gap-2  items-center">
          <div className="">
            <label className="font-sans font-semibold text-sm leading-[22px]">
              <MultiSelectPrice price={cartItem?.product?.calculated_price} />
            </label>
          </div>
          <div
            className={`hidden md:block ${currentLocale === 'he' ? 'max-w-[95px]' : 'max-w-[110px]'}`}
          >
            {!!cartItem?.product?.voucher_value && (
              <div
                className="border-[1px] cursor-pointer border-[#2B324C] rounded-[8px] text-[13px] text-[#2B324C] font-[500] leading-[18px] h-[24px] flex items-center px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                title={`${t('products.value')} 
                  ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : ''}${Math.floor(cartItem.product.voucher_value)}`}
              >
                {`${t('products.value')} ${t('currencySymbol')}${Math.floor(cartItem.product.voucher_value)}`
                  .length > 13
                  ? `${t('products.value')}
                      ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : ''}
                    ${Math.floor(cartItem.product.voucher_value)}`.slice(
                      0,
                      13,
                    ) + '...'
                  : `${t('products.value')}
                     ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : ''}${Math.floor(cartItem.product.voucher_value)}`}
              </div>
            )}
          </div>
        </div>
        <div className="block md:hidden w-[104px] max-w-[110px]">
          {!!cartItem?.product?.voucher_value && (
            <div
              className="border-[1px] cursor-pointer border-[#2B324C] rounded-[8px] text-[13px] text-[#2B324C] font-[500] leading-[18px] h-[24px] flex items-center px-2 overflow-hidden text-ellipsis whitespace-nowrap"
              title={`${t('products.value')} 
              ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : '' + cartItem?.product?.voucher_value}`}
            >
              {`${t('products.value')} ${t('currencySymbol')}${Math.floor(cartItem.product.voucher_value)}`
                .length > 13
                ? `${t('products.value')} ${t('currencySymbol')}${Math.floor(cartItem.product.voucher_value)}`.slice(
                    0,
                    13,
                  ) + '...'
                : `${t('products.value')} 
                  ${campaignDetails?.displayed_currency !== 'POINT' ? t('currencySymbol') : ''}${Math.floor(cartItem.product.voucher_value)}`}
            </div>
          )}
        </div>
        <label
          className="ltr:font-sans font-light ltr:font-normal text-sm leading-[22px] text-text-secondary cursor-pointer"
          onClick={() =>
            router.push(
              `/${campaignDetails?.code}/products/${cartItem?.product?.id}`,
            )
          }
        >
          {cartItem?.product.name}
        </label>
        {cartItem?.product?.product_kind == 'MONEY' && (
          <span className=" bg-discount-light border-1 border-discount my-[2px] rounded-lg font-medium text-xs-1 leading-[18px] text-discount w-fit flex items-center gap-[2px] py-[3px] px-2">
            <DiscountIcon />
            {`Discount ${cartItem?.product?.discount_rate}%`}
          </span>
        )}
        {cartItem?.product?.product_kind != 'MONEY' && (
          <div
            className={`flex items-center gap-3 w-max border-1 rounded-lg ${updateQuantityClassName}`}
          >
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className={`text-primary-100 border-r-1 rounded-r-none h-6 ${currentLocale === 'he' ? 'order-2' : 'order-0'}`}
              onClick={() =>
                updateQuantity(Math.max(0, cartItem?.quantity - 1))
              }
            >
              <FaMinus size={14} />
            </Button>
            {isQuickOfferCampaign(campaignDetails?.campaign_type) ? (
              <Input
                type="number"
                variant="bordered"
                size="sm"
                classNames={{
                  base: 'w-8 order-1',
                  inputWrapper: 'border-none p-0 h-6 min-h-6',
                  input: 'font-semibold text-center',
                }}
                onKeyDown={handleKeyDown}
                value={inputValue}
                onChange={handleInputChange}
                min="0"
                pattern="[0-9]*"
              />
            ) : (
              <span className="font-semibold text-sm order-1">
                {cartItem?.quantity}
              </span>
            )}
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className={`text-primary-100 border-l-1 rounded-l-none h-6 ${currentLocale === 'en' ? 'order-2' : 'order-0'}`}
              isDisabled={
                isCheckoutLocationGlobal &&
                budgetLeft < cartItem?.product.calculated_price
              }
              onClick={() => {
                const newQuantity = cartItem?.quantity + 1;
                updateQuantity(newQuantity);
              }}
            >
              <FaPlus size={14} />
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-y-[6px] justify-between border border-transparent">
          {Object.entries(cartItem?.variations ?? {}).map(([k, v], i) => (
            <div className="text-xs leading-[18px] flex basis-1/2" key={i}>
              <label className="capitalize">{k}:&nbsp;</label>
              <label className="text-text-secondary">{v}</label>
            </div>
          ))}
        </div>
      </div>
      {showDelete && (
        <Image
          src="/delete2.svg"
          alt="delete"
          height={21}
          width={20}
          className="absolute top-0 ltr:right-0 rtl:left-0 cursor-pointer"
          onClick={() => updateQuantity(0)}
        />
      )}
      <ConfirmationModal
        onConfirm={() => handleDeleteProduct(cartItem?.product.id)}
        isOpenModal={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('button.deleteGift')}
        subTitle={t('checkout.warning')}
        cancelButtonText={t('button.cancel')}
        confirmButtonText={t('button.confirm')}
      />
    </div>
  );
}

export default ProductCartCard;
