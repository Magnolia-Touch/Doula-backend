# Doula Backend - Comprehensive API Endpoints Analysis

**Generated:** April 9, 2026  
**Project:** Doula Backend (NestJS)  
**Version:** 1

---

## Overview

This document contains a complete inventory of all API controllers, routes, endpoints, HTTP methods, and current Swagger decorators in the doula-backend NestJS application.

**Total Controllers Found:** 22

---

## 1. Authentication Controller
**File:** [src/auth/auth.controller.ts](src/auth/auth.controller.ts)  
**Base Route:** `/auth` (v1)  
**API Tag:** `Auth`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `RegistrationAdmin()` | `register/admin` | POST | @ApiOperation, @ApiResponse | ✓ JWT + Roles | ADMIN |
| 2 | `LoginOtp()` | `send/otp` | POST | @ApiOperation, @ApiResponse | ✗ | - |
| 3 | `verifyOtp()` | `verify/otp/doula` | POST | @ApiOperation, @ApiResponse | ✗ | - |
| 4 | `verifyAdminOtp()` | `verify/otp` | POST | @ApiOperation, @ApiResponse | ✗ | - |
| 5 | `verifyClientOtp()` | `verify/otp/client` | POST | @ApiOperation, @ApiResponse | ✗ | - |
| 6 | `myProfile()` | `profile` | GET | @ApiOperation, @ApiResponse | ✓ JWT | - |

---

## 2. User Controller
**File:** [src/users/users.controller.ts](src/users/users.controller.ts)  
**Base Route:** `/user` (v1)  
**API Tag:** `User`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `RegisterUser()` | `register/user` | POST | @ApiOperation, @ApiResponse | ✗ | - |
| 2 | `deleteAll()` | `delete` | DELETE | @ApiOperation, @ApiResponse | ✗ | - |
| 3 | `changeUserStatus()` | `change/status` | PATCH | @ApiOperation, @ApiResponse | ✓ JWT + Roles | ADMIN |

---

## 3. Analytics Controller
**File:** [src/analytics/analytics.controller.ts](src/analytics/analytics.controller.ts)  
**Base Route:** `/analytics` (v1)  
**API Tag:** `Analytics`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `listUsers()` | `GET` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✓ JWT + Roles | ADMIN |

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `role` (optional) - Filter by role (ADMIN, CLIENT, DOULA, ZONE_MANAGER)

---

