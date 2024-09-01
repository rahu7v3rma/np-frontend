'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FunctionComponent, useEffect } from 'react';

import { postExchange } from '@/services/api';

import Loader from './_components/loader';

type Props = Record<string, never>;

const ExchangePage: FunctionComponent<Props> = ({}: Props) => {
  const router = useRouter();
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams.get('t');

    if (t) {
      postExchange(campaign_code, t)
        .then(() => {
          // the exchange was successful
          router.push(`/${campaign_code}`);
        })
        .catch(() => {
          // do nothing
        });
    }
  }, [campaign_code, searchParams, router]);

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Loader />
    </div>
  );
};

export default ExchangePage;
