import { LoginPayload, MethodType, OrderPayload } from '@/types/api';
import { CampaignDetailsType } from '@/types/campaign';
import { CategoryType } from '@/types/category';
import { FilterType } from '@/types/filter';
import { Order } from '@/types/order';
import { Product, ProductFilterValue } from '@/types/product';
import { QuickOfferDetailsType } from '@/types/quickOffer';
import { isQuickOfferCampaign } from '@/utils/campaign';

import {
  AUTHORIZATION_HEADER_NAME,
  getAuthorizationHeaderValue,
  setAuthToken,
} from './auth';
import { BASE_API_URL, COMMON } from './common';
import { reportError } from './monitoring';

let controller: AbortController;
let signal: AbortSignal;

const API_END_POINT = {
  LOGIN: 'campaign/{0}/login',
  QUICK_OFFER_LOGIN: 'campaign/{0}/quick-offer-login',
  PRODUCT_DETAILS: 'campaign/{0}/product/{1}/details',
  QUICK_OFFER_PRODUCT_DETAILS: 'campaign/quick-offer-product/{0}',
  CAMPAIGN_TYPE: 'campaign/validate/{0}',
  CAMPAIGN_DETAILS: 'campaign/{0}/details',
  CAMPAIGN_CATEGORIES: 'campaign/{0}/categories',
  QUICK_OFFER_CATEGORIES: 'campaign/quick-offer-categories',
  CREATE_PAYMENT: 'payment/create-payment/{0}',
  GET_LIST: 'campaign/list',
  GET_ORDER: 'campaign/quick-offer-order',
  CREATE_ORDER: 'campaign/{0}/order',
  CREATE_QUICK_OFFER_ORDER: 'campaign/quick-offer-order',
  CAMPAIGN_PRODUCTS: 'campaign/{0}/products',
  QUICK_OFFER_PRODUCTS: 'campaign/quick-offer-products',
  CANCEL_ORDER: 'campaign/{0}/cancel/order/{1}',
  ADD_PRODUCT_TO_CART: 'campaign/{0}/cart/add_product',
  ADD_PRODUCT_TO_QUICK_OFFER: 'campaign/list/add_product',
  FETCH_CART_PRODUCTS: 'campaign/{0}/cart/products',
  EXCHANGE: 'campaign/{0}/exchange',
  EXCHANGE_QUICK_OFFER: 'campaign/{0}/quick_offer_exchange',
  UPDATE_CART_PRODUCT_QUANTITY: 'campaign/{0}/cart/add_product',
  UPDATE_CART_PRODUCT_QUANTITY_QUICK_OFFER: 'campaign/list/add_product',
  ORDER_DETAILS: 'campaign/{0}/order/details',
  SHARE_ITEMS: 'campaign/{0}/share/',
  FETCH_SHARE_ITEMS: 'campaign/share/{0}',
  FILTER_LOOKUP: 'campaign/{0}/filter_lookup',
  QUICK_OFFER: 'campaign/quick-offer',
  QUICK_OFFER_DETAILS: 'campaign/quick-offer/{0}',
  QUICK_OFFER_SELECTED_PRODUCTS: 'campaign/list',
  QUICK_OFFER_SHARE: 'campaign/quick-offer-share/',
  GET_QUICK_OFFER_SHARE: 'campaign/get-quick-offer-share/{0}',
  QUICK_OFFER_CANCEL_ORDER: 'campaign/quick-offer-cancel-order/{0}',
  QUICK_OFFER_LIST_DETAILS: 'campaign/send_my_list/',
};

const _resetAbortController = () => {
  controller = new AbortController();
  signal = controller.signal;
};

// init controller and signal
_resetAbortController();

export const abortPreviousRequests = (): void => {
  controller.abort();

  // replace controller and signal so we have a new unaborted one (otherwise the
  // controller remains aborted and will abort any fetch using its signal immediately)
  _resetAbortController();
};

export const postLogin = async (
  campaignCode: string,
  payload: LoginPayload & { otp?: string },
  type?: string,
) => {
  return _callAPI(
    COMMON.stringFormat(
      type === 'quick_offer_code'
        ? API_END_POINT.QUICK_OFFER_LOGIN
        : API_END_POINT.LOGIN,
      campaignCode,
    ),
    'POST',
    payload,
  ).then((responseData: any) => {
    setAuthToken(responseData?.auth_token);
    // max age is 30 days, after which another login is required
    document.cookie = `campaign_code=${campaignCode}; path=/; max-age=${60 * 60 * 24 * 30};`;
    return responseData;
  });
};

