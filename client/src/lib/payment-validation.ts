
import { z } from "zod";

export const cardTypes = {
  visa: /^4/,
  mastercard: /^5[1-5]/,
  verve: /^506[0-1]/
};

export const validateCard = (number: string): string | null => {
  // Remove spaces and non-digits
  const cleaned = number.replace(/\D/g, '');
  
  // Check card type
  for (const [type, pattern] of Object.entries(cardTypes)) {
    if (pattern.test(cleaned)) {
      return type;
    }
  }
  
  return null;
};

export const luhnCheck = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const formatCardNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
};

export const validateExpiryDate = (month: string, year: string): boolean => {
  const currentDate = new Date();
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  return expiry > currentDate;
};

// Payment form schema with validation
export const cardPaymentSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number too long")
    .refine(num => luhnCheck(num), "Invalid card number"),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().length(2),
  cvv: z.string().min(3).max(4),
  cardholderName: z.string().min(2, "Please enter cardholder name"),
});

export type CardPaymentFormData = z.infer<typeof cardPaymentSchema>;
