'use client';

import { getServerActionRequestMetadata } from 'next/dist/server/lib/server-action-request-meta';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { FunctionComponent } from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';

type Props = Record<string, never>;

const Footer: FunctionComponent<Props> = ({}: Props) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const pathname = usePathname();

  const isCheckoutCompletedPage = pathname.includes('/order');
  const checkFont =
    currentLocale === 'en' ? 'font-bold text-xs' : 'font-semibold text-base';
  const checkF =
    currentLocale === 'en' ? 'text-sm font-normal' : 'text-sm font-light';

  return isCheckoutCompletedPage ? null : (
    <>
      <hr className="border-t-[1px] border-[#919EAB33]" />
      <footer
        className="flex flex-col md:h-[264px] h-[unset] md:flex-row justify-center py-[40px] w-full  md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto"
        dir="ltr"
      >
        <div className="flex flex-col flex-1 items-center md:items-start md:mr-10">
          <Link href="/" legacyBehavior>
            <a>
              <Image
                className="relative"
                src="/logo.svg"
                alt="Next.js Logo"
                width={158.68}
                height={43}
                priority
              />
            </a>
          </Link>
          <div className="flex items-center py-[10px] md:ml-0 md:mr-0 mt-8 md:mt-10">
            <a
              href="https://www.facebook.com/nicklas.team"
              target="_blank"
              className="hover:scale-150 transition-transform duration-200"
            >
              <Image
                className="relative"
                src="/facebook-icon.svg"
                alt="Facebook Icon"
                width={9.17}
                height={15.01}
                priority
              />
            </a>
            <a
              href="https://www.instagram.com/nicklas_team/"
              target="_blank"
              className="hover:scale-150 transition-transform duration-200 ml-6 mr-6"
            >
              <Image
                className="relative"
                src="/instagram-icon.svg"
                alt="Instagram Icon"
                width={16.67}
                height={16.67}
                priority
              />
            </a>
            <a
              href="https://www.linkedin.com/company/nicklas-ltd/"
              target="_blank"
              className="hover:scale-150 transition-transform duration-200"
            >
              <Image
                className="relative"
                src="/linkedin-icon.svg"
                alt="Linkedin Icon"
                width={15}
                height={15}
                priority
              />
            </a>
          </div>
          <p className="text-center text-sm font-normal mt-4 md:mt-9 hidden md:block">
            © 2024. All rights reserved Nicklas LTD
          </p>
        </div>
        <div
          className="flex flex-col items-center md:items-start mt-8 md:mt-0 mx-0 md:mr-20"
          dir={`${currentLocale === 'he' ? 'rtl' : 'ltr'}`}
        >
          <h3 className={`text-[#363839] ${checkFont} uppercase`}>
            {t('footer.legal')}
          </h3>
          <ul
            className={`pt-6 text-center ${checkF} md:text-start text-[#363839]`}
          >
            <li className="pb-4">
              <span className="">{t('footer.termsAndCondition')}</span>
            </li>
            <li className="">
              <span className="">{t('footer.privacyPolicy')}</span>
            </li>
          </ul>
        </div>
        <div
          className="flex flex-col items-center md:items-start mt-8 md:mt-0"
          dir={`${currentLocale === 'he' ? 'rtl' : 'ltr'}`}
        >
          <h3 className={`text-[#363839] ${checkFont} uppercase`}>
            {t('footer.contact')}
          </h3>
          <ul
            className={`pt-6 text-center ${checkF}	md:text-start text-[#363839]`}
          >
            <li
              className="pb-4 hover:text-blue-500 hover:underline transition-colors duration-200"
              dir="ltr"
            >
              <a href="tel:+972545604856">+972 54-560-4856</a>
            </li>
            <li className="hover:text-blue-500 hover:underline transition-colors duration-200">
              <a href="mailto:support@nicklas.co.il">support@nicklas.co.il</a>
            </li>
          </ul>
        </div>
        <p className="text-center text-sm font-normal mt-4 md:mt-auto md:text-left pt-4 block md:hidden">
          © 2024. All rights reserved Nicklas LTD
        </p>
      </footer>
    </>
  );
};

export default Footer;
