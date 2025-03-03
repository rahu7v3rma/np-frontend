'use client';

import Script from 'next/script';
import { FunctionComponent, useEffect } from 'react';

import { GROW_ENV } from '@/services/common';

type Props = {
  paymentCode?: string;
  onPaid: () => void;
  onPaymentClose: () => void;
};

const Payment: FunctionComponent<Props> = ({
  paymentCode,
  onPaid,
  onPaymentClose,
}: Props) => {
  // not a callback since growPayment is provided by the loaded external script
  const handleScriptLoad = () => {
    const config = {
      environment: GROW_ENV,
      version: 1,
      events: {
        onSuccess: (res: any) => {
          onPaid();
        },
        onFailure: (res: any) => {},
        onError: (res: any) => {},
        onTimeout: (res: any) => {},
        onWalletChange: (res: any) => {
          if (res === 'close') {
            onPaymentClose();
          }
        },
      },
    };

    growPayment.init(config);
  };

  useEffect(() => {
    if (paymentCode) {
      growPayment.renderPaymentOptions(paymentCode);
    }
  }, [paymentCode]);

  return (
    <>
      <Script
        src="https://cdn.meshulam.co.il/sdk/gs.min.js"
        onLoad={handleScriptLoad}
      />
      <Script src="https://meshulam.co.il/_media/js/apple_pay_sdk/sdk.min.js" />
    </>
  );
};

export default Payment;
