'use client';

import { Button } from '@nextui-org/react';
import Image from 'next/image';
import { FunctionComponent, useCallback, useState } from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';
import { LoginPayload } from '@/types/api';
import { CampaignDetailsType } from '@/types/campaign';
import { QuickOfferDetailsType } from '@/types/quickOffer';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';

import LoginForm from './loginForm';
import OTPForm from './otpForm';

type Props = {
  campaignCode: string;
  campaignDetails: CampaignDetailsType | QuickOfferDetailsType;
  isIOS: boolean;
  lang?: string;
};

const FormContainer: FunctionComponent<Props> = ({
  campaignCode,
  campaignDetails,
  isIOS,
  lang,
}: Props) => {
  const t = useI18n();
  const [loginPayload, setLoginPayload] = useState<LoginPayload | null>(null);

  const onLoginSuccess = useCallback((loginPayload: LoginPayload) => {
    setLoginPayload(loginPayload);
  }, []);

  const desktopClassNames = 'md:right-[11%] md:top-1/2 md:-translate-y-1/2';
  const mobileClassNames = 'top-[66px] mx-4';
  const currentLocale = useCurrentLocale();
  const isEnglish = currentLocale == 'en';

  if (!campaignDetails.is_active) {
    return (
      <div
        className={`bg-white/[56%] absolute rounded-2xl py-2 px-4 flex-col flex items-center ${desktopClassNames} ${mobileClassNames} md:w-[494px]`}
      >
        {campaignDetails?.organization_logo_image && (
          <div className="mb-4">
            <Image
              src={campaignDetails.organization_logo_image}
              alt="Campaign Logo"
              width={115}
              height={57}
              priority
              className="block md:hidden mt-10 w-[115px] h-[57px]"
            />

            <Image
              src={campaignDetails.organization_logo_image}
              alt="Campaign Logo"
              width={154}
              height={77}
              priority
              className="hidden md:block w-[154px] h-[77px]"
            />
          </div>
        )}
        <h4
          className={`text-2xl leading-9 max-w-[350px] text-center hidden md:block mb-2 ${isEnglish ? 'font-bold' : 'font-semibold'}`}
        >
          {t('login.inactiveCampaign.title')}
        </h4>
        <h4
          className={`text-xl leading-[30px] font-bold  max-w-[295px] text-center md:hidden mb-2 ${isEnglish ? 'font-bold' : 'font-semibold'} `}
        >
          {/* {t('login.inactiveCampaign.smallScreenTitle')} */}
          {t('login.inactiveCampaign.title')}
        </h4>
        <div className="max-w-[398px] py-2 mb-4">
          <p className="text-sm leading-[22px] font-normal text-center">
            {t('login.inactiveCampaign.description')}
          </p>
        </div>
        <div className="mb-4 md:mb-8">
          <Button
            type="button"
            href={`https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`}
            color="primary"
            variant="bordered"
            className={`border-[#BDBDBD52] flex ${isEnglish ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <Image alt="whatsapp" src="/whatsapp.svg" width={20} height={20} />
            <span className="font-bold text-sm leading-6 text-category-selected bg-transparent">
              {t('login.inactiveCampaign.customerService')}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (loginPayload === null) {
    return (
      <div
        className={`bg-white/[56%] absolute rounded-2xl px-6 sm:px-8 md:px-[72px] pb-8 sm:pb-10 md:pb-[32px] flex-col flex items-center ${desktopClassNames} ${mobileClassNames} md:w-[494px]`}
      >
        {campaignDetails?.organization_logo_image && (
          <div className="mb-4">
            <Image
              src={campaignDetails.organization_logo_image}
              alt="Campaign Logo"
              width={115}
              height={57}
              priority
              className="block md:hidden mt-10 w-[115px] h-[57px]"
            />

            <Image
              src={campaignDetails.organization_logo_image}
              alt="Campaign Logo"
              width={154}
              height={77}
              priority
              className="hidden md:block w-[154px] h-[77px]"
            />
          </div>
        )}

        <LoginForm
          organizationName={campaignDetails.organization_name}
          campaignType={campaignDetails?.campaign_type}
          onLoginSuccess={onLoginSuccess}
          lang={lang}
        />
      </div>
    );
  } else {
    return (
      <OTPForm
        organizationName={campaignDetails.organization_name}
        loginPayload={loginPayload}
        isIOS={isIOS}
      />
    );
  }
};

export default FormContainer;
