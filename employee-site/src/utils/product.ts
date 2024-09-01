import { ProductImage } from '@/types/product';

export const sortProductImages = (productImages: ProductImage[]) => {
  // sort product images so that the main image is first

  // since false = 0 and true = 1, this will result in -1 if a is
  // the main image, 1 if b is the main image and 0 if none of them is
  // (or if both of them are for some reason)
  productImages.sort((a, b) => Number(b.main) - Number(a.main));
};
