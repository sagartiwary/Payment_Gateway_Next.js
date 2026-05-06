import { NextResponse } from "next/server";
import type { PaymentPayload, PaymentResult } from "@/types/payment";

const SUCCESS_RATE = 0.6;
const FAILURE_RATE = 0.25;
const STANDARD_DELAY_MS = 2000;
const TIMEOUT_DELAY_MS = 8000;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isPaymentPayload(value: unknown): value is PaymentPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<PaymentPayload>;

  return (
    typeof payload.transactionId === "string" &&
    typeof payload.cardholderName === "string" &&
    typeof payload.cardNumberLast4 === "string" &&
    typeof payload.expiry === "string" &&
    typeof payload.amount === "number" &&
    typeof payload.currency === "string" &&
    typeof payload.cardType === "string" &&
    typeof payload.attempt === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);

  if (!isPaymentPayload(body)) {
    return NextResponse.json(
      { message: "Invalid payment request." },
      { status: 400 },
    );
  }

  const randomValue = Math.random();
  const isSuccess = randomValue < SUCCESS_RATE;
  const isFailure = randomValue < SUCCESS_RATE + FAILURE_RATE;
  const delay = isSuccess || isFailure ? STANDARD_DELAY_MS : TIMEOUT_DELAY_MS;

  await wait(delay);

  const result: PaymentResult = {
    message: isSuccess
      ? "Payment approved successfully."
      : isFailure
        ? "Payment was declined by the mock gateway."
        : "The mock gateway responded too slowly.",
    processedAt: new Date().toISOString(),
    status: isSuccess ? "success" : isFailure ? "failed" : "timeout",
    transactionId: body.transactionId,
  };

  return NextResponse.json(result, {
    status: isSuccess ? 200 : isFailure ? 402 : 504,
  });
}
