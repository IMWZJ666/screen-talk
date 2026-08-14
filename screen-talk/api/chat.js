export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response('method error', { status: 405 });
    }

    const { system, msg, sessionId } = await req.json();
    const apiKey = process.env.ARK_API_KEY;
    const model = process.env.MODEL_NAME || "doubao-pro";

    if (!apiKey) {
      return Response.json({ success: false, msg: "缺少密钥配置" });
    }

    const messages = [
      { role: "system", content: system },
      { role: "user", content: msg }
    ];

    const resp = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature: 0.75 }),
      signal: AbortSignal.timeout(25000) // 增加25秒超时限制
    });

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "获取回复失败";

    return Response.json({ success: true, content });

  } catch (err) {
    console.error("接口异常：", err);
    return Response.json({ success: false, msg: "服务请求异常" }, { status: 500 });
  }
}
