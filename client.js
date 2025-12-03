import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://chabjnxnlwvjmtekyjeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYWJqbnhubHd2am10ZWt5amVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDIyMTgsImV4cCI6MjA3OTE3ODIxOH0.GBP0ayvsbxRJ7GN2gtjX7UIuPAYDE8FeFl-ULoqyt6c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
