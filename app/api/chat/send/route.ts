import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { room_id, sender_id, message, file_url, file_type, file_size } = body;

  if (!room_id || !sender_id) {
    return NextResponse.json(
      { error: "room_id and sender_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("Message")
    .insert({
      room_id: Number(room_id),
      sender_id: Number(sender_id),
      message: message || null,
      file_url: file_url || null,
      file_type: file_type || null,
      file_size: file_size ? Number(file_size) : null,
      is_read: false,
      is_edit: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
