import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_PROJECT_ID || !process.env.SUPABASE_SECRET_KEY) {
	throw new Error('[DB] Missing SUPABASE_PROJECT_ID or SUPABASE_SECRET_KEY');
}

export const supabase = createClient(
	`https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
	process.env.SUPABASE_SECRET_KEY
);
