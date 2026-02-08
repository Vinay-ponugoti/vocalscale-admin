export interface Profile {
  id: string
  user_id: string
  full_name: string
  business_type: string
  contact_phone: string
  avatar_url: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  user_id: string
  business_name: string
  category: string
  email: string
  phone: string
  website: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  timezone: string
  place_id: string
  rating: number | null
  user_ratings_total: number | null
  subscription_status: string
  stripe_customer_id: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Call {
  id: string
  user_id: string
  caller_name: string
  caller_phone: string
  phone_number: string
  duration_seconds: number
  transcript: string
  summary: string
  sentiment: string
  category: string
  status: string
  is_urgent: boolean
  recording_url: string | null
  lead_score: number | null
  tags: string[]
  notes: string
  follow_up_required: boolean
  handled_by: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  user_id: string
  scheduled_time: string
  customer_name: string
  service_name: string
  status: string
  created_at: string
}

export interface Review {
  id: string
  business_id: string
  reviewer_name: string
  rating: number
  review_text: string
  source: string
  source_id: string
  sentiment: string
  review_date: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  stripe_price_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
  plans?: Plan
}

export interface Plan {
  id: string
  name: string
  stripe_price_id: string
  price_amount: number
  interval: string
  description: string
  features: string[]
  limits: {
    ai_minutes?: number
    phone_numbers?: number
  }
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  stripe_invoice_id: string
  currency: string
  amount_paid: number
  amount_due: number
  status: string
  hosted_invoice_url: string
  invoice_pdf: string
  created_at: string
}

export interface CallUsageDetail {
  id: string
  user_id: string
  duration_seconds: number
  total_cost_cents: number
  billing_status: string
  started_at: string
}
