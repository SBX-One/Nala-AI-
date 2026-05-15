import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
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

    const model = new ChatOpenAI({
      modelName: "openai/gpt-oss-120b:free",
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Nala Psychiatrist Assistant",
        },
      },
    });

    const medsList =
      medicationHistory
        ?.map(
          (m: any) =>
            `- ${m.name} (Dose: ${m.dose || "N/A"}, Notes: ${m.notes || "N/A"})`,
        )
        .join("\n") || "None";

    const systemPrompt = new SystemMessage(
      `You are a clinical AI assistant for a psychiatrist. Your task is to analyze the patient's current complaint and their medication history to provide a concise, insightful clinical summary. 
      
      Always use Markdown formatting for your response:
      1. Use **Bold Headers** for main sections like **Clinical Summary** and **Observations for the Psychiatrist**.
      2. Use bullet points for specific observations or recommendations.
      3. Use bold text for key clinical terms or important findings.
      
      Focus on:
      - Potential correlations between current symptoms and past treatments.
      - Patterns of medication effectiveness or side effects.
      - Brief clinical observations to help the psychiatrist during the session.
      
      Keep the tone professional, objective, and concise (max 150 words). Respond in English.`,
    );

    const userPrompt = new HumanMessage(
      `Patient's Current Complaint: "${complaint}"
      
      Medication History:
      ${medsList}`,
    );

    const response = await model.invoke([systemPrompt, userPrompt]);
    const summary = response.content as string;

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("AI Summary Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
