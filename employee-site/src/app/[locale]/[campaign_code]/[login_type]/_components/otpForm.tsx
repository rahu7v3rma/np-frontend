'use client';

import { Button, Input } from '@nextui-org/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  FormEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import { useCurrentLocale, useI18n } from '@/locales/client';
import { postLogin } from '@/services/api';
import { LoginPayload } from '@/types/api';

const OTP_DIGITS = 6;

type Props = {
  organizationName: string;
  loginPayload: LoginPayload;
};

const OTPForm: FunctionComponent<Props> = ({
  organizationName,
  loginPayload,
}: Props) => {
  const t = useI18n();
  const locale = useCurrentLocale();
  const router = useRouter();

  const { campaign_code, login_type } = useParams<{
    campaign_code: string;
    login_type: string;
  }>();

  const [numbers, setNumbers] = useState<string[]>(
    Array.from(Array(OTP_DIGITS).keys()).map((idx) => ''),
  );
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

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
    setIsSubmitDisabled(numbers.join('').length !== OTP_DIGITS);
  }, [numbers]);

  useEffect(() => {
    validateForm();
  }, [numbers, validateForm]);

  const onSubmitSecret = useCallback(async () => {
    if (numbers.length === OTP_DIGITS) {
      const verifyPayload = { ...loginPayload, otp: numbers.join('') };

      try {
        setIsSubmitDisabled(true);

        await postLogin(campaign_code, verifyPayload);

        // logged in successfully (since an exception was not thrown)
        router.push(`/${campaign_code}/`);
      } catch (err: any) {
        if (err.status === 401 && err.data?.code === 'bad_otp') {
          toast.error(t('login.otpForm.wrongOtp'));
        } else {
          toast.error(t('login.form.SomethingWentWrong'));
        }

        validateForm();
      }
    }
  }, [numbers, loginPayload, campaign_code, router, t, validateForm]);

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
    try {
      await postLogin(campaign_code, loginPayload);
      toast.success(t('login.otpForm.resendOtp'));
    } catch (err: any) {
      if (err.status === 401 && err.data?.code === 'missing_otp') {
        toast.success(t('login.form.OtpSuccess'));
      } else {
        toast.error(t('login.form.SomethingWentWrong'));
      }
    }
  }, [loginPayload, campaign_code, t]);

  return (
    <form
      className="flex flex-col gap-[32px] w-full"
      onSubmit={handleFormSubmit}
    >
      <div className="flex flex-col gap-[16px]">
        <span
          className={'text-[24px] leading-[36px] font-[700] text-[#363839]'}
        >
          {t('login.form.title')}
        </span>
        <span
          className={'text-[24px] leading-[36px] font-[700] text-[#363839]'}
        >
          {organizationName}
        </span>
        <div className="flex justify-between relative items-start">
          <div className={'flex flex-col'}>
            <span
              className={'text-[14px] leading-[22px] font-[400] text-[#363839]'}
            >
              {login_type === 'email'
                ? t('login.otpForm.enterCodeEmail')
                : t('login.otpForm.enterCodePhone')}
            </span>
            <span
              className={'text-[14px] leading-[22px] font-[600] text-[#363839]'}
            >
              {t('login.otpForm.codeTimeOut')}
            </span>
          </div>
          <Image
            src="/refresh-icon.svg"
            alt="Refresh Icon"
            width={20}
            height={20}
            className={'mt-1 cursor-pointer'}
            priority
          />
        </div>
      </div>
      <div
        dir="ltr" // so code digit inputs are not reversed
        className="flex w-full justify-between"
      >
        {numbers.map((element, idx) => (
          <Input
            type="tel"
            variant="bordered"
            name={`number${idx}`}
            key={`number${idx}`}
            id={`${idx}`}
            classNames={{
              base: ['max-w-[55px] h-[54px]'],
              inputWrapper: ['h-full p-0 border-1 border-[#BDBDBD7A]'],
              input: [
                'rounded-md font-[400] text-[14px] leading-[22px] text-center color-[#363839]',
              ],
            }}
            placeholder="-"
            maxLength={1}
            value={numbers[idx]}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            autoFocus={idx === 0}
          />
        ))}
      </div>
      <div className={'flex flex-col gap-[20px]'}>
        <Button
          color="primary"
          size="lg"
          className={
            'h-[48px] bg-[#363839] text-[15px] leading-[26px] font-[700] text-white'
          }
          isDisabled={isSubmitDisabled}
          type="submit"
        >
          {t('login.form.buttonText')}
        </Button>
        <div className={'h-max flex gap-1'}>
          <span
            className={'text-[14px] leading-[22px] font-[300] text-[#363839]'}
          >
            {t('login.otpForm.notReceiveCode')}
          </span>
          <span
            onClick={resendCode}
            className={
              'text-[14px] leading-[22px] font-[600] text-[#363839] cursor-pointer'
            }
          >
            {t('login.otpForm.resendCode')}
          </span>
        </div>
      </div>
    </form>
  );
};

export default OTPForm;