export const getList = async (lang: string, includeTax: boolean) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.GET_LIST).concat(
      `?lang=${lang}&including_tax=${includeTax}`,
    ),
  );
};

export const getOrder = async (lang: string) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.GET_ORDER).concat(`?lang=${lang}`),
  );
};

export const getCampaignType = (
  code: string,
): Promise<'quick_offer_code' | string> => {
  return _callAPI(COMMON.stringFormat(API_END_POINT.CAMPAIGN_TYPE, code));
};

export const getCampaignDetails = async (
  code: number | string,
  lang: string,
): Promise<CampaignDetailsType> => {
  return await _callAPI(
    COMMON.stringFormat(API_END_POINT.CAMPAIGN_DETAILS, code).concat(
      `?lang=${lang}`,
    ),
  );
};

export const getExtendedCampaignDetails = async (
  code: number | string,
  lang: string,
): Promise<CampaignDetailsType> => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.CAMPAIGN_DETAILS, code).concat(
      `?lang=${lang}`,
    ),
  );
};

export const getProductDetails = async (
  code: number | string,
  product_id: number | string,
  lang: string,
  type?: string,
): Promise<Product> => {
  const fetchProductDetailsUrl = isQuickOfferCampaign(type)
    ? COMMON.stringFormat(API_END_POINT.QUICK_OFFER_PRODUCT_DETAILS, product_id)
    : COMMON.stringFormat(API_END_POINT.PRODUCT_DETAILS, code, product_id);

  return await _callAuthenticatedAPI(
    fetchProductDetailsUrl.concat(`?lang=${lang || 'en'}`),
  );
};

export const getCampaignCategories = async (
  code: number | string,
  lang: string,
  type?: string,
): Promise<{ categories: CategoryType[] }> => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(
      isQuickOfferCampaign(type)
        ? API_END_POINT.QUICK_OFFER_CATEGORIES
        : API_END_POINT.CAMPAIGN_CATEGORIES,
      code,
    ).concat(`?lang=${lang}`),
  );
};

export const createPayment = async (
  productID: number,
  amount: number,
  lang: string,
) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.CREATE_PAYMENT, productID),
    'POST',
    { amount, lang },
  );
};

export const createOrder = async (
  lang: string,
  campaignCode: string,
  payload: OrderPayload,
  type?: string,
) => {
  const createOrderUrl = isQuickOfferCampaign(type)
    ? API_END_POINT.CREATE_QUICK_OFFER_ORDER.concat(`?lang=${lang}`)
    : COMMON.stringFormat(API_END_POINT.CREATE_ORDER, campaignCode).concat(
        `?lang=${lang}`,
      );

  return await _callAuthenticatedAPI(createOrderUrl, 'POST', payload);
};

export const getCampaignProducts = async (
  code: number | string,
  lang: string,
  limit?: number,
  page?: number,
  category?: number,
  searchText?: string,
  budget?: 1 | 2 | 3,
  filter?: FilterType,
  includingTax = true,
  type?: string,
) => {
  const fetchProductsUrl = isQuickOfferCampaign(type)
    ? API_END_POINT.QUICK_OFFER_PRODUCTS
    : COMMON.stringFormat(API_END_POINT.CAMPAIGN_PRODUCTS, code);

  let url = fetchProductsUrl.concat(
    `?lang=${lang}&limit=${limit}&page=${page}`,
  );

  if (category) {
    url += `&category_id=${encodeURIComponent(category)}`;
  }

  if (searchText) {
    url += `&q=${encodeURIComponent(searchText)}`;
  }

  if (budget) {
    url += `&budget=${encodeURIComponent(budget)}`;
  }

  if (filter?.sort) {
    url += `&sort=${encodeURIComponent(filter.sort)}`;
  }
  if (filter?.subcategory) {
    url += `&sub_categories=${encodeURIComponent(filter?.subcategory.join(','))}`;
  }
  if (filter?.productKinds) {
    url += `&product_type=${encodeURIComponent(filter?.productKinds.join(','))}`;
  }
  if (filter?.priceRange) {
    url += `&min_price=${filter?.priceRange[0]}&max_price=${filter?.priceRange[1]}`;
  }
  if (filter?.brand) {
    url += `&brands=${encodeURIComponent(filter?.brand.join(','))}`;
  }
  url += `&including_tax=${includingTax}`;

  return await _callAuthenticatedAPI(url, 'GET', undefined, true);
};

