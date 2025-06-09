'use client';

import { Button, Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useCallback, useContext } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

import OrderDetails from '@/app/[locale]/(navbar)/[campaign_code]/order/details/page';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { getList, fetchOrderDetails } from '@/services/api';
import ConfirmationModal from '@/shared/modal';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';
import {
  generateCartProductsPDF,
  generateDeliveryPDF,
} from '@/utils/downloadPdf';

import { CampaignContext } from '../../context/campaign';

type Props = {
  paymentAdded: boolean;
  onConfirmExchange: () => void;
  quickOffer?: boolean;
};

export default function CheckoutComplete({
  paymentAdded,
  onConfirmExchange,
  quickOffer,
}: Props) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [isOpen, setIsopen] = useState<boolean>(false);
  const [isOrderDownloading, setIsOrderDownloading] = useState(false);
  const orderDetailsRef = useRef<HTMLDivElement>(null);
  const { includedTax } = useContext(CartContext);
  const { campaignType, campaignDetails } = useContext(CampaignContext);

  const handleExchangeGiftConfirm = useCallback(() => {
    setIsopen(false);

    if (paymentAdded) {
      const whatsappUrl = `https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`;
      window.open(whatsappUrl, '_blank');
    } else {
      onConfirmExchange();
    }
  }, [paymentAdded, onConfirmExchange]);

  const handleDownload = async () => {
    if (campaignType === 'quick_offer_code') {
      const cartProductsList = await getList(locale, includedTax);
      setIsOrderDownloading(true);
      generateCartProductsPDF(cartProductsList?.products);
      setTimeout(() => setIsOrderDownloading(false), 3000);
    } else {
      const cartProductsList = await fetchOrderDetails(
        campaignDetails?.code ?? '',
      );

      setIsOrderDownloading(true);

      campaignDetails &&
        generateDeliveryPDF(
          cartProductsList,
          campaignDetails?.delivery_location,
          t,
          locale,
        );
      setTimeout(() => setIsOrderDownloading(false), 3000);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row overflow-auto md:mx-4 mt-8 mb-4">
        <div className="flex flex-col items-center  bg-cover w-full">
          <p className="max-w-lg text-base font-normal text-center tracking-wider">
            {t('checkout.content')}
          </p>

          <div
            className="flex flex-row justify-around gap-2 md:gap-4 mt-8 mb-4"
            dir="ltr"
          >
            <div className="h-12 flex items-center justify-center">
              <Tooltip
                content={t('button.downloadGift')}
                color="primary"
                showArrow
                offset={0}
                classNames={{
                  content: 'text-xs',
                }}
              >
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Download"
                  className="h-12 w-12"
                  onPress={() => handleDownload()}
                  isLoading={isOrderDownloading}
                >
                  <Image
                    src="/drop.svg"
                    alt="download Image"
                    width={48}
                    height={48}
                    objectFit="contain"
                  />
                </Button>
              </Tooltip>
            </div>
            <div
              dir={locale === 'he' ? 'rtl' : 'ltr'}
              className="flex flex-row justify-around gap-2 md:gap-4"
            >
              {campaignDetails?.campaign_type !== 'WALLET' && (
                <Button
                  variant="bordered"
                  size="lg"
                  startContent={
                    locale === 'he' ? <FaChevronRight /> : <FaChevronLeft />
                  }
                  className="sm:text-sm text-[12px] font-bold px-2 border-1 md:w-[166px]"
                  onClick={() => setIsopen(true)}
                >
                  {quickOffer
                    ? t('button.changeList')
                    : t('button.exchangeGift')}
                </Button>
              )}
              <Button
                as={Link}
                href={`https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`}
                target="_blank"
                color="primary"
                size="lg"
                startContent={
                  <Image
                    src="/whatsapp.svg"
                    alt="whatsapp"
                    width={24}
                    height={24}
                  />
                }
                className="sm:text-sm text-[12px] font-bold px-2 md:w-[192px]"
              >
                {quickOffer
                  ? t('button.talkWith')
                  : t('button.customerService')}
              </Button>
            </div>
          </div>
        </div>
        <ConfirmationModal
          onConfirm={
            campaignType === 'quick_offer_code'
              ? onConfirmExchange
              : handleExchangeGiftConfirm
          }
          isOpenModal={isOpen}
          onClose={() => setIsopen(false)}
          title={t('button.exchangeGift')}
          subTitle={
            paymentAdded
              ? t('checkout.paymentAddedCancelTitle')
              : t('checkout.warning')
          }
          messageText={
            paymentAdded
              ? t('checkout.paymentAddedCancelText')
              : t('checkout.clicking')
          }
          cancelButtonText={t('button.cancel')}
          confirmButtonText={
            paymentAdded ? t('button.customerService') : t('button.confirm')
          }
          confirmButtonStartContent={
            paymentAdded ? (
              <Image
                src="/whatsapp.svg"
                alt="whatsapp"
                width={24}
                height={24}
              />
            ) : undefined
          }
        />
      </div>
      {/* Hacky Workaround: In order to get the component downloaded, it needs to be in DOM, 
      so keeping it here as hidden and it will be processed when the user 
      wants to download order page */}
      <div ref={orderDetailsRef} style={{ display: 'none' }}>
        <OrderDetails />
      </div>
    </>
  );
}
