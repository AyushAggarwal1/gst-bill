// Function to convert number to words
function convertNumberToWords(value) {
    const ones = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    const thousands = [
        '', 'Thousand', 'Million', 'Billion', 'Trillion'
    ];

    // Function to handle conversion of numbers less than 1000
    function toWordsChunk(n, chunkIndex) {
        if (n === 0) return '';

        let chunkWords = '';
        const hundred = Math.floor(n / 100);
        n = n % 100;

        if (hundred > 0) {
            chunkWords += ones[hundred] + ' Hundred ';
        }

        if (n > 0 && n < 20) {
            chunkWords += ones[n];
        } else if (n >= 20) {
            const ten = Math.floor(n / 10);
            const one = n % 10;
            chunkWords += tens[ten] + (one > 0 ? ' ' + ones[one] : '');
        }

        if (chunkIndex > 0) {
            chunkWords += ' ' + thousands[chunkIndex];
        }

        return chunkWords.trim();
    }

    // Main function logic
    value = parseFloat(value).toFixed(2); // Ensure two decimal places
    const [rupeesPart, paisaPart] = value.split('.').map(Number); // Split into rupees and paisa

    let words = '';
    let chunkIndex = 0;
    let rupees = rupeesPart;

    // Convert rupees part
    while (rupees > 0) {
        const chunk = rupees % 1000;
        if (chunk > 0) {
            words = toWordsChunk(chunk, chunkIndex) + ' ' + words;
        }
        rupees = Math.floor(rupees / 1000);
        chunkIndex++;
    }

    words = words.trim();
    const rupeesWords = words.length > 0 ? words + ' Rupees' : '';

    // Convert paisa part
    const paisaWords =
        paisaPart > 0
            ? `${toWordsChunk(paisaPart, 0)} Paisa`
            : '';

    // Combine rupees and paisa parts
    return `${rupeesWords}${rupeesWords && paisaWords ? ' and ' : ''}${paisaWords} Only`.trim();
}

// Retrieve data from localStorage
const invoiceData = JSON.parse(localStorage.getItem('invoiceData'));
// Set values for header details
document.getElementById('invoiceNo').textContent = invoiceData.invoiceNo;
document.getElementById('date').textContent = invoiceData.date;
document.getElementById('supplierRef').textContent = invoiceData.supplierRef;
document.getElementById('buyer').textContent = invoiceData.buyer;
document.getElementById('deliveredAddress').textContent = invoiceData.deliveredAddress;
document.getElementById('otherReference').textContent = invoiceData.otherReference;

// Display items in the table
const tableBody = document.getElementById('invoice-table-body');
invoiceData.items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${item.hsnCode}</td>
                <td>${item.gstRate}%</td>
                <td>${item.qty}</td>
                <td>${item.rate}</td>
                <td>₹${item.amount}</td>
                <td>₹${item.totalAmount}</td>
            `;
    tableBody.appendChild(row);
});

// Display total amount
document.getElementById('total-amount').textContent = invoiceData.totalInvoiceAmount + " /-";
document.getElementById('amountInWords').textContent = convertNumberToWords(invoiceData.totalInvoiceAmount);

// Fill the footer with the cumulative tax amounts
const footerTaxDetails = invoiceData.items.reduce((totals, item) => {
    totals.centralTaxAmount += parseFloat(item.centralTaxAmount);
    totals.stateTaxAmount += parseFloat(item.stateTaxAmount);
    totals.igstRateAmount += parseFloat(item.igstRateAmount);
    return totals;
}, { centralTaxAmount: 0, stateTaxAmount: 0, igstRateAmount: 0 });

document.getElementById('hsnCodeFooter').textContent = invoiceData.items[0].hsnCode;
// Display footer tax details
document.getElementById('centralTaxRate').textContent = `${invoiceData.items[0].centralTaxRate}%`;
document.getElementById('centralTaxAmount').textContent = `₹${footerTaxDetails.centralTaxAmount.toFixed(2)}`;
document.getElementById('stateTaxRate').textContent = `${invoiceData.items[0].stateTaxRate}%`;
document.getElementById('stateTaxAmount').textContent = `₹${footerTaxDetails.stateTaxAmount.toFixed(2)}`;
document.getElementById('igstRate').textContent = `${invoiceData.items[0].igstRate}%`;
document.getElementById('igstRateAmount').textContent = `₹${footerTaxDetails.igstRateAmount.toFixed(2)}`;

totalTaxAmount = footerTaxDetails.centralTaxAmount + footerTaxDetails.stateTaxAmount + footerTaxDetails.igstRateAmount;
document.getElementById('totalTax').textContent = totalTaxAmount + " /-";

document.getElementById('amountTaxInWords').textContent = convertNumberToWords(totalTaxAmount);

// Convert total amount to words (optional, add a function for this if needed)
// document.getElementById('amountInWords').textContent = convertNumberToWords(invoiceData.totalInvoiceAmount);
