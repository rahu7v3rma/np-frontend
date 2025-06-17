import { useMemo, useState, useContext, useEffect } from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';

export function useSendEmail() {
  const { campaignDetails } = useContext(CampaignContext);
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [emailValue, setEmailValue] = useState<any>(
    campaignDetails?.employee_email,
  );
  const validateEmail = (value: string) =>
    value && value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  useEffect(() => {
    if (campaignDetails?.employee_email) {
      setEmailValue(campaignDetails.employee_email);
    }
  }, [campaignDetails?.employee_email]);
  const isInvalid = useMemo(() => {
    if (emailValue === '') return false;

    return validateEmail(emailValue) ? false : true;
  }, [emailValue]);

  return { isSendEmail, setIsSendEmail, emailValue, setEmailValue, isInvalid };
}
