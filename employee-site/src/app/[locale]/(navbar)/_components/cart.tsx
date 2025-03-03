import { Button } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { IoIosInformationCircle } from 'react-icons/io';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductCart } from '@/types/product';

import InfoPopup from './infoPopup';
import ProductCartCard from './productCart';
import SharePopover from './sharePopover';

type Props = {
  onClose: () => void;
};

const Cart: FunctionComponent<Props> = ({ onClose }) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();

  const { campaignDetails } = useContext(CampaignContext);
  const { cart, updateCartItemQuantity } = useContext(CartContext);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    setShareLink(
      `${window.location.host}/${campaignDetails?.code}/cart-details`,
    );
  }, [campaignDetails]);

  const [popup, setPopup] = useState<boolean>(false);

  const giftPrice = useMemo(
    () =>
      cart.reduce(
        (x: number, y: ProductCart) =>
          x + y.product.calculated_price * y.quantity,
        0,
      ),
    [cart],
  );

  const handleContinueButtonClick = useCallback(() => {
    router.push(`/${campaignDetails?.code}/cart`);

    onClose();
  }, [router, campaignDetails, onClose]);

  const handleDeleteProduct = async (
    productId: number,
    callBack?: (isOpen: boolean) => void,
  ) => {
    try {
      updateCartItemQuantity &&
        (await updateCartItemQuantity(productId, 0, {}));
    } catch {}
    callBack && callBack(false);
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      updateCartItemQuantity &&
        (await updateCartItemQuantity(productId, newQuantity, {}));
    } catch {}
  };

  const cartItemCount = useMemo(() => {
    return cart.reduce((x, y) => x + y.quantity, 0);
  }, [cart]);

  const budget = campaignDetails?.budget_per_employee;
  const displayedCurrency = campaignDetails?.displayed_currency;

  return (
    <div className="bg-[#F6F6F6] w-[310px] md:w-[332px]">
      <div className="h-10 bg-primary flex flex-row items-center px-4">
        <FaChevronDown
          className="text-white cursor-pointer rtl:rotate-180"
          onClick={onClose}
        />
        <div className="font-bold text-sm text-white flex flex-1 justify-end gap-2">
          <Image
            src="/money-bag.svg"
            alt="Money Bag"
            width={28}
            height={28}
            className="md:hidden"
          />
          {displayedCurrency === 'POINT' ? t('cart.points') : t('cart.budget')}{' '}
          <span className="text-[#C1E0CE]">
            {budget && <MultiSelectPrice price={budget} />}
          </span>
        </div>
      </div>
      <p className={`text-sm mx-4 h-10 flex items-center justify-end gap-2`}>
        <span>
          {displayedCurrency === 'POINT'
            ? t('cart.leftPoints')
            : t('cart.leftBudget')}{' '}
        </span>
        {budget && (
          <MultiSelectPrice
            price={budget > giftPrice ? budget - giftPrice : 0}
          />
        )}
      </p>
      {cart.length === 0 ? (
        <div className="h-[260px] md:h-[131px] bg-white flex justify-center pt-6">
          <h4 className="font-semibold text-base text-center w-[170px]">
            {t('cart.empty')}
          </h4>
        </div>
      ) : (
        <div className="bg-white">
          <div
            className="p-4 gap-4 ltr:mr-1 rtl:ml-1 md:ltr:mr-0 md:rtl:ml-0 flex flex-col max-h-[335px] overflow-y-scroll 
          min-[768px]:[&::-webkit-scrollbar]:w-[6px] min-[768px]:[&::-webkit-scrollbar-thumb]:bg-[#868788] min-[768px]:[&::-webkit-scrollbar-thumb]:rounded-xl
          max-[768px]:[&::-webkit-scrollbar]:w-[6px] max-[768px]:[&::-webkit-scrollbar-thumb]:bg-[#868788] max-[768px]:[&::-webkit-scrollbar-thumb]:rounded-xl"
          >
            <label className=" font-semibold text-base">
              {cartItemCount}{' '}
              {cartItemCount === 1 ? t('common.item') : t('common.itemPlural')}
            </label>
            <div className="flex flex-col gap-4">
              {cart
                .sort((a, b) => {
                  if (
                    a.product.product_kind === 'MONEY' &&
                    b.product.product_kind !== 'MONEY'
                  ) {
                    return 1;
                  }
                  if (
                    a.product.product_kind !== 'MONEY' &&
                    b.product.product_kind === 'MONEY'
                  ) {
                    return -1;
                  }
                  return 0;
                })
                .map((cartItem, idx) => (
                  <ProductCartCard
                    key={idx}
                    cartItem={cartItem}
                    showDelete={true}
                    budgetLeft={budget ? budget - giftPrice : 0}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="m-4">
        <div className="flex flex-row items-center justify-between m-4">
          <h5 className="font-normal text-sm text-primary-100">
            {t('cart.giftPrice')}
          </h5>
          <h5 className="font-normal text-sm text-primary-100">
            <MultiSelectPrice price={giftPrice} />
          </h5>
        </div>
        <div className="flex flex-row items-center justify-between m-4">
          <h5 className="font-normal text-sm text-primary-100">
            {displayedCurrency === 'POINT'
              ? t('cart.points')
              : t('cart.budget')}
          </h5>
          <h5 className="font-normal text-sm text-primary-100">
            {budget && <MultiSelectPrice price={budget} />}
          </h5>
        </div>
        <div className="flex flex-row items-center justify-between m-4">
          <h5 className="font-normal text-sm text-primary-100">
            {displayedCurrency === 'POINT'
              ? t('cart.leftPoints')
              : t('cart.leftBudget')}
          </h5>
          <div className="flex items-center gap-1 relative">
            <span className="flex gap-1">
              <InfoPopup popup={popup} setPopup={setPopup}>
                <IoIosInformationCircle
                  size={18}
                  className="text-emerald-300 cursor-pointer"
                  onClick={() => setPopup(!popup)}
                />
              </InfoPopup>

              <MultiSelectPrice
                price={budget && budget > giftPrice ? budget - giftPrice : 0}
              />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between h-8 border-t-1">
          <h4
            className={`font-semibold text-base ${currentLocale === 'en' ? 'ml-4' : 'mr-4'}`}
          >
            {t('common.total')}
          </h4>
          <h4
            className={`font-semibold text-base ${currentLocale === 'en' ? 'mr-4' : 'ml-4'}`}
          >
            {budget && (
              <MultiSelectPrice
                price={budget > giftPrice ? 0 : giftPrice - budget}
              />
            )}
          </h4>
        </div>
        <div className="flex items-center justify-between gap-2 pt-4">
          <SharePopover height link={shareLink} />
          <Button
            color="primary"
            className="font-bold flex-1"
            onClick={handleContinueButtonClick}
          >
            {t('cart.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
