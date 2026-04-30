# SRV App — Real API Setup Guide

## Step 1: Apna PC ka IP address pata karo
Windows mein CMD mein run karo:
```
ipconfig
```
IPv4 Address copy karo (e.g., 192.168.1.105)

## Step 2: config.ts update karo
`src/shared/api/config.ts` mein apna IP set karo:
```ts
export const API_BASE_URL = 'http://192.168.1.105:3001/api/v1';
```

## Step 3: Backend start karo
```
cd ADMIN-PANEL-main/ADMIN-BACKEND
npm run start:dev
```

## Step 4: SRV App start karo
```
cd SRV-APP-main
npx expo start
```

## Development OTP
Login ke liye OTP: **1234** (development mode mein)

## New API Endpoints (Backend)
- POST /api/v1/mobile/auth/send-otp
- POST /api/v1/mobile/auth/verify-otp
- POST /api/v1/mobile/auth/refresh
- GET  /api/v1/mobile/auth/profile
- PATCH /api/v1/mobile/auth/profile
- GET  /api/v1/mobile/products
- GET  /api/v1/mobile/banners
- GET  /api/v1/mobile/notifications
- GET  /api/v1/mobile/offers
- GET  /api/v1/mobile/testimonials
- GET  /api/v1/mobile/dealer/by-phone?phone=XXXXXXXXXX
- POST /api/v1/mobile/scan (auth required)
- GET  /api/v1/mobile/wallet (auth required)
- GET  /api/v1/mobile/scan-history (auth required)
- GET  /api/v1/mobile/electricians (auth required)
- POST /api/v1/mobile/electricians (auth required)
