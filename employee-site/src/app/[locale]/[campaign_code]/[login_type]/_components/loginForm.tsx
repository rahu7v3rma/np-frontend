'use client';

import { Button } from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import { useRouter, useParams } from 'next/navigation';
import {
  FormEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import { useI18n } from '@/locales/client';
import { postLogin } from '@/services/api';
import { reportError } from '@/services/monitoring';
import Input from '@/shared/Input';
import { LoginPayload } from '@/types/api';

enum Modes {
  email = 'e',
  phone = 'p',
  authId = 'a',
}

type Props = {
  organizationName: string;
  onLoginSuccess: (loginPayload: LoginPayload) => void;
};

const LoginForm: FunctionComponent<Props> = ({
  organizationName,
  onLoginSuccess,
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

  let modeText: string = t('login.form.phoneModeDescription');
  let inputPlaceholder = t('login.form.phoneModePlaceholder');

  if (login_type === Modes.email) {
    modeText = t('login.form.emailModeDescription');
    inputPlaceholder = t('login.form.emailModePlaceholder');
  } else if (login_type === Modes.authId) {
    modeText = t('login.form.idModeDescription');
    inputPlaceholder = t('login.form.idModePlaceholder');
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

  const onLogin = useCallback(async () => {
    let loginPayload;

    if (login_type === Modes.email) {
      if (!isValidEmail(fieldValue)) {
        setisInvalidEmail(true);
        toast.error(t('login.form.ValidEmail'));
        setErrorMessage(t('login.form.ValidEmail'));
        return;
      }
      setisInvalidEmail(false);

      loginPayload = { email: fieldValue };
    } else if (login_type === Modes.phone) {
      loginPayload = { phone_number: fieldValue };
    } else {
      loginPayload = { auth_id: fieldValue };
    }

    try {
      setIsSubmitDisabled(true);

      await postLogin(campaign_code, loginPayload);

      // logged in successfully (since an exception was not thrown)
      router.push(`/${campaign_code}/`);
    } catch (err: any) {
      if (err.status === 401 && err.data?.code === 'missing_otp') {
        // should enter otp code now
        onLoginSuccess(loginPayload);
        toast.success(t('login.form.OtpSuccess'));
      } else if (err.status === 401 && err.data?.code === 'bad_credentials') {
        toast.error(t('login.form.wrongCredentials'));
        setErrorMessage(t('login.form.wrongCredentials'));
      } else {
        reportError(err);

        // some error occurred - should add actual texts here for known errors
        // such as bad credentials
        toast.error(t('login.form.SomethingWentWrong'));
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
          className={'text-[24px] leading-[36px] font-[700] text-[#363839]'}
        >
          {t('login.form.title')}
        </span>
        <span
          className={'text-[24px] leading-[36px] font-[700] text-[#363839]'}
        >
          {organizationName}
        </span>
        <span
          className={'text-[14px] leading-[22px] font-[400] text-[#363839]'}
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
    </form>
  );
};

export default LoginForm;
