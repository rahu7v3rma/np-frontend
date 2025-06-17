/* eslint-disable @next/next/no-img-element */
'use client';

import { Button, Input } from '@nextui-org/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  FormEvent,
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useI18n } from '@/locales/client';
import { postLogin, getCampaignType } from '@/services/api';
import { LoginMethods, LoginPayload } from '@/types/api';

const OTP_DIGITS = 5;
const RESEND_CODE_SECONDS = 5 * 60;

type Props = {
  organizationName: string;
  loginPayload: LoginPayload;
  isIOS: boolean;
};

const OTPForm: FunctionComponent<Props> = ({
  organizationName,
  loginPayload,
  isIOS,
}: Props) => {
  const t = useI18n();
  const router = useRouter();
  const [timer, setTimer] = useState(RESEND_CODE_SECONDS);

  const { campaign_code, login_type } = useParams<{
    campaign_code: string;
    login_type: string;
  }>();

  const [numbers, setNumbers] = useState<string[]>(
    Array.from(Array(OTP_DIGITS).keys()).map((idx) => ''),
  );

  const [type, setType] = useState<string>();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setTimeout(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(intervalId);
    }
    if (timer === 0) {
      setIsSubmitDisabled(true);
    }
  }, [timer]);

  useEffect(() => {
    (async () => {
      const campaignType = await getCampaignType(campaign_code);
      setType(campaignType);
    })();
  }, [campaign_code]);

  const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData?.getData('text').trim() || '';
    if (pastedData.length === OTP_DIGITS && /^\d+$/.test(pastedData)) {
      const newNumbers = pastedData.split('');
      setNumbers(newNumbers);
      document.getElementById((newNumbers.length - 1).toString())?.focus();
    }
  }, []);

  useEffect(() => {
    const inputs = document.querySelectorAll('input[type="tel"]');
    inputs.forEach((input) =>
      input.addEventListener('paste', handlePaste as EventListener),
    );
    return () => {
      inputs.forEach((input) =>
        input.removeEventListener('paste', handlePaste as EventListener),
      );
    };
  }, [handlePaste]);

  const updateValues = (id: number, newValue: string) => {
    setNumbers((previousState) => {
      let state = [...previousState];
      state[id] = newValue;
      return state;
    });
  };

  const validateForm = useCallback(() => {
    setIsSubmitDisabled(numbers.join('').length !== OTP_DIGITS || timer === 0);
  }, [numbers, timer]);

  useEffect(() => {
    validateForm();
  }, [numbers, validateForm]);

  const onSubmitSecret = useCallback(async () => {
    if (numbers.length === OTP_DIGITS) {
      const verifyPayload = { ...loginPayload, otp: numbers.join('') };

      try {
        setIsSubmitDisabled(true);
        if (type === 'quick_offer_code') {
          await postLogin(campaign_code, verifyPayload, type ?? '');
        } else {
          await postLogin(campaign_code, verifyPayload);
        }
        // logged in successfully (since an exception was not thrown)
        router.push(`/${campaign_code}/`);
      } catch (err: any) {
        validateForm();
      }
    }
  }, [numbers, loginPayload, campaign_code, router, type, validateForm]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNaN(+e.target.value)) {
        return;
      }

      const changedId = Number(e.target.id);

      updateValues(changedId, e.target.value);

      // if the current input has a value and its id is not the last one focus on
      // the next input
      if (e.target.value.length > 0 && changedId < OTP_DIGITS - 1) {
        document.getElementById((changedId + 1).toString())?.focus();
      }
    },
    [],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // handle code input backspaces - if needed we want to focus on the
      // previous input
      if (e.code === 'Backspace') {
        const changedId = Number(e.currentTarget.id);

        // this only applies if the current input is not the first one
        if (changedId > 0) {
          if (e.currentTarget.value === '') {
            // if the current value (before deletion since this is a key down
            // event) is empty we want to actually delete the previous input's
            // value
            updateValues(changedId - 1, '');
          } else {
            // if the current value (before deletion) is not empty we want to
            // delete it and not the previous input's value
            updateValues(changedId, '');
          }

          // prevent default handlers since we don't want the previous input
          // values to be deleted if not needed
          e.preventDefault();

          // focus on the previous input
          document.getElementById((changedId - 1).toString())?.focus();
        }
      }
    },
    [],
  );

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isSubmitDisabled) {
        onSubmitSecret();
      }
    },
    [isSubmitDisabled, onSubmitSecret],
  );

  const resendCode = useCallback(async () => {
    setIsSubmitDisabled(false);
    setNumbers(Array.from(Array(OTP_DIGITS).keys()).map((idx) => ''));
    setTimer(RESEND_CODE_SECONDS);
    try {
      await postLogin(campaign_code, loginPayload);
    } catch (err: any) {}
  }, [loginPayload, campaign_code]);

  return (
    <div className="w-full max-w-[494px] bg-white/70 rounded-[20px] p-8 shadow-[0_4px_24px_0_rgba(0,0,0,0.08)] sm:right-[10%]">
      <form
        className="flex flex-col items-center gap-6 w-full max-w-md mx-auto md:p-8 sm:p-4 rounded-lg"
        onSubmit={handleFormSubmit}
      >
        <div className="flex flex-col items-center gap-4 w-full text-center">
          <img
            src="/checkout_icon.svg"
            alt="Logo"
            className="w-[154px] h-[77px]"
          />
          <h1 className="text-2xl font-bold text-[#363839]">
            {t('login.otpForm.title')}
          </h1>
          <div className="w-full text-start px-5">
            <div className="flex justify-between items-center w-full">
              <p className="text-[14px] text-[#363839] flex items-center justify-center gap-2">
                {login_type === LoginMethods.email
                  ? t('login.otpForm.enterCodeEmail')
                  : t('login.otpForm.enterCodePhone')}
              </p>
              <img
                src="/primary-shape.svg"
                alt="retry"
                className="w-[14px] h-[14px]"
              />
            </div>
            <span className="text-[14px] font-semibold text-[#363839]">
              {formatTime(timer)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-center w-full mb-4">
          {numbers.map((element, idx) => (
            <Fragment key={`number${idx}`}>
              <Input
                type="tel"
                name={`number${idx}`}
                id={`${idx}`}
                classNames={{
                  base: ['w-[55.8px] h-[54px]'],
                  inputWrapper: [
                    'h-full p-0 border-1 border-[#BDBDBD7A] hover:border-[#363839] rounded-lg bg-transparent',
                  ],
                  input: ['text-[14px] font-medium text-center text-[#363839]'],
                }}
                placeholder="-"
                maxLength={1}
                value={element}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                autoComplete="one-time-code"
              />
            </Fragment>
          ))}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            type="submit"
            className="w-full bg-[#363839] text-white rounded-lg py-[12px] font-bold text-[16px]"
            isDisabled={isSubmitDisabled}
          >
            {t('login.form.buttonText')}
          </Button>

          <div className="flex items-center justify-start text-[14px] text-[#363839]">
            <span className="mr-1 font-light">
              {t('login.otpForm.notReceiveCode')}
            </span>
            <Button
              type="button"
              className="text-[#363839] bg-transparent font-medium p-0 h-auto min-w-0 text-[14px]"
              onClick={resendCode}
            >
              {t('login.otpForm.resendCode')}
            </Button>
          </div>

          <div className="flex justify-center w-full mt-2">
            <div className="flex items-center justify-center gap-2 w-fit rounded-md border border-[#BDBDBD52] py-2 px-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0025 0H9.9975C4.48375 0 0 4.485 0 10C0 12.1875 0.705 14.215 1.90375 15.8612L0.6575 19.5763L4.50125 18.3475C6.0825 19.395 7.96875 20 10.0025 20C15.5162 20 20 15.5138 20 10C20 4.48625 15.5162 0 10.0025 0ZM15.8212 14.1213C15.58 14.8025 14.6225 15.3675 13.8587 15.5325C13.3363 15.6437 12.6537 15.7325 10.3562 14.78C7.4175 13.5625 5.525 10.5763 5.3775 10.3825C5.23625 10.1887 4.19 8.80125 4.19 7.36625C4.19 5.93125 4.91875 5.2375 5.2125 4.93375C5.45375 4.68625 5.8525 4.57375 6.235 4.57375C6.35875 4.57375 6.47 4.58 6.57 4.585C6.86375 4.5975 7.01125 4.615 7.205 5.07875C7.44625 5.66 8.03375 7.095 8.10375 7.2425C8.175 7.39 8.24625 7.59 8.14625 7.78375C8.0525 7.98375 7.97 8.0725 7.8225 8.2425C7.675 8.4125 7.535 8.5425 7.3875 8.725C7.2525 8.88375 7.1 9.05375 7.27 9.3475C7.44 9.635 8.0275 10.5937 8.8925 11.3637C10.0087 12.3575 10.9137 12.675 11.2375 12.81C11.4787 12.91 11.7662 12.8863 11.9425 12.6988C12.1663 12.4575 12.4425 12.0575 12.7238 11.6638C12.9237 11.3813 13.1763 11.3462 13.4412 11.4462C13.7113 11.54 15.14 12.2462 15.4338 12.3925C15.7275 12.54 15.9212 12.61 15.9925 12.7338C16.0625 12.8575 16.0625 13.4388 15.8212 14.1213Z"
                  fill="#25D366"
                />
              </svg>
              <Button
                type="button"
                className="text-[#363839] bg-transparent font-bold p-0 h-auto min-w-0 text-[14px]"
                onClick={() => {
                  const url = isIOS
                    ? `whatsapp://send?phone=${process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_PHONE}`
                    : `https://wa.me/${process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_PHONE}`;
                  window.open(url, '_blank');
                }}
              >
                {t('button.customerService')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OTPForm;
