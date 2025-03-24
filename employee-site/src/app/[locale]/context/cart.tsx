'use client';

import { useParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useCurrentLocale } from '@/locales/client';
import {
  addProductToCart,
  fetchCartProducts,
  getList,
  updateCartProductQuantity,
} from '@/services/api';
import { ProductCart } from '@/types/product';
import { sortProductImages } from '@/utils/product';

import { CampaignContext } from './campaign';

type ContextType = {
  cart: ProductCart[];
  fetchCartItems?: (showList?: boolean) => void;
  clearCart: () => void;
  addCartItem?: (
    productId: number,
    quantity: number,
    variations?: Record<string, string>,
  ) => Promise<void>;
  updateCartItemQuantity?: (
    productId: number,
    newQuantity: number,
    variations: object,
  ) => Promise<void>;
  isShowCart?: boolean;
  showCart: (value: boolean) => void;
  showList: (value: boolean) => void;
  showOfferList?: boolean;
  setShowOfferList: (value: boolean) => void;
  offerList?: boolean;
  setOfferList?: (value: boolean) => void;
  includedTax: boolean;
  setIncludedTax: (value: boolean) => void;
};

export const CartContext = createContext<ContextType>({
  cart: [],
  clearCart: () => {},
  showCart: (_: boolean) => {},
  showList: (_: boolean) => {},
  setShowOfferList: (_: boolean) => {},
  includedTax: false,
  setIncludedTax: (_: boolean) => {},
});

export function CartWrapper({ children }: { children: ReactNode }) {
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const locale = useCurrentLocale();
  const { campaignType, campaignDetails } = useContext(CampaignContext);

  const [cartProducts, setCartProducts] = useState<ProductCart[]>([]);
  const [isShowCart, setIsShowCart] = useState<boolean>(false);
  const [showOfferList, setShowOfferList] = useState<boolean>(false);
  const [offerList, setOfferList] = useState<boolean>(false);
  const [includedTax, setIncludedTax] = useState<boolean>(false);

  const fetchCartItems = useCallback(
    (showList = false) => {
      if (!offerList) {
        fetchCartProducts(campaign_code, locale, campaignType ?? '')
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
      } else {
        getList(locale, includedTax)
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
      }
    },
    [campaign_code, locale, offerList, includedTax, campaignType],
  );

  const addCartItem = useCallback(
    (
      productId: number,
      quantity: number,
      variations?: Record<string, string>,
    ) => {
      const existingQuantity =
        cartProducts.find((product) => {
          if (product?.product?.id === productId) {
            const pVariations = product.variations;
            let isVariationMatched =
              (!variations || Object.keys(variations).length === 0) &&
              (!pVariations || Object.keys(pVariations).length === 0);
            if (variations && pVariations) {
              let variationMatchCount = 0;
              Object.keys(pVariations).forEach((key: string) => {
                if (pVariations[key] == variations[key]) {
                  variationMatchCount++;
                }
              });
              isVariationMatched =
                variationMatchCount === Object.keys(variations).length;
            }
            return isVariationMatched;
          }
          return false;
        })?.quantity ?? 0;
      // To consider existing quanity for the product + new quantity
      const updatedQuantity =
        campaignDetails?.product_selection_mode === 'SINGLE'
          ? 1
          : existingQuantity + quantity;
      return addProductToCart(
        campaign_code,
        locale,
        productId,
        updatedQuantity,
        variations,
        campaignType ?? '',
      ).then(() => fetchCartItems(true));
    },
    [campaign_code, cartProducts, fetchCartItems, campaignType, locale],
  );
  const showCart = (value: boolean) => {
    setIsShowCart(value);
  };
  const showList = (value: boolean) => {
    setShowOfferList(value);
  };

  const updateCartItemQuantity = useCallback(
    (productId: number, newQuantity: number, variations: object) => {
      return updateCartProductQuantity(
        campaign_code,
        locale,
        productId,
        newQuantity,
        variations,
        campaignType ?? '',
      ).then(() => fetchCartItems());
    },
    [campaign_code, fetchCartItems, campaignType, locale],
  );

  const clearCart = useCallback(() => {
    setCartProducts([]);
  }, []);

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
        clearCart,
        isShowCart,
        showCart,
        showOfferList,
        setShowOfferList,
        offerList,
        showList,
        setOfferList,
        includedTax,
        setIncludedTax,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
