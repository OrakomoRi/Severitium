import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_PROJECT_ID || !process.env.SUPABASE_SECRET_KEY) {
	throw new Error('[DB] Missing SUPABASE_PROJECT_ID or SUPABASE_SECRET_KEY');
}

/**
 * Supabase client instance initialized with service role key.
 * Used exclusively server-side — never expose SECRET_KEY to the client.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(
	`https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
	process.env.SUPABASE_SECRET_KEY
);
