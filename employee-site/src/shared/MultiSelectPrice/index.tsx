import Image from 'next/image';
import { useContext } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { useCurrentLocale, useI18n } from '@/locales/client';

type Props = {
  price: number | string;
  alignLeft?: boolean;
  point?: boolean;
};

export default function MultiSelectPrice({
  price,
  alignLeft = false,
  point = false,
}: Props) {
  const t = useI18n();
  const locale = useCurrentLocale();

  const { campaignDetails, campaignType } = useContext(CampaignContext);

  const displayedCurrency = campaignDetails?.displayed_currency;

  return (
    <span
      className={`flex items-center ${campaignDetails?.displayed_currency === 'CURRENCY' ? 'gap-0' : 'gap-1'}`}
    >
      {locale === 'en' || alignLeft ? (
        <>
          {campaignDetails?.displayed_currency === 'COINS' && (
            <Image src="/coin.svg" alt="coin" height={20} width={20} />
          )}
          {campaignDetails?.displayed_currency === 'CURRENCY' &&
            campaignType !== 'quick_offer_code' &&
            t('currencySymbol')}
          {campaignDetails?.displayed_currency === 'CURRENCY' &&
            campaignType === 'quick_offer_code' &&
            '₪'}
          {campaignDetails?.displayed_currency !== 'COINS' &&
            campaignDetails?.displayed_currency !== 'CURRENCY' &&
            displayedCurrency !== 'POINT' &&
            campaignType !== 'quick_offer_code' &&
            t('currencySymbol')}
          {campaignDetails?.displayed_currency !== 'COINS' &&
            campaignDetails?.displayed_currency !== 'CURRENCY' &&
            campaignType === 'quick_offer_code' &&
            '₪'}
          <span>{price}</span>{' '}
          {displayedCurrency === 'POINT' && point && t('cart.points')}
        </>
      ) : (
        <>
          {campaignDetails?.displayed_currency === 'CURRENCY' &&
            campaignType !== 'quick_offer_code' &&
            t('currencySymbol')}
          {campaignDetails?.displayed_currency === 'CURRENCY' &&
            campaignType === 'quick_offer_code' &&
            '₪'}
          {campaignDetails?.displayed_currency !== 'COINS' &&
            campaignDetails?.displayed_currency !== 'CURRENCY' &&
            displayedCurrency !== 'POINT' &&
            campaignType !== 'quick_offer_code' &&
            t('currencySymbol')}
          {campaignDetails?.displayed_currency !== 'COINS' &&
            campaignDetails?.displayed_currency !== 'CURRENCY' &&
            campaignType === 'quick_offer_code' &&
            '₪'}
          <span>{price}</span>{' '}
          {displayedCurrency === 'POINT' && point && t('cart.points')}
          {campaignDetails?.displayed_currency === 'COINS' && (
            <Image src="/coin.svg" alt="coin" height={20} width={20} />
          )}
        </>
      )}
    </span>
  );
}
