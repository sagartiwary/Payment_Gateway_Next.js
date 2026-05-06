"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Clock3, RotateCcw, XCircle } from "lucide-react";
import { MAX_PAYMENT_ATTEMPTS, usePaymentStore } from "@/store/paymentStore";

interface StatusScreenProps {
  onRetry: () => void;
}

const statusTitles = {
  failed: "Payment failed",
  idle: "Ready for payment",
  processing: "Processing payment",
  success: "Payment successful",
  timeout: "Payment timed out",
} as const;

export function StatusScreen({ onRetry }: StatusScreenProps) {
  const attempt = usePaymentStore((state) => state.attempt);
  const lastResult = usePaymentStore((state) => state.lastResult);
  const status = usePaymentStore((state) => state.status);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const canRetry =
    (status === "failed" || status === "timeout") &&
    attempt < MAX_PAYMENT_ATTEMPTS;
  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "processing"
        ? Clock3
        : status === "failed" || status === "timeout"
          ? XCircle
          : Clock3;

  useEffect(() => {
    if (status !== "idle") {
      headingRef.current?.focus();
    }
  }, [status]);

  return (
    <section
      aria-live="polite"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-800">
          <Icon
            aria-hidden="true"
            className={status === "processing" ? "size-5 animate-pulse" : "size-5"}
          />
        </span>
        <div className="min-w-0">
          <h2
            className="text-lg font-semibold text-slate-950 outline-none"
            ref={headingRef}
            tabIndex={-1}
          >
            {statusTitles[status]}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {status === "processing"
              ? `Attempt ${attempt} of ${MAX_PAYMENT_ATTEMPTS} is in progress.`
              : lastResult?.message ?? "Complete the form to begin."}
          </p>
        </div>
      </div>

      {status === "processing" && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-[payment-progress_1.2s_ease-in-out_infinite] rounded-full bg-cyan-600" />
        </div>
      )}

      {status !== "idle" && (
        <p className="mt-2 text-sm font-medium text-slate-700">
          Attempt {Math.max(attempt, 1)} of {MAX_PAYMENT_ATTEMPTS}
        </p>
      )}

      {(status === "failed" || status === "timeout") && (
        <div className="mt-4">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:hover:translate-y-0"
            disabled={!canRetry}
            onClick={onRetry}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {canRetry ? "Retry payment" : "Retry limit reached"}
          </button>
          {!canRetry && (
            <p className="mt-3 text-sm text-red-700">
              Final failure after 3 attempts.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
