'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Switch,
} from '@nextui-org/react';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

import SharePopover from '@/app/[locale]/(navbar)/_components/sharePopover';
import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n } from '@/locales/client';
import { quickOfferList } from '@/services/api';

interface Props {
  budget: number | null;
  offerPrice: number;
}

export default function OfferSummary({ budget, offerPrice }: Props) {
  const t = useI18n();
  const { campaign_code } = useParams<{
    campaign_code: string;
  }>();
  const [shareLink, setShareLink] = useState('');
  const { includedTax, setIncludedTax } = useContext(CartContext);
  const router = useRouter();
  const { fetchCampaignDetails } = useContext(CampaignContext);

  useEffect(() => {
    setShareLink(`${window.location.host}/${campaign_code}/list-details`);
  }, [campaign_code]);
  return (
    <div className="w-full lg:w-86">
      <Card
        classNames={{
          base: 'p-3 w-full',
        }}
      >
        <CardHeader className="text-lg font-bold leading-7 flex justify-between	">
          {t('order.offerSummary')}
          <Switch
            color="secondary"
            size="sm"
            className={`rtl:flex-row-reverse rtl:gap-[9px] rtl:[&>span:nth-child(2)]:rotate-180 mr-4 [&>span:nth-child(2)]:h-5 [&>span:nth-child(2)]:w-[33px] [&>span:nth-child(2)>span]:h-[14px] [&>span:nth-child(2)>span]:w-[14px] ${includedTax ? 'rtl:[&>span:nth-child(2)>span]:!mr-[12px] ltr:[&>span:nth-child(2)>span]:!ml-[12px]' : ''} font-normal`}
            isSelected={includedTax}
            onValueChange={setIncludedTax}
          >
            {t('categoriesBar.includingTax')}
          </Switch>
        </CardHeader>
        <CardBody className="p-3">
          <div className="flex flex-col gap-2 text-sm">
            <Divider />
            <div className="flex justify-between font-semibold leading-6 text-base">
              <span>{t('common.total')}</span>₪
              {offerPrice ? offerPrice?.toFixed(1) : budget}
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="flex mt-6 gap-4">
        <SharePopover list link={shareLink} />
        <Button
          color="primary"
          onClick={async () => {
            await quickOfferList({ send_my_list: true });
            fetchCampaignDetails && fetchCampaignDetails();
            router.push(`/${campaign_code}/order`);
          }}
          size="lg"
          className={`flex-1`}
          disabled={false}
        >
          {t('button.sendMyList')}
        </Button>
      </div>
    </div>
  );
}
