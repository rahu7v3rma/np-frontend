'use client';

import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Select, { SingleValue, ActionMeta, StylesConfig } from 'react-select';
import { toast } from 'react-toastify';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { CITIES } from '@/constants/cities';
import { useCitiesList } from '@/hooks/useCitiesList';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { getProductDetails, createOrder } from '@/services/api';
import Input from '@/shared/Input';
import Error from '@/shared/Input/_components/error';
import { OrderPayload } from '@/types/api';
import { Product } from '@/types/product';
import { sortProductImages } from '@/utils/product';

import BackLink from '../../_components/backLink';

import OrderSummary from './_components/orderSummary';
import Payment from './_components/payment';
import ProductConfirmationCard from './_components/productConfirmationCard';

interface OptionItem {
  label: string;
  value: string;
}

interface Option {
  value: string;
  label: string;
}

interface Props {
  t: (key: string) => string;
  paymentCode?: string;
  validationErrors?: { deliveryCity?: boolean };
  isLoading: boolean;
  items: Option[];
  scrollerRef?: React.RefObject<HTMLDivElement>;
  setIsOpen: (isOpen: boolean) => void;
  handleOnChange: (selectedOption: Option | null) => void;
}

export default function Page() {
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const router = useRouter();
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const searchParams = useSearchParams();

  const { campaignDetails, fetchCampaignDetails } = useContext(CampaignContext);
  const { cart, fetchCartItems } = useContext(CartContext);

  const [products, setProducts] = useState<Product | any>(undefined);
  const [optionItems, setOptionItems] = useState<OptionItem[]>([]);
  const [giftPrice, setGiftPrice] = useState<number>(0);
  const [paymentCode, setPaymentCode] = useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [fieldValue, setFieldValue] = useState<any>({});
  const [forceHomeDelivery, setForceHomeDelivery] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState(false);
  const { items, hasMore, isLoading, onLoadMore } = useCitiesList();

  const [, scrollerRef] = useInfiniteScroll({
    hasMore,
    isEnabled: isOpen,
    shouldUseLoader: false,
    onLoadMore,
  });
  // order payload is managed with a ref because the callback using it is sent
  // to grow sdk which keeps it on init, causing us to not be able to use the
  // latest state data when it is fired
  const orderPayloadRef = useRef<OrderPayload | undefined>(undefined);

  const validateHomeDeliveryForm = (formDataObj: any) => {
    const errors: any = {};

    if (
      formDataObj?.fullName?.split(' ').filter((n: string) => n.trim() != '')
        .length <= 1
    ) {
      // full name should be at least two words (grow rules)
      errors.fullName = true;
    } else if (formDataObj?.fullName?.match(/\d/)) {
      // full name must not contain any digits (grow rules)
      errors.fullName = true;
    }

    if (!formDataObj?.phoneNumber?.match(/^05\d{8,}$/))
      // phone number must start with 05 and have 8 more digits (grow rules)
      errors.phoneNumber = true;
    if (!formDataObj?.deliveryCity) errors.deliveryCity = true;
    if (!formDataObj.deliveryStreet) errors.deliveryStreet = true;
    if (!(+formDataObj?.deliveryStreetNumber > 0))
      errors.deliveryStreetNumber = true;
    if (!formDataObj?.additionalPhoneNumber?.match(/^\+?[\d-]{9,}$/))
      errors.additionalPhoneNumber = true;
    return errors;
  };

  // this should be removed when we support checking out with a cart
  const checkoutProductId = useMemo(() => {
    const id = searchParams.get('id');

    if (id) {
      return Number.parseInt(id, 10);
    } else {
      // router.push(`/${campaign_code}/`);
      return -1;
    }
  }, [searchParams]);

  useEffect(() => {
    getProductDetails(campaign_code, checkoutProductId, currentLocale).then(
      (product: Product) => {
        // sort the images array so that the main image is first
        sortProductImages(product.images);
        setProducts(product);

        if (
          product?.product_type === 'SENT_BY_SUPPLIER' ||
          product?.product_kind === 'MONEY'
        ) {
          setForceHomeDelivery(true);
        }
      },
    );
  }, [campaign_code, checkoutProductId, currentLocale]);

  useEffect(() => {
    const totalGiftPrice = cart.reduce((total, cartItem) => {
      return total + cartItem.product.calculated_price * cartItem.quantity;
    }, 0);
    setGiftPrice(totalGiftPrice);
  }, [cart]);

  const postOrder = useCallback(
    async (payload: OrderPayload) => {
      try {
        setLoading(true);
        const res = await createOrder(campaign_code, payload);

        toast.success(t('order.success'));

        // refresh campaign details to account for created order
        fetchCampaignDetails && fetchCampaignDetails();

        // refresh cart to account for it clearing
        fetchCartItems && fetchCartItems();

        router.replace(`/${campaign_code}/order`);
      } catch (err: any) {
        if (err.status === 402) {
          setPaymentCode(err.data.data.payment_code);
        } else {
          toast.error(t('order.somethingWentWrong'));
        }
      } finally {
        setLoading(false);
      }
    },
    [campaign_code, t, fetchCampaignDetails, fetchCartItems, router],
  );

  const formRef = useRef<HTMLFormElement>(null);
  const handleCheckoutSubmit = useCallback(() => {
    // load form data
    const formData = new FormData(formRef.current!);
    // convert form data to an object
    const formDataObj: any = {};
    formData.forEach((v, k) => {
      formDataObj[k] = v;
    });

    if (campaignDetails?.delivery_location === 'ToHome' || forceHomeDelivery) {
      const errors = validateHomeDeliveryForm(formDataObj);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }
    const payload: OrderPayload = {
      product_id: checkoutProductId,
      full_name: formDataObj.fullName,
      phone_number: formDataObj.phoneNumber,
      additional_phone_number: formDataObj.additionalPhoneNumber,
      delivery_city: formDataObj.deliveryCity,
      delivery_street: formDataObj.deliveryStreet,
      delivery_street_number: formDataObj.deliveryStreetNumber,
      delivery_apartment_number: formDataObj.deliveryApartmentNumber,
      delivery_additional_details: formDataObj.deliveryAdditionalDetails,
    };
    orderPayloadRef.current = payload;
    postOrder(payload);
  }, [campaignDetails, forceHomeDelivery, checkoutProductId, postOrder]);

  const handlePaid = useCallback(() => {
    if (orderPayloadRef.current) {
      // do nothing :(
    }
  }, [orderPayloadRef]);

  const handleOnChangeForSelect = (
    newValue: SingleValue<Option>,
    actionMeta: ActionMeta<Option>,
  ) => {
    setFieldValue((prevValue: any) => ({
      ...prevValue,
      ['deliveryCity']: true,
    }));

    setValidationErrors((prevErrors: any) => ({
      ...prevErrors,
      ['deliveryCity']: false,
    }));
  };

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      // setFieldValue(value);
      setFieldValue((prevValue: any) => ({
        ...prevValue,
        [name]: value,
      }));
      setValidationErrors((prevErrors: any) => ({
        ...prevErrors,
        [name]: false,
      }));
    },
    [],
  );

  useEffect(() => {
    const locale = currentLocale === 'en' ? 'en' : 'he';
    const randomIdx = () => Math.floor(Math.random() * 1000); // Generate a random index value

    const newItems = CITIES[locale].map((name: string) => ({
      label: name,
      value: name,
    }));

    setOptionItems(newItems);
  }, [currentLocale, items]);

  const customStyles: StylesConfig<Option, false> = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderWidth: '1px',
      border: validationErrors?.deliveryCity
        ? '2px solid #FF5630'
        : state.isFocused
          ? '2px solid #363839'
          : state.hasValue
            ? '1px solid #363839'
            : '1px solid #E0E0E0',
      boxShadow: 'none',
      borderRadius: '0.475rem',
      padding: '0.5rem',
      fontSize: '0.875rem',
      '&:hover': {
        borderColor: validationErrors?.deliveryCity ? '#FF5630' : '#363839',
      },
      '&:focus-within': {
        border: validationErrors?.deliveryCity
          ? '2px solid #FF5630'
          : '2px solid #363839',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: validationErrors?.deliveryCity ? '#FF5630' : '#BDBDBD',
      fontWeight: validationErrors?.deliveryCity ? '600' : '500',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '0.375rem',
      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: '0.5rem',
      backgroundColor: state.isSelected ? '#E0E0E0' : 'white',
      color: state.isSelected ? '#000' : '#363839',
      '&:hover': {
        backgroundColor: '#E0E0E0',
      },
    }),
  };

  return (
    <section className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <BackLink />
      <h1 className="text-primary text-2xl font-bold py-10">Checkout</h1>
      <form ref={formRef} className="flex flex-col xl:flex-row gap-[2rem]">
        <div className="w-full xl:min-w-[784px]">
          {campaignDetails && (
            <>
              {campaignDetails.delivery_location === 'ToHome' ||
              forceHomeDelivery ? (
                <div className="border border-[#919EAB33] rounded-2xl mb-6 border-slate-200 shadow-md shadow-grey-400">
                  <div className="px-6 py-4 border-b-[1px]">
                    <h2 className="text-primary font-bold text-lg">
                      {t('checkout.delivery')}
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <h3 className="text-primary font-semibold text-base pb-4">
                      {t('checkout.homeDelivery')}
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 mb-2">
                      <Input
                        variant="bordered"
                        label={t('checkout.fullName')}
                        value={fieldValue?.fullName}
                        name="fullName"
                        disabled={!!paymentCode}
                        isInvalid={validationErrors?.fullName}
                        color={
                          validationErrors?.fullName ? 'danger' : 'default'
                        }
                        errorMessage={
                          validationErrors?.fullName
                            ? t('checkout.fullNameErrMsg')
                            : ''
                        }
                        onChange={handleOnChange}
                        labelPlacement={'outside'}
                      />
                      <Input
                        variant="bordered"
                        label={t('checkout.phone')}
                        value={fieldValue?.phoneNumber}
                        type="tel"
                        name="phoneNumber"
                        disabled={!!paymentCode}
                        isInvalid={validationErrors?.phoneNumber}
                        color={
                          validationErrors?.phoneNumber ? 'danger' : 'default'
                        }
                        errorMessage={
                          validationErrors?.phoneNumber
                            ? t('checkout.phoneNumberErrMsg')
                            : ''
                        }
                        onChange={handleOnChange}
                        labelPlacement={'outside'}
                      />
                      <Input
                        variant="bordered"
                        label={t('checkout.additionalPhone')}
                        value={fieldValue?.additionalPhoneNumber}
                        type="tel"
                        name="additionalPhoneNumber"
                        disabled={!!paymentCode}
                        isInvalid={validationErrors?.additionalPhoneNumber}
                        errorMessage={
                          validationErrors?.additionalPhoneNumber
                            ? t('checkout.phoneNumberErrMsg')
                            : ''
                        }
                        color={
                          validationErrors?.additionalPhoneNumber
                            ? 'danger'
                            : 'default'
                        }
                        onChange={handleOnChange}
                        labelPlacement={'outside'}
                      />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mb-0 md:mb-2">
                      <div className="flex-1">
                        <Select
                          name="deliveryCity"
                          options={optionItems}
                          className="relative z-20"
                          placeholder={t('checkout.city')}
                          isDisabled={!!paymentCode}
                          onChange={handleOnChangeForSelect}
                          isLoading={isLoading}
                          styles={customStyles}
                          noOptionsMessage={() => t('checkout.noOptions')}
                        />
                        {validationErrors?.deliveryCity && (
                          <Error error={t('checkout.deliveryCityErrMsg')} />
                        )}
                      </div>
                      <Input
                        variant="bordered"
                        value={fieldValue?.deliveryStreet}
                        className="mt-0 relative z-10"
                        label={t('checkout.street')}
                        onChange={handleOnChange}
                        labelPlacement={'outside'}
                        name="deliveryStreet"
                        disabled={!!paymentCode}
                        isInvalid={validationErrors?.deliveryStreet}
                        color={
                          validationErrors?.deliveryStreet
                            ? 'danger'
                            : 'default'
                        }
                        errorMessage={
                          validationErrors?.deliveryStreet
                            ? t('checkout.deliveryStreetErrMsg')
                            : ''
                        }
                      />
                      <div className="flex flex-col md:flex-row flex-1 gap-4">
                        <Input
                          variant="bordered"
                          value={fieldValue?.deliveryStreetNumber}
                          label={t('checkout.number')}
                          type="number"
                          onChange={handleOnChange}
                          className="relative z-10"
                          name="deliveryStreetNumber"
                          disabled={!!paymentCode}
                          isInvalid={validationErrors?.deliveryStreetNumber}
                          color={
                            validationErrors?.deliveryStreetNumber
                              ? 'danger'
                              : 'default'
                          }
                          errorMessage={
                            validationErrors?.deliveryStreetNumber
                              ? t('checkout.deliveryStreetNumberErrMsg')
                              : ''
                          }
                          labelPlacement={'outside'}
                        />
                        <Input
                          variant="bordered"
                          label={t('checkout.apartment')}
                          value={fieldValue.deliveryApartmentNumber}
                          name="deliveryApartmentNumber"
                          onChange={handleOnChange}
                          labelPlacement={'outside'}
                          className="relative z-10"
                          disabled={!!paymentCode}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Input
                        variant="bordered"
                        label={t('checkout.moreDetails')}
                        value={fieldValue.deliveryAdditionalDetails}
                        name="deliveryAdditionalDetails"
                        onChange={handleOnChange}
                        labelPlacement={'outside'}
                        className="relative z-10"
                        disabled={!!paymentCode}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-[#919EAB33]  rounded-2xl w-full md:max-w-3xl mb-6 border-slate-200 shadow-md shadow-grey-400">
                  <div className="px-6 py-4 border-b-[1px]">
                    <h2 className="text-primary font-bold text-lg">
                      {t('checkout.delivery')}
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <h3 className="text-primary font-semibold text-base pb-4">
                      {t('checkout.officeDelivery')}
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 mb-0 md:mb-4">
                      <div className="flex flex-col md:flex-row flex-1 gap-4">
                        {campaignDetails?.office_delivery_address}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {campaignDetails?.product_selection_mode === 'SINGLE' ? (
          <ProductConfirmationCard
            product={products}
            submitDisabled={
              !!paymentCode ||
              !!campaignDetails.employee_order_reference ||
              loading
            }
            onCancel={() => {}}
            onSubmit={handleCheckoutSubmit}
          />
        ) : (
          <div>
            <OrderSummary
              giftPrice={giftPrice}
              budget={campaignDetails?.budget_per_employee ?? 0}
              submitDisabled={
                !!campaignDetails?.employee_order_reference || loading
              }
              onSubmit={handleCheckoutSubmit}
            />
          </div>
        )}
      </form>
      <Payment paymentCode={paymentCode} onPaid={handlePaid} />
    </section>
  );
}
