'use client';

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

  return isCheckoutCompletedPage ? null : (
    <>
      <hr className="border-t-[1px] border-[#919EAB33]" />
      <footer
        className="flex flex-col md:flex-row justify-center md:justify-between h-auto py-10 w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0"
        // the entire footer orientation should stay the same regardless of the
        // selected language
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
          <div className="flex items-center md:ml-0 md:mr-0 mt-10 md:mt-6">
            <a href="https://www.facebook.com/nicklas.team" target="_blank">
              <Image
                className="relative"
                src="/facebook-icon.svg"
                alt="Facebook Icon"
                width={9.17}
                height={15.01}
                priority
              />
            </a>
            <a href="https://www.instagram.com/nicklas_team/" target="_blank">
              <Image
                className="relative ml-6 mr-6"
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
          <p className="text-center mt-4 md:mt-6 hidden md:block">
            © 2024. All rights reserved Nicklas LTD
          </p>
        </div>
        <div
          className="flex flex-col items-center md:items-start mt-8 md:mt-0 mx-0 md:mr-12"
          // while the footer container stays the same, this div should have
          // the correct direction based on the selected language
          dir={`${currentLocale === 'he' ? 'rtl' : 'ltr'}`}
        >
          <h3 className="text-[#363839] font-bold text-xs uppercase">
            {t('footer.legal')}
          </h3>
          <ul className="pt-4 text-center md:text-start text-[#363839]">
            <li className="pb-4">
              <a href="">{t('footer.termsAndCondition')}</a>
            </li>
            <li>
              <a href="">{t('footer.privacyPolicy')}</a>
            </li>
          </ul>
        </div>
        <div
          className="flex flex-col items-center md:items-start mt-8 md:mt-0"
          // while the footer container stays the same, this div should have
          // the correct direction based on the selected language
          dir={`${currentLocale === 'he' ? 'rtl' : 'ltr'}`}
        >
          <h3 className="text-[#363839] font-bold text-xs uppercase">
            {t('footer.contact')}
          </h3>
          <ul className="pt-4 text-center md:text-start text-[#363839]">
            <li
              className="pb-4"
              // this is so that the phone number is displayed correctly since
              // it is two words that are reversed when rtl
              dir="ltr"
            >
              <a href="tel:+972545604856">+972 54-560-4856</a>
            </li>
            <li>
              <a href="mailto:support@nicklas.co.il">support@nicklas.co.il</a>
            </li>
          </ul>
        </div>
        <p className="text-center mt-4 md:mt-auto md:text-left pt-4 block md:hidden">
          © 2024. All rights reserved Nicklas LTD
        </p>
      </footer>
    </>
  );
};

export default Footer;
