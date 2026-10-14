# YPS Academy Student API

Express and MongoDB API for registering students. Student input is validated at
the API boundary and again by the MongoDB model. Student phone numbers and
provided email addresses must be unique.

## Run locally

1. Use Node.js `20.19.0` or newer, then install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to the MongoDB Atlas
   connection string. Keep `.env` out of source control.
3. Set `CLIENT_ORIGIN` to the Angular application's origin (defaults to
   `http://localhost:4200`).
4. Start the API with `npm run dev`, or `npm start`.

The API listens on port `3000` by default. Run API tests with `npm test`; these
exercise the HTTP contract without requiring an Atlas connection.

## Endpoints

### `GET /api/health`

Returns `200 { "status": "ok" }` when the API process is responsive.

### `POST /api/students`

Create a student. Required fields: `firstName`, `lastName`, `phone`,
`dateOfBirth`, `gender`, `standard`, `course`, `guardianName`, `guardianPhone`,
and `address`. `email` is optional.

```json
{
  "firstName": "Aarav",
  "lastName": "Patil",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "dateOfBirth": "2012-04-18",
  "gender": "Male",
  "standard": "8",
  "course": "SSC",
  "guardianName": "Rajesh Patil",
  "guardianPhone": "9876543211",
  "address": "Udgir, Maharashtra"
}
```

`gender` is `Female`, `Male`, or `Other`; `standard` is `"5"` through `"10"`;
`course` is `SSC`, `HSC Foundation`, `JEE Foundation`, or `NEET Foundation`.
Mobile numbers must be valid 10-digit Indian numbers. The date of birth must be
a real date in the past, formatted as `YYYY-MM-DD`. Unknown fields are rejected.

Success returns `201 { "data": { ...student } }`. Invalid input returns `400`
with field-level `error.details`; a duplicate phone or email returns `409`.
