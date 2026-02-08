import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('trialing'),
  z.literal('canceled'),
  z.literal('past_due'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  username: z.string().optional(),
  email: z.string(),
  phone: z.string(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  businessName: z.string(),
  subscriptionStatus: z.string(),
  planName: z.string(),
  planPrice: z.number().optional(),
  category: z.string(),
  createdAt: z.coerce.date(),
  // Subscription details
  subscriptionStart: z.string().nullable().optional(),
  subscriptionEnd: z.string().nullable().optional(),
  stripeCustomerId: z.string().nullable().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  // Usage stats
  totalCalls: z.number().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

