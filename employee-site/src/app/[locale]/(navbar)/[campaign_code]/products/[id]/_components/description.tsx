'use client';
import { Tabs, Tab } from '@nextui-org/react';
import { useEffect, useState } from 'react';

import { useI18n } from '@/locales/client';
import { Product } from '@/types/product';

type props = {
  product: Product | undefined;
};

export default function Description({ product }: props) {
  const [tabs, setTabs] = useState<
    { id: number; content: JSX.Element; label: string }[] | undefined
  >(undefined);
  const t = useI18n();

  useEffect(() => {
    const tabs = [
      {
        id: 1,
        label: t('productDetails.description'),
        content: (
          <div>
            <div className="w-full">
              <p className="font-bold text-lg">
                {t('productDetails.specifications')}
              </p>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mt-4 mb-10">
                <div className="col-span-3 md:col-span-1 font-normal text-sm">
                  {t('productDetails.category')}
                </div>
                <div className="col-span-1 md:col-span-4 font-normal text-sm break-words">
                  {product?.categories.map((c) => c.name).join(', ')}
                </div>
                <div className="col-span-3 md:col-span-1 font-normal text-sm">
                  {t('productDetails.brand')}
                </div>
                <div className="col-span-1 md:col-span-4 font-normal text-sm break-words">
                  {product?.brand.name}
                </div>
                <div className="col-span-3 md:col-span-1 font-normal text-sm">
                  {t('productDetails.provider')}
                </div>
                <div className="col-span-1 md:col-span-4 font-normal text-sm break-words">
                  {product?.supplier.name}
                </div>
                <div className="col-span-3 md:col-span-1 font-normal text-sm">
                  {t('productDetails.serialNumber')}
                </div>
                <div className="col-span-1 md:col-span-4 font-normal text-sm break-words">
                  {product?.sku}
                </div>
              </div>
              <p className="font-bold text-lg mb-4">
                {t('productDetails.productDetails')}
              </p>
              <div className="w-full gap-4 mt-4 whitespace-pre-wrap">
                {product?.technical_details}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 2,
        label: t('productDetails.returnsPolicy'),
        content: (
          <div className="whitespace-pre-wrap">{product?.exchange_policy}</div>
        ),
      },
      {
        id: 3,
        label: t('productDetails.warranty'),
        content: <div className="whitespace-pre-wrap">{product?.warranty}</div>,
      },
    ];
    setTabs(tabs);
  }, [product, t]);

  return (
    <>
      <div className="mb-3 mt-8 sm:mt-3">
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-white shadow-xl rounded-lg">
            {tabs && (
              <Tabs
                items={tabs}
                variant="underlined"
                classNames={{
                  tab: 'me-6 py-7 data-[selected=true]:font-bold',
                  base: 'w-full border-b-1 border-gray-200',
                  tabList: 'p-0 w-full sm:w-max px-6',
                  panel: 'p-0',
                  cursor: 'w-full',
                }}
              >
                {(item) => (
                  <Tab key={item.id} title={item.label}>
                    <div className="p-5 sm:p-7">{item.content}</div>
                  </Tab>
                )}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
