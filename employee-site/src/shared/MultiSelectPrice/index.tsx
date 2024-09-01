import Image from 'next/image';
import { useContext } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { useI18n } from '@/locales/client';

type Props = {
  price: number;
};

export default function MultiSelectPrice({ price }: Props) {
  const t = useI18n();

  const { campaignDetails } = useContext(CampaignContext);

  return (
    <span className="flex items-center gap-1">
      {campaignDetails?.displayed_currency === 'COINS' && (
        <Image src="/coin.svg" alt="coin" height={20} width={20} />
      )}
      {campaignDetails?.displayed_currency === 'CURRENCY' &&
        t('currencySymbol')}
      {price}
    </span>
  );
}
