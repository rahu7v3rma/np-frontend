import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';

import { Product } from '@/types/product';

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

export const generateCartProductsPDF = (products: Product[]) => {
  const doc = new jsPDF();

  // Title styling
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30); // Dark gray for title
  doc.text('Cart Products Summary', 105, 20, { align: 'center' });

  let yOffset = 35; // Start yOffset after title

  products.forEach((productItem: any, index: number) => {
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
