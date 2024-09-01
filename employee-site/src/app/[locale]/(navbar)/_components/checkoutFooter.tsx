'use client';

import { Button, Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

import { useCurrentLocale, useI18n } from '@/locales/client';
import ConfirmationModal from '@/shared/modal';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';
import downloadPDF from '@/utils/downloadPdf';

type Props = {
  paymentAdded: boolean;
  onConfirmExchange: () => void;
};

export default function CheckoutComplete({
  paymentAdded,
  onConfirmExchange,
}: Props) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const router = useRouter();
  const currentPath = usePathname();
  const [isOpen, setIsopen] = useState<boolean>(false);

  const handleExchangeGiftConfirm = useCallback(() => {
    setIsopen(false);

    if (paymentAdded) {
      const whatsappUrl = `https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`;
      window.open(whatsappUrl, '_blank');
    } else {
      onConfirmExchange();
    }
  }, [paymentAdded, onConfirmExchange]);

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
                className={
                  'bg-neutral-900 text-white px-1.5 py-1 rounded-md	text-xs	font-normal	leading-4 text-center items-center justify-center'
                }
              >
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Download"
                  className="h-12 w-12"
                  onPress={() => downloadPDF(`${currentPath}/details`)}
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
              <Button
                variant="bordered"
                size="lg"
                startContent={
                  locale === 'he' ? <FaChevronRight /> : <FaChevronLeft />
                }
                className="text-sm font-bold px-2 border-1 md:w-[166px]"
                onClick={() => setIsopen(true)}
              >
                {t('button.exchangeGift')}
              </Button>
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
                className="text-sm font-bold px-2 md:w-[192px]"
              >
                {t('button.customerService')}
              </Button>
            </div>
          </div>
        </div>
        <ConfirmationModal
          onConfirm={handleExchangeGiftConfirm}
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
    </>
  );
}
