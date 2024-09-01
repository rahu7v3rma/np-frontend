'use client';

import { Button, Card, CardBody } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent, useCallback, useState } from 'react';

import { useI18n } from '@/locales/client';
import { LoginPayload } from '@/types/api';
import { CampaignDetailsType } from '@/types/campaign';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';

import LoginForm from './loginForm';
import OTPForm from './otpForm';

type Props = {
  campaignDetails: CampaignDetailsType;
};

const FormContainer: FunctionComponent<Props> = ({
  campaignDetails,
}: Props) => {
  const t = useI18n();
  const [loginPayload, setLoginPayload] = useState<LoginPayload | null>(null);

  const onLoginSuccess = useCallback((loginPayload: LoginPayload) => {
    setLoginPayload(loginPayload);
  }, []);

  if (!campaignDetails.is_active) {
    return (
      <Card
        shadow="sm"
        className="h-max my-4 mx-auto w-[343px]"
        style={{
          boxShadow: '0px 12px 24px -4px #919EAB1F, 0px 0px 2px 0px #919EAB33',
        }}
      >
        <CardBody className="p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <h5 className="text-xl font-semibold">
              {t('login.inactiveCampaign.title')}
            </h5>
            <p className="text-sm">{t('login.inactiveCampaign.description')}</p>
            <Button
              as={Link}
              href={`https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`}
              target="_blank"
              variant="bordered"
              startContent={
                <Image
                  src="/whatsapp.svg"
                  alt="whatsapp"
                  width={24}
                  height={24}
                />
              }
              className="mt-4 font-semibold"
            >
              {t('button.customerService')}
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (loginPayload === null) {
    return (
      <LoginForm
        organizationName={campaignDetails.organization_name}
        onLoginSuccess={onLoginSuccess}
      />
    );
  } else {
    return (
      <OTPForm
        organizationName={campaignDetails.organization_name}
        loginPayload={loginPayload}
      />
    );
  }
};

export default FormContainer;