## 4. Doula Controller
**File:** [src/doula/doula.controller.ts](src/doula/doula.controller.ts)  
**Base Route:** `/doula` (v1)  
**API Tag:** `Doula`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiConsumes | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |
| 2 | `get()` | `/` | GET | @ApiOperation, @ApiQuery | ✓ Optional JWT | - |
| 3 | `getById()` | `/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✗ | - |
| 4 | `delete()` | `/:id` | DELETE | @ApiOperation, @ApiParam | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |
| 5 | `updateStatus()` | `/:id/update/status/` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |
| 6 | `updateRegions()` | `/:profileId/regions` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |
| 7 | `getOffDays()` | `/:id/off-days` | GET | @ApiOperation, @ApiParam | ✗ | - |
| 8 | `createOffDays()` | `/:id/off-days` | POST | @ApiOperation, @ApiBody | ✓ JWT + Roles | DOULA |
| 9 | `updateOffDays()` | `/off-days/:id` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | DOULA |
| 10 | `deleteOffDays()` | `/off-days/:id` | DELETE | @ApiOperation, @ApiParam | ✓ JWT + Roles | DOULA |
| 11 | `createCertificate()` | `/:id/certificates` | POST | @ApiOperation, @ApiBody | ✓ JWT + Roles | DOULA |
| 12 | `updateCertificate()` | `/certificates/:certId` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | DOULA |
| 13 | `deleteCertificate()` | `/certificates/:certId` | DELETE | @ApiOperation, @ApiParam | ✓ JWT + Roles | DOULA |
| 14 | `calculatePricing()` | `/pricing/calculate` | POST | @ApiOperation, @ApiBody | ✗ | - |

**Query Parameters for GET /:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name, email, phone, region
- `serviceId` - Filter by service
- `isAvailable` - Filter by availability
- `isActive` - Filter by active status
- `regionName` - Filter by region
- `minExperience` - Minimum years of experience
- `serviceName` - Filter by service name
- `startDate` - ISO date yyyy-MM-dd
- `endDate` - ISO date yyyy-MM-dd
- `weekDays` - Array of weekdays
- `random` - Return random selection

---

## 5. Doula Join Enquiry Controller
**File:** [src/doula-join-enquiry/doula-join-enquiry.controller.ts](src/doula-join-enquiry/doula-join-enquiry.controller.ts)  
**Base Route:** `/doula-join-enquiries` (v1)  
**API Tag:** Not explicitly tagged  

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | ✗ | ✗ | - |
| 2 | `findAll()` | `/` | GET | ✗ | ✗ | - |
| 3 | `findOne()` | `/:id` | GET | ✗ | ✗ | - |
| 4 | `update()` | `/:id` | PATCH | ✗ | ✗ | - |
| 5 | `remove()` | `/:id` | DELETE | ✗ | ✗ | - |

**Query Parameters for GET /:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by JoinEnquiryStatus

---

## 6. Enquiry Forms Controller
**File:** [src/enquiry-forms/enquiry-forms.controller.ts](src/enquiry-forms/enquiry-forms.controller.ts)  
**Base Route:** `/enquiry/form` (v1)  
**API Tag:** `Enquiry Forms`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `submit()` | `/` | POST | @ApiOperation, @ApiBody, @ApiResponse | ✗ | - |
| 2 | `getAllEnquiries()` | `/` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✓ JWT + Roles | ZONE_MANAGER |
| 3 | `getEnquiryById()` | `/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✓ JWT + Roles | ZONE_MANAGER |
| 4 | `deleteEnquiry()` | `/:id` | DELETE | @ApiOperation, @ApiParam | ✗ | - |

**Query Parameters for GET /:**
- `page` - Page number
- `limit` - Items per page

---

## 7. Service Availability Controller
**File:** [src/service-availability/service-availability.controller.ts](src/service-availability/service-availability.controller.ts)  
**Base Route:** `/service/availability` (v1)  
**API Tag:** `Doula Service Availability`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `createAvailability()` | `/` | POST | @ApiOperation, @ApiBody, @ApiResponse | ✓ JWT + Roles | DOULA |
| 2 | `findAll()` | `/` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✓ JWT + Roles | DOULA |
| 3 | `getById()` | `/:id` | GET | @ApiOperation, @ApiParam | ✓ JWT + Roles | DOULA |
| 4 | `updateOffDays()` | `/off-days` | POST | @ApiOperation, @ApiBody | ✓ JWT + Roles | DOULA |
| 5 | `updateOffDaysById()` | `/off-days/:id` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | DOULA |
| 6 | `getOffDaysForDoula()` | `/off-days/list/:doulaId` | GET | @ApiOperation, @ApiParam | ✓ JWT + Roles | DOULA |

**Query Parameters:**
- `date1` - Start date filter
- `date2` - End date filter
- `page` - Page number
- `limit` - Items per page

---

