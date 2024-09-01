'use client';

import { useParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  addProductToCart,
  fetchCartProducts,
  updateCartProductQuantity,
} from '@/services/api';
import { ProductCart } from '@/types/product';
import { sortProductImages } from '@/utils/product';

type ContextType = {
  cart: ProductCart[];
  fetchCartItems?: () => void;
  addCartItem?: (productId: number, quantity: number) => Promise<void>;
  updateCartItemQuantity?: (
    productId: number,
    newQuantity: number,
  ) => Promise<void>;
};

export const CartContext = createContext<ContextType>({ cart: [] });

export function CartWrapper({ children }: { children: ReactNode }) {
  const { campaign_code } = useParams<{ campaign_code: string }>();

  const [cartProducts, setCartProducts] = useState<ProductCart[]>([]);

  const fetchCartItems = useCallback(() => {
    fetchCartProducts(campaign_code)
      .then((cartResponse: { products: ProductCart[] }) => {
        const cartItems = cartResponse.products;

        // sort product images so we have the main image first for each item
        for (const item of cartItems) {
          sortProductImages(item.product.images);
        }

        setCartProducts(cartItems);
      })
      .catch(() => {
        // ignore errors since the main one is 404 which just means no cart was
        // created for this user yet
      });
  }, [campaign_code]);

  const addCartItem = useCallback(
    (productId: number, quantity: number) => {
      return addProductToCart(campaign_code, productId, quantity).then(() =>
        fetchCartItems(),
      );
    },
    [campaign_code, fetchCartItems],
  );

  const updateCartItemQuantity = useCallback(
    (productId: number, newQuantity: number) => {
      return updateCartProductQuantity(
        campaign_code,
        productId,
        newQuantity,
      ).then(() => fetchCartItems());
    },
    [campaign_code, fetchCartItems],
  );

  useEffect(() => {
    // fetch cart when the context is mounted
    fetchCartItems();
  }, [fetchCartItems]);

  return (
    <CartContext.Provider
      value={{
        cart: cartProducts,
        fetchCartItems,
        addCartItem,
        updateCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
