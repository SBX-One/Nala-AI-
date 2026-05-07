import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

// Mark messages as read — dipanggil saat lawan bicara melihat pesan
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { room_id, reader_id } = body;

  if (!room_id || !reader_id) {
    return NextResponse.json(
      { error: "room_id and reader_id are required" },
      { status: 400 }
    );
  }

  // Update semua pesan di room ini yang BUKAN milik reader menjadi is_read = true
  const { error } = await supabase
    .from("Message")
    .update({ is_read: true })
    .eq("room_id", Number(room_id))
    .neq("sender_id", Number(reader_id))
    .eq("is_read", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
