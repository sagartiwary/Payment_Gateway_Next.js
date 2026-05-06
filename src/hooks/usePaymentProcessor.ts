"use client";

import { useCallback } from "react";
import type {
  PaymentFormValues,
  PaymentPayload,
  PaymentResult,
} from "@/types/payment";
import { detectCardType, getCardLast4 } from "@/utils/card";
import { submitPayment } from "@/utils/paymentApi";
import {
  MAX_PAYMENT_ATTEMPTS,
  usePaymentStore,
} from "@/store/paymentStore";

const FRONTEND_TIMEOUT_MS = 6000;

function createPayload(
  values: PaymentFormValues,
  transactionId: string,
  attempt: number,
): PaymentPayload {
  return {
    amount: Number(values.amount),
    attempt,
    cardNumberLast4: getCardLast4(values.cardNumber),
    cardType: detectCardType(values.cardNumber),
    cardholderName: values.cardholderName.trim(),
    currency: values.currency,
    expiry: values.expiry,
    transactionId,
  };
}

function createClientResult(
  transactionId: string,
  status: PaymentResult["status"],
  message: string,
): PaymentResult {
  return {
    message,
    processedAt: new Date().toISOString(),
    status,
    transactionId,
  };
}

export function usePaymentProcessor(values: PaymentFormValues) {
  const activeTransactionId = usePaymentStore(
    (state) => state.activeTransactionId,
  );
  const attempt = usePaymentStore((state) => state.attempt);
  const recordResult = usePaymentStore((state) => state.recordResult);
  const startProcessing = usePaymentStore((state) => state.startProcessing);

  const processPayment = useCallback(
    async (retry = false) => {
      const transactionId =
        retry && activeTransactionId
          ? activeTransactionId
          : crypto.randomUUID();
      const nextAttempt = retry ? attempt + 1 : 1;

      if (nextAttempt > MAX_PAYMENT_ATTEMPTS) {
        return;
      }

      const payload = createPayload(values, transactionId, nextAttempt);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, FRONTEND_TIMEOUT_MS);

      startProcessing(transactionId, nextAttempt);

      try {
        const result = await submitPayment(payload, controller.signal);
        recordResult(payload, result);
      } catch (error) {
        const isAbort =
          error instanceof DOMException && error.name === "AbortError";
        const result = createClientResult(
          transactionId,
          isAbort ? "timeout" : "failed",
          isAbort
            ? "The gateway took too long to respond. No charge was confirmed."
            : "We could not reach the payment gateway. Please check your connection and retry.",
        );

        recordResult(payload, result);
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [activeTransactionId, attempt, recordResult, startProcessing, values],
  );

  return {
    processPayment,
  };
}
