import type { PaymentPayload, PaymentResult } from "@/types/payment";

function isPaymentResult(value: unknown): value is PaymentResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<PaymentResult>;

  return (
    typeof result.transactionId === "string" &&
    typeof result.status === "string" &&
    typeof result.message === "string" &&
    typeof result.processedAt === "string"
  );
}

export async function submitPayment(
  payload: PaymentPayload,
  signal: AbortSignal,
): Promise<PaymentResult> {
  const response = await fetch("/api/pay", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    signal,
  });

  const body: unknown = await response.json().catch(() => null);

  if (isPaymentResult(body)) {
    return body;
  }

  throw new Error("Unexpected gateway response.");
}
