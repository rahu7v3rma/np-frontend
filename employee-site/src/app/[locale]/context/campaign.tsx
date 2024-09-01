'use client';

import { useParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useCurrentLocale } from '@/locales/client';
import { getExtendedCampaignDetails } from '@/services/api';
import { CampaignDetailsType } from '@/types/campaign';

type ContextType = {
  campaignDetails: CampaignDetailsType | null;
  fetchCampaignDetails?: () => void;
};

export const CampaignContext = createContext<ContextType>({
  campaignDetails: null,
});

export function CampaignWrapper({ children }: { children: ReactNode }) {
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const locale = useCurrentLocale();

  const [campaignDetails, setCampaignDetails] =
    useState<CampaignDetailsType | null>(null);

  const fetchCampaignDetails = useCallback(() => {
    getExtendedCampaignDetails(campaign_code, locale).then((campaignDetails) =>
      setCampaignDetails(campaignDetails),
    );
  }, [campaign_code, locale]);

  useEffect(() => {
    fetchCampaignDetails();
  }, [fetchCampaignDetails]);

  return (
    <CampaignContext.Provider value={{ campaignDetails, fetchCampaignDetails }}>
      {children}
    </CampaignContext.Provider>
  );
}
