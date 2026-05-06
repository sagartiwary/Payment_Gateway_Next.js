import type { CardType } from "@/types/payment";

const CARD_NUMBER_MAX_LENGTH = 16;
const AMEX_NUMBER_MAX_LENGTH = 15;

export function getDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function detectCardType(cardNumber: string): CardType {
  const digits = getDigitsOnly(cardNumber);

  if (/^3[47]/.test(digits)) {
    return "amex";
  }

  if (/^4/.test(digits)) {
    return "visa";
  }

  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return "mastercard";
  }

  return "unknown";
}

export function getCardNumberMaxLength(cardType: CardType): number {
  return cardType === "amex" ? AMEX_NUMBER_MAX_LENGTH : CARD_NUMBER_MAX_LENGTH;
}

export function formatCardNumber(value: string): string {
  const digits = getDigitsOnly(value);
  const cardType = detectCardType(digits);
  const maxLength = getCardNumberMaxLength(cardType);
  const trimmed = digits.slice(0, maxLength);
  const groupPattern = cardType === "amex" ? [4, 6, 5] : [4, 4, 4, 4];

  const groups: string[] = [];
  let cursor = 0;

  for (const groupLength of groupPattern) {
    const group = trimmed.slice(cursor, cursor + groupLength);

    if (group.length > 0) {
      groups.push(group);
    }

    cursor += groupLength;
  }

  return groups.join(" ");
}

export function maskCardNumber(value: string): string {
  const digits = getDigitsOnly(value);
  const visibleDigits = digits.slice(-4);
  const maskedLength = Math.max(digits.length - visibleDigits.length, 0);
  const masked = `${"*".repeat(maskedLength)}${visibleDigits}`;

  return formatCardNumber(masked);
}

export function getCardLast4(value: string): string {
  return getDigitsOnly(value).slice(-4);
}

export function passesLuhnCheck(value: string): boolean {
  const digits = getDigitsOnly(value);
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return digits.length > 0 && sum % 10 === 0;
}

export function getSecurityCodeLength(cardType: CardType): number {
  return cardType === "amex" ? 4 : 3;
}

export function getCardTypeLabel(cardType: CardType): string {
  const labels: Record<CardType, string> = {
    amex: "Amex",
    mastercard: "Mastercard",
    unknown: "Card",
    visa: "Visa",
  };

  return labels[cardType];
}
