import { Product } from './product';

export type OrderProduct = {
  quantity: number;
  product: Product;
};

export type Order = {
  full_name: string;
  added_payment: boolean;
  reference: number;
  order_date_time: string;
  products: OrderProduct[];
  phone_number: string;
  additional_phone_number: string;
  delivery_city: string;
  delivery_street: string;
  delivery_street_number: string;
  delivery_apartment_number: string;
  delivery_additional_details: string;
};
