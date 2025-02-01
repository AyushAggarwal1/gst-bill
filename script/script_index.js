
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

                <label for="igstRate${itemCount}">Integrated Tax Rate %:</label>
                <input type="number" id="igstRate${itemCount}" step="0.01" required>

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
    if (!validateForm()) {
        return; // Stop submission if validation fails
    }

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
            const igstRate = parseFloat(document.getElementById(`igstRate${i}`).value) || 0;

            // Calculate amount for the item
            const amount = qty * rate;

            // Calculate the Central Tax and State Tax amounts
            const centralTaxAmount = (amount * centralTaxRate) / 100;
            const stateTaxAmount = (amount * stateTaxRate) / 100;
            const igstRateAmount = (amount * igstRate) / 100;

            // Total amount after including both Central Tax, State Tax, and IGST
            const totalAmount = amount + centralTaxAmount + stateTaxAmount + igstRateAmount;

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
                igstRate,
                igstRateAmount: igstRateAmount.toFixed(2),
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
    console.log("Invoice Date Sent:", invoiceData);
    // Send data to server
    fetch("https://gst-bill.onrender.com/save-invoice", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData)
    }).then((response) => {
        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);
        return response.text(); // Get raw response text
    })
    .then((rawText) => {
        console.log("Raw Response:", rawText);
        const data = JSON.parse(rawText); // Manually parse JSON
        if (!data.message) {
            throw new Error("Missing message in response");
        }
        alert(data.message); // Success message
    })
    .catch((error) => {
        console.error("Error:", error.message); // Log error message
        // alert(`An error occurred: ${error.message}`);
    });


    // Save invoice data to local storage
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));

    // Redirect to the invoice page
    window.location.href = 'invoice.html';
}

// Format date in dd-mm-yyyy format
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Rearrange to dd-mm-yyyy
}

// validate form 
function validateForm() {
    const invoiceNo = document.getElementById("invoiceNo").value.trim();
    const date = document.getElementById("date").value.trim();
    const buyer = document.getElementById("buyer").value.trim();

    if (!invoiceNo) {
        alert("Invoice number is required.");
        return false;
    }
    if (!date) {
        alert("Date is required.");
        return false;
    }
    if (!buyer) {
        alert("Buyer name is required.");
        return false;
    }
    if (itemCount === 0) {
        alert("At least one item is required.");
        return false;
    }
    return true;
}