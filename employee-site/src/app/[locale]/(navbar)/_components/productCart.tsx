import { Button } from '@nextui-org/react';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { toast } from 'react-toastify';

import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n } from '@/locales/client';
import ConfirmationModal from '@/shared/modal';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductCart } from '@/types/product';

interface Props {
  cartItem: ProductCart;
}

function ProductCartCard({ cartItem }: Props) {
  const t = useI18n();

  const { updateCartItemQuantity } = useContext(CartContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDeleteProduct = async (id: number) => {
    try {
      updateCartItemQuantity && (await updateCartItemQuantity(id, 0));

      toast.success(t('cart.deleteProductSuccess'));
    } catch {
      toast.error(t('cart.deleteProductError'));
    }
    setIsOpen(false);
  };

  const updateQuantity = async (newQuantity: number) => {
    try {
      updateCartItemQuantity &&
        (await updateCartItemQuantity(cartItem.product.id, newQuantity));

      toast.success(t('cart.success'));
    } catch {
      toast.error(t('cart.error'));
    }
  };

  return (
    <div className="h-[120px] w-full relative flex gap-4">
      <div className="w-[120px] h-full">
        {cartItem.product.images.length > 0 && (
          <Image
            src={cartItem.product.images[0].image}
            fill
            alt="product Image"
            className="!relative rounded-[10px] object-cover"
          />
        )}
      </div>
      <div className="h-full flex flex-col justify-between">
        <label className="font-sans font-semibold text-sm leading-[22px]">
          <MultiSelectPrice price={cartItem.product.calculated_price} />
        </label>
        <label className="ltr:font-sans font-light ltr:font-normal text-sm leading-[22px] text-text-secondary">
          {cartItem.product.name}
        </label>
        <div className="flex items-center gap-3 w-max border-1 rounded-lg">
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="text-primary-100 border-r-1 rounded-r-none h-6"
            onClick={() => updateQuantity(Math.max(0, cartItem.quantity - 1))}
          >
            <FaMinus size={14} />
          </Button>
          <span className="font-semibold text-sm">{cartItem.quantity}</span>
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="text-primary-100 border-l-1 rounded-l-none h-6"
            onClick={() => updateQuantity(cartItem.quantity + 1)}
          >
            <FaPlus size={14} />
          </Button>
        </div>
      </div>
      <ConfirmationModal
        onConfirm={() => handleDeleteProduct(cartItem.product.id)}
        isOpenModal={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('button.deleteGift')}
        subTitle={t('checkout.warning')}
        cancelButtonText={t('button.cancel')}
        confirmButtonText={t('button.confirm')}
      />
    </div>
  );
}

export default ProductCartCard;
