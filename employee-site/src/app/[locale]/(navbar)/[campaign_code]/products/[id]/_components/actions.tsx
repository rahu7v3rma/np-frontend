'use client';

import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Modal,
  ModalContent,
  Select,
  SelectItem,
  useDisclosure,
} from '@nextui-org/react';
import clsx from 'clsx';
import Image from 'next/image';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { RiAlertFill } from 'react-icons/ri';

import SharePopover from '@/app/[locale]/(navbar)/_components/sharePopover';
import Swatch from '@/app/[locale]/(navbar)/_components/swatch';
import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { ProductImage, ProductKind, Variation } from '@/types/product';

type Props = {
  productName: string;
  additionalPrice?: number;
  exchangeValue?: number;
  description: string;
  orderFound: boolean;
  productId?: number;
  quantity: number;
  isProductOutOfStock: boolean;
  calculatedPrice: number | undefined;
  isButtonDisable: boolean;
  specialOffer: string;
  variations: Variation[];
  productImages: ProductImage[];
  setProductImages: Dispatch<SetStateAction<ProductImage[]>>;
  productKind?: ProductKind;
  voucherValue?: number;
  discountRate?: number;
  productLink?: string;
};

const Actions: FunctionComponent<Props> = ({
  productName,
  additionalPrice,
  exchangeValue,
  description,
  orderFound,
  productId,
  quantity,
  isProductOutOfStock = false,
  calculatedPrice,
  isButtonDisable = false,
  specialOffer,
  variations,
  productImages,
  setProductImages,
  productKind,
  voucherValue,
  discountRate,
  productLink,
}: Props) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  const currentPath = usePathname();
  const router = useRouter();

  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const { addCartItem, showCart, showList } = useContext(CartContext);
  const [shareLink, setShareLink] = useState('');

  const [selectedColorVariation, setSelectedColorVariation] = useState<{
    [key: string]: { color_code: any; site_name: any; name: any };
  }>({});
  const [selectedTextVariations, setSelectedTextVariations] = useState<{
    [key: string]: { site_name: string; name: string } | any;
  }>({});

  const {
    isOpen: isVoucherDetailsModalOpen,
    onOpen: onVoucherDetailsModalOpen,
    onOpenChange: onVoucherDetailsModalOpenChange,
  } = useDisclosure();

  const selectedvariationCount = useCallback(() => {
    const colorCount = Object.keys(selectedColorVariation).length;
    const textCount = Object.keys(selectedTextVariations).length;
    return colorCount + textCount;
  }, [selectedColorVariation, selectedTextVariations]);

  const { id } = useParams<{
    id: string;
  }>();
  useEffect(() => {
    setShareLink(
      `${window.location.host}/${campaignDetails?.code}/product/${id}`,
    );
  }, [campaignDetails, id]);
  const checkoutPath = useMemo(() => {
    const checkoutUrl = currentPath.substring(
      0,
      currentPath.lastIndexOf('/products'),
    );

    return checkoutUrl;
  }, [currentPath]);

  const addToQuickOfferHandler = useCallback(async () => {
    const getVariations = () => {
      const colorVariations = selectedColorVariation
        ? Object.entries(selectedColorVariation).map(([key, value]) => ({
            key,
            name: value.name,
          }))
        : [];

      return [...colorVariations, selectedTextVariations];
    };
    const variations = getVariations();
    const addItemToCart = async () => {
      if (addCartItem) {
        const variationsData = variations.length
          ? Object.fromEntries(variations.map(({ key, name }) => [key, name]))
          : undefined;

        try {
          await addCartItem(productId!!, 1, variationsData);
          showList(true);
        } catch (error) {
          console.error('Error adding item to cart:', error);
        }
      }
    };

    await addItemToCart();
  }, [
    addCartItem,
    productId,
    selectedTextVariations,
    selectedColorVariation,
    showList,
  ]);

  const handleChooseGiftClick = useCallback(async () => {
    if (productId) {
      try {
        const variations = {
          ...Object.fromEntries(
            Object.entries(selectedColorVariation).map(([key, value]) => [
              key,
              value.name,
            ]),
          ),
          ...Object.fromEntries(
            Object.entries(selectedTextVariations || {}).map(([key, value]) => [
              key,
              value,
            ]),
          ),
        };

        await addCartItem?.(
          productId,
          quantity,
          Object.keys(variations).length ? variations : undefined,
        );
        showCart(true);
        if (campaignDetails?.product_selection_mode !== 'MULTIPLE') {
          router.push(`${checkoutPath}/checkout`);
        }
      } catch (error) {
        console.error('Error adding product to cart:', error);
      }
    }
  }, [
    campaignDetails,
    productId,
    quantity,
    addCartItem,
    router,
    checkoutPath,
    showCart,
    selectedTextVariations,
    selectedColorVariation,
  ]);

  const handleColorVariationSelect = useCallback(
    (v: Variation, c: { id: string; bg: string; name: string }) => {
      const imagesToAdd = v.color_variation
        .filter((v) => v.image)
        .map((v) => ({
          main: false,
          selected: v.color_code === c.bg,
          image: v.image,
        }));

      if (imagesToAdd.length > 0) {
        setProductImages([...productImages, ...imagesToAdd]);
      }

      setSelectedColorVariation((prev) => ({
        ...prev,
        [v.site_name]: {
          color_code: c.bg,
          site_name: v.site_name,
          name: c.id,
        },
      }));
    },
    [setProductImages, productImages],
  );

  return (
    <div className="w-full sm:pt-[24px]">
      <h2 className="font-bold text-xl text-[#363839] leading-[30px]">
        {productName}
      </h2>
      <div className="flex items-center my-3 gap-4 sm:mt-[16px] sm:mb-[8px]">
        {campaignDetails?.product_selection_mode === 'SINGLE'
          ? !!additionalPrice && (
              <div className="inline-flex border border-extra-cost-background-2 bg-extra-cost-background-1 rounded-lg">
                <span className="bg-extra-cost-background-2 text-extra-cost-text-color !text-[13px] font-medium leading-6 flex justify-center items-center px-2 rounded-[7px]">
                  {t('products.additional')}
                </span>
                <span className="!text-[15px] font-semibold leading-6 flex justify-center items-center gap-0.5 px-2">
                  {campaignType === 'quick_offer_code'
                    ? '₪'
                    : t('currencySymbol')}
                  {additionalPrice}
                </span>
              </div>
            )
          : !!calculatedPrice && (
              <>
                <div className="text-[#868788] text-base flex gap-1 items-center">
                  {campaignType === 'quick_offer_code' &&
                  productKind === 'MONEY' ? null : (
                    <>
                      <p>{t('cart.price')}</p>
                      <MultiSelectPrice price={calculatedPrice} point />
                    </>
                  )}
                </div>
              </>
            )}
        {productKind === 'MONEY' ? (
          <div className="border-[1px] border-[#2B324C] rounded-[8px] text-[13px] text-[#2B324C] font-[500] leading-[18px] h-[24px] flex items-center px-2">
            {campaignType !== 'quick_offer_code' && t('products.money_value')}{' '}
            {campaignType === 'quick_offer_code'
              ? discountRate +
                (campaignDetails?.displayed_currency !== 'POINT'
                  ? campaignType === 'quick_offer_code'
                    ? t('moneySymbol') + ' ' + t('cart.discount')
                    : t('currencySymbol')
                  : '')
              : voucherValue +
                (campaignDetails?.displayed_currency !== 'POINT'
                  ? campaignType === 'quick_offer_code'
                    ? t('moneySymbol')
                    : t('currencySymbol')
                  : '')}
          </div>
        ) : (
          !!exchangeValue && (
            <div className="border-[1px] border-[#2B324C] rounded-[8px] text-[13px] text-[#2B324C] font-[500] leading-[18px] h-[24px] flex items-center px-2">
              {t('products.value')}{' '}
              {campaignType === 'quick_offer_code'
                ? '₪' + exchangeValue
                : (campaignDetails?.displayed_currency !== 'POINT'
                    ? t('currencySymbol')
                    : '') + exchangeValue}
            </div>
          )
        )}
        {specialOffer && (
          <div className="border  bg-[#D0EADB] text-[#566F61] rounded-lg flex justify-center ">
            <span className="!text-[13px] font-medium leading-6 flex justify-center items-center gap-0.5 px-2 uppercase max-w-[117px]">
              {specialOffer}
            </span>
          </div>
        )}
      </div>
      <div className="">
        <div className="flex flex-col gap-4 my-4">
          <Divider className="bg-[#919EAB33]" />
          {variations
            ?.filter((v) =>
              v.variation_kind === 'COLOR'
                ? v.color_variation.length
                : v.variation_kind === 'TEXT'
                  ? v.text_variation.length
                  : false,
            )
            .slice(0, 5)
            .map((v, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="capitalize text-sm font-semibold">
                  {v.site_name}
                </span>
                {v.variation_kind === 'COLOR' && (
                  <Swatch
                    colors={v.color_variation.map((c) => ({
                      id: c.name,
                      bg: c.color_code,
                      name: c.name,
                    }))}
                    selectedItem={
                      selectedColorVariation[v.site_name]
                        ? {
                            id: selectedColorVariation[v.site_name].name,
                            bg: selectedColorVariation[v.site_name].color_code,
                            name: selectedColorVariation[v.site_name].name,
                          }
                        : undefined
                    }
                    onSelectionChange={(c) => handleColorVariationSelect(v, c)}
                  />
                )}
                {v.variation_kind === 'TEXT' && (
                  <Select
                    className={clsx('custom-border h-[40px] w-[100px]')}
                    size="sm"
                    variant="bordered"
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTextVariations((prev) => {
                        let p = structuredClone(prev);
                        p = p || {};
                        if (!val) {
                          delete p[v.site_name];
                        } else {
                          p[v.site_name] = val;
                        }
                        return p;
                      });
                    }}
                    aria-label="text-variation"
                    classNames={{
                      popoverContent: '[&_li]:w-full',
                    }}
                  >
                    {v.text_variation.map((v) => {
                      return (
                        <SelectItem
                          key={v.text}
                          textValue={v.text}
                          className="w-max"
                        >
                          {v.text}
                        </SelectItem>
                      );
                    })}
                  </Select>
                )}
              </div>
            ))}
          {variations && variations.length > 0 && (
            <Divider className="bg-[#919EAB33]" />
          )}
          <Accordion
            itemClasses={{
              trigger: 'py-0',
              title: 'text-sm font-semibold',
            }}
            defaultExpandedKeys={['1']}
          >
            <AccordionItem
              title={t('productDetails.productDetails')}
              key={variations.length ? undefined : '1'}
            >
              <p className="whitespace-pre-wrap mt-4 text-primary-100 text-sm">
                {description}
              </p>
            </AccordionItem>
          </Accordion>
          {campaignType === 'campaign_code' && productKind === 'MONEY' && (
            <Button
              className="w-[152px] h-[30px] rounded-[8px] bg-[#FA9F56] flex justify-center items-center gap-[8px]"
              onClick={onVoucherDetailsModalOpen}
            >
              <span className="font-[700] text-[13px] leading-[22px] text-white">
                {t('voucherDetails')}
              </span>
              <Image
                src={'/new-tab.svg'}
                width={13.5}
                height={13.5}
                alt="new-tab"
                loading="eager"
              />
            </Button>
          )}
          <Divider className="bg-[#919EAB33]" />
        </div>
        <div className="flex gap-4">
          {campaignType !== 'quick_offer_code' && (
            <SharePopover link={shareLink} />
          )}
          <Button
            color="primary"
            size="lg"
            className="w-full lg:w-100 font-bold text-sm leading-[22px] whitespace-normal h-12"
            onClick={
              campaignType === 'quick_offer_code'
                ? addToQuickOfferHandler
                : handleChooseGiftClick
            }
            isDisabled={
              campaignDetails?.campaign_type === 'WALLET'
                ? isProductOutOfStock ||
                  selectedvariationCount() !== variations.length ||
                  isButtonDisable
                : (campaignType === 'quick_offer_code'
                    ? isProductOutOfStock
                    : orderFound || isProductOutOfStock || isButtonDisable) ||
                  selectedvariationCount() !== variations.length
            }
          >
            {campaignType === 'quick_offer_code'
              ? t('button.quickGift')
              : t('button.gift')}
          </Button>
        </div>
        {campaignType === 'quick_offer_code' ||
        campaignDetails?.campaign_type === 'WALLET'
          ? ''
          : orderFound && (
              <div className="text-red-600 text-small mt-5">
                <div className="flex">
                  <RiAlertFill size="25" style={{ marginTop: '-3px' }} />
                  {t('alreadyChoseProduct')}
                </div>
              </div>
            )}
        <Modal
          isOpen={isVoucherDetailsModalOpen}
          hideCloseButton
          onOpenChange={onVoucherDetailsModalOpenChange}
          placement="center"
          className="h-[80vh] w-[80vw]"
          size="full"
          classNames={{
            base: '!rounded-[16px]',
          }}
        >
          <ModalContent>
            <iframe src={productLink} height={'100%'} width={'100%'} />
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Actions;
