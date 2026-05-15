import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { consultationNotes, diagnose } = await req.json();

    const model = new ChatOpenAI({
      modelName: "openai/gpt-oss-120b:free",
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Nala Psychiatrist Session Assistant",
        },
      },
    });

    const systemPrompt = new SystemMessage(
      `You are a senior clinical AI assistant for a psychiatrist. Your task is to generate a comprehensive "Session AI Summary" and provide clinical insights by synthesizing the psychiatrist's session notes and the final diagnosis.

      Always use Markdown formatting for your response:
      1. Use **Bold Headers** for main sections like **Clinical Synthesis** and **Session Insights**.
      2. Use bullet points for specific observations or findings.
      3. Use bold text for key clinical terms or important findings.
      
      Focus on:
      - Providing a cohesive clinical narrative of the session based on the notes.
      - Offering clinical insights and patterns identified from the psychiatrist's documentation.
      - Highlighting key takeaways for the next session.
      
      Keep the tone professional, highly clinical, and concise (max 200-250 words). Respond in English.`,
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
