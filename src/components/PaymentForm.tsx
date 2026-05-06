"use client";

import type { ChangeEvent, FormEvent } from "react";
import type { FieldErrors, PaymentFormValues } from "@/types/payment";
import {
  detectCardType,
  formatCardNumber,
  getCardTypeLabel,
  getDigitsOnly,
  getSecurityCodeLength,
} from "@/utils/card";
import {
  formatExpiry,
  isPaymentFormValid,
  validateField,
  validatePaymentForm,
} from "@/utils/paymentValidation";

type InteractionState = Partial<Record<keyof PaymentFormValues, boolean>>;

interface PaymentFormProps {
  errors: FieldErrors;
  isProcessing: boolean;
  isValid: boolean;
  onErrorsChange: (errors: FieldErrors) => void;
  onSubmit: () => void;
  onValuesChange: (values: PaymentFormValues) => void;
  values: PaymentFormValues;
}

const fieldLabels: Record<keyof PaymentFormValues, string> = {
  amount: "Amount",
  cardNumber: "Card number",
  cardholderName: "Cardholder name",
  currency: "Currency",
  cvv: "CVV",
  expiry: "Expiry date",
};

export function PaymentForm({
  errors,
  isProcessing,
  isValid,
  onErrorsChange,
  onSubmit,
  onValuesChange,
  values,
}: PaymentFormProps) {
  const cardType = detectCardType(values.cardNumber);
  const cvvLength = getSecurityCodeLength(cardType);

  function updateField(
    field: keyof PaymentFormValues,
    value: PaymentFormValues[keyof PaymentFormValues],
    interactions: InteractionState = { [field]: true },
  ) {
    const nextValues = { ...values, [field]: value };
    const nextErrors = validateVisibleErrors(nextValues, interactions);

    onValuesChange(nextValues);
    onErrorsChange(nextErrors);
  }

  function validateVisibleErrors(
    nextValues: PaymentFormValues,
    interactions: InteractionState,
  ): FieldErrors {
    const allErrors = validatePaymentForm(nextValues);

    return Object.entries(allErrors).reduce<FieldErrors>(
      (visibleErrors, [field, error]) => {
        const key = field as keyof PaymentFormValues;
        const hasTyped = String(nextValues[key]).length > 0;

        if (interactions[key] || hasTyped) {
          return { ...visibleErrors, [key]: error };
        }

        return visibleErrors;
      },
      {},
    );
  }

  function handleBlur(field: keyof PaymentFormValues) {
    const error = validateField(field, values);

    onErrorsChange({
      ...errors,
      [field]: error,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePaymentForm(values);
    onErrorsChange(nextErrors);

    if (Object.keys(nextErrors).length === 0 && isPaymentFormValid(values)) {
      onSubmit();
    }
  }

  function getErrorId(field: keyof PaymentFormValues): string {
    return `${field}-error`;
  }

  function getInputClasses(field: keyof PaymentFormValues): string {
    const hasError = Boolean(errors[field]);

    return [
      "mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-950 outline-none transition",
      "focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100",
      hasError ? "border-red-400" : "border-slate-300",
    ].join(" ");
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <TextField
        autoComplete="cc-name"
        error={errors.cardholderName}
        errorId={getErrorId("cardholderName")}
        label={fieldLabels.cardholderName}
        name="cardholderName"
        onBlur={() => handleBlur("cardholderName")}
        onChange={(event) =>
          updateField("cardholderName", event.target.value)
        }
        value={values.cardholderName}
        inputClassName={getInputClasses("cardholderName")}
      />

      <TextField
        afterLabel={
          <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">
            {getCardTypeLabel(cardType)}
          </span>
        }
        autoComplete="cc-number"
        error={errors.cardNumber}
        errorId={getErrorId("cardNumber")}
        inputMode="numeric"
        label={fieldLabels.cardNumber}
        name="cardNumber"
        onBlur={() => handleBlur("cardNumber")}
        onChange={(event) =>
          updateField("cardNumber", formatCardNumber(event.target.value))
        }
        value={values.cardNumber}
        inputClassName={getInputClasses("cardNumber")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          autoComplete="cc-exp"
          error={errors.expiry}
          errorId={getErrorId("expiry")}
          inputMode="numeric"
          label={fieldLabels.expiry}
          name="expiry"
          onBlur={() => handleBlur("expiry")}
          onChange={(event) =>
            updateField("expiry", formatExpiry(event.target.value))
          }
          placeholder="MM/YY"
          value={values.expiry}
          inputClassName={getInputClasses("expiry")}
        />

        <TextField
          autoComplete="cc-csc"
          error={errors.cvv}
          errorId={getErrorId("cvv")}
          inputMode="numeric"
          label={fieldLabels.cvv}
          maxLength={cvvLength}
          name="cvv"
          onBlur={() => handleBlur("cvv")}
          onChange={(event) =>
            updateField(
              "cvv",
              getDigitsOnly(event.target.value).slice(0, cvvLength),
            )
          }
          value={values.cvv}
          inputClassName={getInputClasses("cvv")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <TextField
          error={errors.amount}
          errorId={getErrorId("amount")}
          inputMode="decimal"
          label={fieldLabels.amount}
          name="amount"
          onBlur={() => handleBlur("amount")}
          onChange={(event) => {
            const nextAmount = event.target.value;

            if (/^\d*\.?\d{0,2}$/.test(nextAmount)) {
              updateField("amount", nextAmount);
            }
          }}
          value={values.amount}
          inputClassName={getInputClasses("amount")}
        />

        <label className="block text-sm font-medium text-slate-800">
          {fieldLabels.currency}
          <select
            aria-describedby={
              errors.currency ? getErrorId("currency") : undefined
            }
            className={getInputClasses("currency")}
            name="currency"
            onBlur={() => handleBlur("currency")}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateField(
                "currency",
                event.target.value as PaymentFormValues["currency"],
              )
            }
            value={values.currency}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          <FieldError id={getErrorId("currency")} message={errors.currency} />
        </label>
      </div>

      <button
        className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white shadow-sm shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:translate-y-0"
        disabled={!isValid}
        type="submit"
      >
        {isProcessing && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {isProcessing ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

interface TextFieldProps {
  afterLabel?: React.ReactNode;
  autoComplete?: string;
  error?: string;
  errorId: string;
  inputClassName: string;
  inputMode?: "decimal" | "numeric" | "text";
  label: string;
  maxLength?: number;
  name: keyof PaymentFormValues;
  onBlur: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
}

function TextField({
  afterLabel,
  autoComplete,
  error,
  errorId,
  inputClassName,
  inputMode = "text",
  label,
  maxLength,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: TextFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {afterLabel}
      </span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={inputClassName}
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p className="mt-2 min-h-5 text-sm text-red-700" id={id}>
      {message}
    </p>
  );
}
