'use client';

import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useCurrentLocale, useI18n } from '@/locales/client';
import { fetchQuickShareItems, fetchShareItems } from '@/services/api';

interface ProductImage {
  image: string;
}

interface Product {
  images: ProductImage[];
  name: string;
  calculated_price: number;
  sku: string;
  quantity: number;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  displayed_currency: string;
}

interface CartDetails {
  products: CartItem[];
}

interface Cart {
  products: CartItem[];
  cart: CartDetails;
  budget_per_employee: number;
  displayed_currency: string;
}

type Props = Record<string, never>;

const CartDetailPage: FunctionComponent<Props> = () => {
  const t = useI18n();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const shareId = searchParams.get('share') || '';
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const [cart, setCart] = useState<Cart | null>(null);

  const fetchCartItems = useCallback(
    (shareId: string) => {
      if (!shareId) return;

      fetchQuickShareItems(campaign_code, shareId, locale)
        .then((cartItems) => {
          setCart(cartItems || null);
        })
        .catch(() => {
          // Ignore errors, since the main one is 404 which just means no cart was
          // created for this user yet
        });
    },
    [campaign_code, locale],
  );

  useEffect(() => {
    fetchCartItems(shareId);
  }, [fetchCartItems, shareId]);

  // Calculate the total gift price by summing up the price for each product
  const giftPrice =
    cart?.cart?.products?.reduce((total, item) => {
      const itemPrice =
        (item.quantity ?? 0) * (item.product?.calculated_price ?? 0);
      return total + itemPrice;
    }, 0) ?? 0;

  const cartBudget = cart?.budget_per_employee ?? 0;

  // Calculate the total price considering the budget
  const totalPrice = giftPrice - cartBudget > 0 ? giftPrice - cartBudget : 0;

  // Calculate the remaining budget
  const leftBudget = cartBudget - giftPrice > 0 ? cartBudget - giftPrice : 0;

  return (
    <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 mr-0 lg:mr-6 h-[450px] overflow-auto">
          {cart?.cart?.products?.map((item) => (
            <div className="flex flex-row" key={item?.id}>
              <div className="w-[100%] h-auto max-w-[149px] max-h-[149px] md:max-w-[270px] md:max-h-[270px] rounded-2xl shadow-t-lg m-1">
                {item.product.images.length > 0 && (
                  <Image
                    src={item.product.images[0].image}
                    width={254}
                    height={254}
                    alt="Product Image"
                    className="rounded-2xl w-full h-full object-cover p-2"
                  />
                )}
              </div>
              <div
                className={`${locale === 'en' ? 'ml-7' : 'mr-7'} mt-0 md:mt-8`}
              >
                <Image
                  src="/logo.svg"
                  width={80}
                  height={22}
                  alt="Organization Logo"
                />
                <h4 className="font-normal text-[#363839] text-sm pt-2 md:pt-4 pb-3 w-[170px] md:w-[238px]">
                  {item?.product?.name}
                </h4>
                <div className="border-t-1 border-b-1 pt-1 pb-1 md:pt-2 md:pb-2">
                  <span className="font-semibold text-sm text-[#363839]">
                    {t('cart.quantity')}:
                  </span>
                  <span
                    className={`font-normal text-[#363839] text-sm ${locale === 'en' ? 'pl-2' : 'pr-2'}`}
                  >
                    {item?.quantity}
                  </span>
                </div>
                <div className="border-t-1 border-b-1 pt-1 pb-1 md:pt-2 md:pb-2">
                  <span className="font-semibold text-sm text-[#363839]">
                    {t('cart.sku')}:
                  </span>
                  <span
                    className={`font-normal text-[#363839] text-sm ${locale === 'en' ? 'pl-2' : 'pr-2'}`}
                  >
                    {item?.product?.sku}
                  </span>
                </div>
                <h3 className="font-semibold text-base pt-4 flex gap-1">
                  {cart?.displayed_currency !== 'COINS' ? (
                    t('currencySymbol')
                  ) : (
                    <Image src="/coin.svg" alt="coin" height={20} width={20} />
                  )}

                  {item?.product?.calculated_price}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div>
          <Card
            classNames={{
              base: 'p-4 w-full lg:w-86 shadow-t-lg mt-10 md:mt-0',
            }}
          >
            <CardHeader className="text-lg font-bold">
              {t('order.offerSummary')}
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4 text-sm">
                <Divider />
                <div className="flex justify-between text-base font-semibold">
                  <span>{t('common.total')}</span>
                  <span>
                    {cart?.displayed_currency !== 'COINS' ? (
                      `${t('currencySymbol')}${totalPrice}`
                    ) : (
                      <span className="flex gap-1">
                        <Image
                          src="/coin.svg"
                          alt="coin"
                          height={18}
                          width={18}
                        />
                        {totalPrice}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartDetailPage;
