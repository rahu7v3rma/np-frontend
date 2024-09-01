'use client';

import { useContext } from 'react';

import { CampaignContext } from '../../context/campaign';
import ProductsGrid from '../_components/productsGrid';

import Banner from './../_components/homeBanner';
import MyOrder from './../_components/myOrder';

export default function ProductsPage({
  params,
}: {
  params: { campaign_code: string };
}) {
  const { campaignDetails } = useContext(CampaignContext);

  return (
    <>
      {campaignDetails && campaignDetails.employee_order_reference !== null && (
        <div className="pb-6 md:pb-10">
          <MyOrder campaign_code={params.campaign_code} />
        </div>
      )}
      <div className="block flex-col justify-between items-center min-h-screen overflow-clip">
        <div className="home-slider w-full mb-4 relative">
          <Banner />
        </div>
        <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-0">
          <ProductsGrid campaignCode={params.campaign_code} />
        </div>
      </div>
    </>
  );
}
