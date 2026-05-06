import type { FieldErrors, PaymentFormValues } from "@/types/payment";
import {
  detectCardType,
  getCardNumberMaxLength,
  getDigitsOnly,
  getSecurityCodeLength,
  passesLuhnCheck,
} from "@/utils/card";

const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

export function formatExpiry(value: string): string {
  const digits = getDigitsOnly(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isExpiryInFuture(expiry: string, now = new Date()): boolean {
  if (!EXPIRY_PATTERN.test(expiry)) {
    return false;
  }

  const [monthValue, yearValue] = expiry.split("/");
  const month = Number(monthValue);
  const year = 2000 + Number(yearValue);
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);

  return expiryDate >= now;
}

export function validateField(
  field: keyof PaymentFormValues,
  values: PaymentFormValues,
): string | undefined {
  const cardType = detectCardType(values.cardNumber);
  const cardDigits = getDigitsOnly(values.cardNumber);
  const cvvDigits = getDigitsOnly(values.cvv);
  const requiredCvvLength = getSecurityCodeLength(cardType);

  if (field === "cardholderName") {
    if (values.cardholderName.trim().length < 2) {
      return "Enter the cardholder name.";
    }

    if (!/^[a-zA-Z\s.'-]+$/.test(values.cardholderName.trim())) {
      return "Use letters and common name punctuation only.";
    }
  }

  if (field === "cardNumber") {
    const expectedLength = getCardNumberMaxLength(cardType);

    if (cardDigits.length === 0) {
      return "Enter the card number.";
    }

    if (cardType === "unknown" && cardDigits.length >= 2) {
      return "Use a supported Visa, Mastercard, or Amex card.";
    }

    if (cardDigits.length !== expectedLength) {
      return `Card number must be ${expectedLength} digits.`;
    }

    if (!passesLuhnCheck(cardDigits)) {
      return "Enter a valid card number.";
    }
  }

  if (field === "expiry") {
    if (!EXPIRY_PATTERN.test(values.expiry)) {
      return "Use MM/YY format.";
    }

    if (!isExpiryInFuture(values.expiry)) {
      return "Expiry date must be in the future.";
    }
  }

  if (field === "cvv") {
    if (cvvDigits.length !== requiredCvvLength) {
      return `CVV must be ${requiredCvvLength} digits.`;
    }
  }

  if (field === "amount") {
    const amount = Number(values.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return "Enter an amount greater than zero.";
    }

    if (amount > 999999) {
      return "Amount must be below 1,000,000.";
    }
  }

  if (field === "currency" && !["INR", "USD"].includes(values.currency)) {
    return "Choose a supported currency.";
  }

  return undefined;
}

export function validatePaymentForm(values: PaymentFormValues): FieldErrors {
  const fields: Array<keyof PaymentFormValues> = [
    "cardholderName",
    "cardNumber",
    "expiry",
    "cvv",
    "amount",
    "currency",
  ];

  return fields.reduce<FieldErrors>((errors, field) => {
    const error = validateField(field, values);

    if (error) {
      return { ...errors, [field]: error };
    }

    return errors;
  }, {});
}

export function isPaymentFormValid(values: PaymentFormValues): boolean {
  return Object.keys(validatePaymentForm(values)).length === 0;
}
