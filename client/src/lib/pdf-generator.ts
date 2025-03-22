import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfOptions {
  filename?: string;
  watermark?: boolean;
  logoUrl?: string;
  organization?: string;
  pageTitle?: string;
}

/**
 * Generate a PDF from a DOM element with branding and watermark
 * @param element The DOM element to convert to PDF
 * @param options PDF generation options
 */
export async function generatePDF(
  element: HTMLElement, 
  options: PdfOptions = {}
): Promise<void> {
  try {
    const {
      filename = 'download.pdf',
      watermark = true,
      logoUrl = '/logo.svg',
      organization = 'SeekLab',
      pageTitle = 'Test Results'
    } = options;

    // Capture the HTML content as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions while maintaining aspect ratio
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const contentWidth = pdfWidth - 20; // 10mm margins on each side
    const contentHeight = contentWidth / ratio;

    // Add logo at the top of the page
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'Anonymous';
      logoImg.src = logoUrl;
      
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          // Determine image format based on URL or mime type
          let format: string = 'PNG';
          
          if (logoUrl.toLowerCase().endsWith('.svg')) {
            format = 'SVG';
          } else if (logoUrl.toLowerCase().endsWith('.jpg') || logoUrl.toLowerCase().endsWith('.jpeg')) {
            format = 'JPEG';
          }
          
          // Calculate dimensions while preserving aspect ratio
          const logoWidth = 40; // mm
          const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
          
          try {
            pdf.addImage(
              logoImg, 
              format, 
              10, 
              10, 
              logoWidth, 
              logoHeight
            );
          } catch (e) {
            console.warn('Failed to add logo with format', format, 'trying alternative format');
            // Try alternative format as fallback
            pdf.addImage(
              logoImg, 
              'JPEG', 
              10, 
              10, 
              logoWidth, 
              logoHeight
            );
          }
          resolve();
        };
        logoImg.onerror = (e) => {
          console.error('Error loading logo for PDF:', e);
          resolve(); // Continue even if logo fails to load
        };
        
        // Set a timeout in case the image loading hangs
        setTimeout(() => {
          console.warn('Logo loading timed out');
          resolve();
        }, 3000);
      });
      
      // Add organization name and document title
      pdf.setFontSize(16);
      pdf.setTextColor(42, 92, 138); // #2A5C8A
      pdf.text(organization, pdfWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(pageTitle, pdfWidth / 2, 28, { align: 'center' });
      
      // Add watermark if enabled
      if (watermark) {
        // Create diagonal watermark
        pdf.setTextColor(200, 200, 200);
        pdf.setFontSize(40);
        pdf.setGState({ opacity: 0.15 } as any);
        
        // Calculate dimensions for repeated watermark text
        const watermarkText = "CONFIDENTIAL";
        const angle = -45;
        
        // Add multiple watermarks for better coverage
        for (let x = 0; x < pdfWidth + 100; x += 120) {
          for (let y = 0; y < pdfHeight + 100; y += 120) {
            pdf.text(
              watermarkText,
              x,
              y,
              {
                angle: angle,
              }
            );
          }
        }
        
        // Company name watermark in center
        pdf.setFontSize(60);
        pdf.setGState({ opacity: 0.1 } as any);
        
        // Center the main watermark
        const textWidth = pdf.getTextWidth(organization);
        pdf.text(
          organization, 
          pdfWidth / 2 - textWidth / 2, 
          pdfHeight / 2, 
          { 
            angle: -45
          }
        );
        
        // Reset opacity
        pdf.setGState({ opacity: 1.0 } as any);
      }
      
      // Add page content with adequate margins below the header
      const contentImage = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for better compression
      pdf.addImage(
        contentImage, 
        'JPEG', 
        10, // x margin
        40, // y position (below the header)
        contentWidth, 
        contentHeight
      );
      
      // Add footer with timestamp
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated on ${timestamp} | ${organization} - Confidential`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error adding branding to PDF:', error);
      
      // Fallback to basic PDF without branding
      const contentImage = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(
        contentImage, 
        'JPEG', 
        10, 
        10, 
        contentWidth, 
        contentHeight
      );
      pdf.save(filename);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}