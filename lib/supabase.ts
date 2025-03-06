import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Отсутствуют Supabase URL или Supabase KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;