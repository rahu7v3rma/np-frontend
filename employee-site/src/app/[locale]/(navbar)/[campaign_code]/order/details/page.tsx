'use client';

import { Button } from '@nextui-org/react';
import { PDFViewer } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { BsQrCode } from 'react-icons/bs';

import {
  I18nProviderClient,
  useCurrentLocale,
  useI18n,
} from '@/locales/client';

import OrderDocument from '../_components/orderDocument';

export default function OrderDetails({
  params,
}: {
  params: {
    orderId: string;
  };
}) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const orderId = params.orderId;

  const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
      ssr: false,
    },
  );

  // TODO: Need to fetch order details dynamically
  const products = [
    {
      quantity: 1,
      image: '/kitchen-icon.svg',
      name: 'Product name',
      description: 'Lorem ipsum dolor sit amet, consectetur',
    },
  ];

  return (
    <div className="w-full lg:max-w-lg p-4 mx-auto flex flex-col items-center">
      {/* Render this to check how order document looks in pdf */}
      {/* <PDFViewer style={{ height: 600, width: 600 }}>
        <I18nProviderClient locale={locale}>
          <OrderDocument locale={locale} />
        </I18nProviderClient>
      </PDFViewer> */}
      <h4 className="text-2xl font-bold">{t('order.greeting')}</h4>
      <h4 className="text-2xl font-bold">{orderId}</h4>
      <div className="flex flex-col justify-center items-center my-5">
        <BsQrCode size="4rem" />
        <div className="mt-2">{t('order.scancode')}</div>
      </div>
      <p className="my-6 text-center">{t('order.greetingDescription')}</p>

      <div className="w-full md:w-96">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-md shadow-grey-400 divide-y-2 divide-dashed">
          <div>
            {products.map((product) => (
              <div key={product?.name} className="mb-4">
                <h4 className="text-primary text-lg font-bold">
                  {product?.quantity} {t('common.item')}
                </h4>
                <div className="flex gap-4 mt-8">
                  <div className="bg-gray-100 p-4 w-[96px] h-[96px] rounded-lg">
                    {product?.image && (
                      <Image
                        src={product?.image}
                        alt={'Product Image'}
                        width={96}
                        height={96}
                      />
                    )}
                  </div>
                  <p className="flex-1 text-primary-100 font-sm mr-4">
                    {product?.name} - {product?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-semibold py-4">
            <p>{t('common.total')}</p>
            <p>{t('currencySymbol')} 384</p>
          </div>
          <div className="py-4">
            <p className="font-semibold">{t('order.officeDelivery')}</p>
            <p className="text-sm text-primary-100 mt-2">
              {t('order.officeDeliveryDescription')}
            </p>
          </div>
        </div>
      </div>
      <PDFDownloadLink
        document={
          <I18nProviderClient locale={locale}>
            <OrderDocument locale={locale} />
          </I18nProviderClient>
        }
        fileName={'order1.pdf'}
      >
        {({ blob, url, loading, error }) =>
          loading ? null : (
            <Button color="primary" className="my-4">
              Download Order PDF
            </Button>
          )
        }
      </PDFDownloadLink>
    </div>
  );
}
