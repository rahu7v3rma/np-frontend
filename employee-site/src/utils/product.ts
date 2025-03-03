import { ProductImage, Product } from '@/types/product';

export const sortProductImages = (productImages: ProductImage[]) => {
  // sort product images so that the main image is first

  // since false = 0 and true = 1, this will result in -1 if a is
  // the main image, 1 if b is the main image and 0 if none of them is
  // (or if both of them are for some reason)
  productImages.sort((a, b) => Number(b.main) - Number(a.main));
};

/**
 * Retrieves the main image URL for a product.
 * If no main image is marked, it returns the URL of the first image.
 */
export const getProductMainImageUrl = (
  productImages: ProductImage[],
): string => {
  const mainImage =
    productImages.find((image) => image.main) || productImages[0];
  const imagePath = mainImage?.image || '';
  return imagePath;
};

/**
 * Checks if a product is out of stock based on its remaining quantity.
 */
export const isProductOutOfStock = (product?: Product): boolean => {
  return (
    product?.remaining_quantity !== undefined &&
    product?.remaining_quantity <= 0
  );
};
