import { LoginPayload, MethodType, OrderPayload } from '@/types/api';
import { CampaignDetailsType } from '@/types/campaign';
import { CategoryType } from '@/types/category';
import { Product } from '@/types/product';
import { AUTH_KEY } from '@/utils/const';

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
  PRODUCT_DETAILS: 'campaign/{0}/product/{1}/details',
  CAMPAIGN_DETAILS: 'campaign/{0}/details',
  CAMPAIGN_CATEGORIES: 'campaign/{0}/categories',
  CREATE_PAYMENT: 'payment/create-payment/{0}',
  CREATE_ORDER: 'campaign/{0}/order',
  CAMPAIGN_PRODUCTS: 'campaign/{0}/products',
  ORDER_DETAILS: 'campaign/{0}/order/details',
  CANCEL_ORDER: 'campaign/{0}/cancel/order/{1}',
  ADD_PRODUCT_TO_CART: 'campaign/{0}/cart/add_product',
  FETCH_CART_PRODUCTS: 'campaign/{0}/cart/products',
  EXCHANGE: 'campaign/{0}/exchange',
  UPDATE_CART_PRODUCT_QUANTITY: 'campaign/{0}/cart/add_product',
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
) => {
  return _callAPI(
    COMMON.stringFormat(API_END_POINT.LOGIN, campaignCode),
    'POST',
    payload,
  ).then((responseData: any) => {
    setAuthToken(responseData?.auth_token);
    document.cookie = `campaign_code=${campaignCode}; path=/;`;
    return responseData;
  });
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
): Promise<Product> => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.PRODUCT_DETAILS, code, product_id).concat(
      `?lang=${lang || 'en'}`,
    ),
  );
};

export const getCampaignCategories = async (
  code: number | string,
  lang: string,
): Promise<{ categories: CategoryType[] }> => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.CAMPAIGN_CATEGORIES, code).concat(
      `?lang=${lang}`,
    ),
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
  campaignCode: string,
  payload: OrderPayload,
) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.CREATE_ORDER, campaignCode),
    'POST',
    payload,
  );
};

export const getCampaignProducts = async (
  code: number | string,
  lang: string,
  limit?: number,
  page?: number,
  category?: number,
  searchText?: string,
  originalBudget?: boolean,
) => {
  let url = COMMON.stringFormat(API_END_POINT.CAMPAIGN_PRODUCTS, code).concat(
    `?lang=${lang}&limit=${limit}&page=${page}`,
  );

  if (category) {
    url += `&category_id=${encodeURIComponent(category)}`;
  }

  if (searchText) {
    url += `&q=${encodeURIComponent(searchText)}`;
  }

  if (originalBudget) {
    url += `&original_budget=${encodeURIComponent(1)}`;
  }

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
  productId: number,
  quantity: number,
) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.ADD_PRODUCT_TO_CART, campaignCode),
    'POST',
    {
      product_id: productId,
      quantity: quantity,
    },
  );
};

export const fetchCartProducts = async (campaignCode: string) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(API_END_POINT.FETCH_CART_PRODUCTS, campaignCode),
  );
};

export const postExchange = async (campaignCode: string, t: string) => {
  const responseData = await _callAPI(
    COMMON.stringFormat(API_END_POINT.EXCHANGE, campaignCode),
    'POST',
    {
      t,
    },
  );

  setAuthToken(responseData?.auth_token);
  document.cookie = `campaign_code=${campaignCode}; path=/;`;
  return responseData;
};

export const updateCartProductQuantity = async (
  campaignCode: string,
  productId: number,
  quantity: number,
) => {
  return await _callAuthenticatedAPI(
    COMMON.stringFormat(
      API_END_POINT.UPDATE_CART_PRODUCT_QUANTITY,
      campaignCode,
    ),
    'POST',
    {
      product_id: productId,
      quantity,
    },
  );
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
