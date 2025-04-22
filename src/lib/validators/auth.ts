import { z } from 'zod';

export const emailPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export type EmailPasswordSchema = z.infer<typeof emailPasswordSchema>; 