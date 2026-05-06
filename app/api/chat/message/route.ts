import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

// Update isi pesan
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { message_id, sender_id, new_message } = body;

  if (!message_id || !sender_id) {
    return NextResponse.json(
      { error: "message_id and sender_id are required" },
      { status: 400 }
    );
  }

  // Hanya sender yang bisa mengedit pesannya sendiri
  const { data, error } = await supabase
    .from("Message")
    .update({ message: new_message, is_edit: true })
    .eq("id", Number(message_id))
    .eq("sender_id", Number(sender_id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Delete pesan
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const messageId = searchParams.get("id");
  const senderId = searchParams.get("senderId");

  if (!messageId || !senderId) {
    return NextResponse.json(
      { error: "id and senderId are required" },
      { status: 400 }
    );
  }

  // Hanya sender yang bisa menghapus pesannya sendiri
  const { error } = await supabase
    .from("Message")
    .delete()
    .eq("id", Number(messageId))
    .eq("sender_id", Number(senderId));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deletedId: Number(messageId) });
}
