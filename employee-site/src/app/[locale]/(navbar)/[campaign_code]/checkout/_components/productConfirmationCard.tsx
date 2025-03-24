'use client';

import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { useI18n } from '@/locales/client';
import ConfirmationModal from '@/shared/modal';

type ProductConfirmation = {
  product: any;
  selectedVariations: any;
  submitDisabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  productLinks?: boolean;
};

export default function ProductConfirmationCard({
  product,
  submitDisabled,
  selectedVariations,
  onCancel,
  onSubmit,
  productLinks = true,
}: ProductConfirmation) {
  const [isOpen, setIsopen] = useState<boolean>(false);
  const t = useI18n();

  const { campaignDetails } = useContext(CampaignContext);
  const router = useRouter();

  return (
    <>
      <div className="w-full">
        <div className="px-6 py-8 bg-white rounded-xl border border-slate-200 shadow-md shadow-grey-400">
          <div className="flex justify-between items-center">
            <h4 className="text-primary text-lg font-bold">
              {product ? '1' : ''} {t('common.item')}
            </h4>
            <Tooltip color="primary" content={t('order.deleteItem')}>
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
            <div>
              {product && (
                <>
                  <div className="flex gap-4 mt-6" key={product?.id}>
                    <div className="bg-gray-100 p-4 w-[96px] h-[96px] rounded-lg">
                      {product?.images?.length > 0 && (
                        <Image
                          src={product.images[0].image}
                          className={productLinks ? 'cursor-pointer' : ''}
                          alt={'Product Image'}
                          width={96}
                          height={96}
                          onClick={
                            productLinks
                              ? () => {
                                  router.push(
                                    `/${campaignDetails?.code}/products/${product.id}`,
                                  );
                                }
                              : undefined
                          }
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="flex font-semibold text-sm mt-1 leading-[22px]"></span>
                      <p
                        onClick={
                          productLinks
                            ? () => {
                                router.push(
                                  `/${campaignDetails?.code}/products/${product.id}`,
                                );
                              }
                            : undefined
                        }
                        className={`
                          flex 
                          text-[#868788] 
                          font-normal 
                          text-sm 
                          leading-[22px] 
                          ltr:mr-4
                          rtl:ml-4
                          ${productLinks ? 'cursor-pointer' : ''}`}
                      >
                        {product?.name}
                      </p>
                      <div className="flex flex-wrap gap-x-2">
                        {Object.entries(
                          selectedVariations.variations ?? {},
                        ).map(([k, v], i) => (
                          <div
                            className={`text-xs leading-[18px] flex basis-1/2`}
                            key={i}
                          >
                            <label className="capitalize">{k}:&nbsp;</label>
                            <label className="text-text-secondary">
                              {String(v)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t-1 border-dotted border-[#919EAB33] w-full mt-10 mb-4"></div>
                </>
              )}
            </div>
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
            className="w-full font-bold"
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
