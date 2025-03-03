'use client';

import { useParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

import { CampaignContext } from '../../context/campaign';
import { CartContext } from '../../context/cart';
import ProductsGrid from '../_components/productsGrid';

import Banner from './../_components/homeBanner';
import MyOrder from './../_components/myOrder';

export default function ProductsPage({
  params,
}: {
  params: { campaign_code: string };
}) {
  const { campaign_code } = useParams<{
    campaign_code: string;
  }>();
  const { campaignDetails, campaignType, fetchCampaignType } =
    useContext(CampaignContext);
  const { cart } = useContext(CartContext);

  useEffect(() => {
    (async () => {
      fetchCampaignType && fetchCampaignType();
    })();
  }, [campaign_code, campaignType, fetchCampaignType, campaignDetails]);

  useEffect(() => {
    const scrollPosition = sessionStorage.getItem(
      'products_screen_scrollPosition',
    );
    if (scrollPosition !== null) {
      const nextUIProvider = document.getElementById('nextUIProvider');
      if (nextUIProvider) {
        nextUIProvider.scrollTo(0, parseInt(scrollPosition, 10));
      }
    }

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('products_screen_scrollPosition');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      {campaignType === 'quick_offer_code' ? (
        <div className="pb-6 md:pb-10 mt-[65px] md:mt-[45px] lg:mt-[40px]">
          {campaignDetails?.send_my_list && (
            <MyOrder campaign_code={params.campaign_code} />
          )}
        </div>
      ) : (
        campaignDetails &&
        campaignDetails.campaign_type !== 'WALLET' &&
        campaignDetails.employee_order_reference !== null && (
          <div className="pb-6 md:pb-10 mt-[65px] md:mt-[45px] lg:mt-[40px]">
            <MyOrder campaign_code={params.campaign_code} />
          </div>
        )
      )}
      <div className="block flex-col justify-between items-center min-h-screen overflow-clip">
        <div className="home-slider w-full mt-[70px] sm:mt-0 mb-4 relative">
          <Banner />
        </div>
        <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-0">
          <ProductsGrid campaignCode={params.campaign_code} />
        </div>
      </div>
    </>
  );
}
