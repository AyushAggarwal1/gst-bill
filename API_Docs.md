# GST Bill API Documentation

This document provides detailed information about the available API endpoints in the GST Bill application.

## Authentication

All API endpoints require authentication. The application uses NextAuth for session-based authentication. Each request must include a valid session token.

If unauthorized, endpoints will return:
```json
{
  "error": "Unauthorized"
}
```

## Bills API

### Get All Bills
**GET** `/api/bills`

Retrieves all bills for the authenticated user.

**Response**
```json
[
  {
    "id": "string",
    "billNumber": "string",
    "billDate": "string",
    "customerId": "string",
    "userId": "string",
    "isIGST": boolean,
    "subtotal": number,
    "cgst": number,
    "sgst": number,
    "igst": number,
    "total": number,
    "deliveryAddress": "string",
    "customer": {
      "name": "string",
      "gstNo": "string"
    }
  }
]
```

### Create Bill
**POST** `/api/bills`

Creates a new bill.

**Request Body**
```json
{
  "billNumber": "string",
  "billDate": "string",
  "customerId": "string",
  "items": [
    {
      "itemId": "string",
      "quantity": number,
      "price": number
    }
  ],
  "isIGST": boolean,
  "deliveryAddress": "string"
}
```

**Response**
```json
{
  "message": "Bill created successfully",
  "bill": {
    // Bill object with complete details
  }
}
```

### Get Bill by ID
**GET** `/api/bills/{id}`

Retrieves a specific bill by ID.

**Response**
```json
{
  "id": "string",
  "billNumber": "string",
  // ... other bill details
  "customer": {
    // customer details
  },
  "items": [
    {
      "item": {
        // item details
      },
      "quantity": number,
      "price": number
    }
  ]
}
```

### Delete Bill
**DELETE** `/api/bills/{id}`

Deletes a specific bill.

**Response**
```json
{
  "message": "Bill deleted successfully"
}
```

### Get Bill Count
**GET** `/api/bills/count`

Returns the total number of bills for the authenticated user.

**Response**
```json
{
  "count": number
}
```

### Get Next Bill Number
**GET** `/api/bills/nextBillNumber`

Generates the next sequential bill number.

**Response**
```json
{
  "billNumber": "string" // Format: B0001, B0002, etc.
}
```

## Customers API

### Get All Customers
**GET** `/api/customers`

Retrieves all customers for the authenticated user.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "deliveryAddress": "string",
    "gstNo": "string",
    "userId": "string"
  }
]
```

### Create Customer
**POST** `/api/customers`

Creates a new customer.

**Request Body**
```json
{
  "name": "string",
  "address": "string",
  "deliveryAddress": "string",
  "gstNo": "string"
}
```

**Response**
```json
{
  "message": "Customer created successfully",
  "customer": {
    // Customer object
  }
}
```

### Get Customer by ID
**GET** `/api/customers/{id}`

Retrieves a specific customer by ID.

**Response**
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "deliveryAddress": "string",
  "gstNo": "string",
  "userId": "string"
}
```

### Update Customer
**PUT** `/api/customers/{id}`

Updates a specific customer.

**Request Body**
```json
{
  "name": "string",
  "address": "string",
  "deliveryAddress": "string",
  "gstNo": "string"
}
```

**Response**
```json
{
  "message": "Customer updated successfully",
  "customer": {
    // Updated customer object
  }
}
```

### Delete Customer
**DELETE** `/api/customers/{id}`

Deletes a specific customer. Cannot delete customers with associated bills.

**Response**
```json
{
  "message": "Customer deleted successfully"
}
```

### Get Customer Count
**GET** `/api/customers/count`

Returns the total number of customers for the authenticated user.

**Response**
```json
{
  "count": number
}
```

## Items API

### Get All Items
**GET** `/api/items`

Retrieves all items for the authenticated user.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "hsnCode": "string",
    "taxRate": number,
    "userId": "string"
  }
]
```

### Create Item
**POST** `/api/items`

Creates a new item.

**Request Body**
```json
{
  "name": "string",
  "hsnCode": "string",
  "taxRate": number // Between 0 and 100
}
```

**Response**
```json
{
  "message": "Item created successfully",
  "item": {
    // Item object
  }
}
```

### Get Item by ID
**GET** `/api/items/{id}`

Retrieves a specific item by ID.

**Response**
```json
{
  "id": "string",
  "name": "string",
  "hsnCode": "string",
  "taxRate": number,
  "userId": "string"
}
```

### Update Item
**PUT** `/api/items/{id}`

Updates a specific item.

**Request Body**
```json
{
  "name": "string",
  "hsnCode": "string",
  "taxRate": number // Between 0 and 100
}
```

**Response**
```json
{
  "message": "Item updated successfully",
  "item": {
    // Updated item object
  }
}
```

### Delete Item
**DELETE** `/api/items/{id}`

Deletes a specific item. Cannot delete items that are referenced in bills.

**Response**
```json
{
  "message": "Item deleted successfully"
}
```

### Get Item Count
**GET** `/api/items/count`

Returns the total number of items for the authenticated user.

**Response**
```json
{
  "count": number
}
```

## Error Responses

All endpoints may return the following error responses:

- **401 Unauthorized**
  ```json
  {
    "error": "Unauthorized"
  }
  ```

- **404 Not Found**
  ```json
  {
    "error": "Resource not found"
  }
  ```

- **400 Bad Request**
  ```json
  {
    "error": "Error message describing the issue"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": "Internal server error"
  }
  ``` 