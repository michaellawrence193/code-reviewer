/**
 * supabase.ts
 * Initializes the Supabase client used throughout the app.
 * The URL and anon key are public-safe — Supabase uses Row Level Security
 * policies to ensure users can only access their own data.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pidpoxrnocxoqkqxbvne.supabase.co'
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZHBveHJub2N4b3FrcXhidm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDg0MTAsImV4cCI6MjA5NTMyNDQxMH0.PUAW3VGNsUfGfeh9i93gk4BQ75vLukuCqFZ43zbEjEA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript type matching our reviews table schema
export type Review = {
  id: string
  user_id: string
  created_at: string
  language: string
  code: string
  review: string
  source: 'manual' | 'github'
  filename: string | null
}