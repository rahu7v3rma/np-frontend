export type ProductImage = {
  main: boolean;
  image: string;
  selected: boolean;
};

export type ProductKind = 'PHYSICAL' | 'MONEY' | 'BUNDLE' | 'VARIATION';

export type Product = {
  id: number;
  name: string;
  description: string;
  special_offer: string;
  sku: string;
  calculated_price: number;
  voucher_value: number;
  extra_price: number;
  remaining_quantity: number;
  discount_rate: number;
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
  product_kind: ProductKind;
  variations: Variation[];
  link: string;
};

export interface ProductCart {
  id: number;
  quantity: number;
  product: Omit<Product, 'variations'>;
  variations: Record<string, string>;
}

export interface ProductFilterValue {
  id: string;
  name: string;
}

export interface BrandsType {
  id: string;
  name: string;
}

export interface ColorVariation {
  name: string;
  color_code: string;
  image: string;
}

export interface TextVariation {
  text: string;
}

export interface Variation {
  variation_kind: 'COLOR' | 'TEXT';
  system_name: string;
  site_name: string;
  color_variation: ColorVariation[];
  text_variation: TextVariation[];
}
