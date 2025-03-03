import { Button, Switch } from '@nextui-org/react';
import { useParams, useRouter } from 'next/navigation';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { isQuickOfferCampaign } from '@/utils/campaign';

import ProductCartCard from './productCart';
import SharePopover from './sharePopover';

type Props = {
  onClose: () => void;
};

const QuickOfferProducts = ({ onClose }: Props) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();

  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const [shareLink, setShareLink] = useState('');
  const {
    cart,
    fetchCartItems,
    setOfferList,
    updateCartItemQuantity,
    includedTax,
    setIncludedTax,
  } = useContext(CartContext);
  const { campaign_code } = useParams<{ campaign_code: string }>();

  useEffect(() => {
    setShareLink(`${window.location.host}/${campaign_code}/list-details`);
  }, [campaign_code]);

  useEffect(() => {
    if (isQuickOfferCampaign(campaignType ?? '')) {
      if (setOfferList) {
        setOfferList(true);
      }
    }
  }, [campaignDetails, campaignType, setOfferList]);

  useEffect(() => {
    // re-fetch cart items on page load so that we don't present stale data if
    // it was modified in another session
    fetchCartItems && fetchCartItems();
  }, [fetchCartItems]);

  const giftPrice = useMemo(
    () =>
      cart.reduce(
        (x: number, y) => x + y.product.calculated_price * y.quantity,
        0,
      ),
    [cart],
  );

  const productsItemCount = useMemo(() => {
    return cart.reduce((x, y) => x + y.quantity, 0);
  }, [cart]);

  const handleContinueButtonClick = useCallback(() => {
    router.push(`/${campaignDetails?.code}/cart`);

    onClose();
  }, [router, campaignDetails, onClose]);

  const budget = campaignDetails?.budget_per_employee;

  return (
    <div className="bg-white w-[315px] md:w-[394px] h-full flex flex-col justify-between">
      <div className="pt-4 pb-4 gap-4 flex flex-col bg-white overflow-y-scroll">
        <div className="flex mx-4 items-center justify-between pt-1 pb-5 border-b-1">
          <label className="font-semibold text-base">
            {productsItemCount}{' '}
            {productsItemCount === 1
              ? t('common.item')
              : t('common.itemPlural')}
          </label>
          <Switch
            color="secondary"
            size="sm"
            className={`rtl:flex-row-reverse rtl:gap-[9px] rtl:[&>span:nth-child(2)]:rotate-180 mr-4 [&>span:nth-child(2)]:h-5 [&>span:nth-child(2)]:w-[33px] [&>span:nth-child(2)>span]:h-[14px] [&>span:nth-child(2)>span]:w-[14px] ${includedTax ? 'rtl:[&>span:nth-child(2)>span]:!mr-[12px] ltr:[&>span:nth-child(2)>span]:!ml-[12px]' : ''}`}
            isSelected={includedTax}
            onValueChange={setIncludedTax}
          >
            {t('categoriesBar.includingTax')}
          </Switch>
        </div>
        <div
          className="flex gap-4 pl-4 pr-[4px] flex-col overflow-y-scroll min-[768px]:[&::-webkit-scrollbar]:w-[6px] min-[768px]:[&::-webkit-scrollbar-thumb]:bg-[#868788] min-[768px]:[&::-webkit-scrollbar-thumb]:rounded-xl
          max-[768px]:[&::-webkit-scrollbar]:w-[6px] max-[768px]:[&::-webkit-scrollbar-thumb]:bg-[#868788] max-[768px]:[&::-webkit-scrollbar-thumb]:rounded-xl"
        >
          {productsItemCount ? (
            cart.map((cartItem, idx) => (
              <ProductCartCard
                key={idx}
                cartItem={cartItem}
                showDelete={true}
                budgetLeft={budget ? budget - giftPrice : 0}
              />
            ))
          ) : (
            <div className="h-[260px] md:h-[131px] bg-white flex justify-center pt-6">
              <h4 className="font-semibold text-base text-center w-[170px]">
                {t('offer.empty')}
              </h4>
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#F6F6F6] pt-4 pb-6 px-4 border-t-1">
        <div className="flex items-center justify-between h-8">
          <h4
            className={`font-semibold text-base ${currentLocale === 'en' ? 'ml-4' : 'mr-4'}`}
          >
            {t('common.total')}
          </h4>
          <h4
            className={`font-semibold text-base ${currentLocale === 'en' ? 'mr-4' : 'ml-4'}`}
          >
            <MultiSelectPrice price={giftPrice?.toFixed(1)} />
          </h4>
        </div>
        <div className="flex items-center justify-between gap-2 pt-4">
          <SharePopover list height link={shareLink} />
          <Button
            color="primary"
            className="font-bold flex-1"
            onClick={handleContinueButtonClick}
          >
            {t('offer.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickOfferProducts;
