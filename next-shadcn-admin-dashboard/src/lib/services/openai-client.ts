// ============================================================================
// OpenAI Client — replaces Gemini
// Dynamic model selection based on input complexity/length
// ============================================================================

import OpenAI from 'openai';

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

export interface StreamChunk {
  type: "text" | "done" | "error";
  content: string;
}

// Logic to rotate/select model based on input length
function selectModel(systemPrompt: string, userMessage: string): string {
  const totalLength = systemPrompt.length + userMessage.length;
  
  // If the input is very long/complex, use the stronger model (from user's allowed list)
  if (totalLength > 10000) {
    return "gpt-4o-2024-08-06";
  }
  
  // Default to fast/cheap model for standard tasks
  return "gpt-4o-mini";
}

export async function* streamOpenAI(
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<StreamChunk> {
  const client = getClient();

  if (!client) {
    // Dummy streaming — for development without API key
    const dummyText = generateDummyResponse(userMessage);
    const words = dummyText.split(" ");
    for (const word of words) {
      yield { type: "text", content: word + " " };
      await new Promise((r) => setTimeout(r, 25));
    }
    yield { type: "done", content: "" };
    return;
  }

  const modelId = selectModel(systemPrompt, userMessage);

  try {
    const stream = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        yield { type: "text", content: text };
      }
    }
    yield { type: "done", content: "" };
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định từ OpenAI";
    
    // Fallback logic on Rate limit or 429
    if (errorMsg.includes("429") || errorMsg.includes("Too Many Requests") || errorMsg.includes("quota")) {
      try {
        const fallbackStream = await client.chat.completions.create({
          model: "gpt-4o-mini", // Fallback to the cheapest model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          stream: true,
        });

        yield { type: "text", content: "\n\n*(Hệ thống tự động chuyển sang mô hình dự phòng gpt-4o-mini do giới hạn API)*\n\n" };
        
        for await (const chunk of fallbackStream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) yield { type: "text", content: text };
        }
        yield { type: "done", content: "" };
        return;
      } catch (fallbackError: any) {
        yield {
          type: "error",
          content: "429: Vượt quá giới hạn số lượt sử dụng API OpenAI. Vui lòng thử lại sau.",
        };
        return;
      }
    }
    
    yield {
      type: "error",
      content: errorMsg,
    };
  }
}

export async function callOpenAI(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClient();

  if (!client) {
    return generateDummyResponse(userMessage);
  }

  const modelId = selectModel(systemPrompt, userMessage);

  try {
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định từ OpenAI";
    
    if (errorMsg.includes("429") || errorMsg.includes("Too Many Requests") || errorMsg.includes("quota")) {
      try {
        const fallbackResponse = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
        });
        return "\n\n*(Hệ thống tự động chuyển sang mô hình dự phòng gpt-4o-mini do giới hạn API)*\n\n" + (fallbackResponse.choices[0]?.message?.content || "");
      } catch (fallbackError) {
        throw new Error("429: Vượt quá giới hạn số lượt sử dụng API OpenAI. Vui lòng thử lại sau.");
      }
    }
    throw error;
  }
}

function generateDummyResponse(userMessage: string): string {
  return JSON.stringify(
    {
      _mode: "dummy",
      _note: "Đây là dữ liệu demo. Cấu hình OPENAI_API_KEY để sử dụng AI thật.",
      documentType: "demo",
      metadata: {
        tieuDe: `Tài liệu demo: ${userMessage.slice(0, 60)}`,
        ngayTao: new Date().toISOString().split("T")[0],
        tacGia: "DevDocs Studio",
      },
      sections: [
        {
          heading: "1. Giới thiệu",
          content: ["Đây là nội dung demo được tạo tự động.", `Yêu cầu: ${userMessage}`],
        },
        {
          heading: "2. Nội dung chính",
          content: ["Cấu hình API key OpenAI để AI tạo nội dung thực tế."],
        },
        {
          heading: "3. Kết luận",
          content: ["Tài liệu hoàn tất (chế độ demo)."],
        },
      ],
    },
    null,
    2
  );
}
