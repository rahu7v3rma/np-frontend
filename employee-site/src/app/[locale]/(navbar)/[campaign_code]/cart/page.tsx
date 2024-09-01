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
} from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { toast } from 'react-toastify';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useI18n, useCurrentLocale } from '@/locales/client';
import ConfirmationModal from '@/shared/modal';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductCart } from '@/types/product';

import BackLink from '../../_components/backLink';
import OrderSummary from '../checkout/_components/orderSummary';

export default function Page() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();

  const { campaignDetails } = useContext(CampaignContext);
  const { cart, updateCartItemQuantity } = useContext(CartContext);

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
      label: t('cart.total_price'),
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [giftPrice, setGiftPrice] = useState<number>(0);

  useEffect(() => {
    const totalGiftPrice = cart.reduce((total, product) => {
      return total + product.product.calculated_price * product.quantity;
    }, 0);
    setGiftPrice(totalGiftPrice);
    localStorage?.setItem('giftPrice', JSON.stringify(totalGiftPrice));
  }, [cart]);

  const handleCartSubmit = useCallback(() => {
    router.push(`/${campaignDetails?.code}/checkout`);
  }, [router, campaignDetails]);

  const handleDeleteProduct = async (id: number) => {
    try {
      updateCartItemQuantity && (await updateCartItemQuantity(id, 0));

      toast.success(t('cart.deleteProductSuccess'));
    } catch {
      toast.error(t('cart.deleteProductError'));
    }

    setDeleteProductId(null);
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      updateCartItemQuantity &&
        (await updateCartItemQuantity(productId, newQuantity));

      toast.success(t('cart.success'));
    } catch {
      toast.error(t('cart.error'));
    }
  };

  const calculateTotalPrice = (price: number, quantity: number) => {
    return price * quantity;
  };

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
                  className="rounded-2xl"
                />
              )}
            </div>
            <Tooltip content={row.product.name} delay={2000}>
              <span className="max-w-[250px] font-semibold text-ellipsis whitespace-nowrap overflow-hidden">
                {row.product.name}
              </span>
            </Tooltip>
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
              className="text-primary-100 border-r-1 rounded-r-none"
              onClick={() =>
                updateQuantity(row.product.id, Math.max(0, row.quantity - 1))
              }
            >
              <FaMinus size={14} />
            </Button>
            <span className="font-semibold">{row.quantity}</span>
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className="text-primary-100 border-l-1 rounded-l-none"
              onClick={() => updateQuantity(row.product.id, row.quantity + 1)}
            >
              <FaPlus size={14} />
            </Button>
          </div>
        );
      case 'totalPrice':
        return (
          <MultiSelectPrice
            price={calculateTotalPrice(
              row.product.calculated_price,
              row.quantity,
            )}
          />
        );
      case 'actions':
        return (
          <div className="flex items-center">
            <Tooltip color="primary" content="Delete item">
              <span className="text-lg text-primary-100 cursor-pointer active:opacity-50">
                <Icon
                  icon="solar:trash-bin-trash-bold"
                  fontSize={20}
                  onClick={() => setDeleteProductId(row.product.id)}
                />
              </span>
            </Tooltip>
          </div>
        );
    }
  };

  return (
    <div className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <BackLink />
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
              <span>{t('cart.cart')}</span>
            </CardHeader>
            <CardBody>
              <Table
                classNames={{
                  wrapper: 'p-0 rounded-none pb-4',
                  th: 'first:rounded-none last:rounded-none text-sm first:pl-4 last:pr-4 py-4 min-w-24 last:min-w-0',
                }}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={cart}>
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => (
                        <TableCell>
                          {renderCell(item, columnKey as string)}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
        <div>
          <OrderSummary
            giftPrice={giftPrice}
            budget={campaignDetails?.budget_per_employee ?? 0}
            onSubmit={handleCartSubmit}
          />
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
