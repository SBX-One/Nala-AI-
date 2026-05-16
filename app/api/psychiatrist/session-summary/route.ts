import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { consultationNotes, diagnose } = await req.json();

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const systemPrompt = new SystemMessage(
      `Anda adalah asisten AI klinis senior untuk psikiater. Tugas Anda adalah menghasilkan "Ringkasan Sesi AI" yang komprehensif dan memberikan wawasan klinis dengan mensintesis catatan sesi psikiater dan diagnosis akhir.

      Selalu gunakan format Markdown untuk tanggapan Anda:
      1. Gunakan **Bold Headers** untuk bagian utama seperti **Sintesis Klinis** dan **Wawasan Sesi**.
      2. Gunakan poin-poin untuk observasi atau temuan spesifik.
      3. Gunakan teks tebal untuk istilah klinis utama atau temuan penting.
      
      Fokus pada:
      - Memberikan narasi klinis yang kohesif tentang sesi berdasarkan catatan tersebut.
      - Menawarkan wawasan klinis dan pola yang diidentifikasi dari dokumentasi psikiater.
      - Menyoroti poin-poin penting untuk sesi berikutnya.
      
      Jaga nada tetap profesional, sangat klinis, dan ringkas (maks 200-250 kata). Tanggapi dalam bahasa Indonesia.`,
    );

    const userPrompt = new HumanMessage(
      `PSYCHIATRIST SESSION NOTES:
      ${consultationNotes}

      FINAL DIAGNOSIS:
      ${diagnose}`,
    );

    const response = await model.invoke([systemPrompt, userPrompt]);
    const summary = response.content as string;

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Session AI Summary Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
