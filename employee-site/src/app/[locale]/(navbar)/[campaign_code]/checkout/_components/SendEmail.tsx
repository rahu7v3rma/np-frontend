import { Input, Switch } from '@nextui-org/react';
import Image from 'next/image';
import React, { memo, useState } from 'react';

import { useI18n, useCurrentLocale } from '@/locales/client';
import { SendEmailProps } from '@/types/order';

const SendEmail = ({
  emailValue,
  setEmailValue,
  isSendEmail,
  setIsSendEmail,
  isInvalid,
}: SendEmailProps) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const [isFocused, setIsFocused] = useState(false);
  const isHebrew = currentLocale === 'he';
  return (
    <div>
      <Switch
        color="secondary"
        size="sm"
        className="mr-4 mt-7 mb-4"
        isSelected={isSendEmail}
        onValueChange={setIsSendEmail}
      >
        {t('checkout.emailConfirmation')}
      </Switch>
      {isSendEmail ? (
        <div className="relative w-full">
          <Input
            variant="bordered"
            value={emailValue}
            type="email"
            onChange={(e) => setEmailValue && setEmailValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            name="email"
            classNames={{
              inputWrapper: 'h-[50px] border-1 border-[#BDBDBD7A]',
            }}
          />
          <label
            className={`
              absolute ${isHebrew ? 'right-2' : 'left-2'} px-1 transition-all bg-white text-sm text-default-500
              ${isFocused || emailValue ? '-top-2 text-sm' : 'top-1/2 -translate-y-1/2'}
            `}
          >
            {t('checkout.emailPlaceholder')}
          </label>
        </div>
      ) : (
        <></>
      )}
      {emailValue && isInvalid && (
        <div className="flex items-center text-danger text-sm mt-1">
          <Image src="/alert.svg" height={16} width={16} alt="alert image" />
          <span className="text-[#FF5630] text-[12px] font-normal">
            {t('checkout.emailError')}
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(SendEmail);
