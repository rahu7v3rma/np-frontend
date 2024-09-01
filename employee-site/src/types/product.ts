export type ProductImage = {
  main: boolean;
  image: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  sku: string;
  calculated_price: number;
  extra_price: number;
  technical_details: string;
  warranty: string;
  exchange_value: number;
  exchange_policy: string;
  brand: {
    name: string;
    logo_image: string;
  };
  supplier: {
    name: string;
  };
  images: ProductImage[];
  categories: {
    id: number;
    name: string;
    icon_image: string;
  }[];
  tags: {
    name: string;
  }[];
  total_product_count: number;
  product_type: 'REGULAR' | 'LARGE_PRODUCT' | 'SENT_BY_SUPPLIER';
  product_kind: string;
};

export interface ProductCart {
  id: number;
  quantity: number;
  product: Product;
}
