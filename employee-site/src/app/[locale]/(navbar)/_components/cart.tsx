import { Button } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { IoIosInformationCircle } from 'react-icons/io';
import { IoShareSocialSharp } from 'react-icons/io5';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductCart } from '@/types/product';

import ProductCartCard from './productCart';

type Props = {
  onClose: () => void;
};

const Cart: FunctionComponent<Props> = ({ onClose }) => {
  const t = useI18n();
  const router = useRouter();

  const { campaignDetails } = useContext(CampaignContext);
  const { cart } = useContext(CartContext);

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

  const cartItemCount = useMemo(() => {
    return cart.reduce((x, y) => x + y.quantity, 0);
  }, [cart]);

  const budget = campaignDetails?.budget_per_employee;

  return (
    <div className="bg-gray-100 w-[310px] md:w-[332px]">
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
          {t('cart.budget')}{' '}
          <span className="text-[#C1E0CE]">
            {budget && <MultiSelectPrice price={budget} />}
          </span>
        </div>
      </div>
      <p className={`text-sm mx-4 h-10 flex items-center justify-end gap-2`}>
        <span>{t('cart.leftBudget')} </span>
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
        <div className="p-4 bg-white gap-4 flex flex-col max-h-[335px] overflow-scroll">
          <label className=" font-semibold text-base">
            {cartItemCount}{' '}
            {cartItemCount === 1 ? t('common.item') : t('common.itemPlural')}
          </label>
          {cart.map((cartItem, idx) => (
            <ProductCartCard key={idx} cartItem={cartItem} />
          ))}
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
            {t('cart.budget')}
          </h5>
          <h5 className="font-normal text-sm text-primary-100">
            {budget && <MultiSelectPrice price={budget} />}
          </h5>
        </div>
        <div className="flex flex-row items-center justify-between m-4">
          <h5 className="font-normal text-sm text-primary-100">
            {t('cart.leftBudget')}
          </h5>
          <div className="flex items-center gap-1">
            <IoIosInformationCircle size={14} className="text-emerald-300" />
            <h5 className="font-normal text-sm text-primary-100">
              {budget && (
                <MultiSelectPrice
                  price={budget > giftPrice ? budget - giftPrice : 0}
                />
              )}
            </h5>
          </div>
        </div>
        <div className="flex items-center justify-between h-8 border-t-1">
          <h4 className="font-semibold text-base ml-4">{t('common.total')}</h4>
          <h4 className="font-semibold text-base mr-4">
            {budget && (
              <MultiSelectPrice
                price={budget > giftPrice ? 0 : giftPrice - budget}
              />
            )}
          </h4>
        </div>
        <div className="flex items-center justify-between gap-2 pt-4">
          <Button variant="bordered" size="md" isIconOnly className="w-16">
            <IoShareSocialSharp size={20} />
          </Button>
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
