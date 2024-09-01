'use client';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React, { FunctionComponent } from 'react';

import { useI18n } from '@/locales/client';

type Props = {
  campaign_code: string;
};

const MyOrder: FunctionComponent<Props> = ({ campaign_code }: Props) => {
  const t = useI18n();
  const router = useRouter();
  const handleClick = () => {
    router.push(`${campaign_code}/order`);
  };

  return (
    <div
      className="flex items-center justify-around bg-[#2B324C] py-6 px-0 md:px-4"
      // the order component orientation should stay the same regardless of the
      // selected language
      dir="ltr"
    >
      <div className="flex flex-col md:flex-row items-center">
        <Button color="secondary" className="font-bold" onClick={handleClick}>
          {t('myOrder')}
        </Button>
        <p className="text-lg text-white font-bold text-center px-0 md:px-4 mx-4 md:mx-0 order-first md:order-last flex-1">
          {t('myOrderDescription')}
        </p>
      </div>
    </div>
  );
};

export default MyOrder;
