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

## Health Check

### Get System Health
**GET** `/api/health`

Returns system health information including database connectivity, memory usage, and application status.

**Response**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-20T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "nodeVersion": "v18.17.0",
  "environment": "production",
  "platform": "linux",
  "arch": "x64",
  "pid": 12345,
  "ppid": 1,
  "hostname": "server-01",
  "commitSha": "abc123def456",
  "database": {
    "connected": true,
    "latencyMs": 15,
    "error": null
  },
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 10485760,
    "external": 5242880,
    "arrayBuffers": 1048576
  }
}
```

## Bills API

### Get All Bills
**GET** `/api/bills`

Retrieves all bills for the authenticated user with optional filtering.

**Query Parameters**
- `startDate` (string): Filter bills from this date (ISO format)
- `endDate` (string): Filter bills until this date (ISO format)
- `customerName` (string): Filter by customer name (case-insensitive)
- `billNumber` (string): Filter by bill number (case-insensitive)
- `limit` (number): Limit the number of results

**Response**
```json
[
  {
    "id": "string",
    "billNumber": "string",
    "billDate": "string",
    "customerId": "string",
    "userId": "string",
    "tenantId": "string",
    "isIGST": boolean,
    "subtotal": number,
    "cgst": number,
    "sgst": number,
    "igst": number,
    "total": number,
    "deliveryAddress": "string",
    "createdAt": "string",
    "updatedAt": "string",
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
    // Bill object with complete details including items
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
  "billDate": "string",
  "customerId": "string",
  "userId": "string",
  "tenantId": "string",
  "isIGST": boolean,
  "subtotal": number,
  "cgst": number,
  "sgst": number,
  "igst": number,
  "total": number,
  "deliveryAddress": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "customer": {
    "id": "string",
    "name": "string",
    "address": "string",
    "deliveryAddress": "string",
    "gstNo": "string"
  },
  "items": [
    {
      "id": "string",
      "billId": "string",
      "itemId": "string",
      "quantity": number,
      "price": number,
      "taxAmount": number,
      "amount": number,
      "item": {
        "id": "string",
        "name": "string",
        "description": "string",
        "hsnCode": "string",
        "taxRate": number
      }
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

### Export Bills to Excel
**POST** `/api/bills/export`

Exports selected bills to an Excel file (XLSX) with multiple sheets (Bills Summary, Bill Items, Item Analysis, Price Analysis).

**Request Body**
```json
{
  "billIds": ["billId1", "billId2", ...]
}
```

- `billIds` (array of strings): List of bill IDs to export. Must not be empty.

**Headers**
- Cookie: Session cookie for authentication

**Response**
- On success: Returns an Excel file (`bills-export.xlsx`) as a file download (Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
- On error: Returns a JSON error message.

**Error Responses**
```json
// 400 Bad Request
{ "error": "No bills selected for export" }

// 401 Unauthorized
{ "error": "Unauthorized" }

// 404 Not Found
{ "error": "No valid bills found for export" }

// 500 Internal Server Error
{ "error": "Internal server error" }
```

### Generate Bulk Bill HTMLs
**POST** `/api/bills/bulk-htmls`

Generates HTML content for multiple bills for printing or PDF generation.

**Request Body**
```json
{
  "billIds": ["billId1", "billId2", ...]
}
```

**Response**
```json
{
  "htmls": ["<html>...</html>", "<html>...</html>"],
  "companyName": "string"
}
```

## Customers API

### Get All Customers
**GET** `/api/customers`

Retrieves all customers for the authenticated user.

**Query Parameters**
- `limit` (number): Limit the number of results

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "deliveryAddress": "string",
    "gstNo": "string",
    "userId": "string",
    "tenantId": "string",
    "createdAt": "string",
    "updatedAt": "string"
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
  "userId": "string",
  "tenantId": "string",
  "createdAt": "string",
  "updatedAt": "string"
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

**Query Parameters**
- `limit` (number): Limit the number of results

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "hsnCode": "string",
    "taxRate": number,
    "userId": "string",
    "tenantId": "string",
    "createdAt": "string",
    "updatedAt": "string"
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
  "description": "string",
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
  "description": "string",
  "hsnCode": "string",
  "taxRate": number,
  "userId": "string",
  "tenantId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Update Item
**PUT** `/api/items/{id}`

Updates a specific item.

**Request Body**
```json
{
  "name": "string",
  "description": "string",
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

## Users API

### Get All Users
**GET** `/api/users`

Retrieves all users in the current tenant.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "isAdmin": boolean,
    "roles": [
      {
        "role": "string",
        "permissions": ["string"]
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

## Invitations API

### Get All Invitations
**GET** `/api/invitations`

Retrieves all invitations for the current tenant.

**Response**
```json
[
  {
    "id": "string",
    "email": "string",
    "role": "string",
    "permissions": ["string"],
    "status": "PENDING" | "ACCEPTED" | "EXPIRED",
    "token": "string",
    "expiresAt": "string",
    "invitedById": "string",
    "invitedUserId": "string",
    "tenantId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "invitedBy": {
      "email": "string",
      "name": "string"
    },
    "invitedUser": {
      "email": "string",
      "name": "string"
    }
  }
]
```

### Create Invitation
**POST** `/api/invitations`

Creates a new user invitation.

**Request Body**
```json
{
  "email": "string",
  "role": "ADMIN" | "USER" | "VIEWER",
  "permissions": ["INVITE_USERS", "MANAGE_BILLS", "VIEW_REPORTS"]
}
```

**Response**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    // Invitation object
  }
}
```

### Accept Invitation
**POST** `/api/invitations/accept`

Accepts an invitation and creates/updates a user account.

**Request Body**
```json
{
  "token": "string",
  "password": "string",
  "name": "string"
}
```

**Response**
```json
{
  "message": "Invitation accepted successfully. You can now log in.",
  "userId": "string",
  "tenantId": "string",
  "tenantName": "string"
}
```

## Profile API

### Get User Profile
**GET** `/api/profile`

Retrieves the current user's profile information.

**Response**
```json
{
  "firmName": "string",
  "address": "string",
  "gstNo": "string",
  "phoneNo": "string",
  "bankDetails": "string"
}
```

### Update User Profile
**POST** `/api/profile`

Updates or creates the current user's profile.

**Request Body**
```json
{
  "firmName": "string",
  "address": "string",
  "gstNo": "string",
  "phoneNo": "string",
  "bankDetails": "string"
}
```

**Response**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    // Profile object
  }
}
```

## GST Verification API

### Verify GST Number
**POST** `/api/gst/verify`

Verifies a GST number using external API services.

**Request Body**
```json
{
  "gstin": "string"
}
```

**Response**
```json
{
  "success": true,
  "isValid": true,
  "gstin": "string",
  "data": {
    "gstin": "string",
    "legalName": "string",
    "tradeName": "string",
    "registrationDate": "string",
    "constitutionOfBusiness": "string",
    "taxpayerType": "string",
    "gstinStatus": "string",
    "lastUpdatedDate": "string",
    "natureOfBusiness": ["string"],
    "principalPlaceOfBusiness": {
      "address": "string",
      "state": "string",
      "pincode": "string",
      "district": "string",
      "location": "string",
      "street": "string",
      "buildingNumber": "string",
      "buildingName": "string",
      "floorNumber": "string",
      "landmark": "string"
    },
    "additionalPlacesOfBusiness": [],
    "jurisdiction": {
      "state": "string",
      "stateCode": "string",
      "center": "string",
      "centerCode": "string"
    },
    "einvoiceStatus": "string",
    "cancellationDate": "string"
  },
  "source": "string",
  "retrievedAt": "string"
}
```

**GET** `/api/gst/verify?gstin={gstin}`

Same functionality as POST but using query parameter.

## HSN Code Verification API

### Search HSN Codes
**POST** `/api/gst/hsnverify`

Searches for HSN codes and their tax rates.

**Request Body**
```json
{
  "keyword": "string"
}
```

**Response**
```json
{
  "success": true,
  "keyword": "string",
  "totalResults": number,
  "data": [
    {
      "hsnCode": "string",
      "description": "string",
      "type": "Goods" | "Services",
      "gstRate": number,
      "integratedTax": number,
      "centralTax": number,
      "stateTax": number,
      "cess": "string",
      "notificationNumber": number
    }
  ],
  "source": "string",
  "retrievedAt": "string"
}
```

**GET** `/api/gst/hsnverify?keyword={keyword}`

Same functionality as POST but using query parameter.

## Error Responses

All endpoints may return the following error responses:

- **401 Unauthorized**
  ```json
  {
    "error": "Unauthorized"
  }
  ```

- **403 Forbidden**
  ```json
  {
    "error": "Forbidden: You do not have permission to perform this action"
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

- **409 Conflict**
  ```json
  {
    "error": "Resource already exists or conflict occurred"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": "Internal server error"
  }
  ```

## Query Parameters

Many endpoints support query parameters for filtering and pagination:

- `limit`: Limit the number of results returned
- `startDate` / `endDate`: Date range filtering (for bills)
- `customerName`: Filter by customer name (for bills)
- `billNumber`: Filter by bill number (for bills)

## Authentication Headers

All API requests must include the session cookie for authentication:

```
Cookie: next-auth.session-token=your_session_token_here
```

## Rate Limiting

API endpoints may be subject to rate limiting. If you encounter rate limiting, you'll receive a 429 status code with appropriate headers indicating when you can retry. 