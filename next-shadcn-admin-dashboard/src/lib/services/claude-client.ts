// ============================================================================
// Claude AI Client — Streaming responses via Anthropic SDK
// ============================================================================

import Anthropic from "@anthropic-ai/sdk";

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "sk-ant-xxx") {
    return null; // Will use dummy mode
  }
  return new Anthropic({ apiKey });
};

export interface StreamChunk {
  type: "text" | "done" | "error";
  content: string;
}

export async function* streamClaude(
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<StreamChunk> {
  const client = getClient();

  if (!client) {
    // Dummy streaming mode — simulate AI response
    const dummyResponse = generateDummyResponse(userMessage);
    const words = dummyResponse.split(" ");
    for (const word of words) {
      yield { type: "text", content: word + " " };
      await new Promise((r) => setTimeout(r, 30));
    }
    yield { type: "done", content: "" };
    return;
  }

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text", content: event.delta.text };
      }
    }
    yield { type: "done", content: "" };
  } catch (error) {
    yield {
      type: "error",
      content: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClient();

  if (!client) {
    return generateDummyResponse(userMessage);
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

function generateDummyResponse(userMessage: string): string {
  return JSON.stringify(
    {
      documentType: "demo",
      metadata: {
        tieuDe: `Tài liệu demo cho: ${userMessage.slice(0, 50)}`,
        ngayTao: new Date().toISOString(),
        tacGia: "DevDocs Studio AI",
      },
      sections: [
        {
          heading: "1. Giới thiệu",
          content: [
            "Đây là nội dung được tạo tự động bởi DevDocs Studio.",
            `Yêu cầu: ${userMessage}`,
          ],
        },
        {
          heading: "2. Nội dung chính",
          content: [
            "Phần nội dung chi tiết sẽ được AI tạo dựa trên system prompt đã cấu hình.",
            "Trong chế độ dummy, nội dung mẫu được hiển thị để demo giao diện.",
          ],
        },
        {
          heading: "3. Kết luận",
          content: [
            "Tài liệu hoàn tất. Vui lòng kiểm tra và chỉnh sửa nếu cần.",
          ],
        },
      ],
    },
    null,
    2
  );
}
