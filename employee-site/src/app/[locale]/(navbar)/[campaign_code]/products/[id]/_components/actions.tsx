'use client';

import { Button } from '@nextui-org/react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import React, {
  FunctionComponent,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { RiAlertFill } from 'react-icons/ri';
import { toast } from 'react-toastify';

import SharePopover from '@/app/[locale]/(navbar)/_components/sharePopover';
import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n } from '@/locales/client';

type Props = {
  productName: string;
  additionalPrice?: number;
  exchangeValue?: number;
  description: string;
  orderFound: boolean;
  productId?: number;
  quantity?: number;
};

const Actions: FunctionComponent<Props> = ({
  productName,
  additionalPrice,
  exchangeValue,
  description,
  orderFound,
  productId,
  quantity,
}: Props) => {
  const t = useI18n();
  const { id } = useParams<{
    id: string;
  }>();
  const currentPath = usePathname();
  const router = useRouter();

  const { campaignDetails } = useContext(CampaignContext);
  const { addCartItem } = useContext(CartContext);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    setShareLink(
      `${window.location.host}/${campaignDetails?.code}/products/${productId}`,
    );
  }, [campaignDetails, productId]);

  const checkoutPath = useMemo(() => {
    const checkoutUrl = currentPath.substring(
      0,
      currentPath.lastIndexOf('/products'),
    );

    return checkoutUrl;
  }, [currentPath]);

  const handleChooseGiftClick = useCallback(async () => {
    try {
      addCartItem && (await addCartItem(productId!!, quantity!!));

      // only show toast if we are actually adding to a cart in multiple
      // selection
      if (campaignDetails?.product_selection_mode === 'MULTIPLE') {
        toast.success(t('cart.itemAdded'));
      } else {
        router.push(`${checkoutPath}/checkout?id=${id}`);
      }
    } catch {
      // only show toast if we are actually adding to a cart in multiple
      // selection
      if (campaignDetails?.product_selection_mode === 'MULTIPLE') {
        toast.error(t('cart.itemNotAdded'));
      }
    }
  }, [
    campaignDetails,
    productId,
    quantity,
    t,
    addCartItem,
    router,
    checkoutPath,
    id,
  ]);

  return (
    <div className="w-full md:max-w-[442px]">
      <h2 className="font-bold text-xl text-[#363839] leading-[30px]">
        {productName}
      </h2>
      <div className="flex items-center my-3 gap-4">
        {!!additionalPrice && (
          <div className="inline-flex border border-extra-cost-background-2 bg-extra-cost-background-1 rounded-lg">
            <span className="bg-extra-cost-background-2 text-extra-cost-text-color !text-[13px] font-medium leading-6 flex justify-center items-center px-2 rounded-[7px]">
              {t('products.additional')}
            </span>
            <span className="!text-[15px] font-semibold leading-6 flex justify-center items-center gap-0.5 px-2">
              {t('currencySymbol')}
              {additionalPrice}
            </span>
          </div>
        )}
        {!!exchangeValue && (
          <div className="border border-[#2B324C] rounded-lg px-2 py-[2px] text-[#2B324C] font-medium text-[13px]">
            {t('products.value')} {t('currencySymbol')}
            {exchangeValue}
          </div>
        )}
      </div>
      <p className='"font-normal text-sm text-[#868788] leading-[22px] whitespace-pre-wrap'>
        {description}
      </p>
      <div className="border border-dashed border-[#919EAB33] mt-4 mb-4"></div>
      <div className="flex gap-4">
        <SharePopover link={shareLink} productName={productName} />
        <Button
          color="primary"
          size="lg"
          className="w-full lg:w-90 font-bold"
          onClick={handleChooseGiftClick}
          isDisabled={orderFound}
        >
          {t('button.gift')}
        </Button>
      </div>
      {orderFound && (
        <div className="text-red-600 text-small mt-5">
          <div className="flex">
            <RiAlertFill size="25" style={{ marginTop: '-3px' }} />
            {t('alreadyChoseProduct')}
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;
