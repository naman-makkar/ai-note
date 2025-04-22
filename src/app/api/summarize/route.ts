// Use the modern Vercel AI SDK pattern
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// IMPORTANT: Set the runtime to edge for Vercel Edge Functions
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a provider instance with explicit API key
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Use the Google provider from @ai-sdk/google with specific model version
    const result = await streamText({
      model: google('gemini-1.5-flash', {
        // Keep structuredOutputs true, but explicitly ask for plain text in prompt
        structuredOutputs: true, 
      }),
      prompt: `Analyze this task list and provide a structured enhancement:

---
${content}
---

**CRITICAL INSTRUCTIONS FOR RESPONSE FORMAT:**
1. Respond ONLY with plain text.
2. Do NOT include any prefixes like '0:', 'f:', 'e:', 'd:'.
3. Do NOT include quotation marks around text segments.
4. Use standard newline characters ONLY between lines and sections.
5. Include relevant emojis within the text as requested.

Please provide the following sections, exactly as written, with plain text content following each header:

🎯 PRIORITY TASKS:
[Bulleted list of tasks, prioritized, with brief reasoning. Use '*' or '-' for bullets.]

✅ SUMMARY:
[1-2 sentence motivational overview.]

💡 PRODUCTIVITY TIP:
[One specific, actionable technique for these tasks.]

Example of CORRECT format:
🎯 PRIORITY TASKS:
* Task A (Reason A)
* Task B (Reason B)

✅ SUMMARY:
This is the summary text.

💡 PRODUCTIVITY TIP:
This is the productivity tip.

Keep the entire response under 120 words.`,
      temperature: 0.1, // Very low temperature for strict adherence to format
      maxTokens: 200,
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("/api/summarize Error:", error);
    const errorMessage = error.message || 'An unexpected error occurred';
    // You can create a JSON response for errors too
    return new Response(JSON.stringify({ error: 'Failed to generate summary', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 