import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars'),
  referralCode: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars'),
});

export const PurchaseSchema = z.object({
  amount: z.number().min(1, 'Min 1'),
});


