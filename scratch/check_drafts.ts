
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDrafts() {
  const { data, error } = await supabase
    .from("Consultation")
    .select("id, psychiatrist_id, status, topic")
    .eq("status", "draft");

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Draft Consultations in DB:", data);

  const { data: profiles } = await supabase
    .from("PsychiatristProfile")
    .select("id, name");
  
  console.log("Psychiatrist Profiles:", profiles);
}

checkDrafts();
