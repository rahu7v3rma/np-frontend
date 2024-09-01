import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const downloadPDF = async (url: string) => {
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

export default downloadPDF;
