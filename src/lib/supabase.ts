import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { SupabaseClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  "https://xegtxhofasgyhsobwelg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZ3R4aG9mYXNneWhzb2J3ZWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1NjQwMTQsImV4cCI6MjAxMzE0MDAxNH0.gGPti5VCUnCmkZbbX5AV1qPLHEEUpdzQwBq8xHVlEA4"
);
