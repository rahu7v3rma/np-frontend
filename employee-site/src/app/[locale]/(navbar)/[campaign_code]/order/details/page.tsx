'use client';

import Image from 'next/image';
import QRCode from 'qrcode.react';
import { useContext, useEffect, useState } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { getOrderDetails } from '@/services/api';
import { Order } from '@/types/order';

import { DeliveryAddress } from '../_components/address';
import { OrderDetailsSkeleton } from '../skeletons';

export default function OrderDetails() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { campaignDetails } = useContext(CampaignContext);

  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [totalGiftPrice, setTotalGiftPrice] = useState<number | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isOrderFetching, setIsOrderFetching] = useState<boolean>(true);

  useEffect(() => {
    const totalPrice = order?.products?.reduce((total, productCart) => {
      const { extra_price } = productCart.product;
      const additionalCost = extra_price > 0 ? extra_price : 0;
      return total + additionalCost * productCart.quantity;
    }, 0);
    setTotalGiftPrice(totalPrice || null);
  }, [order]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!campaignDetails?.code) return;
      setIsOrderFetching(true);
      const order = await getOrderDetails(campaignDetails?.code || '', locale);
      setOrder(order);
      setIsOrderFetching(false);
    };

    if (typeof window !== 'undefined') {
      const currentUrl = `${window.location.origin}`;
      setCurrentUrl(currentUrl);
    }

    fetchOrderDetails();
  }, [campaignDetails?.code, locale]);

  if (isOrderFetching) {
    return (
      <div className="w-full lg:max-w-lg p-4 mx-auto flex flex-col items-center">
        <OrderDetailsSkeleton />;
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-lg p-4 mx-auto flex flex-col items-center">
      <h4 className="text-2xl font-bold">{t('order.greeting')}</h4>
      <h4 className="text-2xl font-bold mt-2">{order?.reference || ''}</h4>
      <div className="flex flex-col justify-center items-center my-5">
        <QRCode
          value={`${currentUrl}/${campaignDetails?.code}/order`}
          size={70}
        />
        <div className="text-gray-600 mt-2">{t('order.scancode')}</div>
      </div>
      <span className="text-md text-center text-gray-700 my-6">
        {t('order.greetingDescription')}
      </span>

      <div className="w-full md:w-96">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-md shadow-grey-400 divide-y-2 divide-dashed">
          <div>
            {(order?.products || []).map((product) => (
              <div key={product.product.name} className="mb-6">
                <h4 className="text-primary text-lg font-bold">
                  {product.quantity} {t('common.item')}
                </h4>
                <div className="flex gap-4 mt-3">
                  <div className="w-[96px] h-[96px]">
                    {product.product?.images.length > 0 && (
                      <Image
                        src={product.product.images[0].image}
                        height={96}
                        width={96}
                        alt="product image"
                        className="rounded-2xl"
                      />
                    )}
                  </div>
                  <p className="flex-1 text-primary-100 font-sm mr-4">
                    {product.product.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {totalGiftPrice ? (
            <div className="flex justify-between font-semibold py-4">
              <p>{t('common.total')}</p>
              <p>
                {t('currencySymbol')} {totalGiftPrice}
              </p>
            </div>
          ) : null}
          {campaignDetails && order ? (
            <div className="py-4">
              <DeliveryAddress
                campaignDetails={campaignDetails}
                order={order}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
