import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export metrics charts as PDF
 * @param {HTMLElement} element - The element to export
 * @param {Object} options - Export options
 * @param {string} options.filename - PDF filename
 * @param {string} options.startDate - Start date for the report
 * @param {string} options.endDate - End date for the report
 */
export async function exportMetricsToPDF(element, options = {}) {
  const {
    filename = `metrics-report-${new Date().toISOString().split('T')[0]}.pdf`,
    startDate,
    endDate,
  } = options;

  try {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // Add title
    pdf.setFontSize(18);
    pdf.text('Sensor Metrics Report', margin, margin + 10);

    // Add date range if provided
    if (startDate || endDate) {
      pdf.setFontSize(12);
      const dateRangeText = `Period: ${startDate || 'N/A'} - ${endDate || 'N/A'}`;
      pdf.text(dateRangeText, margin, margin + 20);
    }

    // Add generation date
    pdf.setFontSize(10);
    const generatedText = `Generated: ${new Date().toLocaleString()}`;
    pdf.text(generatedText, pageWidth - margin - pdf.getTextWidth(generatedText), margin + 10);

    let yOffset = margin + 30;

    // Get all card elements (chart containers)
    const chartCards = element.querySelectorAll('.card');
    
    for (let i = 0; i < chartCards.length; i++) {
      const card = chartCards[i];
      
      // Check if we need a new page
      if (yOffset > pageHeight - 80) {
        pdf.addPage();
        yOffset = margin;
      }

      try {
        // Wait a bit for charts to render
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Convert card to canvas
        const canvas = await html2canvas(card, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits on current page
        if (yOffset + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yOffset = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      } catch (err) {
        console.error(`Error converting chart ${i} to image:`, err);
        // Skip this chart and continue
      }
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

