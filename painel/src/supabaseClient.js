import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iqfwbkfhpjngokwwthfr.supabase.co";
const supabaseAnonKey = "sb_publishable_TcB_isEy54BfKu6LQHKTEw_g4QmO_nu";

//const supabaseUrl = "https://caweqdnkkcvbrmdglshe.supabase.co";
//const supabaseAnonKey = "sb_publishable_P41Lf1XM-Lxn1OQ5Ew5orw_Teywojh6";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);