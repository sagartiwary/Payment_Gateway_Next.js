import type {
  PaymentPayload,
  PaymentResult,
  Transaction,
} from "@/types/payment";

export function createTransactionFromResult(
  payload: PaymentPayload,
  result: PaymentResult,
): Transaction {
  const timestamp = result.processedAt;

  return {
    amount: payload.amount,
    attempts: payload.attempt,
    cardholderName: payload.cardholderName,
    cardNumberLast4: payload.cardNumberLast4,
    cardType: payload.cardType,
    createdAt: timestamp,
    currency: payload.currency,
    id: payload.transactionId,
    message: result.message,
    status: result.status,
    updatedAt: timestamp,
  };
}

export function updateTransactionFromResult(
  transaction: Transaction,
  payload: PaymentPayload,
  result: PaymentResult,
): Transaction {
  return {
    ...transaction,
    amount: payload.amount,
    attempts: payload.attempt,
    cardholderName: payload.cardholderName,
    cardNumberLast4: payload.cardNumberLast4,
    cardType: payload.cardType,
    currency: payload.currency,
    message: result.message,
    status: result.status,
    updatedAt: result.processedAt,
  };
}
