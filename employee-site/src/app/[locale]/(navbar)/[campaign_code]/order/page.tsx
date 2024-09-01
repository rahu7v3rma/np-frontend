'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { useI18n } from '@/locales/client';
import { cancelOrder, fetchOrderDetails } from '@/services/api';
import { reportError } from '@/services/monitoring';

import BackLink from '../../_components/backLink';
import CheckoutFooter from '../../_components/checkoutFooter';

export default function Page() {
  const t = useI18n();
  const { campaign_code } = useParams<{
    campaign_code: string;
  }>();
  const router = useRouter();

  const { campaignDetails, fetchCampaignDetails } = useContext(CampaignContext);

  const [paymentAdded, setPaymentAdded] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchOrderDetails(campaign_code)
      .then((response) => {
        setPaymentAdded(response.added_payment);
      })
      .catch((err) => {
        reportError(err);
      });
  }, [campaign_code]);

  const cancelOrderHandler = async () => {
    try {
      if (campaignDetails?.employee_order_reference) {
        await cancelOrder(
          campaign_code,
          campaignDetails.employee_order_reference,
        );

        toast.success(t('order.cancelSuccess'));

        // refresh campaign details to account for cancelled order
        fetchCampaignDetails && fetchCampaignDetails();

        router.replace(`/${campaign_code}`);
      }
    } catch (err) {
      reportError(err);

      toast.error(t('order.somethingWentWrong'));
    }
  };

  return (
    <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <BackLink
        text={t('checkout.back_to_home_page')}
        href={`/${campaign_code}`}
      />
      <div className="flex items-center flex-col mt-6 md:mt-8">
        <Image
          src="/checkout.png"
          alt="Checkout order page image"
          height={365}
          width={560}
        />
        <div className="flex flex-col items-center mt-8 gap-2">
          <p className="font-bold rtl:font-semibold  text-xl md:text-2xl md:leading-9">
            {t('checkout.thanks')}
          </p>
          <p className="font-bold rtl:font-semibold text-xl md:text-2xl md:leading-9">
            {campaignDetails?.employee_order_reference ?? ''}
          </p>
        </div>
        <div className="mt-6 md:mt-8 relative h-10 w-10 md:h-14 md:w-14">
          <Image
            src="/valid.svg"
            alt="Valid image"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
      {paymentAdded !== undefined && (
        <CheckoutFooter
          paymentAdded={paymentAdded}
          onConfirmExchange={cancelOrderHandler}
        />
      )}
    </div>
  );
}
