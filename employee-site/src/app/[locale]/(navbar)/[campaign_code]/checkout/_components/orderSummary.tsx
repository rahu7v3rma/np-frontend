'use client';

import { Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { IoIosInformationCircle } from 'react-icons/io';

import InfoPopup from '@/app/[locale]/(navbar)/_components/infoPopup';
import SharePopover from '@/app/[locale]/(navbar)/_components/sharePopover';
import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';

interface Props {
  giftPrice: number;
  budget: number;
  displayProducts?: boolean;
  submitDisabled?: boolean;
  onSubmit: () => void;
  productLinks?: boolean;
}

export default function OrderSummary({
  giftPrice,
  budget,
  displayProducts = true,
  submitDisabled = false,
  onSubmit,
  productLinks = true,
}: Props) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { cart } = useContext(CartContext);
  const [shareLink, setShareLink] = useState('');
  const id = useParams<{ id: string }>();
  const { campaign_code } = useParams<{
    campaign_code: string;
  }>();
  const [popup, setPopup] = useState<boolean>(false);
  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const router = useRouter();

  const displayedCurrency = campaignDetails?.displayed_currency;

  const hasMoneyProduct = cart.some(
    (item) => item.product.product_kind === 'MONEY',
  );

  useEffect(() => {
    setShareLink(`${window.location.host}/${campaign_code}/cart-details`);
  }, [campaign_code]);

  return (
    <div className="w-full lg:w-86">
      <Card
        classNames={{
          base: 'p-3 w-full',
        }}
      >
        <CardHeader className="text-lg font-bold leading-7">
          {t('order.summary')}
        </CardHeader>
        <CardBody className="p-3">
          <div>
            {cart?.length > 0 && displayProducts && (
              <>
                <div className="border-t-1 border-dotted border-[#919EAB33] w-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <h4 className="text-primary text-base leading-6 font-semibold">
                    {cart?.length} {t('common.item')}
                  </h4>
                </div>
                {cart?.map(({ product, variations }) => (
                  <div className="flex gap-4 mt-6" key={product?.id}>
                    <div className=" w-[77px] h-[77px] rounded-[6.42px]">
                      <Image
                        src={product.images[0]?.image || '/product-jacket.png'}
                        alt={'Product Image'}
                        width={96}
                        height={96}
                        onClick={
                          productLinks
                            ? () => {
                                router.push(
                                  `/${campaignDetails?.code}/products/${product.id}`,
                                );
                              }
                            : undefined
                        }
                        className={productLinks ? 'cursor-pointer' : ''}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="flex font-semibold text-sm mt-1 leading-[22px]">
                        <MultiSelectPrice price={product?.calculated_price} />
                      </span>
                      <p
                        onClick={
                          productLinks
                            ? () => {
                                router.push(
                                  `/${campaignDetails?.code}/products/${product.id}`,
                                );
                              }
                            : undefined
                        }
                        className={`
                          flex 
                          text-[#868788] 
                          font-normal 
                          text-sm 
                          leading-[22px] 
                          ltr:mr-4
                          rtl:ml-4
                          ${productLinks ? 'cursor-pointer' : ''}`}
                      >
                        {product?.name}
                      </p>
                      <div className="flex flex-wrap">
                        {Object.entries(variations ?? {}).map(([k, v], i) => (
                          <div
                            className={`text-xs leading-[18px] flex basis-1/2`}
                            key={i}
                          >
                            <label className="capitalize">{k}:&nbsp;</label>
                            <label className="text-text-secondary">{v}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {campaignType !== 'quick_offer_code' && (
                  <div className="border-t-1 border-dotted border-[#919EAB33] w-full mt-10 mb-4"></div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {campaignType !== 'quick_offer_code' && (
              <>
                <div className="flex justify-between mt-[12px]">
                  <span className="font-normal text-sm leading-[22px]">
                    {t('order.giftPrice')}
                  </span>
                  <span className="text-primary-100 font-normal text-sm leading-[22px]">
                    <MultiSelectPrice price={giftPrice} />
                  </span>
                </div>
                <div className="flex justify-between mt-[12px]">
                  <span className="font-normal text-sm leading-[22px]">
                    {displayedCurrency === 'POINT'
                      ? t('order.points')
                      : t('order.budget')}
                  </span>
                  <span className="text-primary-100 font-normal text-sm leading-[22px]">
                    <MultiSelectPrice price={budget} />
                  </span>
                </div>
                <div className="flex justify-between text-emerald-300 mt-[12px]">
                  <span className="font-normal text-sm leading-[22px]">
                    {displayedCurrency === 'POINT'
                      ? t('order.pointsLeft')
                      : t('order.budgetLeft')}
                  </span>
                  <span className="flex items-center gap-1 relative">
                    <span className="flex gap-1">
                      <InfoPopup
                        popup={popup}
                        setPopup={setPopup}
                        voucherProduct={hasMoneyProduct}
                      >
                        <IoIosInformationCircle
                          size={18}
                          className="cursor-pointer"
                          onClick={() => setPopup(!popup)}
                        />
                      </InfoPopup>
                      <MultiSelectPrice
                        price={budget - giftPrice > 0 ? budget - giftPrice : 0}
                      />
                    </span>
                  </span>
                </div>
              </>
            )}
            <Divider
              className={
                campaignType === 'quick_offer_code' ? `mt-10 mb-4` : ''
              }
            />
            <div className="flex justify-between font-semibold leading-6 text-base">
              <span>{t('common.total')}</span>
              <MultiSelectPrice
                price={giftPrice - budget > 0 ? giftPrice - budget : 0}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="flex mt-6 gap-4">
        <SharePopover link={shareLink} />
        <Button
          color="primary"
          size="lg"
          className={`flex-1 ${campaignDetails?.campaign_type !== 'WALLET' ? displayProducts && budget > giftPrice && 'bg-button-background-1 text-button-text-color-1' : ''}`}
          isDisabled={submitDisabled}
          onClick={onSubmit}
        >
          {displayProducts
            ? giftPrice > budget
              ? t('common.approveAndPay')
              : t('common.approve')
            : t('button.continue')}
        </Button>
      </div>
      {campaignDetails?.campaign_type !== 'WALLET' &&
        displayProducts &&
        budget > giftPrice && (
          <div className="flex mt-6 pt-2 pl-3 gap-1">
            <Image
              src="/alert.svg"
              height={16}
              width={16}
              alt="alert image"
              className="mb-auto"
            />
            <label className="ltr:font-sans font-normal text-xs leading-[18px] text-alert">
              {t('checkout.budgetAlert')}
            </label>
          </div>
        )}
    </div>
  );
}
