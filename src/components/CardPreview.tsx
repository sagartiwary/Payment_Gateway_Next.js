"use client";

import { CreditCard } from "lucide-react";
import type { PaymentFormValues } from "@/types/payment";
import { detectCardType, formatCardNumber, getCardTypeLabel } from "@/utils/card";

interface CardPreviewProps {
  values: PaymentFormValues;
}

export function CardPreview({ values }: CardPreviewProps) {
  const cardType = detectCardType(values.cardNumber);
  const number = values.cardNumber || "0000 0000 0000 0000";
  const name = values.cardholderName.trim() || "Cardholder Name";
  const expiry = values.expiry || "MM/YY";

  return (
    <section aria-label="Card preview" className="flex flex-col gap-4">
      <div className="relative aspect-[1.586/1] w-full max-w-md overflow-hidden rounded-lg bg-[linear-gradient(135deg,#0f172a_0%,#164e63_48%,#111827_100%)] p-6 text-white shadow-2xl shadow-slate-300 transition duration-300 hover:-translate-y-1">
        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
        <div className="absolute -right-20 top-10 h-48 w-48 rotate-12 bg-white/5" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <CreditCard aria-hidden="true" className="size-8 text-cyan-100" />
            <p className="mt-2 text-sm text-slate-300">
              {getCardTypeLabel(cardType)}
            </p>
          </div>
          <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {values.currency}
          </span>
        </div>

        <div className="mt-10 font-mono text-xl tracking-normal sm:text-2xl">
          {formatCardNumber(number)}
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto] gap-4 text-sm">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
            <p className="mt-1 truncate font-medium">{name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Expires
            </p>
            <p className="mt-1 font-medium">{expiry}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
