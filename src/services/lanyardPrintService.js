import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class LanyardPrintService {
  static async printLanyards(visitorCount, studentName, pageSize = 'a6') {
    try {
      // Set page size and lanyard dimensions
      let pdfSize = 'a6';
      let lanyardWidth = 105, lanyardHeight = 148, margin = 5;
      if (pageSize === 'a5') {
        pdfSize = 'a5';
        lanyardWidth = 148;
        lanyardHeight = 210;
        margin = 10;
      } else if (pageSize === 'a4') {
        pdfSize = 'a4';
        lanyardWidth = 210;
        lanyardHeight = 297;
        margin = 10;
      }
      // Create a temporary container for all lanyards
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = `${lanyardWidth}mm`;
      printContainer.style.height = `${lanyardHeight}mm`;
      printContainer.style.background = 'white';
      printContainer.style.padding = '0';
      printContainer.style.margin = '0';
      document.body.appendChild(printContainer);

      // Generate lanyards
      for (let i = 0; i < visitorCount; i++) {
        const lanyardElement = document.getElementById(`lanyard-${i}`);
        if (lanyardElement) {
          // Clone the lanyard element
          const clonedLanyard = lanyardElement.cloneNode(true);
          // Apply print-specific styles
          clonedLanyard.style.width = `${lanyardWidth}mm`;
          clonedLanyard.style.height = `${lanyardHeight}mm`;
          clonedLanyard.style.transform = 'none';
          clonedLanyard.style.margin = '0';
          clonedLanyard.style.pageBreakAfter = 'always';
          clonedLanyard.style.breakAfter = 'page';
          printContainer.appendChild(clonedLanyard);
        }
      }

      // Wait for images to load
      await this.waitForImages(printContainer);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', pdfSize);
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate how many lanyards can fit on one page
      const lanyardsPerPage = Math.floor((pageHeight - 2 * margin) / lanyardHeight);
      const totalPages = Math.ceil(visitorCount / lanyardsPerPage);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const startIndex = page * lanyardsPerPage;
        const endIndex = Math.min(startIndex + lanyardsPerPage, visitorCount);

        for (let i = startIndex; i < endIndex; i++) {
          const lanyardIndex = i - startIndex;
          const yPosition = margin + (lanyardIndex * lanyardHeight);

          // Create canvas for this lanyard
          const lanyardElement = printContainer.children[i];
          if (lanyardElement) {
            const canvas = await html2canvas(lanyardElement, {
              scale: 2, // Higher resolution
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: lanyardWidth * 3.779527559, // Convert mm to pixels (96 DPI)
              height: lanyardHeight * 3.779527559,
              scrollX: 0,
              scrollY: 0,
              windowWidth: lanyardWidth * 3.779527559,
              windowHeight: lanyardHeight * 3.779527559
            });

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/png');

            // Add image to PDF
            pdf.addImage(
              imgData, 
              'PNG', 
              margin, 
              yPosition, 
              lanyardWidth, 
              lanyardHeight
            );
          }
        }
      }

      // Clean up
      document.body.removeChild(printContainer);

      // Save PDF
      const fileName = `visitor-lanyards-${studentName}-${pdfSize}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Error printing lanyards:', error);
      throw new Error('Failed to generate lanyards PDF');
    }
  }

  static async waitForImages(container) {
    const images = container.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        }
      });
    });
    
    await Promise.all(imagePromises);
  }

  static async printDirect(visitorCount, studentName, onErrorFallback, pageSize = 'a6', volunteerName = 'Volunteer') {
    try {
      // Set page size and lanyard dimensions
      let cssPageSize = 'A6';
      let lanyardWidth = 105, lanyardHeight = 148;
      if (pageSize === 'a5') {
        cssPageSize = 'A5';
        lanyardWidth = 148;
        lanyardHeight = 210;
      } else if (pageSize === 'a4') {
        cssPageSize = 'A4';
        lanyardWidth = 210;
        lanyardHeight = 297;
      }
      // Alternative method: Print directly using browser print
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        if (onErrorFallback) onErrorFallback(new Error('Popup blocked. Please allow popups for this site.'));
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      // Create HTML content for printing
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Visitor Lanyards - ${studentName}</title>
          <style>
            @page {
              size: ${cssPageSize};
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
              background: white;
            }
            .lanyard-page {
              width: ${lanyardWidth}mm;
              height: ${lanyardHeight}mm;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: radial-gradient(circle at 70% 30%, #e0e7ef 60%, #38bdf8 100%), linear-gradient(135deg, #f0f4ff 0%, #cfd9e9 100%);
              box-shadow: 0 8px 32px rgba(56,189,248,0.10), 0 2px 8px rgba(37,99,235,0.08);
              border: 2.5px solid #2563eb;
              overflow: hidden;
              min-height: 100%;
            }
            .accent-bar {
              height: 10px;
              width: 100%;
              background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
              border-radius: 12px 12px 0 0;
              margin-bottom: 8px;
            }
            .decorative-circle-1 {
              position: absolute;
              top: -40px;
              left: -40px;
              width: 120px;
              height: 120px;
              background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
              opacity: 0.13;
              border-radius: 50%;
              z-index: 0;
            }
            .decorative-circle-2 {
              position: absolute;
              bottom: -30px;
              right: -30px;
              width: 90px;
              height: 90px;
              background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%);
              opacity: 0.10;
              border-radius: 50%;
              z-index: 0;
            }
            .lanyard-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.08;
              z-index: 1;
              pointer-events: none;
            }
            .lanyard-watermark img {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            .lanyard-content {
              position: relative;
              z-index: 2;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .lanyard-header {
              text-align: center;
              margin-bottom: 0;
            }
            .lanyard-logo {
              height: 48px;
              margin-bottom: 4px;
            }
            .deskbuddy-brand {
              font-weight: 900;
              font-size: 1.25rem;
              color: #2563eb;
              letter-spacing: 0.08em;
              margin-bottom: 8px;
              text-shadow: 0 2px 8px #cfd9e9;
            }
            .lanyard-message {
              margin: 0.5rem 0 1.2rem 0;
              text-align: center;
            }
            .lanyard-title {
              font-size: 1.15rem;
              font-weight: 800;
              color: #1e293b;
              margin: 0;
              line-height: 1.3;
              letter-spacing: 0.01em;
              text-shadow: 0 1px 2px #fff;
            }
            .lanyard-subtitle {
              font-size: 1rem;
              color: #475569;
              margin: 0.3rem 0 0 0;
              font-weight: 600;
            }
            .lanyard-info {
              background: rgba(255,255,255,0.97);
              border-radius: 10px;
              padding: 1.1rem 1.2rem;
              margin: 0 auto 0.7rem auto;
              box-shadow: 0 2px 8px rgba(0,123,255,0.08);
              border: 1.5px solid #e0e7ef;
              max-width: 320px;
            }
            .lanyard-info-item {
              font-size: 1.05rem;
              font-weight: 700;
              color: #2563eb;
              margin-bottom: 8px;
              display: flex;
              justify-content: flex-start;
              align-items: center;
            }
            .lanyard-info-item:last-child {
              margin-bottom: 0;
            }
            .lanyard-value {
              color: #1e293b;
              font-weight: 800;
              margin-left: 8px;
            }
            .lanyard-footer {
              text-align: center;
              padding-top: 8px;
              border-top: 1px solid #e0e7ef;
              margin-top: 8px;
            }
            .lanyard-footer-text {
              font-size: 0.95rem;
              color: #64748b;
              font-weight: 600;
              margin: 0;
              letter-spacing: 0.01em;
            }
            @media print {
              .lanyard-page {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
      `;
      // Add lanyards to HTML
      for (let i = 0; i < visitorCount; i++) {
        htmlContent += `
          <div class="lanyard-page">
            <div class="decorative-circle-1"></div>
            <div class="decorative-circle-2"></div>
            <div class="accent-bar"></div>
            <div class="lanyard-watermark">
              <img src="/title.webp" alt="DeskBuddy" />
            </div>
            <div class="lanyard-content">
              <div class="lanyard-header">
                <img src="/title.png" alt="DeskBuddy" class="lanyard-logo" />
                <div class="deskbuddy-brand">DeskBuddy</div>
              </div>
              <div class="lanyard-message">
                <h2 class="lanyard-title">Welcome to Our College Family!</h2>
                <div class="lanyard-subtitle">You're not just dropping off a student today.<br />You're joining our extended family!</div>
              </div>
              <div class="lanyard-info">
                <div class="lanyard-info-item">Guest of: <span class="lanyard-value">${studentName}</span></div>
                <div class="lanyard-info-item">Scanned by: <span class="lanyard-value">${volunteerName}</span></div>
                <div class="lanyard-info-item">Date: <span class="lanyard-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div class="lanyard-info-item">Day: <span class="lanyard-value">${new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span></div>
                <div class="lanyard-info-item">Time: <span class="lanyard-value">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
              </div>
              <div class="lanyard-footer">
                <p class="lanyard-footer-text">Please wear this lanyard during your visit</p>
              </div>
            </div>
          </div>
        `;
      }
      htmlContent += `
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.print();
            printWindow.close();
          } catch (err) {
            if (onErrorFallback) onErrorFallback(err);
          }
        }, 500);
      };
      return { success: true, method: 'direct' };
    } catch (error) {
      if (onErrorFallback) onErrorFallback(error);
      throw error;
    }
  }
}

export default LanyardPrintService; 