'use server';

import { Image as NextUIImage } from '@nextui-org/image';
import { headers } from 'next/headers';
import Image from 'next/image';

import { getCurrentLocale } from '@/locales/server';
import {
  getCampaignDetails,
  getCampaignType,
  getQuickOfferDetails,
} from '@/services/api';
import LogoPng from '@public/logo.png';

import FormContainer from './_components/formContainer';
import './index.css';

export default async function LoginPage({
  params,
}: {
  params: { campaign_code: string };
}) {
  const locale: 'en' | 'he' = await getCurrentLocale();

  let campaignType = null;
  try {
    campaignType = await getCampaignType(params.campaign_code);
  } catch {}

  const campaignDetails =
    campaignType === 'quick_offer_code'
      ? await getQuickOfferDetails(params.campaign_code, locale)
      : await getCampaignDetails(params.campaign_code, locale);

  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  function renderContent() {
    return (
      <>
        {campaignDetails.is_active && (
          <>
            <div className="absolute top-1 right-1 lg:left-1 lg:right-auto h-[70px] w-[70px] sm:h-[137px] sm:w-[137px] flex items-center justify-center z-10">
              <Image
                className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px]"
                src={LogoPng}
                alt="App Logo"
                priority
              />
            </div>
            <div className="w-full lg:w-[66.6666667%] sm:h-screen relative">
              <div className="flex justify-center items-center h-[527px] sm:h-screen">
                <div className="flex flex-col justify-center items-center gap-[32px] sm:gap-[40px] relative w-[343px] lg:w-[600px] xl:w-[739px]">
                  <div className="flex flex-col gap-[24px] justify-center items-center">
                    <div className="flex flex-col gap-[8px] items-center justify-center">
                      <NextUIImage
                        src={
                          campaignDetails.organization_logo_image ?? '/logo.svg'
                        }
                        alt="Organization logo"
                        classNames={{
                          img: 'max-h-8 md:max-h-12',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div>
          <div className="flex sm:items-center w-[90%] xl:w-[80%] max-w-[375px] sm:max-w-[343px] pt-4 pb-10 sm:py-0">
            <FormContainer
              campaignCode={params.campaign_code}
              campaignDetails={campaignDetails}
              isIOS={isIOS}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="h-screen flex flex-col sm:hidden bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: campaignDetails
            ? `url(${campaignDetails.login_page_mobile_image})`
            : 'none',
        }}
      >
        {renderContent()}
      </div>

      <div
        className="h-screen hidden sm:flex flex-col bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: campaignDetails
            ? `url(${campaignDetails.login_page_image})`
            : 'none',
        }}
      >
        {renderContent()}
      </div>
    </>
  );
}