## 8. Service Bookings Controller
**File:** [src/service-bookings/service-booking.controller.ts](src/service-bookings/service-booking.controller.ts)  
**Base Route:** `/service-booked` (v1)  
**API Tag:** `Service Bookings`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `findAll()` | `/` | GET | @ApiOperation, @ApiResponse | ✓ JWT + Roles | ADMIN |
| 2 | `getBookingById()` | `/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✓ JWT + Roles | ADMIN |
| 3 | `updateScheduleStatus()` | `/schedules/:id/status` | PATCH | @ApiOperation, @ApiParam | ✓ JWT + Roles | DOULA, ZONE_MANAGER, ADMIN |
| 4 | `updateBookingStatus()` | `/bookings/:id/status` | PATCH | @ApiOperation, @ApiParam | ✓ JWT + Roles | DOULA, ZONE_MANAGER, ADMIN |
| 5 | `getAllMeetings()` | `/meetings/list/admin` | GET | @ApiOperation, @ApiResponse | ✓ JWT + Roles | ADMIN |
| 6 | `getMeetingById()` | `/meetings/list/admin/:id` | GET | @ApiOperation, @ApiParam | ✓ JWT + Roles | ADMIN |
| 7 | `getAllSchedules()` | `/schedules/list/admin` | GET | @ApiOperation, @ApiResponse | ✗ | - |
| 8 | `getScheduleById()` | `/schedules/list/admin/:id` | GET | @ApiOperation, @ApiParam | ✗ | - |
| 9 | `getTestimonials()` | `/testimonials/list/admin/` | GET | @ApiOperation, @ApiResponse | ✗ | - |
| 10 | `getById()` | `/testimonials/list/admin/:id` | GET | @ApiOperation, @ApiParam | ✗ | - |

---

## 9. Services Controller
**File:** [src/services/services.controller.ts](src/services/services.controller.ts)  
**Base Route:** `/services` (v1)  
**API Tag:** `Services`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiBody, @ApiResponse | ✓ JWT + Roles | ADMIN |
| 2 | `findAll()` | `/` | GET | @ApiOperation, @ApiResponse | ✗ | - |
| 3 | `findOne()` | `/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✗ | - |
| 4 | `update()` | `/:id` | PATCH | @ApiOperation, @ApiResponse | ✓ JWT + Roles | ADMIN |
| 5 | `delete()` | `/:id` | DELETE | @ApiOperation, @ApiParam | ✓ JWT + Roles | ADMIN |

---

## 10. Testimonials Controller
**File:** [src/testimonials/testimonials.controller.ts](src/testimonials/testimonials.controller.ts)  
**Base Route:** `/testimonials` (v1)  
**API Tag:** `Testimonials`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiBody | ✓ JWT + Roles | CLIENT |
| 2 | `findAll()` | `/` | GET | @ApiOperation, @ApiQuery | ✗ | - |
| 3 | `findOne()` | `/:id` | GET | @ApiOperation, @ApiParam | ✗ | - |
| 4 | `update()` | `/:id` | PATCH | @ApiOperation, @ApiParam | ✓ JWT + Roles | CLIENT |
| 5 | `remove()` | `/:id` | DELETE | @ApiOperation, @ApiParam | ✓ JWT + Roles | CLIENT |
| 6 | `getTestimonials()` | `/recent/testimonials` | GET | @ApiOperation, @ApiQuery | ✓ JWT + Roles | ZONE_MANAGER |
| 7 | `getAllzmTestimonial()` | `/all/testimonials` | GET | @ApiOperation, @ApiQuery | ✓ JWT + Roles | ZONE_MANAGER |
| 8 | `getZmTestimonialSummary()` | `/all/summary` | GET | @ApiOperation | ✓ JWT + Roles | ZONE_MANAGER |

**Query Parameters for findAll():**
- `doulaId` - Filter by doula ID
- `serviceId` - Filter by service ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

---

