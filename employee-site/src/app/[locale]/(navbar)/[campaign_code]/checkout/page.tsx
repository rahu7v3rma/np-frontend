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
import 'react-phone-number-input/style.css';
import PhoneInput, {
  isValidPhoneNumber,
  getCountryCallingCode,
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import Select, { SingleValue, ActionMeta, StylesConfig } from 'react-select';

import { CampaignContext } from '@/app/[locale]/context/campaign';
import { CartContext } from '@/app/[locale]/context/cart';
import { CITIES } from '@/constants/cities';
import { COUNTRIES } from '@/constants/countries';
import { STATES } from '@/constants/states';
import { useCitiesList } from '@/hooks/useCitiesList';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { createOrder } from '@/services/api';
import Input, { InputWithForward } from '@/shared/Input';
import Error from '@/shared/Input/_components/error';
import { OrderPayload } from '@/types/api';
import { isQuickOfferCampaign } from '@/utils/campaign';

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

  const { campaignDetails, campaignType, fetchCampaignDetails } =
    useContext(CampaignContext);
  const { cart, fetchCartItems } = useContext(CartContext);

  const [optionItems, setOptionItems] = useState<OptionItem[]>([]);
  const [giftPrice, setGiftPrice] = useState<number>(0);
  const [paymentCode, setPaymentCode] = useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [fieldValue, setFieldValue] = useState<any>({});
  const [forceHomeDelivery, setForceHomeDelivery] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<any>('US');
  const [additionalCountryCode, setAdditionalCountryCode] = useState<any>('US');

  const [isOpen, setIsOpen] = useState(false);
  const { items, hasMore, isLoading, onLoadMore } = useCitiesList();
  // State to hold country options
  const [countryOptions, setCountryOptions] = useState<OptionItem[]>([]);
  const [showPhoneInput, setShowPhoneInput] = useState<boolean>(false);

  useEffect(() => {
    const locale = currentLocale === 'en' ? 'en' : 'he';
    // Set country options based on the locale
    const newCountryOptions = COUNTRIES[locale].map((name: string) => ({
      label: name,
      value: name,
    }));
    setCountryOptions(newCountryOptions);
  }, [currentLocale]);

  const stateOptions = STATES.map((state) => ({
    label: state,
    value: state,
  }));

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

  useEffect(() => {
    // re-fetch cart items on page load so that we don't present stale data if
    // it was modified in another session
    fetchCartItems && fetchCartItems();
  }, [fetchCartItems]);

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
    if (campaignDetails?.check_out_location === 'GLOBAL') {
      if (!isValidPhoneNumber(formDataObj?.phoneNumber, countryCode as any))
        errors.phoneNumber = true;
      if (
        !isValidPhoneNumber(
          formDataObj?.additionalPhoneNumber,
          additionalCountryCode as any,
        )
      )
        errors.additionalPhoneNumber = true;
    } else {
      if (!formDataObj?.phoneNumber?.match(/^05\d{8}$/))
        // phone number must start with 05 and have 8 more digits (grow rules)
        errors.phoneNumber = true;
      if (!formDataObj?.additionalPhoneNumber?.match(/^05\d{8}$/))
        errors.additionalPhoneNumber = true;
    }
    if (!formDataObj?.deliveryCity) errors.deliveryCity = true;
    if (!formDataObj.deliveryStreet?.trim()) errors.deliveryStreet = true;
    if (!(+formDataObj?.deliveryStreetNumber > 0))
      errors.deliveryStreetNumber = true;
    if (campaignDetails?.check_out_location === 'GLOBAL') {
      if (!formDataObj?.deliveryCountry) errors.deliveryCountry = true;
      if (!formDataObj?.deliveryStateCode) errors.deliveryStateCode = true;
      if (!formDataObj?.deliveryZipCode) errors.deliveryZipCode = true;
    }
    return errors;
  };

  const validatePhoneNumber = (formDataObj: any) => {
    const errors: any = {};
    if (!formDataObj?.phoneNumber?.match(/^05\d{8}$/))
      errors.phoneNumber = true;

    return errors;
  };

  useEffect(() => {
    let shouldForceHomeDelivery = false;

    for (const cartItem of cart) {
      if (
        cartItem.product.product_type === 'SENT_BY_SUPPLIER' ||
        isQuickOfferCampaign(campaignType ?? '')
      ) {
        shouldForceHomeDelivery = true;
        setShowPhoneInput(true);
        break;
      }
    }

    setForceHomeDelivery(shouldForceHomeDelivery);
  }, [cart, campaignType]);

  useEffect(() => {
    let hasMoneyProduct = false;

    for (const cartItem of cart) {
      if (cartItem.product.product_kind === 'MONEY') {
        hasMoneyProduct = true;
        break;
      }
    }

    if (campaignDetails?.delivery_location === 'ToOffice' && hasMoneyProduct) {
      setShowPhoneInput(true);
    } else if (
      campaignDetails?.delivery_location === 'ToHome' &&
      hasMoneyProduct &&
      cart.every((cartItem) => cartItem.product.product_kind === 'MONEY')
    ) {
      setShowPhoneInput(true);
    } else {
      setShowPhoneInput(false);
    }
  }, [cart, campaignDetails]);

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
        const res = await createOrder(
          currentLocale,
          campaign_code,
          payload,
          campaignType || '',
        );

        // refresh campaign details to account for created order
        fetchCampaignDetails && fetchCampaignDetails();

        // refresh cart to account for it clearing
        fetchCartItems && fetchCartItems();
        campaignDetails?.campaign_type === 'WALLET'
          ? router.replace(`/${campaign_code}`)
          : router.replace(`/${campaign_code}/order`);
      } catch (err: any) {
        if (err.status === 402) {
          setPaymentCode(err.data.data.payment_code);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      campaign_code,
      campaignDetails,
      fetchCampaignDetails,
      fetchCartItems,
      router,
    ],
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
      let errors: any = {};
      if (showPhoneInput) {
        errors = validatePhoneNumber(formDataObj);
      } else {
        errors = validateHomeDeliveryForm(formDataObj);
      }
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }
    if (campaignDetails?.delivery_location === 'ToOffice' && showPhoneInput) {
      const errors = validatePhoneNumber(formDataObj);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }
    const payload: OrderPayload = {
      full_name: formDataObj.fullName,
      phone_number:
        campaignDetails?.check_out_location === 'GLOBAL' &&
        formDataObj.phoneNumber
          ? `${getCountryCallingCode(countryCode as any)}${formDataObj.phoneNumber}`
          : formDataObj.phoneNumber,
      additional_phone_number:
        campaignDetails?.check_out_location === 'GLOBAL' &&
        formDataObj.additionalPhoneNumber
          ? `${getCountryCallingCode(additionalCountryCode as any)}${formDataObj.additionalPhoneNumber}`
          : formDataObj.additionalPhoneNumber,
      delivery_city: formDataObj.deliveryCity,
      delivery_street: formDataObj.deliveryStreet,
      delivery_street_number: formDataObj.deliveryStreetNumber,
      delivery_apartment_number: formDataObj.deliveryApartmentNumber,
      delivery_additional_details: formDataObj.deliveryAdditionalDetails,
      country: formDataObj.deliveryCountry,
      state_code: formDataObj.deliveryStateCode,
      zip_code: formDataObj.deliveryZipCode,
    };

    orderPayloadRef.current = payload;
    postOrder(payload);
  }, [
    additionalCountryCode,
    campaignDetails,
    countryCode,
    forceHomeDelivery,
    postOrder,
  ]);

  const handlePaid = useCallback(() => {
    if (orderPayloadRef.current) {
      // do nothing :(
    }
  }, [orderPayloadRef]);

  const handlePaymentClose = useCallback(() => {
    setPaymentCode(undefined);
  }, []);

  const handleOnChangeForSelect = (
    newValue: SingleValue<Option>,
    name: string, // Add name as a parameter
  ) => {
    // Clear the validation error for the selected field
    setValidationErrors((prevErrors: any) => ({
      ...prevErrors,
      [name]: false, // Clear error for the specific field being changed
    }));
    // Update the field value based on selection
    setFieldValue((prevValue: any) => ({
      ...prevValue,
      [name]: newValue ? newValue.value : '', // Update field value based on selection
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

  const customStyles = {
    deliveryCityStyles: {
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
        ['@media screen and (max-width: 768px)']: {
          fontSize: '1rem',
        },
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
        zIndex: 9999, // Add a high z-index value
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
    },
    countryStyles: {
      control: (provided: any, state: any) => ({
        ...provided,
        borderWidth: '1px',
        border: validationErrors?.deliveryCountry
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
          borderColor: validationErrors?.deliveryCountry
            ? '#FF5630'
            : '#363839',
        },
        '&:focus-within': {
          border: validationErrors?.deliveryCountry
            ? '2px solid #FF5630'
            : '2px solid #363839',
        },
      }),
      placeholder: (provided: any) => ({
        ...provided,
        color: validationErrors?.deliveryCountry ? '#FF5630' : '#BDBDBD',
        fontWeight: validationErrors?.deliveryCountry ? '600' : '500',
      }),
      menu: (provided: any) => ({
        ...provided,
        borderRadius: '0.375rem',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
        zIndex: 9999, // Add a high z-index value
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
    },
    stateStyles: {
      control: (provided: any, state: any) => ({
        ...provided,
        borderWidth: '1px',
        border: validationErrors?.deliveryStateCode
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
          borderColor: validationErrors?.deliveryStateCode
            ? '#FF5630'
            : '#363839',
        },
        '&:focus-within': {
          border: validationErrors?.deliveryStateCode
            ? '2px solid #FF5630'
            : '2px solid #363839',
        },
      }),
      placeholder: (provided: any) => ({
        ...provided,
        color: validationErrors?.deliveryStateCode ? '#FF5630' : '#BDBDBD',
        fontWeight: validationErrors?.deliveryStateCode ? '600' : '500',
      }),
      menu: (provided: any) => ({
        ...provided,
        borderRadius: '0.375rem',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
        zIndex: 9999, // Add a high z-index value
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
    },
  };

  return (
    <section className="w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
      <BackLink />
      <h1 className="text-primary text-[24px] leading-9 font-bold py-10">
        Checkout
      </h1>
      <form ref={formRef} className="flex flex-col xl:flex-row gap-[2rem]">
        <div className="w-full xl:min-w-[784px]">
          {campaignDetails && (
            <>
              {campaignDetails.delivery_location === 'ToHome' ||
              forceHomeDelivery ? (
                <div className="border border-[#919EAB33] rounded-2xl mb-6 border-slate-200 shadow-md shadow-grey-400">
                  <div className="px-6 py-4 border-b-[1px]">
                    <h2 className="text-primary leading-7 font-bold text-lg">
                      {t('checkout.delivery')}
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <>
                      {!showPhoneInput ? (
                        <>
                          <h3 className="text-primary font-semibold leading-6 text-base pb-4">
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
                                validationErrors?.fullName
                                  ? 'danger'
                                  : 'default'
                              }
                              errorMessage={
                                validationErrors?.fullName
                                  ? t('checkout.fullNameErrMsg')
                                  : ''
                              }
                              onChange={handleOnChange}
                              labelPlacement={'outside'}
                            />
                            {campaignDetails.check_out_location === 'GLOBAL' ? (
                              <div
                                className={`flex-1 ${currentLocale === 'he' && 'flag-arrow'}`}
                              >
                                <PhoneInput
                                  defaultCountry="US"
                                  label={t('checkout.phone')}
                                  name="phoneNumber"
                                  value={fieldValue?.phoneNumber}
                                  onChange={(value: string | undefined) =>
                                    handleOnChange({
                                      target: {
                                        name: 'phoneNumber',
                                        value: value,
                                      },
                                    } as any)
                                  }
                                  disabled={!!paymentCode}
                                  isInvalid={validationErrors?.phoneNumber}
                                  color={
                                    validationErrors?.phoneNumber
                                      ? 'danger'
                                      : 'default'
                                  }
                                  flags={flags}
                                  labelPlacement={'outside'}
                                  inputComponent={InputWithForward}
                                  onCountryChange={setCountryCode}
                                />
                                {validationErrors?.phoneNumber && (
                                  <Error
                                    error={t('checkout.phoneNumberErrMsg')}
                                  />
                                )}
                              </div>
                            ) : (
                              <Input
                                variant="bordered"
                                label={t('checkout.phone')}
                                value={fieldValue?.phoneNumber}
                                type="tel"
                                name="phoneNumber"
                                disabled={!!paymentCode}
                                isInvalid={validationErrors?.phoneNumber}
                                color={
                                  validationErrors?.phoneNumber
                                    ? 'danger'
                                    : 'default'
                                }
                                errorMessage={
                                  validationErrors?.phoneNumber
                                    ? t('checkout.phoneNumberErrMsg')
                                    : ''
                                }
                                onChange={handleOnChange}
                                labelPlacement={'outside'}
                              />
                            )}
                            {campaignDetails.check_out_location === 'GLOBAL' ? (
                              <div
                                className={`flex-1 ${currentLocale === 'he' && 'flag-arrow'}`}
                              >
                                <PhoneInput
                                  defaultCountry="US"
                                  label={t('checkout.additionalPhone')}
                                  name="additionalPhoneNumber"
                                  value={fieldValue?.additionalPhoneNumber}
                                  onChange={(value: string | undefined) =>
                                    handleOnChange({
                                      target: {
                                        name: 'additionalPhoneNumber',
                                        value: value,
                                      },
                                    } as any)
                                  }
                                  disabled={!!paymentCode}
                                  isInvalid={
                                    validationErrors?.additionalPhoneNumber
                                  }
                                  color={
                                    validationErrors?.additionalPhoneNumber
                                      ? 'danger'
                                      : 'default'
                                  }
                                  flags={flags}
                                  labelPlacement={'outside'}
                                  inputComponent={InputWithForward}
                                  onCountryChange={setAdditionalCountryCode}
                                />
                                {validationErrors?.additionalPhoneNumber && (
                                  <Error
                                    error={t('checkout.phoneNumberErrMsg')}
                                  />
                                )}
                              </div>
                            ) : (
                              <Input
                                variant="bordered"
                                label={t('checkout.additionalPhone')}
                                value={fieldValue?.additionalPhoneNumber}
                                type="tel"
                                name="additionalPhoneNumber"
                                disabled={!!paymentCode}
                                isInvalid={
                                  validationErrors?.additionalPhoneNumber
                                }
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
                            )}
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 mb-0 md:mb-2">
                            {campaignDetails.check_out_location === 'GLOBAL' ? (
                              <div className="flex-1">
                                <Input
                                  variant="bordered"
                                  label={t('checkout.city')}
                                  onChange={handleOnChange}
                                  isLoading={isLoading}
                                  styles={customStyles.deliveryCityStyles}
                                  name="deliveryCity"
                                  disabled={!!paymentCode}
                                  labelPlacement={'outside'}
                                  isInvalid={validationErrors?.deliveryCity}
                                />
                                {validationErrors?.deliveryCity && (
                                  <Error
                                    error={t('checkout.deliveryCityErrMsg')}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex-1">
                                <Select
                                  name="deliveryCity"
                                  options={optionItems}
                                  className="relative"
                                  placeholder={t('checkout.city')}
                                  isDisabled={!!paymentCode}
                                  onChange={(value) =>
                                    handleOnChangeForSelect(
                                      value,
                                      'deliveryCity',
                                    )
                                  } // Pass name here
                                  isLoading={isLoading}
                                  styles={customStyles.deliveryCityStyles}
                                  noOptionsMessage={() =>
                                    t('checkout.noOptions')
                                  }
                                />
                                {validationErrors?.deliveryCity && (
                                  <Error
                                    error={t('checkout.deliveryCityErrMsg')}
                                  />
                                )}
                              </div>
                            )}
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
                                isInvalid={
                                  validationErrors?.deliveryStreetNumber
                                }
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
                                className="relative"
                                disabled={!!paymentCode}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 mb-2">
                            {campaignDetails.check_out_location ===
                              'GLOBAL' && (
                              <>
                                <div className="flex-1">
                                  <Select
                                    name="deliveryCountry"
                                    options={countryOptions}
                                    className="relative"
                                    placeholder={t('checkout.country')}
                                    isDisabled={!!paymentCode}
                                    onChange={(value) =>
                                      handleOnChangeForSelect(
                                        value,
                                        'deliveryCountry',
                                      )
                                    } // Pass name here
                                    styles={customStyles.countryStyles}
                                    noOptionsMessage={() =>
                                      t('checkout.noOptions')
                                    }
                                  />
                                  {validationErrors?.deliveryCountry && (
                                    <Error
                                      error={t('checkout.countryErrMsg')}
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Input
                                    variant="bordered"
                                    label={t('checkout.stateCode')}
                                    value={fieldValue?.deliveryStateCode}
                                    name="deliveryStateCode"
                                    disabled={!!paymentCode}
                                    isInvalid={
                                      validationErrors?.deliveryStateCode
                                    }
                                    onChange={handleOnChange}
                                    labelPlacement={'outside'}
                                    styles={customStyles.stateStyles}
                                  />
                                  {validationErrors?.deliveryStateCode && (
                                    <Error
                                      error={t('checkout.stateCodeErrMsg')}
                                    />
                                  )}
                                </div>
                                <Input
                                  variant="bordered"
                                  label={t('checkout.zipCode')}
                                  value={fieldValue?.deliveryZipCode}
                                  name="deliveryZipCode"
                                  disabled={!!paymentCode}
                                  isInvalid={validationErrors?.deliveryZipCode}
                                  color={
                                    validationErrors?.deliveryZipCode
                                      ? 'danger'
                                      : 'default'
                                  }
                                  errorMessage={
                                    validationErrors?.deliveryZipCode
                                      ? t('checkout.zipCodeErrMsg')
                                      : ''
                                  }
                                  onChange={handleOnChange}
                                  labelPlacement={'outside'}
                                />
                              </>
                            )}
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
                        </>
                      ) : (
                        <>
                          <h3 className="text-primary font-semibold leading-6 text-base pb-4">
                            {t('checkout.homeDelivery')}
                          </h3>
                          <h3 className="text-primary leading-6 font-semibold text-base pb-4">
                            {t('checkout.voucherPhoneNumber')}
                          </h3>
                          <Input
                            variant="bordered"
                            value={fieldValue?.phoneNumber}
                            label={t('checkout.phone')}
                            type="number"
                            onChange={handleOnChange}
                            className="relative z-10 w-[295px]"
                            name="phoneNumber"
                            disabled={!!paymentCode}
                            isInvalid={validationErrors?.phoneNumber}
                            color={
                              validationErrors?.phoneNumber
                                ? 'danger'
                                : 'default'
                            }
                            errorMessage={
                              validationErrors?.phoneNumber
                                ? t('checkout.phoneNumberErrMsg')
                                : ''
                            }
                            labelPlacement={'outside'}
                          />
                        </>
                      )}
                    </>
                  </div>
                </div>
              ) : (
                <div className="border border-[#919EAB33]  rounded-2xl w-full md:max-w-3xl mb-6 border-slate-200 shadow-md shadow-grey-400">
                  <div className="px-6 py-4 border-b-[1px]">
                    <h2 className="text-primary leading-7 font-bold text-lg">
                      {t('checkout.delivery')}
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <h3 className="text-primary leading-6 font-semibold text-[18px] pb-4">
                      {t('checkout.officeDelivery')}
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 mb-0 md:mb-4">
                      <div className="flex flex-col md:flex-row flex-1 gap-4 text-sm text-[#868788] font-normal leading-[22px]">
                        {campaignDetails?.office_delivery_address}
                      </div>
                    </div>
                    {showPhoneInput && (
                      <>
                        <h3 className="text-primary leading-6 font-semibold text-base pb-4">
                          {t('checkout.voucherPhoneNumber')}
                        </h3>
                        <Input
                          variant="bordered"
                          value={fieldValue?.phoneNumber}
                          label={t('checkout.phone')}
                          type="number"
                          onChange={handleOnChange}
                          className="relative z-10 w-[295px]"
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
                          labelPlacement={'outside'}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {campaignDetails?.product_selection_mode === 'SINGLE' ? (
          <ProductConfirmationCard
            selectedVariations={cart.length > 0 ? cart[0] : null}
            product={cart.length > 0 ? cart[0].product : null}
            submitDisabled={
              !!paymentCode ||
              !!campaignDetails.employee_order_reference ||
              loading
            }
            onCancel={() => {
              router.replace(`/${campaign_code}`);
            }}
            onSubmit={handleCheckoutSubmit}
          />
        ) : (
          <div>
            <OrderSummary
              giftPrice={giftPrice}
              budget={campaignDetails?.budget_per_employee ?? 0}
              submitDisabled={
                campaignDetails?.campaign_type === 'WALLET'
                  ? loading
                  : !!campaignDetails?.employee_order_reference || loading
              }
              onSubmit={handleCheckoutSubmit}
            />
          </div>
        )}
      </form>
      <Payment
        paymentCode={paymentCode}
        onPaid={handlePaid}
        onPaymentClose={handlePaymentClose}
      />
    </section>
  );
}
