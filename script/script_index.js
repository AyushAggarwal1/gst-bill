
let itemCount = 0; // Start with zero items

// Function to add more item details
function addItem() {
    itemCount++; // Increment item count
    const itemsContainer = document.getElementById('items-container');

    const newItem = document.createElement('div');
    newItem.classList.add('item');
    newItem.setAttribute('id', `item${itemCount}`);
    newItem.innerHTML = `
                <h3>Item ${itemCount}</h3>
                <label for="description${itemCount}">Description of Goods:</label>
                <input type="text" id="description${itemCount}" required>

                <label for="hsnCode${itemCount}">HSN Code:</label>
                <input type="text" id="hsnCode${itemCount}" required>

                <label for="gstRate${itemCount}">GST Rate:</label>
                <input type="number" id="gstRate${itemCount}" step="0.01" required>

                <label for="qty${itemCount}">Quantity:</label>
                <input type="number" id="qty${itemCount}" required>

                <label for="rate${itemCount}">Rate:</label>
                <input type="number" id="rate${itemCount}" step="0.01" required>

                <label for="centralTaxRate${itemCount}">Central Tax Rate %:</label>
                <input type="number" id="centralTaxRate${itemCount}" step="0.01" required>

                <label for="stateTaxRate${itemCount}">State Tax Rate %:</label>
                <input type="number" id="stateTaxRate${itemCount}" step="0.01" required>

                <button type="button" onclick="removeItem(${itemCount})" class="remove-btn">Remove</button>
            `;
    itemsContainer.appendChild(newItem);
}

// Function to remove an item
function removeItem(itemId) {
    const itemToRemove = document.getElementById(`item${itemId}`);
    itemToRemove.remove();
}

// Function to generate invoice data
function generateInvoice() {
    const invoiceNo = document.getElementById('invoiceNo').value;
    const date = formatDate(document.getElementById('date').value);
    const supplierRef = document.getElementById('supplierRef').value;
    const buyer = document.getElementById('buyer').value;
    const deliveredAddress = document.getElementById('deliveredAddress').value;
    const otherReference = document.getElementById('otherReference').value;

    const items = [];
    let totalInvoiceAmount = 0; // To calculate the overall total

    for (let i = 1; i <= itemCount; i++) {
        const item = document.getElementById(`item${i}`);
        if (item) { // Ensure the item hasn't been removed
            const description = document.getElementById(`description${i}`).value;
            const hsnCode = document.getElementById(`hsnCode${i}`).value;
            const gstRate = parseFloat(document.getElementById(`gstRate${i}`).value) || 0;
            const qty = parseFloat(document.getElementById(`qty${i}`).value) || 0;
            const rate = parseFloat(document.getElementById(`rate${i}`).value) || 0;
            const centralTaxRate = parseFloat(document.getElementById(`centralTaxRate${i}`).value) || 0;
            const stateTaxRate = parseFloat(document.getElementById(`stateTaxRate${i}`).value) || 0;

            // Calculate amount for the item
            const amount = qty * rate;

            // Calculate the Central Tax and State Tax amounts
            const centralTaxAmount = (amount * centralTaxRate) / 100;
            const stateTaxAmount = (amount * stateTaxRate) / 100;

            // Total amount after including both Central Tax and State Tax
            const totalAmount = amount + centralTaxAmount + stateTaxAmount;

            // Add item details to the items array
            items.push({
                description,
                hsnCode,
                gstRate,
                qty,
                rate,
                amount: amount.toFixed(2),
                centralTaxRate,
                centralTaxAmount: centralTaxAmount.toFixed(2),
                stateTaxRate,
                stateTaxAmount: stateTaxAmount.toFixed(2),
                totalAmount: totalAmount.toFixed(2)
            });

            // Add the total amount of the item to the overall total invoice amount
            totalInvoiceAmount += totalAmount;
        }
    }

    // Prepare invoice data including the total amount
    const invoiceData = {
        invoiceNo,
        date,
        supplierRef,
        buyer,
        deliveredAddress,
        otherReference,
        items,
        totalInvoiceAmount: totalInvoiceAmount.toFixed(2)
    };

    // Save invoice data to local storage
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));

    // Redirect to the invoice page
    window.location.href = 'invoice.html';
}


function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Rearrange to dd-mm-yyyy
}