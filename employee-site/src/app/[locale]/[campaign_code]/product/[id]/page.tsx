import Description from '@/app/[locale]/(navbar)/[campaign_code]/products/[id]/_components/description';
import Images from '@/app/[locale]/(navbar)/[campaign_code]/products/[id]/_components/images';
import { getCurrentLocale } from '@/locales/server';
import { fetchShareItems } from '@/services/api';
import { isProductOutOfStock } from '@/utils/product';

export default async function Product({
  params,
  searchParams,
}: {
  params: { campaign_code: string; id: number; share: string };
  searchParams?: { [key: string]: string };
}) {
  const locale = await getCurrentLocale();
  const product = await fetchShareItems(
    params.campaign_code,
    searchParams?.share ?? '',
    locale,
  );

  return (
    <div className="mx-auto w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <div className="max-w-full flex flex-col sm:flex-row gap-3 sm:gap-[4.2rem]">
        <div className="sm:w-1/2">
          <Images
            images={product?.products[0]?.images}
            brandLogo={product?.products[0]?.brand?.logo_image}
            isOutOfStock={isProductOutOfStock(product)}
          />
        </div>
        <div className="flex justify-center md:items-start sm:w-1/2">
          <div className="w-full">
            <h2 className="font-bold text-xl">{product?.products[0]?.name}</h2>
            <p className="text-sm text-primary-100 mt-4">
              {product?.products[0]?.description}
            </p>
          </div>
        </div>
      </div>
      <Description product={product?.products[0]} />
    </div>
  );
}
