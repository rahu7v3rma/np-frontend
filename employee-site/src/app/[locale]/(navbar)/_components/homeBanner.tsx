'use client';

import { Skeleton } from '@nextui-org/react';
import Image from 'next/image';
import { useContext, useRef } from 'react';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import { useCurrentLocale } from '@/locales/client';

import 'swiper/css';
import { CampaignContext } from '../../context/campaign';

export default function HomeBanner() {
  const locale = useCurrentLocale();

  const { campaignDetails } = useContext(CampaignContext);

  const swiperRef = useRef<SwiperRef>(null);

  const swiperTimeout = useRef<NodeJS.Timeout>();

  if (campaignDetails) {
    const secondBannerBackgroundColor =
      campaignDetails.main_page_second_banner_background_color;
    const secondBannerTextColorName =
      campaignDetails.main_page_second_banner_text_color === 'BLACK'
        ? 'black'
        : 'white';

    return (
      <>
        <Swiper
          ref={swiperRef}
          className="!overflow-visible w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] !z-0"
          slidesPerView={'auto'}
          onInit={() => {
            swiperTimeout.current = setTimeout(() => {
              swiperRef.current?.swiper?.slideNext(1000);
            }, 10000);
          }}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        >
          <SwiperSlide
            className="relative me-5 !w-[90%] md:!w-full"
            onClick={() => {
              clearTimeout(swiperTimeout.current);
              swiperRef.current?.swiper?.slideNext(1000);
            }}
          >
            {/* desktop */}
            <div
              dir="ltr"
              className="absolute w-full h-full flex content-center p-5 xl:p-10 hidden md:block"
            >
              <div
                className="h-max flex flex-col gap-2 w-[38%]"
                dir={locale === 'he' ? 'rtl' : 'ltr'}
              >
                <span className="text-white text-[2rem] lg:text-[3rem] xl:text-[4rem] leading-[3rem] lg:leading-[4rem] xl:leading-[5rem] font-bold">
                  {campaignDetails.main_page_first_banner_title}
                </span>
                <span className="text-white text-2xl leading-9 font-bold whitespace-pre-wrap">
                  {campaignDetails.main_page_first_banner_subtitle}
                </span>
              </div>
            </div>
            <Image
              src={campaignDetails.main_page_first_banner_image}
              loading="eager"
              unoptimized
              alt={`home banner image`}
              layout="responsive"
              width={0}
              height={0}
              className="rounded-2xl hidden md:block"
              priority
            />

            {/* mobile */}
            <div className="absolute w-full h-[45%] top-[55%] flex p-6 block md:hidden">
              <div className="h-max w-max flex flex-col gap-1">
                <span className="text-white text-[1.9375rem] leading-[2.625rem] font-extrabold">
                  {campaignDetails.main_page_first_banner_title}
                </span>
                <span className="text-white text-lg leading-[1.6875rem] font-bold whitespace-pre-wrap">
                  {campaignDetails.main_page_first_banner_subtitle}
                </span>
              </div>
            </div>
            <Image
              src={campaignDetails.main_page_first_banner_mobile_image}
              loading="eager"
              unoptimized
              alt={`home banner image`}
              layout="responsive"
              width={0}
              height={0}
              className="rounded-2xl block md:hidden"
              priority
            />
          </SwiperSlide>
          <SwiperSlide className="relative !w-[90%] md:!w-[53%] !h-auto">
            <div
              className="w-full h-full flex p-5 xl:p-10 rounded-2xl"
              // use style for the dynamic background color since arbitrary
              // values cannot be computed from dynamic values. see:
              // https://tailwindcss.com/docs/just-in-time-mode
              style={{ backgroundColor: secondBannerBackgroundColor }}
            >
              <div className="h-full w-full flex flex-col gap-4">
                <span
                  className={`text-${secondBannerTextColorName} text-[2rem] md:text-xl lg:text-3xl xl:text-4xl 2xl:text-5xl leading-[3rem] lg:leading-[4rem] xl:leading-[5rem] font-semibold md:font-bold`}
                >
                  {campaignDetails.main_page_second_banner_title}
                </span>
                <span
                  className={`text-${secondBannerTextColorName} text-[1.0625rem] md:text-sm lg:text-lg xl:text-xl leading-[1.625rem] lg:leading-[1.875rem] font-semibold whitespace-pre-wrap line-clamp-[8] md:line-clamp-6 xl:line-clamp-[8] 2xl:line-clamp-[11]`}
                >
                  {campaignDetails.main_page_second_banner_subtitle}
                </span>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </>
    );
  } else {
    return <Skeleton className="h-[380px] md:h-[30vh]" />;
  }
}
