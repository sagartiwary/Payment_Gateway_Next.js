export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type Currency = "INR" | "USD";

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumberLast4: string;
  cardType: CardType;
  expiry: string;
  amount: number;
  currency: Currency;
  attempt: number;
}

export interface PaymentResult {
  transactionId: string;
  status: Exclude<PaymentStatus, "idle" | "processing">;
  message: string;
  processedAt: string;
}

export interface Transaction {
  id: string;
  cardholderName: string;
  cardNumberLast4: string;
  cardType: CardType;
  amount: number;
  currency: Currency;
  status: Exclude<PaymentStatus, "idle" | "processing">;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof PaymentFormValues, string>>;
