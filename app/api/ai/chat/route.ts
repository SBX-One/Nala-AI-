import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
            ? new HumanMessage(m.content)
            : new AIMessage(m.content),
        ),
      ...history.map((m: any) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
    ];

    // NEW: Fetch Context for AI (Articles & Psychiatrists)
    const [availableArticles, availablePsychiatrists] = await Promise.all([
      prisma.article.findMany({
        where: { status: "published" },
        take: 3,
        select: { id: true, title: true, overview: true },
      }),
      prisma.psychiatristProfile.findMany({
        take: 3,
        select: { id: true, name: true, specialization: true },
      }),
    ]);

    const contextInfo = `
Daftar Artikel Tersedia (Berikan link /user/article/[id] jika relevan):
${availableArticles.map((a) => `- ID: ${a.id}, Judul: ${a.title}`).join("\n")}

Daftar Psikiater Tersedia:
${availablePsychiatrists.map((p) => `- ${p.name} (${p.specialization})`).join("\n")}
    `;

    // 6. Initialize Model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // 7. System Prompt with Action Capabilities
    const systemPrompt = new SystemMessage(
      `Kamu adalah Nala AI, asisten kesehatan mental cerdas. 
      
      KONTEKS SISTEM:
      ${contextInfo}

      PROTOKOL KRISIS & TINDAKAN:
      1. Jika pengguna menunjukkan tanda-tanda ingin menyakiti diri sendiri, putus asa yang ekstrem, atau niat bunuh diri (contoh: "aku ingin mati", "lelah hidup"):
         - Berikan empati yang dalam dan tawarkan dukungan emosional segera.
         - Kamu WAJIB menyertakan penanda tepat di akhir jawabanmu: [ACTION: BOOK_PSYCHIATRIST]
         - Katakan bahwa berbicara dengan profesional dapat membantu dan arahkan mereka untuk melakukan booking.

      2. Jika pengguna ingin membaca lebih lanjut atau mencari informasi tentang topik tertentu:
         - Cari artikel yang relevan dari daftar di atas.
         - Berikan judulnya dan gunakan penanda: [ARTICLE: ID_ARTIKEL]
         - Contoh: "Kamu bisa baca artikel 'Cara Mengatasi Stress' di sini: [ARTICLE: 1]"

      GAYA BICARA:
      Tetap sopan, ramah, dan empatik. Gunakan bahasa yang hangat namun profesional. Fokus pada Near-Zero Friction (jangan membebani pengguna).

      PENTING: 
      1. Kamu dilarang keras memberikan saran medis atau diagnosis. Kamu adalah pendamping, bukan pengganti profesional.
      2. Jangan pernah melakukan tugas di luar konteks kesehatan mental, seperti:
         - Menciptakan/menghasilkan gambar (kamu hanya berbasis teks).
         - Menulis atau menjelaskan kode pemrograman.
         - Mengirim atau meminta data privasi sensitif (password, alamat detail, dll).
      3. Jika pengguna meminta hal di luar tugasmu, tolaklah dengan sopan dan kembalikan fokus pada kesejahteraan emosional mereka.`,
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

    // 10. Update Session timestamp and potentially title
    if (sessionId === null || !sessionId) {
      // Generate a title using AI for new sessions
      const titlePrompt = new SystemMessage(
        "Buatlah judul yang sangat singkat (maksimal 5 kata) dan deskriptif untuk percakapan ini berdasarkan pesan pertama pengguna. Jangan gunakan tanda kutip.",
      );
      const titleResponse = await model.invoke([
        titlePrompt,
        new HumanMessage(message),
      ]);
      const generatedTitle = (titleResponse.content as string).trim();

      await prisma.aiChatSession.update({
        where: { id: currentSessionId },
        data: {
          updated_at: new Date(),
          title: generatedTitle,
        },
      });
    } else {
      await prisma.aiChatSession.update({
        where: { id: currentSessionId },
        data: { updated_at: new Date() },
      });
    }

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
