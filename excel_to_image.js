const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');

async function excelToImageWithStyles(excelPath, sheetName, outputImagePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const sheet = workbook.getWorksheet(sheetName);

    const data = [];
    sheet.eachRow((row) => {
        const rowData = [];
        row.eachCell((cell) => {
            const cellValue = cell.result !== undefined ? cell.result : cell.value;
            const formattedValue = formatCellValue(cellValue);
            rowData.push({
                value: formattedValue,
                fill: cell.fill,
                border: cell.border,
            });
        });
        data.push(rowData);
    });

    const html = generateHtmlTable(data);
    await saveHtmlAsImage(html, outputImagePath);
}

function formatCellValue(value) {
    if (value instanceof Date) {
        return formatExcelTime(value);
    }
    return value;
}

function formatExcelTime(date) {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function generateHtmlTable(data) {
    let html = '<table border="1" style="border-collapse: collapse;">';
    for (const row of data) {
        html += '<tr>';
        for (const cell of row) {
            const bgColor = cell.fill && cell.fill.fgColor && cell.fill.fgColor.argb 
                ? `background-color: #${cell.fill.fgColor.argb.slice(2)};` 
                : '';
            html += `<td style="padding: 5px; ${bgColor}">${cell.value || ''}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

async function saveHtmlAsImage(html, outputImagePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const element = await page.$('table');
    await element.screenshot({ path: outputImagePath });
    await browser.close();
}

const args = process.argv.slice(2);
const excelPath = args[0];  // Path to the Excel file
const sheetName = args[1];  // Sheet name
const outputImagePath = args[2];  // Output image path

excelToImageWithStyles(excelPath, sheetName, outputImagePath)
    .then(() => console.log('Image saved successfully'))
    .catch(err => console.error('Error:', err));
