import crypto from 'crypto';
import { z } from 'zod';

// OPay integration constants
const OPAY_BASE_URL = process.env.OPAY_API_URL || 'https://api.opay.ng';
const OPAY_PUBLIC_KEY = process.env.OPAY_PUBLIC_KEY || '';
const OPAY_SECRET_KEY = process.env.OPAY_SECRET_KEY || '';
const OPAY_MERCHANT_ID = process.env.OPAY_MERCHANT_ID || '';

// Validation schema for OPay webhook payload
export const opayWebhookSchema = z.object({
  reference: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  transactionTime: z.string(),
  paymentMethod: z.string(),
  signature: z.string(),
  payerName: z.string().optional(),
  payerEmail: z.string().optional(),
  payerPhone: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type OpayWebhookPayload = z.infer<typeof opayWebhookSchema>;

/**
 * Generates OPay HMAC signature for verification
 * @param payload - The payload to sign
 * @param secretKey - Secret key for signing
 * @returns HMAC signature
 */
export function generateOPaySignature(
  payload: Record<string, any>, 
  secretKey: string = OPAY_SECRET_KEY
): string {
  // Remove signature from payload if present
  const { signature, ...payloadWithoutSignature } = payload;
  
  // Sort keys alphabetically
  const sortedPayload = Object.keys(payloadWithoutSignature)
    .sort()
    .reduce((acc, key) => {
      acc[key] = payloadWithoutSignature[key];
      return acc;
    }, {} as Record<string, any>);
  
  // Convert to string
  const payloadString = JSON.stringify(sortedPayload);
  
  // Generate HMAC-SHA512 signature
  return crypto
    .createHmac('sha512', secretKey)
    .update(payloadString)
    .digest('hex');
}

/**
 * Verifies OPay webhook signature
 * @param payload - Webhook payload including signature
 * @param secretKey - Secret key for verification
 * @returns Whether signature is valid
 */
export function verifyOpaySignature(
  payload: OpayWebhookPayload, 
  secretKey: string = OPAY_SECRET_KEY
): boolean {
  const { signature, ...payloadWithoutSignature } = payload;
  const calculatedSignature = generateOPaySignature(payloadWithoutSignature, secretKey);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

/**
 * Initialize a new OPay payment
 * @param amount - Payment amount
 * @param currency - Payment currency (default: NGN)
 * @param reference - Unique payment reference
 * @param callbackUrl - Webhook callback URL for payment notifications
 * @param metadata - Additional payment metadata
 * @returns Payment initialization response
 */
export async function initializeOpayPayment({
  amount,
  currency = 'NGN',
  reference,
  callbackUrl,
  metadata = {}
}: {
  amount: number;
  currency?: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}): Promise<any> {
  try {
    // Calculate expiration (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    const payload = {
      reference,
      amount: amount.toString(),
      currency,
      callbackUrl,
      expiresAt: expiresAt.toISOString(),
      metadata,
      merchantId: OPAY_MERCHANT_ID
    };
    
    // Generate signature
    const signature = generateOPaySignature(payload);
    
    // Make API call to OPay
    const response = await fetch(`${OPAY_BASE_URL}/v1/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPAY_PUBLIC_KEY}`,
        'Signature': signature
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OPay API error: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error initializing OPay payment:', error);
    throw error;
  }
}

/**
 * Verify an OPay payment status
 * @param reference - Payment reference to verify
 * @returns Payment verification response
 */
export async function verifyOpayPayment(reference: string): Promise<any> {
  try {
    const payload = {
      reference,
      merchantId: OPAY_MERCHANT_ID
    };
    
    // Generate signature
    const signature = generateOPaySignature(payload);
    
    // Make API call to OPay
    const response = await fetch(`${OPAY_BASE_URL}/v1/payments/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPAY_PUBLIC_KEY}`,
        'Signature': signature
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OPay API error: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying OPay payment:', error);
    throw error;
  }
}