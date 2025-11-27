import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

class PDFExportService {
  constructor() {
    this.pdf = null;
    this.currentY = 0;
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  async generateAnalyticsReport(analyticsData, chartsRefs) {
    try {
      // Initialize PDF
      this.pdf = new jsPDF('portrait', 'mm', 'a4');
      this.currentY = this.margin;

      // Add header
      await this.addHeader();
      
      // Add summary section
      await this.addSummarySection(analyticsData);
      
      // Add charts
      await this.addChartsSection(chartsRefs);
      
      // Add data table
      await this.addDataTableSection(analyticsData.logs);
      
      // Add footer
      await this.addFooter();

      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      this.pdf.save(`deskbuddy-analytics-report-${timestamp}.pdf`);
      
      return true;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  async addHeader() {
    // Title
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(37, 99, 235);
    this.pdf.text('DeskBuddy Analytics Report', this.margin, this.currentY);
    this.currentY += 15;

    // Subtitle
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 116, 139);
    this.pdf.text('Comprehensive scan activity and volunteer performance analysis', this.margin, this.currentY);
    this.currentY += 10;

    // Date
    this.pdf.setFontSize(10);
    this.pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, this.margin, this.currentY);
    this.currentY += 20;

    // Add decorative line
    this.pdf.setDrawColor(37, 99, 235);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  async addSummarySection(analyticsData) {
    // Section title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.text('Summary Overview', this.margin, this.currentY);
    this.currentY += 12;

    // Summary cards
    const summaryItems = [
      { label: 'Total Scans', value: analyticsData.totalScans, color: [102, 126, 234] },
      { label: 'Unique Students', value: analyticsData.uniqueStudents, color: [16, 185, 129] },
      { label: 'Active Volunteers', value: analyticsData.uniqueVolunteers, color: [245, 158, 11] }
    ];

    const cardWidth = (this.contentWidth - 20) / 3;
    const cardHeight = 25;

    summaryItems.forEach((item, index) => {
      const x = this.margin + (index * (cardWidth + 10));
      
      // Card background
      this.pdf.setFillColor(248, 250, 252);
      this.pdf.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Card border
      this.pdf.setDrawColor(...item.color);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, 'S');
      
      // Value
      this.pdf.setFontSize(18);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(...item.color);
      this.pdf.text(item.value.toString(), x + 5, this.currentY + 8);
      
      // Label
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 116, 139);
      this.pdf.text(item.label, x + 5, this.currentY + 18);
    });

    this.currentY += cardHeight + 20;
  }

  async addChartsSection(chartsRefs) {
    // Section title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.text('Analytics Charts', this.margin, this.currentY);
    this.currentY += 12;

    // Add each chart
    for (const [chartName, chartRef] of Object.entries(chartsRefs)) {
      if (chartRef && chartRef.current) {
        try {
          // Check if we need a new page
          if (this.currentY > this.pageHeight - 100) {
            this.pdf.addPage();
            this.currentY = this.margin;
          }

          // Chart title
          this.pdf.setFontSize(12);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor(30, 41, 59);
          this.pdf.text(this.formatChartTitle(chartName), this.margin, this.currentY);
          this.currentY += 8;

          // Convert chart to image
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = this.contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if chart fits on current page
          if (this.currentY + imgHeight > this.pageHeight - 30) {
            this.pdf.addPage();
            this.currentY = this.margin;
          }

          // Add chart image
          this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
          this.currentY += imgHeight + 15;

        } catch (error) {
          console.error(`Failed to add chart ${chartName}:`, error);
          // Add placeholder text if chart fails
          this.pdf.setFontSize(10);
          this.pdf.setFont('helvetica', 'italic');
          this.pdf.setTextColor(156, 163, 175);
          this.pdf.text(`Chart "${chartName}" could not be rendered`, this.margin, this.currentY);
          this.currentY += 10;
        }
      }
    }
  }

  async addDataTableSection(logs) {
    if (!logs || logs.length === 0) return;

    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }

    // Section title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.text('Scan Activity Data', this.margin, this.currentY);
    this.currentY += 12;

    // Table headers
    const headers = ['Student', 'Student ID', 'Stage', 'Volunteer', 'Timestamp'];
    const columnWidths = [40, 30, 25, 35, 40];
    const startX = this.margin;

    // Header row
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.setDrawColor(226, 232, 240);
    this.pdf.setLineWidth(0.5);
    
    let currentX = startX;
    headers.forEach((header, index) => {
      this.pdf.rect(currentX, this.currentY, columnWidths[index], 8, 'F');
      this.pdf.rect(currentX, this.currentY, columnWidths[index], 8, 'S');
      
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(30, 41, 59);
      this.pdf.text(header, currentX + 2, this.currentY + 5);
      
      currentX += columnWidths[index];
    });

    this.currentY += 8;

    // Data rows (limit to first 20 rows to avoid PDF size issues)
    const limitedLogs = logs.slice(0, 20);
    
    limitedLogs.forEach((log) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 30) {
        this.pdf.addPage();
        this.currentY = this.margin;
        
        // Re-add headers on new page
        currentX = startX;
        headers.forEach((header, index) => {
          this.pdf.setFillColor(248, 250, 252);
          this.pdf.rect(currentX, this.currentY, columnWidths[index], 8, 'F');
          this.pdf.rect(currentX, this.currentY, columnWidths[index], 8, 'S');
          
          this.pdf.setFontSize(8);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor(30, 41, 59);
          this.pdf.text(header, currentX + 2, this.currentY + 5);
          
          currentX += columnWidths[index];
        });
        this.currentY += 8;
      }

      // Data row
      currentX = startX;
      const rowData = [
        log.studentName || 'N/A',
        log.studentId || 'N/A',
        log.stage || 'N/A',
        log.volunteerName || 'N/A',
        new Date(log.timestamp).toLocaleString()
      ];

      rowData.forEach((cell, index) => {
        this.pdf.setFillColor(255, 255, 255);
        this.pdf.rect(currentX, this.currentY, columnWidths[index], 6, 'F');
        this.pdf.rect(currentX, this.currentY, columnWidths[index], 6, 'S');
        
        this.pdf.setFontSize(7);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(71, 85, 105);
        
        // Truncate text if too long
        const maxLength = Math.floor(columnWidths[index] / 3);
        const displayText = cell.length > maxLength ? cell.substring(0, maxLength) + '...' : cell;
        this.pdf.text(displayText, currentX + 2, this.currentY + 4);
        
        currentX += columnWidths[index];
      });

      this.currentY += 6;
    });

    // Add note about limited rows
    if (logs.length > 20) {
      this.currentY += 5;
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setTextColor(156, 163, 175);
      this.pdf.text(`Note: Showing first 20 of ${logs.length} total records. Use CSV export for complete data.`, this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  async addFooter() {
    // Add page number
    const pageCount = this.pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(156, 163, 175);
      this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin - 25, this.pageHeight - 10);
      
      // Add decorative line
      this.pdf.setDrawColor(226, 232, 240);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
    }
  }

  formatChartTitle(chartName) {
    const titles = {
      'scansByStage': 'Scans by Stage',
      'scansByVolunteer': 'Scans by Volunteer',
      'scansOverTime': 'Scans Over Time',
      'hourlyDistribution': 'Peak Hours Analysis'
    };
    return titles[chartName] || chartName;
  }
}

export default new PDFExportService(); 