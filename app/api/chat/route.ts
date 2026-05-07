import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const roomId = request.nextUrl.searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  // 1. Ambil info MeetingRoom
  const { data: room, error: roomError } = await supabase
    .from("MeetingRoom")
    .select("id, user_id, psychiatrist_id, status, duration")
    .eq("id", Number(roomId))
    .single();

  if (roomError || !room) {
    return NextResponse.json(
      { error: roomError?.message || "Room not found" },
      { status: 404 }
    );
  }

  // 2. Ambil semua messages dalam room ini
  const { data: messages, error: messagesError } = await supabase
    .from("Message")
    .select("*")
    .eq("room_id", Number(roomId))
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json(
      { error: messagesError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    room,
    messages: messages || [],
  });
}
