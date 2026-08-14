import { createClient } from '@vercel/kv';
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req) {
  if(req.method !== 'POST') return new Response('method error',{status:405});
  const {system,msg,sessionId} = await req.json();
  const apiKey = process.env.ARK_API_KEY;
  const model = process.env.MODEL_NAME || "doubao-pro-4k";
  if(!apiKey) return Response.json({success:false,msg:"缺少密钥配置"});

  const messages = [
    {role:"system",content:system},
    {role:"user",content:msg}
  ];
  const resp = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${apiKey}`
    },
    body:JSON.stringify({model,messages,temperature:0.75})
  })
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "获取回复失败";

  // 简单存入对话记录
  await kv.lpush(`session:${sessionId}`,JSON.stringify({role:"user",content:msg,time:Date.now()}));
  await kv.lpush(`session:${sessionId}`,JSON.stringify({role:"assistant",content,time:Date.now()}));

  return Response.json({success:true,content});
}