export const fetchOrderDetails = async (campaignCode: number | string) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.ORDER_DETAILS, campaignCode),
  );
};

export const cancelOrder = async (
  campaignCode: number | string,
  orderId: number,
) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.CANCEL_ORDER, campaignCode, orderId),
    'PUT',
  );
};

export const addProductToCart = async (
  campaignCode: number | string,
  lang: string,
  productId: number,
  quantity: number,
  variations?: Record<string, string>,
  type?: string,
) => {
  return await _callAuthenticatedAPI(
    type === 'quick_offer_code'
      ? API_END_POINT.ADD_PRODUCT_TO_QUICK_OFFER
      : COMMON.stringFormat(
          API_END_POINT.ADD_PRODUCT_TO_CART,
          campaignCode,
        ).concat(`?lang=${lang}`),
    'POST',
    {
      product_id: productId,
      quantity: quantity,
      ...(variations ? { variations } : {}),
    },
  );
};

export const fetchCartProducts = async (
  campaignCode: string,
  lang: string,
  type?: string,
) => {
  return await _callAuthenticatedAPI(
    type === 'quick_offer_code'
      ? API_END_POINT.QUICK_OFFER_SELECTED_PRODUCTS.concat(`?lang=${lang}`)
      : COMMON.stringFormat(
          API_END_POINT.FETCH_CART_PRODUCTS,
          campaignCode,
        ).concat(`?lang=${lang}`),
  );
};

export const postExchange = async (campaignCode: string, t: string) => {
  const campaingType = await getCampaignType(campaignCode);
  const responseData = await _callAPI(
    COMMON.stringFormat(
      campaingType === 'quick_offer_code'
        ? API_END_POINT.EXCHANGE_QUICK_OFFER
        : API_END_POINT.EXCHANGE,
      campaignCode,
    ),
    'POST',
    {
      t,
    },
  );

  setAuthToken(responseData?.auth_token);
  // do not set expiration here (aka leave it as a session cookie which is
  // cleaned when the browser is closed) since this should be a short-lived
  // exchange session
  document.cookie = `campaign_code=${campaignCode}; path=/;`;
  return responseData;
};

export const updateCartProductQuantity = async (
  campaignCode: string,
  lang: string,
  productId: number,
  quantity: number,
  variations: object,
  type?: string,
) => {
  return await _callAuthenticatedAPI(
    type === 'quick_offer_code'
      ? API_END_POINT.UPDATE_CART_PRODUCT_QUANTITY_QUICK_OFFER.concat(
          `?lang=${lang}`,
        )
      : COMMON.stringFormat(
          API_END_POINT.UPDATE_CART_PRODUCT_QUANTITY,
          campaignCode,
        ).concat(`?lang=${lang}`),
    'POST',
    {
      product_id: productId,
      quantity,
      variations,
    },
  );
};

export const fetchShareItems = async (
  campaignCode: string,
  shareId: string,
  lang: string,
  campaignType: string | null = null,
) => {
  const url = COMMON.stringFormat(
    API_END_POINT.FETCH_SHARE_ITEMS,
    encodeURIComponent(shareId),
  ).concat(`?lang=${lang}`);
  return await _callAPI(url);
};

export const fetchQuickShareItems = async (
  campaignCode: string,
  shareId: string,
  lang: string,
) => {
  const url = COMMON.stringFormat(
    API_END_POINT.GET_QUICK_OFFER_SHARE,
    encodeURIComponent(shareId),
  ).concat(`?lang=${lang}`);
  return await _callAPI(url);
};

export const updateShareItems = async (
  campaignCode: string,
  productIds: string[],
  shareType: string,
  campaignType: string | null = null,
) => {
  const endpoint =
    campaignType === 'quick_offer_code'
      ? API_END_POINT.QUICK_OFFER_SHARE
      : COMMON.stringFormat(API_END_POINT.SHARE_ITEMS, campaignCode);
  return _callAuthenticatedAPI(endpoint, 'POST', {
    share_type: shareType,
    product_ids: productIds,
  });
};

