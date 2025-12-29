# Shift Routes API Documentation

## Overview
Two new endpoints have been added to fetch shift information for doulas.

---

## 1. Get Shifts by Doula

**Endpoint:** `GET /v1/doula/doula/:doulaId/shifts`

**Description:** Retrieves all scheduled shifts for a specific doula with pagination support.

### Parameters

| Parameter | Type | Location | Required | Default | Description |
|-----------|------|----------|----------|---------|-------------|
| doulaId | string (UUID) | Path | Yes | - | The unique identifier of the doula profile |
| page | number | Query | No | 1 | Page number for pagination |
| limit | number | Query | No | 10 | Number of items per page |

### Request Example

```http
GET /v1/doula/doula/abc123-def456-ghi789/shifts?page=1&limit=10
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Shifts fetched successfully",
  "data": [
    {
      "shiftId": "shift-uuid-1",
      "date": "2025-01-15T00:00:00.000Z",
      "timeshift": "MORNING",
      "status": "SCHEDULED",
      "serviceName": "Postnatal Care",
      "clientName": "Jane Doe"
    },
    {
      "shiftId": "shift-uuid-2",
      "date": "2025-01-16T00:00:00.000Z",
      "timeshift": "NIGHT",
      "status": "COMPLETED",
      "serviceName": "Prenatal Consultation",
      "clientName": "Sarah Smith"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Response Error (404)

```json
{
  "statusCode": 404,
  "message": "Doula not found"
}
```

### Field Descriptions

- **shiftId**: Unique identifier for the shift
- **date**: The date of the shift (ISO 8601 format)
- **timeshift**: Time period of the shift. Possible values: `MORNING`, `NIGHT`, `FULLDAY`
- **status**: Current status of the shift. Possible values: `SCHEDULED`, `COMPLETED`, `CANCELLED`
- **serviceName**: Name of the service being provided
- **clientName**: Name of the client receiving the service

---

## 2. Get Shift by ID

**Endpoint:** `GET /v1/doula/shifts/:shiftId`

**Description:** Retrieves detailed information about a specific shift.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| shiftId | string (UUID) | Path | Yes | The unique identifier of the shift |

### Request Example

```http
GET /v1/doula/shifts/shift-uuid-123
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Shift details fetched successfully",
  "data": {
    "shiftId": "shift-uuid-123",
    "date": "2025-01-15T00:00:00.000Z",
    "timeshift": "MORNING",
    "status": "SCHEDULED",
    "doula": {
      "doulaId": "doula-uuid-456",
      "name": "Sarah Johnson"
    },
    "client": {
      "clientId": "client-uuid-789",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    },
    "service": {
      "servicePricingId": "pricing-uuid-101",
      "serviceId": "service-uuid-202",
      "serviceName": "Postnatal Care",
      "price": {
        "morning": 100,
        "night": 120,
        "fullday": 200
      }
    }
  }
}
```

### Response Error (404)

```json
{
  "statusCode": 404,
  "message": "Shift not found"
}
```

### Field Descriptions

- **shiftId**: Unique identifier for the shift
- **date**: The date of the shift (ISO 8601 format)
- **timeshift**: Time period of the shift (`MORNING`, `NIGHT`, or `FULLDAY`)
- **status**: Current status of the shift
- **doula**: Information about the doula assigned to this shift
  - **doulaId**: Doula's profile ID
  - **name**: Doula's full name
- **client**: Information about the client (null if no client assigned)
  - **clientId**: Client's user ID
  - **name**: Client's full name
  - **email**: Client's email address
- **service**: Service and pricing information
  - **servicePricingId**: Service pricing record ID
  - **serviceId**: Service ID
  - **serviceName**: Name of the service
  - **price**: Pricing breakdown by shift type (JSON object)

---

## Common Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Notes

1. All dates are returned in ISO 8601 format
2. Pagination metadata is included in the first endpoint response
3. The `client` object may be `null` if no client is assigned to the shift
4. All UUIDs are strings in UUID v4 format
5. Price values are numbers representing the currency amount (assumed to be in the base currency unit)

---

## Testing

You can test these endpoints using tools like Postman, curl, or your frontend application.

### Example with curl:

```bash
# Get shifts for a doula
curl -X GET "http://localhost:3000/v1/doula/doula/{doulaId}/shifts?page=1&limit=10"

# Get specific shift details
curl -X GET "http://localhost:3000/v1/doula/shifts/{shiftId}"
```

Replace `{doulaId}` and `{shiftId}` with actual UUIDs from your database.