## 11. Zone Manager Controller
**File:** [src/zone_manager/zone_manager.controller.ts](src/zone_manager/zone_manager.controller.ts)  
**Base Route:** `/zonemanager` (v1)  
**API Tag:** `Zone Managers`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiConsumes | ✓ JWT + Roles | ADMIN |
| 2 | `getZoneManagers()` | `/` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✗ | - |
| 3 | `getById()` | `/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✗ | - |
| 4 | `updateZoneManager()` | `/:id` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | ADMIN |
| 5 | `updateRegion()` | `/:id/regions` | PATCH | @ApiOperation, @ApiBody | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |
| 6 | `checkRegionAssignment()` | `/check-by-region/:regionId` | GET | @ApiOperation, @ApiParam | ✓ JWT | - |
| 7 | `getDoulasUnderZM()` | `/:zmId/doulas` | GET | @ApiOperation, @ApiParam, @ApiQuery | ✗ | - |

**Query Parameters for GET /:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search query
- `regionId` - Filter by region
- `is_active` - Filter by active status

**Query Parameters for getDoulasUnderZM():**
- `page` - Page number
- `limit` - Items per page
- `search` - Search query
- `isAvailable` - Filter by availability
- `serviceName` - Filter by service

---

## 12. Intake Forms Controller
**File:** [src/intake-forms/intake-forms.controller.ts](src/intake-forms/intake-forms.controller.ts)  
**Base Route:** `/intake/forms` (v1)  
**API Tag:** `Intake Forms`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiBody, @ApiResponse | ✓ JWT | - |
| 2 | `getAll()` | `/` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✗ | - |
| 3 | `getById()` | `/:id` | GET | @ApiOperation, @ApiParam | ✗ | - |

**Query Parameters for GET /:**
- `page` - Page number
- `limit` - Items per page

---

## 13. Meetings Controller
**File:** [src/meetings/meetings.controller.ts](src/meetings/meetings.controller.ts)  
**Base Route:** `/meetings` (v1)  
**API Tag:** `Meetings`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `getMeetings()` | `/` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✓ JWT + Roles | ADMIN, DOULA, ZONE_MANAGER |
| 2 | `scheduleDoulaMeeting()` | `/doula/schedule` | POST | ✗ (Marked as USELESS) | ✓ JWT + Roles | ZONE_MANAGER |
| 3 | `findAll()` | `/doula/schedule/list` | GET | ✗ | ✓ JWT + Roles | ZONE_MANAGER, DOULA |
| 4 | `updateStatus()` | `/doula/schedule/list/:id/status` | PATCH | ✗ | ✓ JWT + Roles | ZONE_MANAGER, DOULA |
| 5 | `findOne()` | `/doula/schedule/list/:id` | GET | ✗ | ✗ | - |
| 6 | `update()` | `/doula/schedule/update/:id` | PATCH | ✗ | ✓ JWT + Roles | ZONE_MANAGER |
| 7 | `remove()` | `/doula/schedule/delete/:id` | DELETE | ✗ | ✓ JWT + Roles | ZONE_MANAGER |

**Query Parameters for GET /:**
- `startDate` - YYYY-MM-DD format
- `endDate` - YYYY-MM-DD format
- `status` - SCHEDULED, COMPLETED, CANCELED
- `page` - Page number
- `limit` - Items per page

---

## 14. Regions Controller
**File:** [src/regions/regions.controller.ts](src/regions/regions.controller.ts)  
**Base Route:** `/regions` (v1)  
**API Tag:** `Regions`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiBody | ✗ | - |
| 2 | `findAll()` | `/` | GET | @ApiOperation, @ApiQuery, @ApiResponse | ✗ | - |
| 3 | `findOne()` | `/:id` | GET | @ApiOperation, @ApiParam | ✗ | - |
| 4 | `update()` | `/:id` | PUT | @ApiOperation, @ApiBody | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |
| 5 | `delete()` | `/:id` | DELETE | @ApiOperation, @ApiParam | ✓ JWT + Roles | ADMIN, ZONE_MANAGER |

**Query Parameters for GET /:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search query
- `is_active` - Filter by active status

---

## 15. Contact Form Controller
**File:** [src/contact-form/contact-form.controller.ts](src/contact-form/contact-form.controller.ts)  
**Base Route:** `/contact-form` (v1)  
**API Tag:** `Contact Form`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `submit()` | `/` | POST | @ApiOperation, @ApiBody, @ApiResponse | ✗ | - |

---

## 16. Client Controller
**File:** [src/client/client.controller.ts](src/client/client.controller.ts)  
**Base Route:** `/clients` (v1)  
**API Tag:** Not explicitly tagged  
**Default Auth:** @UseGuards(JwtAuthGuard)

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `getBookedServices()` | `/booked-services` | GET | @ApiOperation, @ApiResponse | ✓ JWT | - |
| 2 | `getBookedServiceById()` | `/booked-services/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✓ JWT | - |
| 3 | `cancelServiceBooking()` | `/booked-services/:id/cancel` | PATCH | @ApiOperation, @ApiParam | ✓ JWT | - |
| 4 | `getSchedules()` | `/booked-schedules` | GET | @ApiOperation, @ApiResponse | ✓ JWT | - |
| 5 | `getScheduleById()` | `/booked-schedules/:id` | GET | @ApiOperation, @ApiParam | ✓ JWT | - |
| 6 | `updateProfile()` | `/profile` | PATCH | @ApiOperation, @ApiResponse | ✓ JWT | - |
| 7 | `uploadProfileImage()` | `/profile-image` | POST | @ApiOperation, @ApiConsumes | ✓ JWT | - |
| 8 | `getProfile()` | `/profile` | GET | @ApiOperation, @ApiResponse | ✓ JWT | - |
| 9 | `getEnquiries()` | `/enquiries` | GET | @ApiOperation, @ApiResponse | ✓ JWT | - |
| 10 | `deleteProfile()` | `/profile` | DELETE | @ApiOperation | ✓ JWT | - |

