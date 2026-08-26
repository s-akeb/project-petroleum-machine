# Petroleum Machine API

Node.js + Express + MongoDB backend for user/admin auth and petroleum-machine CRUD, documented with Swagger.

## Setup

```bash
npm install
copy .env.example .env
```

`.env` already points at local MongoDB:

```
MONGO_URI=mongodb://127.0.0.1:27017/petroleum
```

Start MongoDB, then the API (two terminals):

```bash
npm run mongo
npm start
```

- API: `http://localhost:8888`
- Swagger: `http://localhost:8888/api-docs`
- Health: `http://localhost:8888/health`

Default admin: `POST /admin/adminLogin` using `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` from `.env`.

## Auth

Protected routes expect a `token` header (JWT from login). Bearer tokens (`Authorization: Bearer <jwt>`) also work.

Standard body shape:

```json
{
  "responseCode": 200,
  "responseMessage": "Login successful.",
  "responseResult": {}
}
```

## Route map

| Area | Base path | Notes |
|---|---|---|
| User | `/user` | Signup, OTP, login, profile, IFSC |
| Admin | `/admin` | Admin auth and profile |
| Machine | `/machine` | Admin CRUD + QR |
| Static | `/static` | T&C, Privacy, About Us |

OTP is returned in signup/forgot responses so you can demo the flow if SMTP is unavailable.

## Scripts

- `npm run mongo` — local MongoDB 7 on `127.0.0.1:27017`
- `npm start` — production
- `npm run dev` — nodemon
