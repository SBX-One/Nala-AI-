import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Expertise")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase error fetching expertises:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("Expertises fetched from Supabase:", data);

  // Jika data null, kembalikan array kosong agar frontend tidak error .map
  return NextResponse.json(data || []);
}
