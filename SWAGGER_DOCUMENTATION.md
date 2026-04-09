# Swagger/OpenAPI Documentation

## Overview
This project includes comprehensive Swagger documentation for all API endpoints. The Swagger UI is automatically generated and accessible at:

**`http://localhost:PORT/api/docs`** (default PORT is 3000)

## What's Documented

### ✅ 22 Controllers with 155+ Endpoints

#### Authentication & User Management
- **Auth Controller** - Login, OTP verification, user profiles for all roles
- **User Controller** - User registration, status management
- **Device Tokens** - Push notification device registration

#### Core Service Management
- **Services** - Service CRUD operations
- **Service Pricing** - Pricing management for services by doulas
- **Service Availability** - Availability slots and off-days management
- **Service Bookings** - Booking management, schedule tracking

#### Doula Management
- **Doula Controller** - Doula profiles, certifications, gallery, regions
- **Doula Join Enquiry** - Inquiries from prospective doulas

#### Client Operations
- **Client Controller** - Client bookings, schedules, profiles
- **Enquiry Forms** - Client inquiry submission and management
- **Intake Forms** - Detailed intake forms for services

#### Meetings & Scheduling
- **Meetings Controller** - Meeting scheduling, status tracking
- **Meetings Availability** - Slot availability for meetings

#### Support & Information
- **Testimonials** - Client reviews and ratings
- **Regions** - Geographic region management
- **Contact Form** - Public contact form submission

#### Admin & Zone Management
- **Zone Manager Controller** - Zone management and oversight
- **Analytics** - User analytics and filtering

#### Payment & External Services
- **Stripe Controller** - Payment webhook handling

#### Infrastructure
- **Mail Queue** - Email queue testing
- **Health Check (App)** - API health check endpoint

## Documentation Features

### Each Endpoint Includes:
✅ **Operation Summary** - Brief endpoint description  
✅ **Detailed Description** - Long-form explanation of what the endpoint does  
✅ **Parameters** - All path, query, and body parameters documented  
✅ **Request Examples** - Sample request payloads  
✅ **Response Examples** - Sample successful responses with real data  
✅ **Error Responses** - All possible error codes (400, 401, 403, 404, 500)  
✅ **Authentication** - Bearer token requirements clearly marked  
✅ **Authorization** - Role-based access control documented  

### Response Format
All responses follow a consistent format using `SwaggerResponseDto`:

```json
{
  "status": "success|error",
  "message": "Human readable message",
  "data": {}
}
```

## API Tags (Groups)

Endpoints are organized by functional area:

| Tag | Purpose |
|-----|---------|
| Auth | Authentication flows and OTP/JWT handling |
| Doula | Doula profile and professional management |
| Doula Join Enquiries | Doula recruitment inquiry management |
| Client | Client-facing operations and bookings |
| Services | Service definitions and management |
| Service Pricing | Service pricing configuration |
| Service Availability | Doula availability scheduling |
| Doula Service Availability | Same as above with different naming |
| Service Bookings | Booking lifecycle management |
| Meetings | Consultation meeting scheduling |
| Intake Forms | Client intake form management |
| Enquiry Forms | Inquiry form submission |
| Testimonials | Client testimonials and ratings |
| Regions | Geographic region management |
| Contact Form | Public contact submissions |
| Zone Managers | Zone manager operations |
| Analytics | System analytics and reporting |
| Device Tokens | Push notification token management |
| User Management | User account operations |
- **Stripe Payment** | Payment webhook handling |
| Mail Queue (Testing) | Email queue testing |
| Health Check | API health verification |

## Authentication

### Bearer Token Authentication
Most endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access Control (RBAC)
Endpoints are protected by user roles:

- **ADMIN** - Full system access, user management
- **DOULA** - Own profile management, availability scheduling
- **CLIENT** - Booking operations, profile management
- **ZONE_MANAGER** - Region and doula oversight

## Request/Response Examples

### Example: Create a Service Booking
```bash
POST /backend/v1/service-booked
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
  "doulaProfileId": "c47f4da8-c249-403f-9e27-f0452dec9a41",
  "clientId": "8411173d-0d5b-4b02-8e8c-2812c109d102",
  "startDate": "2026-04-15T00:00:00.000Z",
  "endDate": "2026-04-20T00:00:00.000Z"
}
```

