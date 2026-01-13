import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export Service
 * Handles PDF export functionality for analytics charts and dashboards
 */

/**
 * Export a single chart to PDF
 * @param {Object} options - Export options
 * @param {Array} options.queryResult - The query result data
 * @param {string} options.currentQueryName - Name of the current query
 * @param {string} options.selectedDatabase - Selected database name
 * @param {Object} options.filters - Applied filters
 * @param {Object} options.selectedQuery - Selected query object
 * @param {HTMLElement} options.chartContainerRef - Reference to chart container element
 * @returns {Promise<void>}
 */
export const exportChartToPDF = async ({
    queryResult,
    currentQueryName,
    selectedDatabase,
    filters,
    selectedQuery,
    chartContainerRef
}) => {
    if (!queryResult || queryResult.length === 0) {
        throw new Error('No data to export. Please run a query first.');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('eHealth Insights Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Query: ${currentQueryName || 'Custom Query'}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Database: ${selectedDatabase}`, margin, yPosition);
    yPosition += 5;

    // Add filters if active
    if (filters.ageGroup !== 'all' || filters.gender !== 'all') {
        pdf.text(`Filters: Age=${filters.ageGroup}, Gender=${filters.gender}`, margin, yPosition);
        yPosition += 5;
    }

    yPosition += 5;
    pdf.setDrawColor(200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Capture chart if exists
    if (chartContainerRef) {
        try {
            const canvas = await html2canvas(chartContainerRef, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Check if we need a new page
            if (yPosition + imgHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }

            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
        } catch (err) {
            console.error('Failed to capture chart:', err);
        }
    }

    // Add data table
    if (yPosition + 30 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data Summary', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    // Create table
    const data = queryResult.slice(0, 50); // Limit to 50 rows for PDF
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const colWidth = (pageWidth - 2 * margin) / headers.length;

        // Headers
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
            pdf.text(header, margin + i * colWidth, yPosition);
        });
        yPosition += 6;

        // Data rows
        pdf.setFont('helvetica', 'normal');
        data.forEach((row, rowIndex) => {
            if (yPosition > pageHeight - margin - 10) {
                pdf.addPage();
                yPosition = margin;

                // Repeat headers on new page
                pdf.setFont('helvetica', 'bold');
                headers.forEach((header, i) => {
                    pdf.text(header, margin + i * colWidth, yPosition);
                });
                yPosition += 6;
                pdf.setFont('helvetica', 'normal');
            }

            headers.forEach((header, i) => {
                const value = String(row[header] || '');
                const truncated = value.length > 20 ? value.substring(0, 17) + '...' : value;
                pdf.text(truncated, margin + i * colWidth, yPosition);
            });
            yPosition += 5;
        });

        if (queryResult.length > 50) {
            yPosition += 5;
            pdf.setFont('helvetica', 'italic');
            pdf.text(`(Showing first 50 of ${queryResult.length} rows)`, margin, yPosition);
        }
    }

    // Add footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
            `Page ${i} of ${totalPages} | eHealth Insights Platform`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Save PDF
    const filename = `analytics-${selectedDatabase}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return filename;
};

/**
 * Export complete dashboard with multiple charts to PDF in a 3x3 grid layout
 * @param {Object} options - Export options
 * @param {Object} options.queries - All available queries object
 * @param {Function} options.executeQuery - Function to execute queries
 * @param {Function} options.isQueryFilterable - Function to check if query is filterable
 * @param {Function} options.applyFiltersToSql - Function to apply filters to SQL
 * @param {Function} options.getChartComponent - Function to get chart component
 * @param {string} options.selectedDatabase - Selected database name
 * @param {Object} options.filters - Applied filters
 * @returns {Promise<void>}
 */
export const exportCompleteDashboardToPDF = async ({
    queries,
    executeQuery,
    isQueryFilterable,
    applyFiltersToSql,
    getChartComponent,
    selectedDatabase,
    filters
}) => {
    // Define all 19 queries to export
    const dashboardQueries = [
        { category: 'demographics', key: 'genderDistribution', name: 'Gender Distribution' },
        { category: 'demographics', key: 'ageDistribution', name: 'Age Distribution' },
        { category: 'demographics', key: 'populationPyramid', name: 'Population Pyramid' },
        { category: 'demographics', key: 'totalPatients', name: 'Total Patients' },
        { category: 'conditions', key: 'topConditions', name: 'Top Conditions' },
        { category: 'conditions', key: 'conditionsByGender', name: 'Conditions by Gender' },
        { category: 'conditions', key: 'conditionsByAge', name: 'Conditions by Age' },
        { category: 'conditions', key: 'chronicConditions', name: 'Chronic Conditions' },
        { category: 'conditions', key: 'totalConditions', name: 'Total Conditions' },
        { category: 'medications', key: 'topMedications', name: 'Top Medications' },
        { category: 'medications', key: 'medicationsByGender', name: 'Medications by Gender' },
        { category: 'medications', key: 'medicationsByAge', name: 'Medications by Age' },
        { category: 'medications', key: 'polypharmacy', name: 'Polypharmacy Analysis' },
        { category: 'medications', key: 'totalMedications', name: 'Total Medications' },
        { category: 'visits', key: 'totalVisits', name: 'Total Visits' },
        { category: 'visits', key: 'visitsByType', name: 'Visits by Type' },
        { category: 'visits', key: 'visitsByGender', name: 'Visits by Gender' },
        { category: 'observations', key: 'totalObservations', name: 'Total Observations' },
        { category: 'observations', key: 'topObservations', name: 'Top Observations' }
    ];

    console.log('Starting complete dashboard export with all 19 queries...');

    // Step 1: Execute all queries in parallel and wait for all to complete
    const queryPromises = dashboardQueries.map(async ({ category, key, name }) => {
        try {
            if (queries[category] && queries[category][key]) {
                const queryObj = queries[category][key];

                // Execute the query
                let sql = queryObj.sql;
                if (isQueryFilterable(queryObj)) {
                    sql = applyFiltersToSql(sql);
                }

                const data = await executeQuery(sql, selectedDatabase);

                return {
                    category,
                    key,
                    name,
                    queryObj,
                    data,
                    success: true
                };
            }
        } catch (err) {
            console.error(`Failed to execute query ${name}:`, err);
            return {
                category,
                key,
                name,
                success: false,
                error: err.message
            };
        }
    });

    // Wait for all queries to complete
    const queryResults = await Promise.all(queryPromises);
    console.log(`Completed ${queryResults.filter(r => r.success).length} out of ${queryResults.length} queries`);

    // Step 2: Generate chart images for all successful queries
    const chartPromises = queryResults
        .filter(result => result.success && result.data && result.data.length > 0)
        .map(async (result) => {
            try {
                // Create temporary container for chart
                const tempContainer = document.createElement('div');
                tempContainer.style.width = '600px';
                tempContainer.style.height = '400px';
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                document.body.appendChild(tempContainer);

                // Render chart
                const chartElement = getChartComponent(result.data, result.queryObj);
                if (chartElement) {
                    const ReactDOM = await import('react-dom/client');
                    const root = ReactDOM.createRoot(tempContainer);
                    root.render(chartElement);

                    // Wait for chart to render
                    await new Promise(resolve => setTimeout(resolve, 800));

                    // Capture chart
                    const canvas = await html2canvas(tempContainer, {
                        scale: 1.5,
                        backgroundColor: '#ffffff',
                        logging: false
                    });

                    const imgData = canvas.toDataURL('image/png');

                    root.unmount();
                    document.body.removeChild(tempContainer);

                    return {
                        ...result,
                        chartImage: imgData,
                        hasChart: true
                    };
                }

                document.body.removeChild(tempContainer);
                return result;
            } catch (err) {
                console.error(`Failed to generate chart for ${result.name}:`, err);
                return result;
            }
        });

    // Wait for all charts to be generated
    const chartsWithImages = await Promise.all(chartPromises);
    console.log(`Generated ${chartsWithImages.filter(c => c.hasChart).length} chart images`);

    // Step 3: Create PDF with 3x3 grid layout
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape mode for better grid layout
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const chartsPerPage = 9;
    const cols = 3;
    const rows = 3;

    // Calculate chart dimensions
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2) - 20; // Reserve space for header
    const chartWidth = (availableWidth - (margin * (cols - 1))) / cols;
    const chartHeight = (availableHeight - (margin * (rows - 1))) / rows;

    // Add cover page header (on first landscape page)
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Complete Dashboard Report', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()} | Database: ${selectedDatabase}`, pageWidth / 2, 28, { align: 'center' });

    if (filters.ageGroup !== 'all' || filters.gender !== 'all') {
        pdf.text(`Filters: Age=${filters.ageGroup}, Gender=${filters.gender}`, pageWidth / 2, 34, { align: 'center' });
    }

    // Process charts in pages of 9
    for (let pageIndex = 0; pageIndex < Math.ceil(chartsWithImages.length / chartsPerPage); pageIndex++) {
        if (pageIndex > 0) {
            pdf.addPage('a4', 'l'); // Add landscape page for subsequent pages
        }

        const startIndex = pageIndex * chartsPerPage;
        const endIndex = Math.min(startIndex + chartsPerPage, chartsWithImages.length);
        const pageCharts = chartsWithImages.slice(startIndex, endIndex);

        // Add page header
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Dashboard Overview - Page ${pageIndex + 1}`, margin, pageIndex === 0 ? 45 : margin + 5);

        // Draw charts in 3x3 grid
        pageCharts.forEach((chart, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            const x = margin + (col * (chartWidth + margin));
            const y = (pageIndex === 0 ? margin + 50 : margin + 15) + (row * (chartHeight + margin));

            // Draw border
            pdf.setDrawColor(200);
            pdf.rect(x, y, chartWidth, chartHeight);

            // Add chart title
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            const titleLines = pdf.splitTextToSize(chart.name, chartWidth - 4);
            pdf.text(titleLines, x + 2, y + 5);

            // Add chart image if available
            if (chart.hasChart && chart.chartImage) {
                const imgY = y + (titleLines.length * 3) + 3;
                const imgHeight = chartHeight - (titleLines.length * 3) - 5;
                try {
                    pdf.addImage(chart.chartImage, 'PNG', x + 2, imgY, chartWidth - 4, imgHeight);
                } catch (err) {
                    console.error(`Failed to add image for ${chart.name}:`, err);
                }
            }
        });
    }

    // Add footer to all pages
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
            `Page ${i} of ${totalPages} | eHealth Insights Platform`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
        );
    }

    // Save PDF
    const filename = `complete-dashboard-${selectedDatabase}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    console.log('Dashboard export completed successfully!');
    return filename;
};