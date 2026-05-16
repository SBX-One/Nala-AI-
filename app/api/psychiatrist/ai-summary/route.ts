import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { complaint, medicationHistory } = await req.json();

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint is required" },
        { status: 400 },
      );
    }

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const medsList =
      medicationHistory
        ?.map(
          (m: any) =>
            `- ${m.name} (Dose: ${m.dose || "N/A"}, Notes: ${m.notes || "N/A"})`,
        )
        .join("\n") || "None";

    const systemPrompt = new SystemMessage(
      `Anda adalah asisten AI klinis untuk psikiater. Tugas Anda adalah menganalisis keluhan pasien saat ini dan riwayat pengobatan mereka untuk memberikan ringkasan klinis yang singkat dan berwawasan. 
      
      Selalu gunakan format Markdown untuk tanggapan Anda:
      1. Gunakan **Bold Headers** untuk bagian utama seperti **Ringkasan Klinis** dan **Observasi untuk Psikiater**.
      2. Gunakan poin-poin untuk observasi atau rekomendasi spesifik.
      3. Gunakan teks tebal untuk istilah klinis utama atau temuan penting.
      
      Fokus pada:
      - Potensi korelasi antara gejala saat ini dan pengobatan masa lalu.
      - Pola efektivitas pengobatan atau efek samping.
      - Observasi klinis singkat untuk membantu psikiater selama sesi.
      
      Jaga nada tetap profesional, objektif, dan ringkas (maks 150 kata). Tanggapi dalam bahasa Indonesia.`,
    );

    const userPrompt = new HumanMessage(
      `PATIENT COMPLAINT:
      ${complaint}

      MEDICATION HISTORY:
      ${medsList}`,
    );

    const response = await model.invoke([systemPrompt, userPrompt]);
    const summary = response.content as string;

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Clinical AI Summary Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
