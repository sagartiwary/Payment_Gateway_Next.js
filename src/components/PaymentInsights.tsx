"use client";

import {
  BadgeCheck,
  CircleAlert,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { CardType, PaymentFormValues } from "@/types/payment";
import {
  detectCardType,
  getCardNumberMaxLength,
  getDigitsOnly,
  getSecurityCodeLength,
  passesLuhnCheck,
} from "@/utils/card";
import { isExpiryInFuture } from "@/utils/paymentValidation";

interface PaymentInsightsProps {
  disabled: boolean;
  onUseSample: (cardType: Exclude<CardType, "unknown">) => void;
  values: PaymentFormValues;
}

const sampleCards: Array<{
  cardType: Exclude<CardType, "unknown">;
  label: string;
  number: string;
}> = [
  {
    cardType: "visa",
    label: "Visa",
    number: "4242 4242 4242 4242",
  },
  {
    cardType: "mastercard",
    label: "Mastercard",
    number: "5555 5555 5555 4444",
  },
  {
    cardType: "amex",
    label: "Amex",
    number: "3782 822463 10005",
  },
];

export function PaymentInsights({
  disabled,
  onUseSample,
  values,
}: PaymentInsightsProps) {
  const cardType = detectCardType(values.cardNumber);
  const cardDigits = getDigitsOnly(values.cardNumber);
  const amount = Number(values.amount);
  const checks = [
    {
      isReady:
        cardType !== "unknown" &&
        cardDigits.length === getCardNumberMaxLength(cardType) &&
        passesLuhnCheck(cardDigits),
      label: "Supported card with valid checksum",
    },
    {
      isReady: isExpiryInFuture(values.expiry),
      label: "Future expiry date",
    },
    {
      isReady:
        getDigitsOnly(values.cvv).length === getSecurityCodeLength(cardType),
      label: "Security code matches card type",
    },
    {
      isReady: Number.isFinite(amount) && amount > 0,
      label: "Charge amount is ready",
    },
  ];
  const readyCount = checks.filter((check) => check.isReady).length;

  return (
    <section className="rounded-lg border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-cyan-800">
          <Sparkles aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Checkout intelligence
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Use demo cards to quickly test success, failure, retry, and timeout
            paths without typing everything manually.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {sampleCards.map((card) => (
          <button
            className="group rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-500 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={disabled}
            key={card.cardType}
            onClick={() => onUseSample(card.cardType)}
            type="button"
          >
            <CreditCard
              aria-hidden="true"
              className="size-4 text-slate-500 group-hover:text-cyan-700"
            />
            <span className="mt-2 block text-sm font-semibold text-slate-900">
              {card.label}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              {card.number.slice(-4)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">
            Readiness score
          </p>
          <p className="text-sm text-slate-500">{readyCount} / {checks.length}</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-cyan-600 transition-all duration-500"
            style={{ width: `${(readyCount / checks.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-4 grid gap-2">
        {checks.map((check) => {
          const Icon = check.isReady ? BadgeCheck : CircleAlert;

          return (
            <li
              className="flex items-center gap-2 text-sm text-slate-700"
              key={check.label}
            >
              <Icon
                aria-hidden="true"
                className={
                  check.isReady
                    ? "size-4 text-emerald-600"
                    : "size-4 text-slate-400"
                }
              />
              {check.label}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-start gap-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 text-cyan-700" />
        <p>
          History stores only transaction metadata and the last four card
          digits, keeping the mock flow closer to real payment UX expectations.
        </p>
      </div>
    </section>
  );
}
