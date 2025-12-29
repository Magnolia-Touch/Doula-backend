# Shift Routes API Documentation

## Overview
This document covers endpoints related to doula shifts and service pricing calculation. Three main endpoints are available:
1. Get all shifts for a specific doula (with pagination)
2. Get detailed information about a specific shift
3. Calculate pricing for doula services with availability checking

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

## 3. Calculate Pricing for Doula Service

**Endpoint:** `POST /v1/doula/calculate-pricing`

**Description:** Calculates the total price for a doula service based on service type, dates, and doula availability. Returns pricing if the doula is available for all selected dates, otherwise returns a list of unavailable dates.

### Request Body

```json
{
  "doulaProfileId": "7de77403-ca72-452b-abfa-296c26df8116",
  "servicePricingId": "00880c8d-abbc-42df-b6d7-c24ab4044ed0",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "visitFrequency": 7,
  "timeShift": "MORNING",
  "buffer": 0
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| doulaProfileId | string (UUID) | Yes | The unique identifier of the doula profile |
| servicePricingId | string (UUID) | Yes | The unique identifier of the service pricing record |
| startDate | string | Yes | Start date in YYYY-MM-DD format |
| endDate | string | Yes | End date in YYYY-MM-DD format |
| visitFrequency | number | Conditional | Number of days between visits. **Required for Post Partum Doula** service |
| timeShift | string | Conditional | Time shift: `MORNING`, `NIGHT`, or `FULLDAY`. **Required for Post Partum Doula** service |
| buffer | number | No | Buffer days before and after for Birth Doula service (default: 0) |

### Response Success - Doula Available (200)

```json
{
  "success": true,
  "message": "Pricing calculated successfully",
  "data": {
    "available": true,
    "doulaProfileId": "7de77403-ca72-452b-abfa-296c26df8116",
    "servicePricingId": "00880c8d-abbc-42df-b6d7-c24ab4044ed0",
    "serviceName": "Post Partum Doula",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "visitDates": [
      "2025-01-01",
      "2025-01-08",
      "2025-01-15",
      "2025-01-22",
      "2025-01-29"
    ],
    "numberOfVisits": 5,
    "timeShift": "MORNING",
    "pricePerVisit": 10,
    "totalAmount": 50,
    "currency": "INR",
    "priceBreakdown": {
      "morning": 10,
      "night": 20,
      "fullday": 30
    }
  }
}
```

### Response Success - Doula Not Available (200)

```json
{
  "success": false,
  "message": "Doula is not available for selected dates",
  "data": {
    "available": false,
    "unavailableDates": [
      "2025-01-08",
      "2025-01-15"
    ],
    "reason": "Doula is not available on 2 date(s)"
  }
}
```

### Response Error (400)

```json
{
  "statusCode": 400,
  "message": "Visit frequency and time shift are required for Post Partum Doula service"
}
```

### Response Error (404)

```json
{
  "statusCode": 404,
  "message": "Doula profile not found"
}
```

### Field Descriptions

**Request:**
- **doulaProfileId**: The ID of the doula whose services are being priced
- **servicePricingId**: The specific service pricing configuration for this doula
- **startDate/endDate**: Date range for the service
- **visitFrequency**: For Post Partum Doula, the interval in days between visits (e.g., 7 = weekly)
- **timeShift**: For Post Partum Doula, the time of day for visits. For Birth Doula, this is always FULLDAY
- **buffer**: For Birth Doula only, adds extra days before/after the date range

**Response (Available):**
- **available**: Boolean indicating if doula is available for all dates
- **visitDates**: Array of all dates when the doula will provide service
- **numberOfVisits**: Total number of visits/days
- **pricePerVisit**: Cost per single visit
- **totalAmount**: Total cost for all visits
- **priceBreakdown**: The full pricing structure showing morning/night/fullday rates

**Response (Not Available):**
- **unavailableDates**: List of dates when the doula is not available
- **reason**: Human-readable explanation

### Service Type Rules

1. **Birth Doula**:
   - Uses `FULLDAY` shift automatically
   - Optional `buffer` parameter adds days before/after the date range
   - `visitFrequency` and `timeShift` are not required
   - Single total price for the entire service period

2. **Post Partum Doula**:
   - Requires `visitFrequency` (days between visits)
   - Requires `timeShift` (MORNING, NIGHT, or FULLDAY)
   - Price calculated as: `pricePerVisit × numberOfVisits`
   - `buffer` parameter is ignored

---

## Testing

You can test these endpoints using tools like Postman, curl, or your frontend application.

### Example with curl:

```bash
# Get shifts for a doula
curl -X GET "http://localhost:3000/v1/doula/doula/{doulaId}/shifts?page=1&limit=10"

# Get specific shift details
curl -X GET "http://localhost:3000/v1/doula/shifts/{shiftId}"

# Calculate pricing for Post Partum Doula
curl -X POST "http://localhost:3000/v1/doula/calculate-pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "doulaProfileId": "7de77403-ca72-452b-abfa-296c26df8116",
    "servicePricingId": "00880c8d-abbc-42df-b6d7-c24ab4044ed0",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "visitFrequency": 7,
    "timeShift": "MORNING"
  }'

# Calculate pricing for Birth Doula
curl -X POST "http://localhost:3000/v1/doula/calculate-pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "doulaProfileId": "7de77403-ca72-452b-abfa-296c26df8116",
    "servicePricingId": "00880c8d-abbc-42df-b6d7-c24ab4044ed0",
    "startDate": "2025-02-15",
    "endDate": "2025-02-20",
    "buffer": 2
  }'
```

Replace `{doulaId}` and `{shiftId}` with actual UUIDs from your database.
