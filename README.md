# WashPanda Backend

REST API for guest car-wash bookings. Customers do not create accounts. A generated
booking ID such as `WP-20260716-A1B2C3D4`, together with the booking phone number,
is used to look up or cancel a booking.

## Stack

- Node.js 20+
- Express 5
- MongoDB and Mongoose
- Zod request validation
- Helmet security headers
- CORS
- Express rate limiting
- Morgan request logging

## Project flow

```text
HTTP request
  -> route
  -> validation/rate-limit/admin middleware
  -> controller
  -> service (business rules and price calculation)
  -> Mongoose model
  -> MongoDB
  -> standard JSON response
```

Important folders:

```text
src/
  config/       database connection
  controllers/  HTTP request and response handling
  data/         initial catalogue data
  middleware/   errors, validation, CORS, rate limits, admin key
  models/       Mongoose schemas
  routes/       API endpoint definitions
  scripts/      executable maintenance scripts
  services/     booking, pricing, availability, catalogue rules
  utils/        reusable errors, IDs, async and response helpers
  validations/  Zod request schemas
```

## Setup

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run seed
npm.cmd run dev
```

The API runs at `http://localhost:5000`.

The customer frontend runs on port `5173` and the separate admin dashboard runs
on port `5174`; both origins are included in the default CORS configuration.

`JWT_SECRET` must be a random value of at least 32 characters. Running `npm.cmd
run seed:admin` creates only the initial admin from `INITIAL_ADMIN_*` environment
values. The regular `seed` command creates the catalogue and the initial admin.
The development defaults are `admin@example.com` and `Admin@123`; change that
password for a deployed environment.

Sign in to receive an expiring bearer token:

```text
POST /api/auth/login
```

## Public endpoints

```text
GET  /api/health
GET  /api/catalog
GET  /api/catalog/packages?vehicleType=sedan
GET  /api/catalog/availability?date=2026-07-20
POST /api/bookings/quote
POST /api/bookings
GET  /api/bookings/:bookingId?phone=03001234567
POST /api/bookings/:bookingId/cancel
POST /api/contact
```

### Quote request

Only catalogue IDs or codes are accepted. Prices sent by a browser are ignored.

```json
{
  "vehicles": [
    {
      "vehicleTypeId": "sedan",
      "packageId": "sedan-deluxe",
      "addonIds": ["bike"],
      "makeAndModel": "Honda Civic"
    }
  ]
}
```

### Create booking request

```json
{
  "serviceDate": "2026-07-20",
  "timeSlotId": "evening",
  "paymentMethod": "cash",
  "note": "Please call before arrival",
  "customer": {
    "fullName": "Ali Khan",
    "email": "ali@example.com",
    "phone": "03001234567",
    "address": "Johar Town, Lahore"
  },
  "vehicles": [
    {
      "vehicleTypeId": "sedan",
      "packageId": "sedan-deluxe",
      "addonIds": [],
      "makeAndModel": "Honda Civic"
    }
  ]
}
```

The server verifies catalogue records and availability, calculates all prices from
MongoDB, stores price snapshots, and returns the generated `bookingId`.

Each wash package belongs to one vehicle type. The package endpoint returns only
the three active packages linked to the requested vehicle type. Booking and quote
requests reject a package when it does not belong to the selected vehicle.

### Guest lookup

The phone number is required so a booking cannot be retrieved using only a guessed
booking ID.

```text
GET /api/bookings/WP-20260716-A1B2C3D4?phone=03001234567
```

### Guest cancellation

```json
{
  "phone": "03001234567"
}
```

## Admin endpoints

All routes below require `Authorization: Bearer <token>`.

```text
GET   /api/admin/bookings
GET   /api/admin/bookings/:bookingId
PATCH /api/admin/bookings/:bookingId
GET   /api/admin/contact-messages
PATCH /api/admin/contact-messages/:id
GET   /api/admin/catalog/:resource
POST  /api/admin/catalog/:resource
PATCH /api/admin/catalog/:resource/:id
DELETE /api/admin/catalog/:resource/:id
GET   /api/admin/me
PATCH /api/admin/me
PATCH /api/admin/me/photo
POST  /api/admin/admins
```

Supported catalogue resources are `vehicle-types`, `packages`, `addons`, and
`time-slots`. Delete performs a soft delete by setting `isActive` to `false`, which
preserves historical booking references.

Package create/update payloads include the MongoDB ID of the related vehicle type:

```json
{
  "code": "sedan-basic",
  "vehicleTypeId": "64f1234567890abcdef1234",
  "name": "Basic Wash",
  "basePrice": 1099,
  "currency": "PKR",
  "features": ["Exterior Detailed Wash", "Interior Cleaning"],
  "durationMinutes": 60,
  "sortOrder": 1,
  "isActive": true
}
```

Booking list filters:

```text
?page=1&limit=20&status=pending&serviceDate=2026-07-20
```

Update example:

```json
{
  "status": "confirmed",
  "paymentStatus": "paid",
  "adminNote": "Assigned to team A"
}
```

## Standard response shape

Success:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Request validation failed",
  "details": []
}
```

## Booking rules

- No user/customer account is created.
- The server is the only price authority.
- Package, vehicle, add-on, and time-slot snapshots are saved in each booking.
- Slot capacity is measured in cars, not booking documents.
- Past dates are rejected.
- Completed or already-cancelled bookings cannot be cancelled by a guest.
- Cash starts as `unpaid`; bank/card starts as `pending`.

For high-volume production booking traffic, move slot reservation into an atomic
MongoDB transaction/counter so simultaneous requests cannot briefly pass the same
capacity check.
