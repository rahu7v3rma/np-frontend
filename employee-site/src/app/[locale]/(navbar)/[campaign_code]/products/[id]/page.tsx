'use client';

import { useParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { getProductDetails } from '@/services/api';
import { Product, ProductCart, ProductImage } from '@/types/product';
import { CHECKOUT_LOCATION_GLOBAL } from '@/utils/const';
import { isProductOutOfStock } from '@/utils/product';

import Breadcrumbs, {
  BreadcrumbItemType,
} from '../../../_components/breadcrumbs';

import Actions from './_components/actions';
import Description from './_components/description';
import Images from './_components/images';

export default function Page() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { campaign_code, id } = useParams<{
    campaign_code: string;
    id: string;
  }>();
  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const { cart } = useContext(CartContext);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [productOutOfStock, setProductOutOfStock] = useState<boolean>(false);
  const [productImages, setProductImages] = useState<ProductImage[]>(
    product?.images || [],
  );

  const breadcrumbItems: BreadcrumbItemType[] | undefined = useMemo(() => {
    if (product) {
      const crumbs = [{ label: t('common.shop'), link: `/${campaign_code}` }];

      if (product.categories.length > 0) {
        crumbs.push({
          label: product.categories[0].name,
          link: `/${campaign_code}?c=${product.categories[0].id}`,
        });
      }

      crumbs.push({ label: product.name, link: `/${campaign_code}` });

      return crumbs;
    }
    return undefined;
  }, [product, t, campaign_code]);

  useEffect(() => {
    getProductDetails(campaign_code, id, locale, campaignType ?? '').then(
      (product: Product) => {
        setProduct(product);
        setProductOutOfStock(isProductOutOfStock(product));
        setProductImages(product.images);
      },
    );
  }, [campaign_code, id, locale, campaignType]);

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

  return (
    <div className="mx-auto w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] px-4 md:px-0">
      {breadcrumbItems && (
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      )}
      <div className="max-w-full flex flex-col sm:flex-row gap-3 sm:gap-16 sm:justify-between">
        <div className="sm:w-[56%]">
          <Images
            images={productImages}
            brandLogo={product?.brand?.logo_image}
            isOutOfStock={productOutOfStock}
          />
        </div>
        <div className="flex justify-start md:items-start sm:w-[38%]">
          <Actions
            productName={product?.name || ''}
            description={product?.description || ''}
            additionalPrice={product?.extra_price}
            exchangeValue={product?.exchange_value}
            orderFound={campaignDetails?.employee_order_reference !== null}
            productId={product?.id}
            quantity={1}
            specialOffer={product?.special_offer || ''}
            calculatedPrice={product?.calculated_price}
            isButtonDisable={
              isCheckoutLocationGlobal &&
              giftBudget - cartTotalPrice < (product?.calculated_price ?? 0)
            }
            isProductOutOfStock={productOutOfStock}
            variations={product?.variations || []}
            productImages={product?.images || []}
            setProductImages={setProductImages}
            productKind={product?.product_kind}
            voucherValue={product?.voucher_value}
            productLink={product?.link}
          />
        </div>
      </div>
      <Description product={product} />
    </div>
  );
}
