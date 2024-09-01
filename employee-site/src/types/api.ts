export type MethodType =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'PATCH';

export type LoginPayload =
  | { email: string }
  | { phone_number: string }
  | { auth_id: string };

export type OrderPayload = {
  product_id: number;
  full_name: string;
  phone_number: string;
  additional_phone_number: string | undefined;
  delivery_city: string;
  delivery_street: string;
  delivery_street_number: number;
  delivery_apartment_number: string | undefined;
  delivery_additional_details: string | undefined;
};