Response:
```json
{
  "status": "success",
  "message": "Service booking created successfully",
  "data": {
    "id": "booking-uuid-123",
    "serviceId": "service-uuid",
    "doulaProfileId": "doula-uuid",
    "clientId": "client-uuid",
    "status": "ACTIVE",
    "startDate": "2026-04-15T00:00:00.000Z",
    "endDate": "2026-04-20T00:00:00.000Z",
    "createdAt": "2026-04-09T10:30:00.000Z"
  }
}
```

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering & Searching
```
?role=DOULA
?search=Sarah
?status=ACTIVE
?isAvailable=true
```

### Date Range Filtering
```
?startDate=2026-04-01&endDate=2026-04-30
```

## File Upload Endpoints

Some endpoints support file uploads (multipart/form-data):

- **POST /doula** - Upload doula profile image and gallery
- **PATCH /clients/:id/profile-image** - Update client profile picture
- **POST /zonemanager** - Zone manager profile image upload

Example using curl:
```bash
curl -X POST http://localhost:3000/backend/v1/doula \
  -H "Authorization: Bearer <token>" \
  -F "name=John Doe" \
  -F "profile_image=@/path/to/image.jpg" \
  -F "gallery_image=@/path/to/image1.jpg" \
  -F "gallery_image=@/path/to/image2.jpg"
```

## Error Handling

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": ["Error message 1", "Error message 2"],
  "error": "Bad Request"
}
```

Common error scenarios:
- **400 Bad Request** - Invalid input data, validation errors
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User lacks required permissions/roles
- **404 Not Found** - Resource does not exist
- **500 Internal Server Error** - Server-side error

## Testing with Swagger UI

1. **Navigate to Swagger UI**: `http://localhost:3000/api/docs`
2. **Authorize**: Click "Authorize" button and paste your JWT token
3. **Try it out**: Click "Try it out" on any endpoint
4. **Fill parameters**: Enter required path, query, and body parameters
5. **Execute**: Click "Execute" to make the request
6. **View response**: Check the response status, headers, and body

## Integration with Frontend

### Example: JavaScript/Fetch
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:3000/backend/v1/doula', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
// data.data contains the actual response
```

### Example: TypeScript with Auto-Generated Client
You can use tools like OpenAPI Generator to auto-generate client code:
```bash
openapi-generator-cli generate -i http://localhost:3000/api-json -g typescript-fetch -o ./src/generated
```

## Documentation Standards

All endpoints follow these standards:

✅ **Consistent naming** - Clear, descriptive endpoint paths  
✅ **Detailed summaries** - Each endpoint has a brief summary  
✅ **Full descriptions** - What the endpoint does and why  
✅ **Type definitions** - All request/response schemas defined  
✅ **Example data** - Realistic examples provided  
✅ **Error documentation** - All possible error responses listed  
✅ **Status codes** - Correct HTTP status codes used  
✅ **Authorization** - Clear auth requirements marked  

## Updating Documentation

To update Swagger documentation:

1. **Edit Controller Decorators**: Modify `@ApiOperation`, `@ApiResponse` in controller files
2. **Update DTO Classes**: Ensure DTOs have proper type definitions
3. **Restart Server**: Changes take effect when server restarts
4. **Refresh Swagger UI**: Browser cache may need clearing

Example updating an endpoint:
```typescript
@ApiOperation({
  summary: 'Get user profile',
  description: 'Retrieve the authenticated user\'s profile information'
})
@ApiResponse({
  status: 200,
  schema: {
    example: {
      status: 'success',
      data: { /* example response */ }
    }
  }
})
```

## Support & Documentation

- **API Docs**: http://localhost:3000/api/docs
- **Project Structure**: See README.md
- **Database Schema**: See prisma/schema.prisma
- **Environment Setup**: Check .env configuration

## Version

API Version: **1.0**  
Doulas API Documentation  
Last Updated: April 2026

---

For detailed endpoint specifications, visit the Swagger UI at your running server.
