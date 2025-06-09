import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import React from 'react';

import { BASE_API_URL } from '@/services/common';
import { Order } from '@/types/order';
import { Product, ProductCart } from '@/types/product';

export const downloadPDF = async (url: string) => {
  try {
    // Fetch the HTML content from the URL
    const response = await fetch(url);
    const htmlText = await response.text();

    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = htmlText;
    document.body.appendChild(tempDiv);

    // Use html2canvas to capture the content of the div
    const canvas = await html2canvas(tempDiv, { scale: 2 });

    // Calculate dimensions for the PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
    const pageHeight = 295; // A4 height in mm
    const margin = 10; // Margin in mm
    let heightLeft = imgHeight;

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Add the image to the PDF
    let position = margin;
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      margin,
      position,
      imgWidth - 2 * margin,
      imgHeight - 2 * margin,
    );
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        margin,
        position,
        imgWidth - 2 * margin,
        imgHeight - 2 * margin,
      );
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save('download.pdf');

    // Remove the temporary div
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error('Failed to download PDF:', error);
  }
};

/**
 * Downloads the component as a PDF. It captures the content within the specified
 * ref and saves it as a PDF file with the given filename.
 *
 * @param ref - React reference to the HTML div element to be captured.
 * @param filename - The name of the PDF file to be saved.
 */
