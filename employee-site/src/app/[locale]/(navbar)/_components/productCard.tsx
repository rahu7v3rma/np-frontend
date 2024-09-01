'use client';
import { Icon } from '@iconify/react';
import { Button, Card, CardBody, Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { Product } from '@/types/product';

import { CampaignContext } from '../../context/campaign';

type props = {
  product: Product;
  isOutOfStock?: boolean;
  onAddToCart: (productId: number) => void;
};

export default function ProductCard({
  product,
  isOutOfStock = false,
  onAddToCart = () => {},
}: props) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const currentPath = usePathname();
  const router = useRouter();

  const { campaignDetails } = useContext(CampaignContext);

  return (
    <Card
      shadow="sm"
      isPressable
      disableRipple
      onPress={() => router.push(`${currentPath}/products/${product.id}`)}
    >
      <CardBody className="text-start p-2 pb-4">
        {/* viewport-width based height is here due to the fact we don't know
         * the size of product images, but we want them to all be displayed
         * the same (and also responsive)
         */}
        <div className="w-full relative rounded-2xl h-[39vw] md:h-[18.75vw]">
          {product?.images?.length > 0 && (
            <Image
              src={product.images[0].image}
              alt="product image"
              fill
              className="rounded-2xl object-cover"
            />
          )}
          <div dir="ltr">
            {!!product?.exchange_value && (
              <span
                className={`${locale === 'he' ? 'font-normal text-xs-1' : ' font-medium text-xs-2 md:text-xs-1'} px-1 block bottom-0 mb-[8.5px] md:hidden absolute flex justify-center items-center rounded-lg border border-black leading-5-1`}
              >
                {`${t('products.value')} ${t('currencySymbol')}${product.exchange_value}`}
              </span>
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
            {!!product?.exchange_value && (
              <span
                className={`${locale === 'he' ? 'font-normal text-xs-1' : ' font-medium text-xs-2 md:text-xs-1'} px-1 hidden md:block flex justify-center items-center rounded-lg border border-black leading-5-1`}
              >
                {`${t('products.value')} ${t('currencySymbol')}${product.exchange_value}`}
              </span>
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

          <div className="mt-2 flex items-center justify-between">
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
            {campaignDetails?.product_selection_mode === 'MULTIPLE' && (
              <>
                {!!product?.calculated_price && (
                  <span className="!text-[15px] font-semibold leading-6 flex justify-center items-center gap-0.5">
                    <MultiSelectPrice price={product.calculated_price} />
                  </span>
                )}
                <Tooltip color="primary" content="Add to Cart" delay={1000}>
                  <Button
                    variant="light"
                    isIconOnly
                    className="ltr:ml-auto rtl:mr-auto"
                    onClick={() => onAddToCart(product.id)}
                    isDisabled={
                      campaignDetails?.employee_order_reference !== null
                    }
                  >
                    <Icon icon="solar:cart-plus-bold" fontSize={24} />
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
