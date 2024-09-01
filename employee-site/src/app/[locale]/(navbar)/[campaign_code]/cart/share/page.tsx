'use client';

import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import Image from 'next/image';
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';

type Props = Record<string, never>;

const ShareCart: FunctionComponent<Props> = ({}: Props) => {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { cart } = useContext(CartContext);
  const budget =
    useContext(CampaignContext).campaignDetails?.budget_per_employee ?? 0;
  const [giftPrice, setGiftPrice] = useState<number>(0);

  useEffect(() => {
    const giftPrice = localStorage?.getItem('giftPrice');
    if (giftPrice) {
      setGiftPrice(JSON.parse(giftPrice));
    }
  }, []);

  return (
    <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <div className="mb-10">
        <Image
          className="relative object-contain w-auto h-full max-h-10 hidden md:block"
          src={'/logo.svg'}
          alt="Organization logo"
          width={159}
          height={43}
          priority
        />
        <Image
          className="relative object-contain w-auto h-full max-h-7 block md:hidden"
          src={'/logo-mobile.svg'}
          alt="Organization logo"
          width={29.36}
          height={29.4}
          priority
        />
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 mr-0 lg:mr-6 h-[450px] overflow-auto">
          {cart.map((item) => {
            return (
              <div className="flex flex-row" key={item?.id}>
                <div className="w-[100%] h-auto max-w-[149px] max-h-[149px] md:max-w-[270px] md:max-h-[270px] rounded-2xl shadow-t-lg m-1">
                  {item.product.images.length > 0 && (
                    <Image
                      src={item.product.images[0].image}
                      width={254}
                      height={254}
                      alt="Product Image"
                      className="rounded-2xl w-full h-full object-cover p-2"
                    />
                  )}
                </div>
                <div
                  className={`${locale === 'en' ? 'ml-7' : 'mr-7'} mt-0 md:mt-8`}
                >
                  <Image
                    src="/logo.svg"
                    width={80}
                    height={22}
                    alt="Organization Logo"
                  />
                  <h4 className="font-normal text-[#363839] text-sm pt-2 md:pt-4 pb-3 w-[170px] md:w-[238px]">
                    {item.product.name}
                  </h4>
                  <div className="border-t-1 border-b-1 pt-1 pb-1 md:pt-2 md:pb-2">
                    <span className="font-semibold text-sm text-[#363839]">
                      {t('cart.quantity')}:
                    </span>
                    <span
                      className={`font-normal text-[#363839] text-sm ${locale === 'en' ? 'pl-2' : 'pr-2'}`}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base pt-4">
                    {t('currencySymbol')}
                    {item.product.calculated_price}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <Card
            classNames={{
              base: 'p-4 w-full lg:w-86 shadow-t-lg mt-10 md:mt-0',
            }}
          >
            <CardHeader className="text-lg font-bold">
              {t('order.summary')}
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between">
                  <span>{t('order.giftPrice')}</span>
                  <span className="text-primary-100">{`$${giftPrice}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('order.budget')}</span>
                  <span className="text-primary-100">
                    {budget !== undefined ? `$${budget}` : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('order.budgetLeft')}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-primary-100">{`$${budget - giftPrice > 0 ? budget - giftPrice : 0}`}</span>
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between text-base font-semibold">
                  <span>{t('common.total')}</span>
                  <span>{`$${giftPrice - budget > 0 ? giftPrice - budget : 0}`}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShareCart;
