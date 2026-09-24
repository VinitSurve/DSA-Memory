import { supabase } from './src/services/supabase.js';
supabase.from('memories').select('*').then(console.log);
