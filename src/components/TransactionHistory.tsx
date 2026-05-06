"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { usePaymentStore } from "@/store/paymentStore";
import { getCardTypeLabel } from "@/utils/card";

export function TransactionHistory() {
  const history = usePaymentStore((state) => state.history);
  const selectedTransactionId = usePaymentStore(
    (state) => state.selectedTransactionId,
  );
  const selectTransaction = usePaymentStore((state) => state.selectTransaction);
  const clearHistory = usePaymentStore((state) => state.clearHistory);
  const selectedTransaction = useMemo(
    () =>
      history.find((transaction) => transaction.id === selectedTransactionId),
    [history, selectedTransactionId],
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Transaction history
        </h2>
        {history.length > 0 ? (
          <button
            className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={clearHistory}
            title="Clear history"
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            <span className="sr-only">Clear history</span>
          </button>
        ) : (
          <span className="text-sm text-slate-500">{history.length}</span>
        )}
      </div>

      {history.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No transactions yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {history.map((transaction) => (
            <button
              className="rounded-md border border-slate-200 p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-600 hover:bg-cyan-50"
              key={transaction.id}
              onClick={() => selectTransaction(transaction.id)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {transaction.currency} {transaction.amount.toFixed(2)}
                </span>
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {transaction.status}
                </span>
              </span>
              <span className="mt-2 block text-xs text-slate-500">
                {getCardTypeLabel(transaction.cardType)} ending{" "}
                {transaction.cardNumberLast4} - Attempt {transaction.attempts}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedTransaction && (
        <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-950">Transaction details</h3>
          <dl className="mt-3 grid gap-2">
            <Detail label="ID" value={selectedTransaction.id} />
            <Detail label="Name" value={selectedTransaction.cardholderName} />
            <Detail label="Status" value={selectedTransaction.status} />
            <Detail label="Message" value={selectedTransaction.message} />
            <Detail
              label="Updated"
              value={new Date(selectedTransaction.updatedAt).toLocaleString()}
            />
          </dl>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[88px_1fr]">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="break-words text-slate-800">{value}</dd>
    </div>
  );
}
