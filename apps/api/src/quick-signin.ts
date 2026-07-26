import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://opyqxytnfrbzyhsnbwfm.supabase.co",
  "sb_publishable_E5_BYaLN3uXo2ucIADa0Og_P665pF_F"
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "mahinkatariya31@gmail.com",
  password: "Mahinmahin@123"
});

if (error) console.error(error);
else console.log(data.session?.access_token);
