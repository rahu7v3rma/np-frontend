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
import {
  getExtendedCampaignDetails,
  getAuthQuickOfferDetails,
  getCampaignType,
} from '@/services/api';
import { CampaignDetailsType } from '@/types/campaign';

type ContextType = {
  campaignDetails: CampaignDetailsType | null;
  fetchCampaignDetails?: () => void;
  fetchCampaignType?: () => void;
  campaignType?: string | null;
};

export const CampaignContext = createContext<ContextType>({
  campaignDetails: null,
});

export function CampaignWrapper({ children }: { children: ReactNode }) {
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const locale = useCurrentLocale();
  const [campaignDetails, setCampaignDetails] =
    useState<CampaignDetailsType | null>(null);
  const [campaignType, setCampaignType] = useState<string | null>(null);

  const fetchCampaignDetails = useCallback(() => {
    if (campaignType === 'quick_offer_code') {
      return getAuthQuickOfferDetails(campaign_code, locale).then(
        (campaignDetails: any) =>
          setCampaignDetails({
            ...campaignDetails,
            campaign_type: campaignType,
          }),
      );
    } else {
      return getExtendedCampaignDetails(campaign_code, locale).then(
        (campaignDetails) => setCampaignDetails(campaignDetails),
      );
    }
  }, [campaign_code, locale, campaignType]);

  const fetchCampaignType = useCallback(() => {
    return getCampaignType(campaign_code).then((campaignDetails) =>
      setCampaignType(campaignDetails),
    );
  }, [campaign_code, setCampaignType]);

  useEffect(() => {
    fetchCampaignType();
    fetchCampaignDetails();
  }, [fetchCampaignDetails, fetchCampaignType, campaignType]);

  return (
    <CampaignContext.Provider
      value={{
        campaignDetails,
        fetchCampaignDetails,
        fetchCampaignType,
        campaignType,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}