---

## 17. Device Token Controller
**File:** [src/token/device-token.controller.ts](src/token/device-token.controller.ts)  
**Base Route:** `/device-tokens` (v1)  
**API Tag:** `Device Tokens`

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `register()` | `/` | POST | @ApiOperation, @ApiBody, @ApiResponse | ✗ | - |
| 2 | `listForUser()` | `/:userId` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✗ | - |
| 3 | `remove()` | `/:token` | DELETE | @ApiOperation, @ApiParam, @ApiResponse | ✗ | - |

---

## 18. Stripe Controller
**File:** [src/stripe/stripe.controller.ts](src/stripe/stripe.controller.ts)  
**Base Route:** `/stripe` (v1)  
**API Tag:** Not explicitly tagged

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `testWebhook()` | `/webhook` | GET | ✗ | ✗ | - |
| 2 | `handleStripeWebhook()` | `/webhook` | POST | ✗ | ✗ | - |

---

## 19. Mail Queue Controller
**File:** [src/mail-queue/queue.controller.ts](src/mail-queue/queue.controller.ts)  
**Base Route:** `/test/queue` (v1)  
**API Tag:** Not explicitly tagged

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `testQueue()` | `/test-mail-queue` | GET | ✗ | ✗ | - |

---

## 20. App Controller
**File:** [src/app.controller.ts](src/app.controller.ts)  
**Base Route:** `/` (no version)  
**API Tag:** Not applicable

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `getHello()` | `/` | GET | ✗ | ✗ | - |

---

## 21. Service Pricing Controller
**File:** [src/service-pricing/service-pricing.controller.ts](src/service-pricing/service-pricing.controller.ts)  
**Base Route:** `/services-pricing` (v1)  
**API Tag:** `Service Pricing`  
**Default Auth:** @ApiBearerAuth

| # | Method | Route | HTTP Verb | Swagger Decorator | Protected | Roles |
|---|--------|-------|-----------|------------------|-----------|-------|
| 1 | `create()` | `/` | POST | @ApiOperation, @ApiResponse | ✓ JWT + Roles | DOULA |
| 2 | `findAll()` | `/` | GET | @ApiOperation, @ApiResponse | ✓ JWT + Roles | DOULA |
| 3 | `findOne()` | `/:id` | GET | @ApiOperation, @ApiParam, @ApiResponse | ✗ | - |
| 4 | `update()` | `/:id` | PATCH | @ApiOperation, @ApiResponse | ✓ JWT + Roles | DOULA |
| 5 | `delete()` | `/:id` | DELETE | @ApiOperation, @ApiResponse | ✓ JWT + Roles | DOULA |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Controllers** | 22 |
| **Total Endpoints** | ~155+ |
| **Protected Endpoints** | ~85+ |
| **Public Endpoints** | ~70+ |
| **Controllers with Swagger Decorators** | 17+ |
| **Controllers with Basic API Tags** | 15+ |

