'use client';

import { Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { IoIosInformationCircle } from 'react-icons/io';

import SharePopover from '@/app/[locale]/(navbar)/_components/sharePopover';
import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';

interface Props {
  giftPrice: number;
  budget: number;
  submitDisabled?: boolean;
  onSubmit: () => void;
}

export default function OrderSummary({
  giftPrice,
  budget,
  submitDisabled = false,
  onSubmit,
}: Props) {
  const t = useI18n();
  const { cart } = useContext(CartContext);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    setShareLink(`${window.location.href}/share`);
  }, []);

  return (
    <>
      <Card
        classNames={{
          base: 'p-4 w-full lg:w-86',
        }}
      >
        <CardHeader className="text-lg font-bold">
          {t('order.summary')}
        </CardHeader>
        <CardBody>
          <div>
            {cart?.length > 0 && (
              <>
                <div className="border-t-1 border-dotted border-[#919EAB33] w-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <h4 className="text-primary text-lg font-bold">
                    {cart?.length} {t('common.item')}
                  </h4>
                </div>
                {cart?.map(({ product }) => (
                  <div className="flex gap-4 mt-6" key={product?.id}>
                    <div className="bg-gray-100 p-4 w-[96px] h-[96px] rounded-lg">
                      <Image
                        src={product.images[0]?.image || '/product-jacket.png'}
                        alt={'Product Image'}
                        width={96}
                        height={96}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="flex font-semibold text-sm mt-1">
                        <MultiSelectPrice price={product?.calculated_price} />
                      </span>
                      <p className="flex-1 text-primary-100 text-sm mr-4 mt-3">
                        {product?.name}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t-1 border-dotted border-[#919EAB33] w-full mt-10 mb-4"></div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between">
              <span>{t('order.giftPrice')}</span>
              <span className="text-primary-100">
                <MultiSelectPrice price={giftPrice} />
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('order.budget')}</span>
              <span className="text-primary-100">
                <MultiSelectPrice price={budget} />
              </span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>{t('order.budgetLeft')}</span>
              <span className="flex items-center gap-1">
                <span>
                  <IoIosInformationCircle size={18} />
                </span>
                <MultiSelectPrice
                  price={budget - giftPrice > 0 ? budget - giftPrice : 0}
                />
              </span>
            </div>
            <Divider />
            <div className="flex justify-between text-lg font-semibold">
              <span>{t('common.total')}</span>
              <MultiSelectPrice
                price={giftPrice - budget > 0 ? giftPrice - budget : 0}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="flex mt-6 gap-4">
        <SharePopover link={shareLink} />
        <Button
          color="primary"
          size="lg"
          className={`flex-1 ${budget > giftPrice ? 'bg-button-background-1 text-button-text-color-1' : ''}`}
          isDisabled={submitDisabled}
          onClick={onSubmit}
        >
          {giftPrice > budget ? t('common.approveAndPay') : t('common.approve')}
        </Button>
      </div>
      {budget > giftPrice && (
        <div className="flex mt-6 pt-2 pl-3 gap-1">
          <Image
            src="/alert.svg"
            height={16}
            width={16}
            alt="alert image"
            className="mb-auto"
          />
          <label className="ltr:font-sans text-xs leading-[18px] text-alert">
            {t('checkout.budgetAlert')}
          </label>
        </div>
      )}
    </>
  );
}