function _callAuthenticatedAPI(
  endpoint: string,
  method: MethodType = 'GET',
  body?: { [key: string]: any },
  abortable: boolean = false,
  headers: Record<string, string> = {},
) {
  headers = {
    [AUTHORIZATION_HEADER_NAME]: getAuthorizationHeaderValue(),
    ...headers,
  };

  return _callAPI(endpoint, method, body, headers, abortable);
}

async function _callAPI(
  endpoint: string,
  method: MethodType = 'GET',
  body?: { [key: string]: any },
  headers?: { [key: string]: string },
  abortable: boolean = false,
) {
  const config: {
    method: string;
    headers: { [key: string]: string };
    body?: string;
    signal?: AbortSignal;
  } = {
    method,
    headers: headers || {},
  };

  if (body) {
    config['headers']['Content-Type'] = 'application/json';
    config['body'] = JSON.stringify(body);
  }

  if (abortable) {
    config['signal'] = signal;
  }

  return fetch(BASE_API_URL + endpoint, config)
    .catch((err) => {
      reportError(err);

      // reject with unknown error, but aborting an abortable request should be
      // distinguishable as it's not necessarily an erroneous path
      return Promise.reject({
        status: -1,
        aborted: abortable && err.name === 'AbortError',
      });
    })
    .then((response) =>
      response
        .json()
        .catch((_err) => {
          return Promise.reject({ status: response.status });
        })
        .then((responseBody) => {
          if (response.ok) {
            return Promise.resolve(responseBody.data);
          } else {
            // error and description may not be available
            return Promise.reject({
              status: response.status,
              data: responseBody,
            });
          }
        }),
    );
}

export const getOrderDetails = async (
  code: number | string,
  lang: string,
): Promise<Order> => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.ORDER_DETAILS, code).concat(
      `?lang=${lang}`,
    ),
  );
};

export const getFilters = async (
  code: number | string,
  lookup: 'product_kinds' | 'brands' | 'sub_categories' | 'max_price',
  lang: string,
  originalBudget?: number,
  tax?: boolean,
  search?: string,
  category?: string,
  filter?: FilterType,
): Promise<ProductFilterValue[]> => {
  try {
    let url = COMMON.stringFormat(API_END_POINT.FILTER_LOOKUP, code);
    let queryParams = [
      `lookup=${lookup}`,
      `lang=${encodeURIComponent(lang)}`,
      originalBudget !== undefined ? `budget=${originalBudget}` : '',
      tax !== undefined ? `including_tax=${tax}` : '',
      search ? `q=${encodeURIComponent(search)}` : '',
      category ? `category=${encodeURIComponent(category)}` : '',
      filter?.subcategory
        ? `sub_categories=${encodeURIComponent(filter?.subcategory.join(','))}`
        : '',
      filter?.productKinds
        ? `product_kinds=${encodeURIComponent(filter?.productKinds.join(','))}`
        : '',
      filter?.brand
        ? `brands=${encodeURIComponent(filter?.brand.join(','))}`
        : '',
    ].filter(Boolean);

    url += `?${queryParams.join('&')}`;

    return await _callAuthenticatedAPI(url);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getQuickOfferDetails = async (
  code: number | string,
  lang: string,
): Promise<QuickOfferDetailsType> => {
  return _callAPI(
    COMMON.stringFormat(API_END_POINT.QUICK_OFFER_DETAILS, code).concat(
      `?lang=${lang}`,
    ),
  );
};

export const getAuthQuickOfferDetails = async (
  code: number | string,
  lang: string,
): Promise<QuickOfferDetailsType> => {
  return _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.QUICK_OFFER_DETAILS, code).concat(
      `?lang=${lang}`,
    ),
  );
};

export const quickOfferCancelOrder = async (referenceId: number) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.QUICK_OFFER_CANCEL_ORDER, referenceId),
    'PUT',
  );
};

export const quickOfferList = async (reference: { [key: string]: any }) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.QUICK_OFFER_LIST_DETAILS),
    'PUT',
    reference,
  );
};