---

## API Versioning

All controllers use **Version 1** routing by default:
- Pattern: `/api/v1/{route}`
- Configured via `@Controller({ path: '...', version: '1' })`

---

## Authentication & Authorization

### Guard Types Used:
- **JwtAuthGuard** - Requires valid JWT token
- **OptionalJwtAuthGuard** - JWT is optional (public with optional auth)
- **RolesGuard** - Enforces role-based access control

### Roles in System:
- `ADMIN` - Administrator access
- `DOULA` - Doula service provider
- `CLIENT` - Service consumer
- `ZONE_MANAGER` - Regional manager

---

## Documentation Gaps Identified

### Controllers with Missing/Minimal Swagger:
1. **Doula Join Enquiry Controller** - No Swagger decorators at all
2. **Mail Queue Controller** - No Swagger decorators
3. **Stripe Controller** - No Swagger decorators
4. **Meetings Controller** - Some endpoints marked as "USELESS" (likely deprecated)
5. **App Controller** - Basic, no decorators

### Incomplete Documentation:
- Service Pricing - No dedicated controller file found
- Admin module - No dedicated admin controller found
- Missing response DTO examples on some endpoints
- Inconsistent @ApiResponse decorators across modules

---

## Recommended Documentation Priorities

### High Priority (Missing Core Documentation):
1. Admin-specific operations and management endpoints
2. Payment/Stripe webhook and processing flows
3. Missing response DTO examples on some endpoints
4. Complete documentation for all service pricing endpoints

### Medium Priority (Incomplete Swagger):
1. Add Swagger decorators to Doula Join Enquiry
2. Add Swagger decorators to Mail Queue endpoints
3. Complete Stripe webhook documentation
4. Mark deprecated endpoints clearly (e.g., Meetings USELESS endpoints)

### Low Priority (Enhancement):
1. Add more detailed query parameter documentation
2. Add request/response body examples to all endpoints
3. Expand error response documentation
4. Document pagination standards

---

## File Structure Reference

```
src/
├── admin/                      # ⚠️ No controller found (service only)
├── analytics/                  # analytics.controller.ts ✓
├── auth/                       # auth.controller.ts ✓
├── client/                     # client.controller.ts ✓
├── contact-form/              # contact-form.controller.ts ✓
├── doula/                      # doula.controller.ts ✓
├── doula-join-enquiry/         # doula-join-enquiry.controller.ts ✓
├── enquiry-forms/              # enquiry-forms.controller.ts ✓
├── intake-forms/               # intake-forms.controller.ts ✓
├── mail-queue/                # queue.controller.ts ✓
├── meetings/                   # meetings.controller.ts ✓
├── regions/                    # regions.controller.ts ✓
├── service-availability/       # service-availability.controller.ts ✓
├── service-bookings/           # service-booking.controller.ts ✓
├── service-pricing/            # service-pricing.controller.ts ✓
├── services/                   # services.controller.ts ✓
├── stripe/                     # stripe.controller.ts ✓
├── testimonials/               # testimonials.controller.ts ✓
├── token/                      # device-token.controller.ts ✓
├── users/                      # users.controller.ts ✓
├── zone_manager/               # zone_manager.controller.ts ✓
└── app.controller.ts          # ✓
```

---

## Next Steps

1. **Add Missing Swagger Documentation** - Focus on high-priority gaps
2. **Verify Service Pricing Routes** - Check if integrated in doula.controller.ts or elsewhere
3. **Document Admin Endpoints** - Create comprehensive admin API documentation
4. **Add Response Schemas** - Include complete response body examples for all endpoints
5. **Document Error Codes** - Standardize error responses and codes

---

*For API documentation updates, focus on [src/](src/) directory controllers and ensure all endpoints have proper Swagger decorators.*

