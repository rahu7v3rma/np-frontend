import { Product, ProductCart } from './product';

export type Order = {
  full_name: string;
  added_payment: boolean;
  reference: number;
  scanner_image_url?: string;
  order_date_time: string;
  products: ProductCart[];
  phone_number: string;
  total?: number;
  additional_phone_number: string;
  delivery_city: string;
  delivery_street: string;
  delivery_street_number: string;
  delivery_apartment_number: string;
  delivery_additional_details: string;
};
