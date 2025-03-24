'use client';

import { Icon } from '@iconify/react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  Tooltip,
  TableRow,
  Input,
} from '@nextui-org/react';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n, useCurrentLocale } from '@/locales/client';
import ConfirmationModal from '@/shared/modal';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductCart } from '@/types/product';
import { isQuickOfferCampaign } from '@/utils/campaign';
import { CHECKOUT_LOCATION_GLOBAL } from '@/utils/const';

import BackLink from '../../_components/backLink';
import OfferSummary from '../checkout/_components/offerSummary';
import OrderSummary from '../checkout/_components/orderSummary';

export default function Page() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();

  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const { cart, fetchCartItems, updateCartItemQuantity, setOfferList } =
    useContext(CartContext);

  const displayedCurrency = campaignDetails?.displayed_currency;

  const columns = [
    {
      key: 'title',
      label: t('cart.product'),
    },
    {
      key: 'price',
      label: t('cart.price'),
    },
    {
      key: 'quantity',
      label: t('cart.quantity'),
    },
    {
      key: 'totalPrice',
      label:
        displayedCurrency === 'POINT'
          ? t('cart.totalPoints')
          : t('cart.total_price'),
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  const discountColumns = [
    {
      key: 'title',
      label: t('cart.voucher'),
    },
    {
      key: 'value',
      label: t('cart.value'),
    },
    {
      key: 'budget',
      label:
        displayedCurrency === 'POINT'
          ? t('cart.above_points')
          : t('cart.above_budget'),
    },
    {
      key: 'discount',
      label: t('cart.discount'),
    },
    {
      key: 'totalPrice',
      label:
        displayedCurrency === 'POINT'
          ? t('cart.totalPoints')
          : t('cart.total_price'),
    },
    {
      key: 'actions',
      label: '',
    },
  ];
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [giftPrice, setGiftPrice] = useState<number>(0);

  useEffect(() => {
    // re-fetch cart items on page load so that we don't present stale data if
    // it was modified in another session
    fetchCartItems && fetchCartItems();
  }, [fetchCartItems]);

  useEffect(() => {
    const totalGiftPrice = cart.reduce((total, product) => {
      if (
        campaignDetails?.campaign_type === 'quick_offer_code' &&
        product.product.product_kind === 'MONEY'
      ) {
        return total;
      }
      return total + product.product.calculated_price * product.quantity;
    }, 0);
    setGiftPrice(totalGiftPrice);
    localStorage?.setItem('giftPrice', JSON.stringify(totalGiftPrice));
  }, [cart]);

  useEffect(() => {
    if (isQuickOfferCampaign(campaignType ?? '')) {
      if (setOfferList) {
        setOfferList(true);
      }
    }
  }, [campaignDetails, setOfferList, campaignType]);

  const handleCartSubmit = useCallback(() => {
    router.push(`/${campaignDetails?.code}/checkout`);
  }, [router, campaignDetails]);

  const handleDeleteProduct = async (id: number) => {
    try {
      updateCartItemQuantity && (await updateCartItemQuantity(id, 0, {}));
    } catch {}

    setDeleteProductId(null);
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      const product = cart.find((item) => item.product.id === productId);

      if (!product) return;

      // // Check if new quantity is within the allowed range
      if (newQuantity > product.product.remaining_quantity) {
        return;
      }

      if (newQuantity === 0) {
        setDeleteProductId(productId);
      } else {
        updateCartItemQuantity &&
          (await updateCartItemQuantity(
            productId,
            newQuantity,
            product.variations,
          ));
      }
    } catch {
      fetchCartItems && fetchCartItems();
    }
  };

  const calculateTotalPrice = (price: number, quantity: number) => {
    return price * quantity;
  };

  const cartTotalPrice = useMemo(
    () =>
      cart.reduce(
        (x: number, y: ProductCart) =>
          x + y.product.calculated_price * y.quantity,
        0,
      ),
    [cart],
  );

  const giftBudget = campaignDetails?.budget_per_employee || 0;
  const isCheckoutLocationGlobal =
    campaignDetails?.check_out_location === CHECKOUT_LOCATION_GLOBAL;

  const renderCell = (row: ProductCart, columnKey: string) => {
    switch (columnKey) {
      case 'title':
        return (
          <div className="flex items-center gap-4">
            <div className="w-[64px]">
              {row.product.images.length > 0 && (
                <Image
                  src={row.product.images[0].image}
                  height={64}
                  width={64}
                  alt="product image"
                  onClick={() => {
                    router.push(
                      `/${campaignDetails?.code}/products/${row.product.id}`,
                    );
                  }}
                  className="rounded-2xl cursor-pointer"
                />
              )}
            </div>
            <div className="w-[200px]">
              <Tooltip content={row.product.name} delay={2000}>
                <span
                  onClick={() => {
                    router.push(
                      `/${campaignDetails?.code}/products/${row.product.id}`,
                    );
                  }}
                  className="max-w-[250px] font-semibold text-ellipsis whitespace-nowrap overflow-hidden cursor-pointer"
                >
                  {row.product.name}
                </span>
              </Tooltip>
              <div className="mt-1 flex flex-wrap flex-row">
                {Object.entries(row.variations ?? {}).map(([k, v], i) => (
                  <div
                    key={i}
                    className="text-xs leading-[18px] flex basis-1/2"
                  >
                    <span className="capitalize">{k}:&nbsp;</span>
                    <span className="text-text-secondary">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'price':
        return <MultiSelectPrice price={row.product.calculated_price} />;
      case 'quantity':
        return (
          <div className="flex items-center gap-3 w-max border-1 rounded-lg">
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className={`text-primary-100 border-r-1 rounded-r-none ${currentLocale === 'he' ? 'order-2' : 'order-0'}`}
              onClick={() => {
                const newQuantity = Math.max(0, row.quantity - 1);
                updateQuantity(row.product.id, newQuantity);
              }}
            >
              <FaMinus size={14} />
            </Button>
            {isQuickOfferCampaign(campaignDetails?.campaign_type) ? (
              <Input
                type="number"
                variant="bordered"
                size="sm"
                classNames={{
                  base: 'w-8 order-1',
                  inputWrapper: 'border-none p-0 h-6 min-h-6',
                  input: 'font-semibold text-center',
                }}
                value={row?.quantity.toString()}
                onChange={(e) =>
                  updateQuantity(
                    row.product.id,
                    +(e.target as HTMLInputElement).value,
                  )
                }
              />
            ) : (
              <span className="font-semibold order-1">{row.quantity}</span>
            )}
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className={`text-primary-100 border-l-1 rounded-l-none ${currentLocale === 'en' ? 'order-2' : 'order-0'}`}
              isDisabled={
                isCheckoutLocationGlobal &&
                giftBudget - cartTotalPrice < row.product.calculated_price
              }
              onClick={() => {
                const newQuantity = row.quantity + 1;
                updateQuantity(row.product.id, newQuantity);
              }}
            >
              <FaPlus size={14} />
            </Button>
          </div>
        );
      case 'totalPrice':
        return campaignType === 'quick_offer_code' &&
          row.product.product_kind === 'MONEY' ? (
          '-'
        ) : (
          <MultiSelectPrice
            price={calculateTotalPrice(
              row.product.calculated_price,
              row.quantity,
            ).toFixed(1)}
          />
        );
      case 'discount':
        return (
          <div>
            {row.product.discount_rate != null
              ? ` ${row.product.discount_rate}%`
              : '-'}
          </div>
        );
      case 'value':
        return (
          <div>
            {row.product.voucher_value != null
              ? `${row.product.voucher_value}`
              : '-'}
          </div>
        );
      case 'budget':
        return (
          <div>
            {row.product.extra_price != null
              ? `${row.product.extra_price}`
              : '-'}
          </div>
        );
      case 'actions':
        return (
          <div className="flex items-center justify-end">
            <Tooltip color="primary" content="Delete item">
              <span className="text-lg text-primary-100 cursor-pointer active:opacity-50">
                <Button
                  isIconOnly
                  variant="light"
                  onClick={() => setDeleteProductId(row.product.id)}
                >
                  <Icon
                    className="text-[#868788]"
                    icon="solar:trash-bin-trash-bold"
                    fontSize={20}
                  />
                </Button>
              </span>
            </Tooltip>
          </div>
        );
    }
  };

  return (
    <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0 sm:pb-20 pb-0">
      <div className="mb-[50px]">
        <BackLink />
      </div>
      <div className="flex flex-col lg:flex-row">
        <div
          className={`flex-1 mr-0 ${
            currentLocale === 'en' ? 'lg:mr-6' : 'lg:ml-6'
          }`}
        >
          <Card
            classNames={{
              base: 'mb-4',
              header: 'text-lg font-bold p-6',
              body: 'p-0 rounded-none',
            }}
          >
            <CardHeader>
              <span>
                {isQuickOfferCampaign(campaignType ?? '')
                  ? `${t('cart.giftList')}`
                  : `${t('cart.cart')}`}{' '}
                {`(${cart?.length})`}
              </span>
            </CardHeader>
            <CardBody>
              <>
                {cart.filter((item) => item.product.product_kind !== 'MONEY')
                  .length > 0 && (
                  <Table
                    classNames={{
                      wrapper: 'p-0 rounded-none',
                      th: 'first:rounded-none last:rounded-none text-sm first:pl-4 last:pr-4 py-4 min-w-24 last:min-w-0',
                    }}
                  >
                    <TableHeader columns={columns}>
                      {(column) => (
                        <TableColumn
                          className="text-[#868788]"
                          key={column.key}
                        >
                          <div
                            className={`${column?.label === 'Quantity' ? 'flex justify-center items-center' : ''}`}
                          >
                            {column.label}
                          </div>
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody
                      items={cart.filter(
                        (item) => item.product.product_kind !== 'MONEY',
                      )}
                    >
                      {(item) => (
                        <TableRow key={item.id}>
                          {(columnKey) => (
                            <TableCell className="border-b border-[#919EAB33] border-dashed pt-[10px] pb-[10px]">
                              <div
                                className={`${columnKey === 'quantity' ? 'flex justify-center items-center' : ''}`}
                              >
                                {renderCell(item, columnKey as string)}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
                {cart.filter((item) => item.product.product_kind === 'MONEY')
                  .length > 0 && (
                  <Table
                    classNames={{
                      wrapper: 'p-0 rounded-none',
                      th: 'first:rounded-none last:rounded-none text-sm first:pl-4 last:pr-4 py-4 min-w-24 last:min-w-0',
                    }}
                  >
                    <TableHeader columns={discountColumns}>
                      {(column) => (
                        <TableColumn
                          className="text-[#868788]"
                          key={column.key}
                        >
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody
                      items={cart.filter(
                        (item) => item.product.product_kind === 'MONEY',
                      )}
                    >
                      {(item) => (
                        <TableRow key={item.id}>
                          {(columnKey) => (
                            <TableCell className="border-b border-[#919EAB33] border-dashed pt-[10px] pb-[10px]">
                              {renderCell(item, columnKey as string)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </>
            </CardBody>
          </Card>
        </div>
        <div>
          {isQuickOfferCampaign(campaignType ?? '') ? (
            <OfferSummary
              budget={campaignDetails?.budget_per_employee ?? 0}
              offerPrice={giftPrice ?? 0}
            />
          ) : (
            <OrderSummary
              giftPrice={giftPrice}
              budget={campaignDetails?.budget_per_employee ?? 0}
              onSubmit={handleCartSubmit}
              displayProducts={false}
            />
          )}
        </div>
      </div>
      <ConfirmationModal
        onConfirm={() =>
          deleteProductId !== null && handleDeleteProduct(deleteProductId)
        }
        isOpenModal={deleteProductId !== null}
        onClose={() => setDeleteProductId(null)}
        title={t('button.deleteGift')}
        subTitle={t('checkout.warning')}
        cancelButtonText={t('button.cancel')}
        confirmButtonText={t('button.confirm')}
      />
    </div>
  );
}
