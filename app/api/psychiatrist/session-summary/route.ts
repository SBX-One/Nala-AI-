import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { 
      initialAiSummary, 
      consultationNotes, 
      consultationContext, 
      observationNotes, 
      psychiatristFeedback, 
      diagnose, 
      medicines 
    } = await req.json();

    const model = new ChatOpenAI({
      modelName: "google/gemini-2.0-flash-lite-preview-02-05:free",
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Nala Psychiatrist Session Assistant",
        },
      },
    });

    const medsList = medicines?.map((m: any) => 
      `- ${m.name || m.medicine?.name} (Dose: ${m.dose || "N/A"}, Use: ${m.use || "N/A"}, Notes: ${m.notes || "N/A"})`
    ).join("\n") || "None";

    const systemPrompt = new SystemMessage(
      `You are a senior clinical AI assistant for a psychiatrist. Your task is to generate a comprehensive "Session AI Summary" by synthesizing the initial AI summary, the psychiatrist's session notes, clinical context, observations, and prescribed medications.

      Always use Markdown formatting for your response:
      1. Use **Bold Headers** for main sections like **Diagnostic Overview**, **Clinical Synthesis**, and **Plan & Recommendations**.
      2. Use bullet points for specific observations or findings.
      3. Use bold text for key clinical terms or important findings.
      
      Focus on:
      - Integrating the initial concerns with the psychiatrist's live observations.
      - Providing a cohesive clinical narrative of the session.
      - Highlighting the rationale behind the chosen diagnosis and medications.
      - Offering actionable next steps for the psychiatrist to consider.
      
      Keep the tone professional, highly clinical, and concise (max 200-250 words). Respond in English.`
    );

    const userPrompt = new HumanMessage(
      `INITIAL PATIENT SUMMARY:
      ${initialAiSummary}

      PSYCHIATRIST SESSION NOTES:
      ${consultationNotes}

      CONSULTATION CONTEXT:
      ${consultationContext}

      OBSERVATION NOTES:
      ${observationNotes}

      PSYCHIATRIST FEEDBACK:
      ${psychiatristFeedback}

      FINAL DIAGNOSIS:
      ${diagnose}

      PRESCRIBED MEDICINES:
      ${medsList}`
    );

    const response = await model.invoke([systemPrompt, userPrompt]);
    const summary = response.content as string;

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Session AI Summary Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
