"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PaymentPayload,
  PaymentResult,
  PaymentStatus,
  Transaction,
} from "@/types/payment";
import {
  createTransactionFromResult,
  updateTransactionFromResult,
} from "@/utils/transactions";

interface PaymentStore {
  activeTransactionId?: string;
  attempt: number;
  history: Transaction[];
  lastResult?: PaymentResult;
  selectedTransactionId?: string;
  status: PaymentStatus;
  clearResult: () => void;
  clearHistory: () => void;
  recordResult: (payload: PaymentPayload, result: PaymentResult) => void;
  selectTransaction: (transactionId?: string) => void;
  startProcessing: (transactionId: string, attempt: number) => void;
}

export const MAX_PAYMENT_ATTEMPTS = 3;

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      activeTransactionId: undefined,
      attempt: 0,
      clearResult: () =>
        set({
          activeTransactionId: undefined,
          attempt: 0,
          lastResult: undefined,
          status: "idle",
        }),
      clearHistory: () =>
        set({
          history: [],
          selectedTransactionId: undefined,
        }),
      history: [],
      lastResult: undefined,
      recordResult: (payload, result) =>
        set((state) => {
          const existing = state.history.find(
            (transaction) => transaction.id === payload.transactionId,
          );
          const nextTransaction = existing
            ? updateTransactionFromResult(existing, payload, result)
            : createTransactionFromResult(payload, result);
          const history = existing
            ? state.history.map((transaction) =>
                transaction.id === payload.transactionId
                  ? nextTransaction
                  : transaction,
              )
            : [nextTransaction, ...state.history];

          return {
            attempt: payload.attempt,
            history,
            lastResult: result,
            selectedTransactionId: payload.transactionId,
            status: result.status,
          };
        }),
      selectTransaction: (transactionId) =>
        set({ selectedTransactionId: transactionId }),
      selectedTransactionId: undefined,
      startProcessing: (transactionId, attempt) =>
        set({
          activeTransactionId: transactionId,
          attempt,
          lastResult: undefined,
          status: "processing",
        }),
      status: "idle",
    }),
    {
      name: "payment-gateway-history",
      partialize: (state) => ({
        history: state.history,
        selectedTransactionId: state.selectedTransactionId,
      }),
    },
  ),
);
