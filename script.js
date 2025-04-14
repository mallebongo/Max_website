document.addEventListener('DOMContentLoaded', () => {
    // --- Global Data and State ---
    const printerData = {
        "CJV200-160": { "width": 10.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "JV100-160": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "UCJV330-160": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "SWJ-320EA": { "width": 27.5, "length": 340.2, "adjustment_positions": 9, "adjustment_columns": [0, 2, 4, 6, 8, 10, 12, 14, 16] },
        "UCJV300-160": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "CJV300-160 plus": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "Txf300-1600": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "Txf150-75": { "width": 14.5, "length": 94, "adjustment_positions": 3, "adjustment_columns": [0, 2, 4] },
        "TS100-1600": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "TS330-1600": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "UJV100-160": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "JV300-160 plus": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "CJV150": { "width": 14.5, "length": 175, "adjustment_positions": 4, "adjustment_columns": [0, 2, 4, 6] },
        "Ts55-1800": { "width": 14.5, "length": 208.5, "adjustment_positions": 5, "adjustment_columns": [0, 2, 4, 6, 8] },
        "UJV55-320": { "width": 27.5, "length": 340.2, "adjustment_positions": 9, "adjustment_columns": [0, 2, 4, 6, 8, 10, 12, 14, 16] },
        "TX300P-1800B": { "width": 29.2, "length": 208.5, "adjustment_positions": 5, "adjustment_columns": [0, 2, 4, 6, 8] },
        "Tiger600-1800": { "width": 29.2, "length": 199.5, "adjustment_positions": 5, "adjustment_columns": [0, 2, 4, 6, 8] }
    };

    let currentModel = null;
    let gridRows = 0;
    let gridCols = 0;
    let gridInputs = []; // To store references to input elements
    let beforeData = null;
    let afterData = null;

    // --- DOM Element References ---
    const printerModelSelect = document.getElementById('printerModel');
    const generateGridBtn = document.getElementById('generateGridBtn');
    const gridContainer = document.getElementById('gridContainer');
    const plotBtn = document.getElementById('plotBtn');
    const saveBeforeBtn = document.getElementById('saveBeforeBtn');
    const loadBeforeBtn = document.getElementById('loadBeforeBtn');
    const saveAfterBtn = document.getElementById('saveAfterBtn');
    const loadAfterBtn = document.getElementById('loadAfterBtn');
    const compareBtn = document.getElementById('compareBtn');
    const adjustBtn = document.getElementById('adjustBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const loadBeforeFile = document.getElementById('loadBeforeFile');
    const loadAfterFile = document.getElementById('loadAfterFile');
    const currentPlotDiv = document.getElementById('currentPlotDiv');
    const compareContainer = document.getElementById('compareContainer');
    const comparePlotBeforeDiv = document.getElementById('comparePlotBeforeDiv');
    const comparePlotAfterDiv = document.getElementById('comparePlotAfterDiv');
    const adjustmentModal = document.getElementById('adjustmentModal');
    const adjustmentText = document.getElementById('adjustmentText');
    const closeModalBtn = document.querySelector('.close-button');

    // --- Initialization ---
    function initialize() {
        // Populate dropdown
        Object.keys(printerData).forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            printerModelSelect.appendChild(option);
        });
        printerModelSelect.selectedIndex = 0; // Select first model by default

        // Add Event Listeners
        generateGridBtn.addEventListener('click', generateGrid);
        plotBtn.addEventListener('click', plotCurrent);
        saveBeforeBtn.addEventListener('click', () => saveData('before'));
        loadBeforeBtn.addEventListener('click', () => loadBeforeFile.click());
        saveAfterBtn.addEventListener('click', () => saveData('after'));
        loadAfterBtn.addEventListener('click', () => loadAfterFile.click());
        compareBtn.addEventListener('click', plotComparison);
        adjustBtn.addEventListener('click', calculateAdjustments);
        exportPdfBtn.addEventListener('click', exportPdf);

        loadBeforeFile.addEventListener('change', (e) => loadData(e, 'before'));
        loadAfterFile.addEventListener('change', (e) => loadData(e, 'after'));

        // Modal listeners
        closeModalBtn.addEventListener('click', () => adjustmentModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target == adjustmentModal) {
                adjustmentModal.style.display = 'none';
            }
        });
    }

    // --- Grid Management ---
    function generateGrid() {
        currentModel = printerModelSelect.value;
        const specs = printerData[currentModel];
        if (!specs) {
            alert("Invalid printer model selected.");
            return;
        }

        gridRows = 3; // Fixed at 3 rows
        gridCols = 2 * specs.adjustment_positions - 1;
        gridInputs = []; // Reset input references
        beforeData = null; // Reset data
        afterData = null;

        gridContainer.innerHTML = ''; // Clear previous grid
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');

        for (let r = 0; r < gridRows; r++) {
            const row = document.createElement('tr');
            const rowInputs = [];
            for (let c = 0; c < gridCols; c++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01'; // Allow decimals
                input.placeholder = '0.00';
                cell.appendChild(input);
                row.appendChild(cell);
                rowInputs.push(input);
            }
            tbody.appendChild(row);
            gridInputs.push(rowInputs);
        }
        table.appendChild(tbody);
        gridContainer.appendChild(table);

        // Update button states
        updateButtonStates();
        // Clear plots
        Plotly.purge(currentPlotDiv);
        Plotly.purge(comparePlotBeforeDiv);
        Plotly.purge(comparePlotAfterDiv);
        compareContainer.style.display = 'none'; // Hide compare section
        document.getElementById('plotContainer').style.display = 'block'; // Show current plot section
    }

    // --- Data Handling ---
    function getGridData() {
        const data = [];
        let isValid = true;
        for (let r = 0; r < gridRows; r++) {
            const rowData = [];
            for (let c = 0; c < gridCols; c++) {
                const value = gridInputs[r][c].value;
                const num = parseFloat(value);
                if (value === '' || isNaN(num)) { // Treat empty as error for calculations
                    alert(`Invalid input at Row ${r + 1}, Column ${c + 1}. Please enter numbers.`);
                    gridInputs[r][c].focus();
                    isValid = false;
                    break;
                }
                rowData.push(num);
            }
            if (!isValid) break;
            data.push(rowData);
        }
        return isValid ? data : null;
    }

    function populateGrid(data) {
        if (!data || data.length !== gridRows || data[0].length !== gridCols) {
            alert("Data dimensions do not match the current grid.");
            return;
        }
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                gridInputs[r][c].value = data[r][c].toFixed(2);
            }
        }
    }

    function saveData(mode) {
        const data = getGridData();
        if (!data) return; // Validation failed

        // Store data internally
        if (mode === 'before') {
            beforeData = data;
        } else {
            afterData = data;
        }
        updateButtonStates(); // Update button enable/disable status

        // Convert array to CSV string
        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${currentModel}_${mode}_data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} data saved.`);
    }

    function loadData(event, mode) {
        const file = event.target.files[0];
        if (!file) return;
        if (!currentModel) {
            alert("Please generate a grid for a printer model first.");
            event.target.value = ''; // Reset file input
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            try {
                const loadedRows = text.trim().split('\n');
                const data = loadedRows.map(rowString =>
                    rowString.split(',').map(val => {
                        const num = parseFloat(val);
                        if (isNaN(num)) throw new Error("Invalid number found in CSV");
                        return num;
                    })
                );

                // Validate dimensions
                if (data.length !== gridRows || !data[0] || data[0].length !== gridCols) {
                    throw new Error(`CSV dimensions (${data.length}x${data[0]?.length || 0}) do not match the expected grid (${gridRows}x${gridCols}) for ${currentModel}.`);
                }

                if (mode === 'before') {
                    beforeData = data;
                } else {
                    afterData = data;
                }
                populateGrid(data); // Put loaded data into the visible grid
                updateButtonStates();
                alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} data loaded successfully.`);

            } catch (error) {
                alert(`Error loading CSV: ${error.message}`);
                beforeData = (mode === 'before') ? null : beforeData; // Reset if error
                afterData = (mode === 'after') ? null : afterData;
                updateButtonStates();
            } finally {
                // Reset file input value so 'change' event fires even if same file is selected again
                 event.target.value = '';
            }
        };
        reader.onerror = function () {
            alert("Error reading file.");
             event.target.value = '';
        };
        reader.readAsText(file);
    }

    // --- Plotting ---
    function createPlotData(data, title) {
        if (!currentModel || !data) return null;
        const specs = printerData[currentModel];

        // Generate X, Y coordinates (like linspace)
        const x = Array.from({ length: gridCols }, (_, i) => (i / (gridCols - 1)) * specs.length);
        const y = Array.from({ length: gridRows }, (_, i) => (i / (gridRows - 1)) * specs.width);

        // Find absolute max for symmetric color scale around zero
        let zAbsMax = 0;
        data.forEach(row => row.forEach(val => {
            if (Math.abs(val) > zAbsMax) zAbsMax = Math.abs(val);
        }));
        if (zAbsMax === 0) zAbsMax = 0.1; // Avoid zero range for colorscale

        const surface = {
            x: x,
            y: y,
            z: data,
            type: 'surface',
            colorscale: 'RdBu',
            reversescale: true,
            cmin: -zAbsMax,
            cmax: zAbsMax,
            showscale: true,
            colorbar: {title: 'Deviation (mm)', len: 0.75},
            name: title, // Added for potential legend use
        };

         // Add reference plane at z=0
        const refPlaneZ = data.map(row => row.map(() => 0));
        const referencePlane = {
            x: x,
            y: y,
            z: refPlaneZ,
            type: 'surface',
            colorscale: [[0, 'rgba(150,150,150,0.4)'], [1, 'rgba(150,150,150,0.4)']],
            showscale: false,
            opacity: 0.7,
            name: "Reference Plane"
        };

        const layout = {
            title: `${title} - ${currentModel}`,
            scene: {
                xaxis: { title: 'Length (cm)' },
                yaxis: { title: 'Width (cm)' },
                zaxis: { title: 'Deviation (mm)', range: [-zAbsMax * 1.1, zAbsMax * 1.1] }, // Add slight padding to range
                aspectratio: { x: 2.5, y: 1, z: 0.5 },
                 camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } }
            },
            width: 600, // Adjust as needed
            height: 500, // Adjust as needed
            margin: { l: 40, r: 40, b: 40, t: 80 },
            // autosize: true // Use autosize for responsiveness
        };

        return { data: [surface, referencePlane], layout: layout };
    }

    function plotCurrent() {
        const data = getGridData();
        if (!data) return; // Validation failed

        const plotConfig = createPlotData(data, "Current Measurements");
        if (plotConfig) {
            Plotly.newPlot(currentPlotDiv, plotConfig.data, plotConfig.layout);
            compareContainer.style.display = 'none'; // Ensure compare section is hidden
            document.getElementById('plotContainer').style.display = 'block';
        } else {
            alert("Could not generate plot data.");
        }
    }

   function plotComparison() {
        if (!beforeData || !afterData) {
            alert("Load both 'Before' and 'After' datasets first.");
            return;
        }

        const plotConfigBefore = createPlotData(beforeData, "Before Adjustment");
        const plotConfigAfter = createPlotData(afterData, "After Adjustment");

        if (plotConfigBefore && plotConfigAfter) {
            // Optional: Adjust z-axis to be the same for better comparison
            const maxZ = Math.max(
                plotConfigBefore.layout.scene.zaxis.range[1],
                plotConfigAfter.layout.scene.zaxis.range[1]
            );
            plotConfigBefore.layout.scene.zaxis.range = [-maxZ, maxZ];
            plotConfigAfter.layout.scene.zaxis.range = [-maxZ, maxZ];

            // Adjust colorbar positioning if needed (might require more complex layout updates)
            // plotConfigBefore.data[0].colorbar.x = 0.45; // Example positioning
            // plotConfigAfter.data[0].colorbar.x = 0.95; // Example positioning


            Plotly.newPlot(comparePlotBeforeDiv, plotConfigBefore.data, plotConfigBefore.layout);
            Plotly.newPlot(comparePlotAfterDiv, plotConfigAfter.data, plotConfigAfter.layout);

            document.getElementById('plotContainer').style.display = 'none'; // Hide single plot
            compareContainer.style.display = 'block'; // Show comparison section
        } else {
            alert("Could not generate comparison plot data.");
        }
    }


    // --- Calculations ---
    function calculateAdjustments() {
        const data = getGridData();
        if (!data) return; // Validation failed

        const specs = printerData[currentModel];
        const threshold = 0.05;
        const adjustmentCols = specs.adjustment_columns;
        let suggestions = [];

        // Process Front (row 0) and Back (row 2)
        for (const sideInfo of [{ side: "Front", row: 0 }, { side: "Back", row: 2 }]) {
            const { side, row } = sideInfo;
            if (row >= gridRows) continue; // Skip if grid is too small (shouldn't happen with 3 rows)

            const baseline = data[row][0]; // Baseline is always the first column's value for that row

            for (const col of adjustmentCols) {
                if (col >= gridCols) continue; // Skip if column index is out of bounds
                if (col === 0) continue; // Skip the baseline column itself

                const deviation = data[row][col] - baseline;

                if (Math.abs(deviation) >= threshold) {
                    let direction = "";
                    let rec = 0;
                    let recommendation = "";

                    if (deviation < 0) { // Platen too low
                        rec = Math.abs(deviation);
                        direction = "Raise";
                    } else { // Platen too high
                        rec = deviation;
                        direction = "Lower";
                    }

                    // Basic neighbor influence check simulation
                    let neighborOk = true;
                    const adjustmentEffect = (direction === "Lower" ? rec : -rec); // Effect on Z axis
                    for (const neighborCol of [col - 1, col + 1]) { // Check immediate neighbors only
                        if (neighborCol >= 0 && neighborCol < gridCols && neighborCol !== 0) { // Ensure neighbor is valid and not the baseline
                            const neighborBaseline = data[row][0]; // Neighbor deviation is also relative to baseline
                            const neighborCurrentDev = data[row][neighborCol] - neighborBaseline;
                            const neighborSimulatedDev = neighborCurrentDev + 0.2 * adjustmentEffect; // Apply 20% influence

                             // Check if simulation pushes neighbor *out* of tolerance relative to baseline
                            if (Math.abs(neighborSimulatedDev) >= threshold && Math.abs(neighborCurrentDev) < threshold) {
                                 // Only flag if the simulation *causes* an issue
                                neighborOk = false;
                                break;
                            }
                             // Also consider if it makes an existing problem much worse (e.g., doubles the deviation) - optional refinement
                             // if (Math.abs(neighborSimulatedDev) > Math.abs(neighborCurrentDev) * 1.5 && Math.abs(neighborCurrentDev) >= threshold) {
                             //    neighborOk = false;
                             //    break;
                             // }
                        }
                    }

                    if (neighborOk) {
                        recommendation = `At ${side} (column index ${col}): ${direction} platen by ${rec.toFixed(2)} mm (Current deviation from baseline: ${deviation.toFixed(2)} mm).`;
                    } else {
                        recommendation = `At ${side} (column index ${col}): Check Manually. Adjustment (${direction} ${rec.toFixed(2)}mm, Dev: ${deviation.toFixed(2)}mm) may push neighbor(s) out of tolerance.`;
                    }
                    suggestions.push(recommendation);
                }
             }
        }

        let outputText = "";
        if (suggestions.length === 0) {
            outputText = "Platen appears within tolerance based on front/back row baseline comparisons. No automatic adjustments recommended.";
        } else {
            outputText = suggestions.join("\n\n"); // Add extra newline for readability
        }

        adjustmentText.textContent = outputText;
        adjustmentModal.style.display = 'block';
    }

    // --- PDF Export ---
   async function exportPdf() { // Make function async
        if (!beforeData || !afterData) {
            alert("Load both 'Before' and 'After' datasets first for PDF export.");
            return;
        }

        // Ensure comparison plots are rendered (even if hidden) to export images
        plotComparison(); // Render the comparison plots first

        // Add a small delay to ensure plots are fully rendered before image capture
        await new Promise(resolve => setTimeout(resolve, 500));


        try {
            // Use Plotly.toImage to get images as data URLs
            const beforeImgData = await Plotly.toImage(comparePlotBeforeDiv, { format: 'png', width: 800, height: 500 });
            const afterImgData = await Plotly.toImage(comparePlotAfterDiv, { format: 'png', width: 800, height: 500 });

             // Check if image data is valid (basic check)
            if (!beforeImgData || !beforeImgData.startsWith('data:image/png') ||
                !afterImgData || !afterImgData.startsWith('data:image/png')) {
                throw new Error("Failed to generate plot images.");
            }


            // Use jsPDF (ensure it's loaded via CDN or script tag)
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape', // Match plot aspect ratio better
                unit: 'mm',
                format: 'a4' // Standard page size
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const imgWidth = pageWidth / 2 - margin * 1.5; // Fit two images side by side potentially
            const imgHeight = (imgWidth / 800) * 500; // Maintain aspect ratio

            pdf.setFontSize(16);
            pdf.text(`Platen Alignment Report - ${currentModel}`, margin, margin);

            // --- Page 1: Before Adjustment ---
            pdf.setFontSize(12);
            pdf.text("Before Adjustment", margin, margin + 10);
            pdf.addImage(beforeImgData, 'PNG', margin, margin + 15, imgWidth, imgHeight);

             // Add simple data summary (optional)
             // let beforeStats = calculateStats(beforeData);
             // pdf.text(`Max Dev: ${beforeStats.max.toFixed(2)}mm, Min Dev: ${beforeStats.min.toFixed(2)}mm`, margin + imgWidth + 10, margin + 20);

            // --- Page 2: After Adjustment ---
            pdf.addPage();
            pdf.setFontSize(12);
            pdf.text("After Adjustment", margin, margin + 10); // Adjust Y pos for second page
            pdf.addImage(afterImgData, 'PNG', margin, margin + 15, imgWidth, imgHeight);

             // let afterStats = calculateStats(afterData);
             // pdf.text(`Max Dev: ${afterStats.max.toFixed(2)}mm, Min Dev: ${afterStats.min.toFixed(2)}mm`, margin + imgWidth + 10, margin + 20);

            pdf.save(`Platen_Report_${currentModel}.pdf`);
            alert("PDF report generated successfully.");

        } catch (error) {
            console.error("PDF Export Error:", error);
            alert(`PDF export failed: ${error.message}\n\nPlease ensure plots are visible and jsPDF library is loaded correctly. Check browser console for details.`);
        } finally {
             // Optionally switch back to showing the comparison view if desired
             // compareContainer.style.display = 'block';
        }
    }

    // --- Utility Functions ---
    function updateButtonStates() {
        const gridExists = gridInputs.length > 0;
        plotBtn.disabled = !gridExists;
        saveBeforeBtn.disabled = !gridExists;
        saveAfterBtn.disabled = !gridExists;
        adjustBtn.disabled = !gridExists;
        compareBtn.disabled = !(beforeData && afterData);
        exportPdfBtn.disabled = !(beforeData && afterData);
    }

    // --- Run Initialization ---
    initialize();
});