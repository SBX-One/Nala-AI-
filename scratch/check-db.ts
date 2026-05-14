import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function main() {
  const { data: users, error } = await supabase
    .from("User")
    .select("*, UserProfile(*), PsychiatristProfile(*)");

  if (error) {
    console.error(error);
    return;
  }

  console.log(JSON.stringify(users, null, 2));
}

main();
