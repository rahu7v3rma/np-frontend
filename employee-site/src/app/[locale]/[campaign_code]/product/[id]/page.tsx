import Description from '@/app/[locale]/(navbar)/[campaign_code]/products/[id]/_components/description';
import Images from '@/app/[locale]/(navbar)/[campaign_code]/products/[id]/_components/images';
import { getCurrentLocale } from '@/locales/server';
import { getProductDetails } from '@/services/api';

export default async function Product({
  params,
}: {
  params: { campaign_code: string; id: number };
}) {
  const locale = getCurrentLocale();
  const product = await getProductDetails(
    params.campaign_code,
    params.id,
    locale,
  );

  return (
    <div className="mx-auto w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <div className="max-w-full flex flex-col sm:flex-row gap-3 sm:gap-[4.2rem]">
        <div className="sm:w-1/2">
          <Images
            images={product?.images}
            brandLogo={product?.brand?.logo_image}
          />
        </div>
        <div className="flex justify-center md:items-start sm:w-1/2">
          <div className="w-full">
            <h2 className="font-bold text-xl">{product.name}</h2>
            <p className="text-sm text-primary-100 mt-4">
              {product.description}
            </p>
          </div>
        </div>
      </div>
      <Description product={product} />
    </div>
  );
}
