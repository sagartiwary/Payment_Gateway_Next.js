# Payment Gateway Simulation

A frontend assignment implementation for a simulated payment gateway built with Next.js App Router, TypeScript, Tailwind CSS, and Zustand.

## Features

- Real-time payment form validation with per-field errors.
- Card number formatting and card type detection for Visa, Mastercard, and Amex.
- Expiry validation that rejects past dates.
- Amex-aware CVV validation.
- INR and USD currency support.
- Live card preview.
- Mock gateway route at `/api/pay`.
- Payment lifecycle states: idle, processing, success, failed, and timeout.
- Frontend timeout handling with `AbortController` after 6 seconds.
- Retry support up to 3 attempts with the same transaction ID.
- Transaction history persisted with `localStorage`.
- Clickable transaction details.
- Responsive layout for mobile and desktop.
- Demo card shortcuts for faster review.
- Live readiness score with payment UX checks.
- Luhn card checksum validation.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Assumptions

- This is a mock payment flow and does not use a third-party payment SDK.
- Only non-sensitive display data is stored in history, including the last four card digits.
- The mock gateway randomly returns success, failure, or a slow response.
- Slow gateway responses are treated as frontend timeouts because the client aborts after 6 seconds.
- Zustand was chosen because the assignment needs compact global lifecycle and history state without the boilerplate of a larger Redux setup.

## Future Improvements

- Add automated component and interaction tests.
- Add toast notifications for network status changes.
- Add stronger card-brand rules and Luhn validation.
- Add a clear-history action with confirmation.
- Add deployment-specific environment checks.
# Payment_Gateway_Next.js
