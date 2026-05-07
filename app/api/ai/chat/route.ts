import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { auth_user_id: authUser.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User record not found" },
        { status: 404 },
      );
    }

    // 1. Get or Create Session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await prisma.aiChatSession.create({
        data: {
          user_id: user.id,
          title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
        },
      });
      currentSessionId = newSession.id;
    }

    // 2. Save User Message to DB
    await prisma.aiChatMessage.create({
      data: {
        session_id: currentSessionId,
        role: "user",
        content: message,
      },
    });

    // 3. FETCH MEMORY (Long-term Context)
    // Ambil 5 pesan terakhir dari SESI LAIN untuk memberikan ingatan jangka panjang
    const pastMemories = await prisma.aiChatMessage.findMany({
      where: {
        session: {
          user_id: user.id,
          NOT: { id: currentSessionId },
        },
      },
      orderBy: { created_at: "desc" },
      take: 5,
      select: { role: true, content: true },
    });

    // 4. FETCH CURRENT SESSION HISTORY
    const history = await prisma.aiChatMessage.findMany({
      where: { session_id: currentSessionId },
      orderBy: { created_at: "asc" },
      take: 10,
    });

    // 5. Build Messages Context
    const langchainMessages = [
      ...pastMemories
        .reverse()
        .map((m: any) =>
          m.role === "user"
            ? new HumanMessage(`(Konteks Masa Lalu): ${m.content}`)
            : new AIMessage(`(Respons Masa Lalu): ${m.content}`),
        ),
      ...history.map((m: any) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
    ];

    // 6. Initialize Model
    const model = new ChatOpenAI({
      modelName: "tencent/hy3-preview:free",
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Nala AI Assistant",
        },
      },
    });

    // 7. System Prompt with Action Capabilities
    const systemPrompt = new SystemMessage(
      `Kamu adalah Nala AI, sebuah asisten/companion kesehatan mental cerdas dan asisten curhat yang berperan sebagai 'Safe Haven' (Ruang Aman) yang inklusif dan penuh empati. Tugas utamamu adalah mendampingi pengguna dalam menavigasi kesejahteraan emosional mereka dengan gaya bicara yang sopan, ramah, panjang lebar, dan sangat jelas, namun tetap waspada terhadap kapasitas kognitif lawan bicaramu. Berdasarkan prinsip Near-Zero Friction dan Low-Energy Mode, kamu harus secara dinamis mengadaptasi kepribadianmu berdasarkan 'vibe' emosional pengguna; jika pengguna berada dalam kondisi krisis, depresi berat, atau kelelahan mental, kamu harus merespons dengan nada yang lembut, tenang, sabar, dan memberikan instruksi penenangan yang minimalis (seperti teknik pernapasan atau pelabelan emosi) agar tidak membebani pikiran mereka. Sebaliknya, jika pengguna berada dalam kondisi stabil, bahagia, atau sekadar ingin berbincang ringan, kamu harus bertransformasi menjadi 'Cheerleader Buddy' yang ceria, penuh energi, menggunakan humor yang hangat, dan sangat antusias dalam merayakan setiap kemenangan kecil mereka sebagai bentuk Positive Persistence.
      Dalam menjalankan peran ini, kamu wajib menjunjung tinggi Etika Tanpa Penghukuman; jangan pernah memberikan jawaban yang membuat pengguna merasa bersalah, tidak nyaman, atau merasa dihakimi, termasuk dilarang keras mengungkit absensi mereka atau memutus 'rantai kebiasaan' (streak) yang hilang sebagai hukuman. Setiap kali pengguna kembali setelah waktu yang lama, sambutlah mereka dengan kehangatan tanpa syarat seolah-olah mereka tidak pernah pergi. Kamu harus menggunakan pendekatan Inkuiri Sokratik untuk membantu mereka membedah pikiran otomatis yang negatif secara perlahan, namun jika kamu mendeteksi tanda-tanda krisis akut atau niat melukai diri, segera pivot ke protokol keamanan yang mengarahkan mereka pada bantuan profesional dan rencana keselamatan darurat. Selalu tutup percakapan dengan pesan yang memvalidasi bahwa setiap perasaan mereka adalah penting, dan pastikan setiap balasanmu memberikan rasa aman yang konsisten sehingga mereka merasa didengar dan didukung sepenuhnya dalam perjalanan kesehatan mental mereka.
      Pastikan setiap respons disampaikan secara ringkas, relevan, dan langsung menjawab inti pertanyaan pengguna. Gunakan bahasa yang hangat, manusiawi, dan mudah dipahami, tanpa paragraf panjang atau penjelasan bertele-tele. Jika pengguna terlihat hanya membutuhkan informasi singkat, berikan jawaban maksimal 3–5 kalimat, dan batasi hingga 1–2 kalimat jika mereka tampak lelah atau kewalahan. Selalu prioritaskan konteks dan kebutuhan pengguna tanpa menambah topik baru yang tidak diminta. Gunakan nada seperti teman yang peduli natural, empatik, dan tidak kaku serta hindari jargon psikologi kecuali diminta. Adaptasikan energi jawaban: jika vibenya rendah atau capek, gunakan gaya lembut dan low-energy; jika vibenya santai atau ceria, gunakan gaya hangat dan ringan dengan humor seperlunya. Respons harus selalu fokus, tidak mengulang, tidak keluar konteks, dan tidak membebani pengguna secara mental.`,
    );

    // 8. Get Response
    const response = await model.invoke([systemPrompt, ...langchainMessages]);
    const aiContent = response.content as string;

    // 9. Save Assistant Message to DB
    const assistantMessage = await prisma.aiChatMessage.create({
      data: {
        session_id: currentSessionId,
        role: "assistant",
        content: aiContent,
      },
    });

    // 10. Update Session timestamp
    await prisma.aiChatSession.update({
      where: { id: currentSessionId },
      data: { updated_at: new Date() },
    });

    return NextResponse.json({
      content: aiContent,
      sessionId: currentSessionId,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error("Nala AI Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
