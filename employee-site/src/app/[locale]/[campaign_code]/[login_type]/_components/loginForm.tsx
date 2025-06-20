'use client';

import { Button } from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import {
  FormEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useI18n } from '@/locales/client';
import { postLogin, getCampaignType } from '@/services/api';
import { reportError } from '@/services/monitoring';
import Input from '@/shared/Input';
import { LoginMethods, LoginPayload } from '@/types/api';

type Props = {
  organizationName: string;
  campaignType?: string;
  onLoginSuccess: (loginPayload: LoginPayload) => void;
  lang?: string;
};

const LoginForm: FunctionComponent<Props> = ({
  organizationName,
  campaignType,
  onLoginSuccess,
  lang,
}: Props) => {
  const t = useI18n();
  const router = useRouter();

  const { campaign_code, login_type } = useParams<{
    campaign_code: string;
    login_type: string;
  }>();

  const [fieldValue, setFieldValue] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isInvalidEmail, setisInvalidEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [type, setType] = useState('');

  let modeText: string = t('login.form.phoneModeDescription');
  let inputPlaceholder = t('login.form.phoneModePlaceholder');

  if (login_type === LoginMethods.email) {
    modeText = t('login.form.emailModeDescription');
    inputPlaceholder = t('login.form.emailModePlaceholder');
  } else if (login_type === LoginMethods.authId) {
    modeText = t('login.form.idModeDescription');
    inputPlaceholder = t('login.form.idModePlaceholder');
  } else if (login_type === LoginMethods.voucherCode) {
    modeText = '';
    inputPlaceholder = t('login.form.voucherModePlaceholder');
  }

  const validateForm = useCallback(() => {
    setIsSubmitDisabled(!fieldValue);
  }, [fieldValue]);

  const isValidEmail = (email: string) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  useEffect(() => {
    validateForm();
  }, [fieldValue, validateForm]);

  useEffect(() => {
    (async () => {
      const campaignType = await getCampaignType(campaign_code);
      setType(campaignType);
    })();
  }, [campaign_code]);

  const onLogin = useCallback(async () => {
    let loginPayload;

    if (login_type === LoginMethods.email) {
      if (!isValidEmail(fieldValue)) {
        setisInvalidEmail(true);
        setErrorMessage(t('login.form.ValidEmail'));
        return;
      }
      setisInvalidEmail(false);

      loginPayload = { email: fieldValue };
    } else if (login_type === LoginMethods.phone) {
      loginPayload = { phone_number: fieldValue };
    } else if (login_type === LoginMethods.voucherCode) {
      loginPayload = { auth_id: fieldValue };
    } else {
      loginPayload = { auth_id: fieldValue };
    }

    try {
      setIsSubmitDisabled(true);

      if (type === 'quick_offer_code') {
        await postLogin(campaign_code, loginPayload, type);
      } else {
        await postLogin(campaign_code, loginPayload);
      }

      // logged in successfully (since an exception was not thrown)
      router.push(`/${campaign_code}/`);
    } catch (err: any) {
      if (err.status === 401 && err.data?.code === 'missing_otp') {
        // should enter otp code now
        onLoginSuccess(loginPayload);
      } else if (
        err.status === 401 &&
        err.data?.code === 'user_not_registered'
      ) {
        setErrorMessage(t('login.form.userNotFound'));
      } else if (
        (err.status === 401 && err.data?.code === 'bad_credentials') ||
        (err.status === 400 && err.data?.code === 'request_invalid')
      ) {
        // 'request_invalid' error can be raised if the phone number is bad
        // since we validate it in the backend
        setErrorMessage(
          login_type === LoginMethods.voucherCode
            ? t('login.form.wrongVoucherCode')
            : t('login.form.wrongCredentials'),
        );
      } else {
        reportError(err);
      }

      validateForm();
    }
  }, [
    login_type,
    fieldValue,
    t,
    campaign_code,
    router,
    onLoginSuccess,
    validateForm,
    type,
  ]);

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isSubmitDisabled) {
        onLogin();
      }
    },
    [isSubmitDisabled, onLogin],
  );

  return (
    <form
      className="flex flex-col gap-[32px] w-full"
      onSubmit={handleFormSubmit}
    >
      <div className="flex flex-col gap-[16px]">
        <span
          className={`text-[24px] leading-[36px] text-[#363839] text-center ${
            lang === 'he' ? 'font-[600]' : 'font-[700]'
          }`}
        >
          {t('login.form.phoneNumberTitle')}
        </span>

        {campaignType !== 'WALLET' && (
          <span
            className={'text-[24px] leading-[36px] font-[700] text-[#363839]'}
          >
            {organizationName}
          </span>
        )}
        <span
          className={
            'text-[16px] leading-[24px] font-[600] text-[#363839] text-center'
          }
        >
          {modeText}
        </span>
      </div>
      <div>
        <Input
          type="text"
          variant="bordered"
          label={inputPlaceholder}
          value={fieldValue}
          onChange={(e) => {
            setFieldValue(e.target.value);
            setisInvalidEmail(false);
          }}
          isInvalid={isInvalidEmail}
          labelPlacement={'outside'}
          errorMessage={errorMessage}
          autoFocus
        />
      </div>

      <Button
        color="primary"
        size="lg"
        isDisabled={isSubmitDisabled}
        className={`h-[48px] bg-[#363839] text-[15px] leading-[26px] font-[700] ${isSubmitDisabled ? 'text-[#919EAB99]' : 'text-white'}`}
        type="submit"
      >
        {t('login.form.buttonText')}
      </Button>
      <div className="flex flex-row justify-center h-[43px] items-center self-center border-1 border-[#BDBDBD52] rounded-[8px] m-2 py-[9px] px-[19px] mt-[8px]">
        <Image
          className="relative object-contain w-auto h-full max-h-10"
          src={'/whatsapp-icon.svg'}
          alt="Organization logo"
          width={19}
          height={19}
          priority
        />
        <div className="px-2 text-[14px] leading-[24px] font-[700] text-[#363839]">
          {t('login.form.customerServices')}
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
