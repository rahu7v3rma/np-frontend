'use client';

import { useParams } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { getProductDetails } from '@/services/api';
import { Product } from '@/types/product';

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
  const { campaignDetails } = useContext(CampaignContext);

  const [product, setProduct] = useState<Product | undefined>(undefined);

  const breadcrumbItems: BreadcrumbItemType[] | undefined = useMemo(() => {
    if (product) {
      const crumbs = [{ label: t('common.shop'), link: `/${campaign_code}` }];

      if (product.categories.length > 0) {
        crumbs.push({
          label: product.categories[0].name,
          link: `/${campaign_code}`,
        });
      }

      crumbs.push({ label: product.name, link: `/${campaign_code}` });

      return crumbs;
    }
    return undefined;
  }, [product, t, campaign_code]);

  useEffect(() => {
    getProductDetails(campaign_code, id, locale).then((product: Product) => {
      setProduct(product);
    });
  }, [campaign_code, id, locale]);

  return (
    <div className="mx-auto w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      {breadcrumbItems && (
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      )}
      <div className="max-w-full flex flex-col sm:flex-row gap-3 sm:gap-[4.2rem]">
        <div className="sm:w-1/2">
          <Images
            images={product?.images}
            brandLogo={product?.brand?.logo_image}
          />
        </div>
        <div className="flex justify-center md:items-start sm:w-1/2">
          <Actions
            productName={product?.name || ''}
            description={product?.description || ''}
            additionalPrice={product?.extra_price}
            exchangeValue={product?.exchange_value}
            orderFound={campaignDetails?.employee_order_reference !== null}
            productId={product?.id}
            quantity={1}
          />
        </div>
      </div>
      <Description product={product} />
    </div>
  );
}
