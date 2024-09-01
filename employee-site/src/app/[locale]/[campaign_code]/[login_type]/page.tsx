'use server';

import { Image as NextUIImage } from '@nextui-org/image';
import { headers } from 'next/headers';
import Image from 'next/image';
import { userAgent } from 'next/server';

import { getCurrentLocale } from '@/locales/server';
import { getCampaignDetails } from '@/services/api';
import LoginBgSvg from '@public/login-bg.svg';
import LogoPng from '@public/logo.png';

import FormContainer from './_components/formContainer';

export default async function LoginPage({
  params,
}: {
  params: { campaign_code: string };
}) {
  const locale = getCurrentLocale();

  const campaignDetails = await getCampaignDetails(
    params.campaign_code,
    locale,
  );

  const { device } = userAgent({ headers: headers() });

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      <div className="absolute h-[70px] w-[70px] sm:h-[137px] sm:w-[137px] flex items-center justify-center z-10">
        <Image
          className="w-[24px] h-[24px] sm:w-[48px] sm:h-[48px]"
          src={LogoPng}
          alt="App Logo"
          priority
        />
      </div>
      <div className={'w-full lg:w-[66.6666667%] sm:h-screen relative'}>
        <Image
          src={LoginBgSvg}
          alt={'Login Background'}
          objectFit={'cover'}
          fill
          className={`absolute ${locale === 'he' && 'scale-x-[-1]'}`}
          priority
        />
        <div
          className={'flex justify-center items-center h-[527px] sm:h-screen'}
        >
          <div
            className={
              'flex flex-col justify-center items-center gap-[32px] sm:gap-[40px] relative w-[343px] lg:w-[600px] xl:w-[739px]'
            }
          >
            <div
              className={'flex flex-col gap-[24px] justify-center items-center'}
            >
              <div
                className={
                  'flex flex-col gap-[8px] items-center justify-center'
                }
              >
                <span
                  className={
                    'text-[24px] sm:text-[32px] leading-[36px] sm:leading-[48px] text-center font-[700] text-[#363839]'
                  }
                >
                  {campaignDetails.login_page_title}
                </span>
                <NextUIImage
                  src={campaignDetails.organization_logo_image ?? '/logo.svg'}
                  alt="Organization logo"
                  classNames={{
                    img: 'max-h-8 md:max-h-12',
                  }}
                />
              </div>
              <span
                className={
                  'font-[400] text-[14px] leading-[22px] sm:text-[16px] sm:leading-[24px] sm:font-[600] text-center text-[#363839]'
                }
              >
                {campaignDetails.login_page_subtitle}
              </span>
            </div>
            <Image
              src={
                device.type === 'mobile'
                  ? campaignDetails.login_page_mobile_image
                  : campaignDetails.login_page_image
              }
              alt="login_page_image"
              width={415}
              height={315}
              priority
            />
          </div>
        </div>
      </div>
      <div className="sm:h-screen flex justify-center sm:items-center flex-1">
        <div className="flex sm:items-center w-[90%] xl:w-[80%] max-w-[375px] sm:max-w-[343px] pt-4 pb-10 sm:py-0">
          <FormContainer campaignDetails={campaignDetails} />
        </div>
      </div>
    </div>
  );
}
