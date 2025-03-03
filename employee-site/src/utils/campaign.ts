import { QUICK_OFFER_CAMPAIGN_TYPE } from './const';

export const isQuickOfferCampaign = (campaignType = '') => {
  return campaignType.toLowerCase() === QUICK_OFFER_CAMPAIGN_TYPE.toLowerCase();
};
