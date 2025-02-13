let itemCount = 0; // Start with zero items

let itemsData = [];
let customerData = [];

// Load items data from JSON file
async function loadItemsData() {
    try {
        const response = await fetch("items/items.json");
        itemsData = await response.json();
        console.log("Items Data Loaded:", itemsData);
    } catch (error) {
        console.error("Error loading item data:", error);
    }
}

// Call function to load data when the script starts
loadItemsData();

// Load customer data from JSON file
async function loadCustomerData() {
    try {
        const response = await fetch("items/customers.json");
        customerData = await response.json();
        console.log("Customer Data Loaded:", customerData);

        // Populate datalist with customer names
        const buyerList = document.getElementById('buyerList');
        buyerList.innerHTML = customerData.map(c => `<option value="${c.data}"></option>`).join("");
    
    } catch (error) {
        console.error("Error loading customer data:", error);
    }
}
// Call function to load data when the script starts
loadCustomerData();

// Function to add an item row dynamically
function addItem() {
    itemCount++;
    const itemsContainer = document.getElementById('items-container');

    const newItem = document.createElement('div');
    newItem.classList.add('item');
    newItem.setAttribute('id', `item${itemCount}`);

    newItem.innerHTML = `
        <h3>Item ${itemCount}</h3>

        <label for="description${itemCount}">Description of Goods:</label>
        <input type="text" id="description${itemCount}" list="itemList${itemCount}" oninput="fillItemDetails(${itemCount})" placeholder="Enter Goods" required>
        <datalist id="itemList${itemCount}">
            ${itemsData.map(item => `<option value="${item.name}"></option>`).join("")}
        </datalist>

        <label for="hsnCode${itemCount}">HSN Code:</label>
        <input type="text" id="hsnCode${itemCount}" placeholder="HSN Code" readonly required>

        <label for="gstRate${itemCount}">GST Rate:</label>
        <input type="number" id="gstRate${itemCount}" placeholder="GST Rate" readonly required>
        
        <label for="qty${itemCount}">Quantity:</label>
        <input type="number" id="qty${itemCount}" placeholder="Enter quantity" required>

        <label for="rate${itemCount}">Rate:</label>
        <input type="number" id="rate${itemCount}" step="0.01" placeholder="Enter rate" required>
        
        <label for="igstCheckbox${itemCount}">Enable IGST</label>
        <input type="checkbox" id="igstCheckbox${itemCount}" onchange="toggleTaxFields(${itemCount})">

        <!-- IGST Enabled message -->
        <div id="igstMessage${itemCount}" class="igst-message hidden">
            IGST Enabled
        </div>
        <br>

        <div id="cgstSgstFields${itemCount}">
            <label for="centralTaxRate${itemCount}">Central Tax Rate %:</label>
            <input type="number" id="centralTaxRate${itemCount}" step="0.01" placeholder="Enter Central Tax Rate" required>

            <label for="stateTaxRate${itemCount}">State Tax Rate %:</label>
            <input type="number" id="stateTaxRate${itemCount}" step="0.01" placeholder="Enter State Tax Rate" required>
        </div>

        <div id="igstField${itemCount}" style="display: none;">
            <label for="igstRate${itemCount}">Integrated Tax Rate %:</label>
            <input type="number" id="igstRate${itemCount}" step="0.01" placeholder="Enter Integrated Tax Rate">
        </div>

        <button type="button" onclick="removeItem(${itemCount})" class="remove-btn">Remove</button>
    `;

    itemsContainer.appendChild(newItem);
    toggleTaxFields(itemCount); // Ensure the right fields are visible when adding a new item
}


// Function to toggle tax fields based on IGST checkbox
function toggleTaxFields(itemIndex) {
    const igstCheckbox = document.getElementById(`igstCheckbox${itemIndex}`);
    const gstInput = document.getElementById(`gstRate${itemIndex}`);
    const cgstSgstFields = document.getElementById(`cgstSgstFields${itemIndex}`);
    const igstField = document.getElementById(`igstField${itemIndex}`);
    const centralTaxRate = document.getElementById(`centralTaxRate${itemIndex}`);
    const stateTaxRate = document.getElementById(`stateTaxRate${itemIndex}`);
    const igstMessage = document.getElementById(`igstMessage${itemIndex}`);

    const gstRate = parseFloat(gstInput.value) || 0;

    if (igstCheckbox.checked) {
        // IGST enabled: Show IGST field, hide CGST/SGST fields
        igstField.style.display = "block";
        cgstSgstFields.style.display = "none";
        igstMessage.classList.remove("hidden");

        // Set IGST rate based on the GST rate
        document.getElementById(`igstRate${itemIndex}`).value = gstRate; // Set IGST value
        centralTaxRate.value = 0; // Set Central Tax Rate (CGST)
        stateTaxRate.value = 0; // Set State Tax Rate (SGST)
    } else {
        // IGST disabled: Show CGST/SGST fields and calculate CGST/SGST rates
        igstField.style.display = "none";
        cgstSgstFields.style.display = "block";
        igstMessage.classList.add("hidden");

        // Calculate CGST and SGST as half of the GST rate
        const cgstRate = gstRate / 2;
        const sgstRate = gstRate / 2;

        centralTaxRate.value = cgstRate; // Set Central Tax Rate (CGST)
        stateTaxRate.value = sgstRate; // Set State Tax Rate (SGST)
        document.getElementById(`igstRate${itemIndex}`).value = 0;
    }
}



// Function to auto-fill HSN Code & GST Rate based on item selection
function fillItemDetails(itemIndex) {
    const descriptionInput = document.getElementById(`description${itemIndex}`);
    const hsnInput = document.getElementById(`hsnCode${itemIndex}`);
    const gstInput = document.getElementById(`gstRate${itemIndex}`);

    const selectedItem = itemsData.find(item => item.name.toLowerCase() === descriptionInput.value.toLowerCase());

    if (selectedItem) {
        hsnInput.value = selectedItem.hsn;
        gstInput.value = selectedItem.gst;

        // Call toggleTaxFields to ensure the tax fields are updated accordingly
        toggleTaxFields(itemIndex);
    } else {
        hsnInput.value = "";
        gstInput.value = "";
    }
}

function fillCustomerDetails() {
    const buyerInput = document.getElementById("buyer");
    const buyerName = buyerInput.value.trim().toLowerCase();
    const selectedItem = customerData.find(item => item.name.toLowerCase() === buyerName);

    if (selectedItem) {
        buyerInput.value = selectedItem.data;
    } else {
        buyerInput.value = "";
    }
}


// Function to remove an item
function removeItem(itemId) {
    const itemToRemove = document.getElementById(`item${itemId}`);
    if (itemToRemove) {
        itemToRemove.remove();
        itemCount--; // Decrement item count
    }
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