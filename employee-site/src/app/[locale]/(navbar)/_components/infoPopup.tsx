import React, { FunctionComponent, useEffect, useRef, ReactNode } from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';

type Props = {
  children: ReactNode;
  popup: boolean;
  setPopup: (value: boolean) => void;
  voucherProduct?: boolean;
};

const InfoPopup: FunctionComponent<Props> = ({
  children,
  popup,
  setPopup,
  voucherProduct,
}: Props) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {children}
      {popup && (
        <div
          ref={popupRef}
          className="absolute z-50 w-[270psx] bg-white rounded-xl shadow-popup px-4 py-1"
          style={{
            bottom: '82%',
            left: currentLocale === 'en' ? 'auto' : '-15px',
            right: currentLocale === 'en' ? '-15px' : 'auto',
            marginBottom: '15px',
          }}
        >
          {voucherProduct ? (
            <>
              <div className="flex gap-4 justify-between items-center my-0.5 ">
                <div className="text-sm text-[#363839]">
                  {t('cart.totalVoucher')}
                </div>
                <div className="text-sm text-[#363839]">$1000</div>
              </div>
              <div className="flex gap-4 justify-between items-center text-black my-0.5">
                <div className="text-sm text-[#363839]">
                  {t('cart.discount')}
                </div>
                <div className="text-sm text-[#363839]">$10</div>
              </div>
              <div className="text-sm text-[#ff5630] my-0.5">
                {t('cart.discountInfo')}
              </div>
              <div
                className={`absolute bottom-0 
                  ${currentLocale === 'en' ? 'right-0' : 'left-0'}`}
              >
                <div className="relative w-0 h-0">
                  <div
                    className={`absolute
                      ${
                        currentLocale === 'en' ? 'right-3' : 'left-3'
                      } w-0 h-0 border-[12px] border-transparent border-t-white`}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#363839]">{t('cart.popup')}</p>
              <div
                className={`absolute bottom-0 ${currentLocale === 'en' ? 'right-0' : 'left-0'}`}
              >
                <div className="relative w-0 h-0">
                  <div
                    className={`absolute ${currentLocale === 'en' ? 'right-3' : 'left-3'} w-0 h-0 border-[12px] border-transparent border-t-white`}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoPopup;