export const downloadComponentPDF = async (
  ref: React.RefObject<HTMLDivElement>,
  filename: string,
) => {
  if (!ref.current) return;

  // Temporarily make the element visible for capturing and set fixed dimensions
  const originalStyle = ref.current.style.cssText;
  ref.current.style.cssText = `
    position: absolute;
    top: -10000px;
    left: -10000px;
    width: 210mm;  // A4 paper width
    height: auto;  // Auto height to capture all content
    display: block;
  `;

  // Process all images within the component
  await processImagesInComponent(ref.current);

  document.body.appendChild(ref.current);

  try {
    const canvas = await html2canvas(ref.current, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      scrollY: -window.scrollY, // Adjust to get full content
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;

    // Calculate scaling to fit the image on a single page, respecting aspect ratio
    const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Center the image horizontally and vertically
    const xPosition = (pdfWidth - scaledWidth) / 2;
    const yPosition = (pdfHeight - scaledHeight) / 2;

    pdf.addImage(
      imgData,
      'PNG',
      xPosition,
      yPosition,
      scaledWidth,
      scaledHeight,
    );
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    // Restore the original style and remove from body
    if (ref.current) {
      ref.current.style.cssText = originalStyle;
      if (ref.current.parentNode === document.body) {
        document.body.removeChild(ref.current);
      }
    }
  }
};

export const generateCartProductsPDF = (products: ProductCart[]) => {
  const doc = new jsPDF();

  // Title styling
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30); // Dark gray for title
  doc.text('Cart Products Summary', 105, 20, { align: 'center' });

  let yOffset = 35; // Start yOffset after title

  products?.forEach((productItem: any, index: number) => {
    const { product, quantity, variations } = productItem;
    const variationsText = Object.entries(variations ?? {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    // Initialize boxHeight with base value
    let boxHeight = 35; // Base height for minimal content

    // Dynamic height calculation based on the length of each field
    const lineHeight = 8; // Line height for additional lines

    // Adjust box height for SKU
    if (product.sku.length > 50) {
      boxHeight += lineHeight * 2; // Add 2 lines if SKU is very long
    } else if (product.sku.length > 20) {
      boxHeight += lineHeight; // Add 1 line if SKU is moderately long
    }

    // Adjust box height for Brand and Supplier names
    if (product.brand.name.length > 50 || product.supplier.name.length > 50) {
      boxHeight += lineHeight * 2; // Add 2 lines if either is very long
    } else if (
      product.brand.name.length > 20 ||
      product.supplier.name.length > 20
    ) {
      boxHeight += lineHeight; // Add 1 line if either is moderately long
    }

    // Adjust box height for Description if it exists
    if (product.description) {
      boxHeight += lineHeight * Math.ceil(product.description.length / 70); // Add lines based on description length
    }

    // Draw rounded rectangle with dynamic height
    doc.setDrawColor(200, 200, 200); // Light border color
    doc.setFillColor(245, 245, 245); // Very light gray background
    doc.roundedRect(10, yOffset - 5, 190, boxHeight, 3, 3, 'FD'); // Dynamic box height

    // Product title and index
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204); // Light blue color for product name
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${product.name}`, 15, yOffset + 2);

    // SKU, Price, and Quantity display
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60); // Dark gray for detail text
    yOffset += 10;

    if (product.sku.length <= 20) {
      doc.text(`SKU: ${product.sku}`, 15, yOffset);
      doc.text(`Price: $${product.calculated_price}`, 80, yOffset);
      doc.text(`Quantity: ${quantity}`, 140, yOffset);
    } else {
      doc.text(`SKU: ${product.sku}`, 15, yOffset);
      yOffset += lineHeight;
      doc.text(`Price: $${product.calculated_price}`, 15, yOffset);
      doc.text(`Quantity: ${quantity}`, 80, yOffset);
    }

    yOffset += lineHeight;

    // Brand and Supplier display
    if (product.brand.name.length <= 20 && product.supplier.name.length <= 20) {
      doc.text(`Brand: ${product.brand.name}`, 15, yOffset);
      doc.text(`Supplier: ${product.supplier.name}`, 80, yOffset);
    } else {
      doc.text(`Brand: ${product.brand.name}`, 15, yOffset);
      yOffset += lineHeight;
      doc.text(`Supplier: ${product.supplier.name}`, 15, yOffset);
    }
    if (variations) {
      yOffset += lineHeight;
      doc.text(`Variations: ${variationsText}`, 15, yOffset);
    }

    // Description if available
    if (product.description) {
      yOffset += lineHeight; // Start after the last label
      doc.setFont('helvetica', 'italic');
      doc.text('Description:', 15, yOffset); // Print the label
      doc.setFont('helvetica', 'normal');
      doc.text(product.description, 38, yOffset, { maxWidth: 160 }); // Print the description next to the label

      // Check the length of the description and split if necessary
      if (product.description.length > 60) {
        const descriptionLines = doc.splitTextToSize(product.description, 160);
        // Move yOffset for the subsequent lines
        yOffset += lineHeight; // Move down for the first line
        for (let i = 1; i < descriptionLines.length; i++) {
          yOffset += lineHeight; // Move down for each subsequent line
          doc.text(descriptionLines[i], 38, yOffset, { maxWidth: 160 });
        }
      }
      // Move yOffset based on description length
      yOffset += lineHeight; // Extra space after description
    }

    yOffset += 15; // Extra gap between products
  });

  // Save the PDF
  doc.save('Cart_Products_Summary.pdf');
};

/**
 * Processes all images within the component, adjusting their sizes and aspect ratios
 * using a canvas to ensure proper rendering.
 *
 * @param element - The HTML element containing the images to be processed.
 */
const processImagesInComponent = async (element: HTMLElement) => {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map((img: HTMLImageElement) => {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.src = img.src;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const canvasWidth = img.width;
        const canvasHeight = img.height;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const imgAspectRatio = image.width / image.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspectRatio > canvasAspectRatio) {
          // Image is wider relative to canvas
          drawHeight = canvasHeight;
          drawWidth = image.width * (canvasHeight / image.height);
          offsetX = (canvasWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller relative to canvas
          drawWidth = canvasWidth;
          drawHeight = image.height * (canvasWidth / image.width);
          offsetX = 0;
          offsetY = (canvasHeight - drawHeight) / 2;
        }

        // Draw the image to the canvas
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        // Replace the original image source with the canvas image
        img.src = canvas.toDataURL();
        resolve();
      };
    });
  });

  await Promise.all(promises);
};
/**
 * Generates a proxied image URL using Next.js's image optimization path.
 *
 * Note: Next.js image loader is not directly callable from custom code.
 * As a result, we must manually construct the image URL with the '/_next/image'
 * prefix along with the encoded image URL, width, and quality parameters.
 * This mimics the behavior of the Next.js image loader internally, but the
 * logic relies on Next.js' internal image processing system.
 *
 * @param imageUrl - The URL of the image to be proxied.
 * @param width - The desired width of the image (default is 640px).
 * @param quality - The desired quality of the image (default is 75).
 * @returns The proxied image URL that can be used with Next.js's image optimization system.
 */
function getNextImageProxyUrl(
  imageUrl: string,
  width: number = 640,
  quality: number = 75,
): string {
  const encodedUrl = encodeURIComponent(imageUrl);
  return `/_next/image?url=${encodedUrl}&w=${width}&q=${quality}`;
}
const getBase64FromUrl = async (url?: string, fallbackUrl?: string) => {
  if (!url) return fallbackUrl || '';

  try {
    const base64Image = getNextImageProxyUrl(url);
    const response = await fetch(base64Image);

    // Check if the response is okay
    if (!response.ok) {
      console.warn(`Failed to fetch image from ${base64Image}`);
      return fallbackUrl || '';
    }

    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error, url);
    return fallbackUrl || '';
  }
};

export const generateDeliveryPDF = async (
  orderDetails: Order,
  deliveryLocation: string,
  t: (key: string, options?: any) => string,
  locale: string,
) => {
  let deliveryDetailHtml;

  const totalGiftPrice = orderDetails.products.reduce((total, product) => {
    return total + product.product.calculated_price * product.quantity;
  }, 0);
  const defaultScannerImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const defaultProductImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

  const productImagesBase64 = await Promise.all(
    orderDetails.products.map(async (product) => {
      let imageUrl = product.product.images[0]?.image;
      // If no image is available, use the default product image
      if (!imageUrl) {
        return defaultProductImage;
      }
      // Use the improved getBase64FromUrl function with the actual product image URL
      try {
        const base64Image = getNextImageProxyUrl(imageUrl);
        return base64Image;
      } catch (error) {
        console.error('Error processing product image:', error);
        return defaultProductImage;
      }
    }),
  );
  // Default fallback image URLs (optional)
  const qrCodeBase64 = await QRCode.toDataURL(
    window.location.origin + '/' + orderDetails.reference + '/order/',
  );
  if (deliveryLocation === 'ToOffice') {
    let officeDeliveryAddress = '';
    if (orderDetails?.delivery_apartment_number) {
      officeDeliveryAddress += orderDetails?.delivery_apartment_number;
    }
    if (orderDetails?.delivery_street_number) {
      officeDeliveryAddress += ', ' + orderDetails?.delivery_street_number;
    }
    if (orderDetails?.delivery_street) {
      officeDeliveryAddress += ', ' + orderDetails?.delivery_street;
    }
    if (orderDetails?.delivery_city) {
      officeDeliveryAddress += ', ' + orderDetails?.delivery_city;
    }
    deliveryDetailHtml = `<p class="description secondary-text-color">${officeDeliveryAddress || 'N/A'}</p>`;
  } else {
    const {
      full_name,
      phone_number,
      additional_phone_number,
      delivery_city,
      delivery_street,
      delivery_street_number,
      delivery_apartment_number,
      delivery_additional_details,
    } = orderDetails;

    const addressFields = [
      { [t('checkout.fullName')]: full_name },
      { [t('checkout.phone')]: phone_number },
      { [t('checkout.additionalPhone')]: additional_phone_number },
      { [t('checkout.city')]: delivery_city },
      { [t('checkout.street')]: delivery_street },
      { [t('checkout.number')]: delivery_street_number },
      { [t('checkout.apartment')]: delivery_apartment_number },
      { [t('checkout.moreDetails')]: delivery_additional_details },
    ];

    const htmlAddressFields = addressFields.map((address) => {
      const [key, value] = Object.entries(address)[0];

      return `<p class="home-delivery__address-title">
                  <span class="description primary-text-color">${key}</span>
                  <span class="description secondary-text-color">${value || 'N/A'}</span>
              </p>`;
    });

    deliveryDetailHtml = htmlAddressFields.join('');
  }
  // Configuration for html2pdf
  const pdfConfig = {
    margin: 0,
    filename: 'delivery_order.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  };

  // Convert live image URLs to base64
  const scannerBase64 = await getBase64FromUrl(
    orderDetails.scanner_image_url || 'https://i.ibb.co/p6fmPDYc/scanner.png',
    defaultScannerImage,
  );

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="${locale}" dir="${locale === 'he' ? 'rtl' : 'ltr'}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Public Sans', sans-serif;
                padding: 20px;
            }
    
            h1 {
                margin-bottom: 0;
            }
    
            h2,
            p {
                margin: 0;
            }
    
            .title {
                font-size: 16px;
                line-height: 24px;
                font-weight: 500;
                letter-spacing: 0;
                color: #363839;
            }
    
            .primary-text-color {
                color: #363839;
                font-weight: 500;
                font-size: 14px;
                line-height: 22px;
            }
    
            .secondary-text-color {
                color: #868788;
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
            }
    
            .bold-title {
                font-size: 18px;
                font-weight: 600;
                line-height: 28px;
                text-align: left;
                margin: 0;
                color: #363839;
                margin-bottom: 15px;
            }
    
            .container {
                border: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding-bottom: 15px;
                padding-top: 15px;
            }
    
            .order-title-container {
                margin-bottom: 16px;
                margin-top: 50px;
            }
    
            .order-title {
                font-weight: 600;
                font-size: 24px;
                line-height: 36px;
                letter-spacing: 0;
                color: #363839;
                text-align: center;
            }
    
            .scanner-container {
                text-align: center;
                margin-bottom: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin-top: 10px
            }
    
            .description {
                font-size: 14px;
                font-weight: 400;
                line-height: 22px;
                letter-spacing: 0;
            }
    
            .product-description-container p {
                text-align: center;
            }
    
            .card {
                width: 344px;
                background-color: #fff;
                border-radius: 20px;
                padding: 20px 24px;
                border: 1px solid rgba(145, 158, 171, 0.12);
                padding-bottom: 30px;
                max-width: 90%;
                margin-top: 30px;
            }
    
            .product-container {
                display: flex;
                gap: 15px;
                max-height: 80px;
                margin-bottom: 20px;
            }
    
            .price-container {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid rgba(145, 158, 171, 0.12);
                padding-bottom: 30px;
            }
    
            .price-container :nth-child(2) {
                margin-right: 8px;
            }
    
            .product-details {
                text-align: left;
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
                letter-spacing: 0;
                overflow: hidden;
            }
    
            .delivery-title {
                margin-bottom: 24px;
                text-align: left;
            }
    
            .delivery-info > div {
                text-align: left;
            }
    
            .home-delivery__address-title {
                display: flex;
                justify-content: space-between;
            }
    
            .home-delivery__address-title {
                margin-bottom: 16px;
            }
    
            address {
                font-style: normal;
            }

            .scanner-description {
              font-weight: 300;
              font-size: 14px;
              line-height: 22px;
              color: #363839;
            }
            .product-image-container {
               width:80px;
               height:80px;
            }

            .exchange-instructions {
              max-width: 480px;
              font-size: 16px;
              line-height: 24px;
              color: #363839;
              text-align: center;
              margin-bottom: 15px;
              margin-top: 30px;
            }

            .delivery-page{
              margin-top: 20px;
            }

            .delivery-page-container {
              width: 344px;
              background-color: #fff;
              border-radius: 20px;
              padding: 10px 24px;
              border: 1px solid rgba(145, 158, 171, 0.12);
              margin-top: 30px;
              padding-bottom: 40px;
              max-width: 90%;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="order-title-container">
                <h1 class="order-title">${t('order.greeting')}</h1>
                <h2 class="order-title">${orderDetails.reference ?? ''}</h2>
            </div>
    
            <div class="scanner-container">
                <img src="${qrCodeBase64}" alt="scanner" width="80px" height="80px">
                <p class="scanner-description description primary-text-color">${t('order.scancode')}</p>
            </div>

            <div class="exchange-instructions">
              ${t('checkoutExchangeInstructions')}
            </div>


          ${await (async () => {
            const products = orderDetails.products;
            const groups = [];
            // First group has exactly 4 items (or all if less than 4)
            const firstGroupSize = Math.min(4, products.length);
            let isFirstGroup = true;
            groups.push(
              products
                .slice(0, firstGroupSize)
                .map((product, idx) => [product, idx]),
            );
            let currentIndex = firstGroupSize;
            while (currentIndex < products.length) {
              isFirstGroup = false;
              const remainingProducts = products.length - currentIndex;
              const groupSize = Math.min(6, remainingProducts);
              groups.push(
                products
                  .slice(currentIndex, currentIndex + groupSize)
                  .map((product, idx) => [product, currentIndex + idx]),
              );
              currentIndex += groupSize;
            }
            // Check if we should remove top border radius
            const lastGroupSize = groups[groups.length - 1].length;
            const shouldRemoveTopBorderRadius =
              isFirstGroup && lastGroupSize === 1;
            const borderRadiusStyle = shouldRemoveTopBorderRadius
              ? 'border-radius: 0 0 20px 20px; border-top: none;margin-top:0px;'
              : 'border-radius: 20px;';
            const priceContainerStyle = shouldRemoveTopBorderRadius
              ? 'border-top: 1px solid rgba(145, 158, 171, 0.12);'
              : '';
            // Generate HTML for each group
            return {
              productsHtml: groups
                .map(
                  (productGroup) =>
                    `<div class="card" style="${shouldRemoveTopBorderRadius ? 'border-radius: 20px 20px 0 0; border-bottom: none' : 'border-radius: 20px;'}">
                  ${productGroup
                    .map(([product, idx]: any) => {
                      return `
                    <h3 class="bold-title" style="text-align: ${locale === 'he' ? 'right' : 'left'};">${t('common.item')} ${idx + 1}</h3>
                    <div class="product-container">
                      <img class="product-image-container" src="${productImagesBase64[idx]}" alt="product-img"></img>
                        <div class="product-details">
                          <p class="description secondary-text-color">${product.product.name ?? ''}</p>
                        </div>
                    </div>
                  `;
                    })
                    .join('')}
                  </div>
                  ${productGroup.length > 2 || (isFirstGroup && productGroup.length >= 2) ? '<div class="html2pdf__page-break"></div>' : ''}
                  `,
                )
                .join(''),
              borderRadiusStyle,
              priceContainerStyle,
            };
          })().then((result) => {
            return (
              result.productsHtml +
              `
              <div class="delivery-page-container" style="${result.borderRadiusStyle}">
              <div class="price-container" style="${result.priceContainerStyle}">`
            );
          })}
                    <h3 class="title">${t('common.total')}</h3>
                    <h3 class="title">${totalGiftPrice ? `${t('currencySymbol')}${totalGiftPrice}` : ''}</h3>
                </div>
                <div class="delivery-page">
                    <h3 class="title delivery-title" style="text-align: ${locale === 'he' ? 'right' : 'left'};">
                        ${deliveryLocation === 'ToHome' ? t('order.homeDelivery') : t('order.officeDelivery')}
                    </h3>
                    <address class="delivery-info">
                        <div>
                            ${deliveryDetailHtml}
                        </div>
                    </address>
                </div>
              </div>
        </div>
    </body></html>`;

  // Generate PDF
  html2pdf().from(htmlTemplate).set(pdfConfig).save();
};
