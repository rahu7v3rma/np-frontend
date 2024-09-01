'use client';

import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import { useState } from 'react';

import { useI18n } from '@/locales/client';
import ConfirmationModal from '@/shared/modal';

type ProductConfirmation = {
  product: any;
  submitDisabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function ProductConfirmationCard({
  product,
  submitDisabled,
  onCancel,
  onSubmit,
}: ProductConfirmation) {
  const [isOpen, setIsopen] = useState<boolean>(false);
  const t = useI18n();

  return (
    <>
      <div className="w-full">
        <div className="px-6 py-8 bg-white rounded-xl border border-slate-200 shadow-md shadow-grey-400">
          <div className="flex justify-between items-center">
            <h4 className="text-primary text-lg font-bold">
              {product?.quantity} {t('common.item')}
            </h4>
            <Tooltip color="primary" content="Delete item">
              <Icon
                onClick={() => setIsopen(true)}
                icon="solar:trash-bin-trash-bold"
                color="#868788"
                fontSize="18"
                className="cursor-pointer"
              />
            </Tooltip>
          </div>
          <div className="flex gap-4 mt-8">
            <div className="bg-gray-100 p-4 w-[96px] h-[96px] rounded-lg">
              {product?.images.length > 0 && (
                <Image
                  src={product.images[0].image}
                  alt={'Product Image'}
                  width={96}
                  height={96}
                />
              )}
            </div>
            <p className="flex-1 text-primary-100 font-sm mr-4">
              {product?.name}
            </p>
          </div>
          {!!product?.extra_price && (
            <>
              <div className="border-t-1 border-dotted border-[#919EAB33] w-full mt-10 mb-4"></div>
              <div className="flex flex-row justify-between h-6">
                <div>
                  <h4 className="text-[#363839] font-semibold">
                    {t('common.total')}
                  </h4>
                </div>
                <div>
                  <h4 className="text-[#363839] font-semibold">
                    {t('currencySymbol')}
                    {product?.extra_price}
                  </h4>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-5">
          {product?.product_type === 'SENT_BY_SUPPLIER' && (
            <h3 className="text-red-600 text-small mb-5">
              {t('checkout.notification')}
            </h3>
          )}
          <Button
            color="primary"
            size="lg"
            className="w-full"
            isDisabled={submitDisabled}
            onClick={onSubmit}
          >
            {product?.extra_price
              ? t('common.approveAndPay')
              : t('common.confirm')}
          </Button>
        </div>
      </div>
      <ConfirmationModal
        onConfirm={() => {
          onCancel();
          setIsopen(false);
        }}
        isOpenModal={isOpen}
        onClose={() => {
          setIsopen(false);
        }}
        title={t('button.deleteGift')}
        subTitle={t('checkout.warning')}
        messageText={t('checkout.clicking')}
        cancelButtonText={t('button.cancel')}
        confirmButtonText={t('button.confirm')}
      />
    </>
  );
}
