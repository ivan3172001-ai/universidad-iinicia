import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://pzlbxavsagibkbbqtlgd.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_JntNFNWjUVcNTnpKgCfzSA_LmyeYGn9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
