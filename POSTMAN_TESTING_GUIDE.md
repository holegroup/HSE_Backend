# HSE Buddy Backend - Postman Testing Guide

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select the `postman_demo_data.json` file
4. The collection will be imported with all endpoints and demo data

### 2. Environment Setup
Set these variables in your Postman environment:
- `baseUrl`: `http://localhost:5000`
- Update other variables as you get actual IDs from responses

## Testing Workflow

### Step 1: Health Check
```
GET {{baseUrl}}/api/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "message": "HSE Buddy API is healthy",
  "timestamp": "2024-10-10T07:52:35.000Z",
  "environment": "development",
  "port": 5000
}
```

### Step 2: User Registration & Login

#### Register Supervisor
```
POST {{baseUrl}}/api/users/register
{
  "name": "John Supervisor",
  "email": "supervisor@hse.com",
  "password": "password123",
  "role": "supervisor",
  "phone": "+1234567890"
}
```

#### Register Inspector
```
POST {{baseUrl}}/api/users/register
{
  "name": "Jane Inspector",
  "email": "inspector@hse.com",
  "password": "password123",
  "role": "inspector",
  "phone": "+1234567891"
}
```

#### Login and Get Tokens
```
POST {{baseUrl}}/api/users/login
{
  "email": "supervisor@hse.com",
  "password": "password123"
}
```
**Save the JWT token from response for Authorization headers**

### Step 3: Create Site
```
POST {{baseUrl}}/api/sites/create-site
{
  "site_name": "Industrial Plant A",
  "location": {
    "address": "123 Industrial Ave",
    "city": "Houston",
    "state": "Texas",
    "country": "USA",
    "zip_code": "77001"
  },
  "products_stored": []
}
```
**Save the site ID from response**

### Step 4: Create Product
```
POST {{baseUrl}}/api/products/create-product
{
  "equip_name": "Safety Valve",
  "description": "High pressure safety valve for industrial use",
  "actual_equip_id": "SV-EQUIP-001"
}
```
**Save the product ID from response**

**Expected Response:**
```json
{
  "message": "Product created successfully",
  "data": {
    "_id": "product_id_here",
    "equip_name": "Safety Valve",
    "description": "High pressure safety valve for industrial use",
    "actual_equip_id": "SV-EQUIP-001",
    "items": []
  }
}
```

### Step 5: Test New Listing Flow

#### 5a. Inspector Adds Item (Goes to Temp)
```
POST {{baseUrl}}/api/sites/add-items-site
Authorization: Bearer {inspectorToken}
{
  "siteId": "{{siteId}}",
  "productId": "{{productId}}",
  "serial_number": "SV-001-2024",
  "name": "Safety Valve Unit 1"
}
```
**Expected:** Item goes to temporary collection for approval

#### 5b. Fetch Temp Items
```
GET {{baseUrl}}/api/sites/fetch-all-temp-items
```
**Expected Response:**
```json
{
  "data": [
    {
      "_id": "temp_item_id",
      "siteId": {
        "_id": "site_id",
        "site_name": "Industrial Plant A"
      },
      "productId": {
        "_id": "product_id",
        "equip_name": "Safety Valve"
      },
      "serial_number": "SV-001-2024",
      "name": "Safety Valve Unit 1",
      "added_by": {
        "_id": "user_id",
        "name": "Jane Inspector"
      },
      "status": "Pending"
    }
  ]
}
```

#### 5c. Supervisor Approves Item
```
POST {{baseUrl}}/api/sites/temp-item-status-change
{
  "tempItemId": "{{tempItemId}}",
  "status": "Approved"
}
```
**Expected:** Item moves to main collection, removed from temp

#### 5d. Inspector Adds Part (Goes to Temp)
```
POST {{baseUrl}}/api/sites/add-parts-items
Authorization: Bearer {{inspectorToken}}
{
  "productId": "{{productId}}",
  "itemId": "{{itemId}}",
  "part_name": "Pressure Gauge",
  "part_number": "PG-2024-001"
}
```

#### 5e. Fetch Temp Parts
```
GET {{baseUrl}}/api/sites/fetch-all-temp-parts
```

#### 5f. Supervisor Approves Part
```
POST {{baseUrl}}/api/sites/temp-part-status-change
{
  "tempPartId": "{{tempPartId}}",
  "status": "Approved"
}
```

### Step 6: Test SSE (Server-Sent Events)

#### 6a. Connect to SSE Stream
```
GET {{baseUrl}}/api/sse/events
Headers:
  Accept: text/event-stream
  Cache-Control: no-cache
```
**Keep this connection open**

#### 6b. Send SSE Message
```
POST {{baseUrl}}/api/sse/send
{
  "message": "New inspection task assigned to Inspector John"
}
```
**Check the SSE connection for real-time message**

## Status Codes Reference

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

### Step 7: Test Task Status APIs

#### 7a. Get Supervisor Task Status
```
GET {{baseUrl}}/api/tasks/get-task-status-supervisor?supervisorId={{supervisorId}}
```
**Expected Response (when no tasks exist):**
```json
{
  "message": "No Tasks Found",
  "data": {
    "Pending": 0,
    "Due Soon": 0,
    "Overdue": 0,
    "Completed": 0
  }
}
```

#### 7b. Get All Recurring Tasks
```
GET {{baseUrl}}/api/tasks/get-all-recurring-task
```

## Common Issues & Solutions

### Issue: "Access Denied: No Token Provided"
**Solution:** Add Authorization header: `Bearer your_jwt_token`

### Issue: "Site not found" / "Product not found"
**Solution:** Ensure you're using correct IDs from previous responses

### Issue: "Serial number already exists"
**Solution:** Use unique serial numbers for each test

### Issue: Connection refused
**Solution:** Ensure backend server is running on port 5000

### Issue: "404 Not Found" for task status
**Solution:** This has been fixed - the API now returns empty status counts instead of 404

## Testing the Flutter App Integration

After backend testing, your Flutter app should:
1. Successfully fetch temp items and parts
2. Display them in cards with proper data
3. Allow approve/reject actions
4. Show loading states during API calls
5. Display success/error messages

## Sample Data for Multiple Tests

### Additional Items:
```json
{
  "siteId": "{{siteId}}",
  "productId": "{{productId}}",
  "serial_number": "SV-002-2024",
  "name": "Safety Valve Unit 2"
}
```

### Additional Parts:
```json
{
  "productId": "{{productId}}",
  "itemId": "{{itemId}}",
  "part_name": "Relief Valve",
  "part_number": "RV-2024-001"
}
```

This comprehensive testing guide will help you verify that your backend APIs are working correctly before testing with the Flutter app.
