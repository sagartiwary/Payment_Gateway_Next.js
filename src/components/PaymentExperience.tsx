"use client";

import { useMemo, useState } from "react";
import { CardPreview } from "@/components/CardPreview";
import { PaymentForm } from "@/components/PaymentForm";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import { usePaymentStore } from "@/store/paymentStore";
import type { FieldErrors, PaymentFormValues } from "@/types/payment";
import { isPaymentFormValid } from "@/utils/paymentValidation";

const initialValues: PaymentFormValues = {
  amount: "",
  cardNumber: "",
  cardholderName: "",
  currency: "INR",
  cvv: "",
  expiry: "",
};

export function PaymentExperience() {
  const [values, setValues] = useState<PaymentFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const isValid = useMemo(() => isPaymentFormValid(values), [values]);
  const status = usePaymentStore((state) => state.status);
  const clearResult = usePaymentStore((state) => state.clearResult);
  const { processPayment } = usePaymentProcessor(values);
  const isProcessing = status === "processing";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Payment details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Card data is only used for this simulated transaction.
            </p>
          </div>
          {status !== "idle" && status !== "processing" && (
            <button
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setValues(initialValues);
                setErrors({});
                clearResult();
              }}
              type="button"
            >
              New payment
            </button>
          )}
        </div>
        <div className="mt-6">
          <PaymentForm
            errors={errors}
            isProcessing={isProcessing}
            isValid={isValid && !isProcessing}
            onErrorsChange={setErrors}
            onSubmit={() => void processPayment(false)}
            onValuesChange={setValues}
            values={values}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:sticky lg:top-6">
        <CardPreview values={values} />
        <StatusScreen onRetry={() => void processPayment(true)} />
        <TransactionHistory />
      </div>
    </div>
  );
}
