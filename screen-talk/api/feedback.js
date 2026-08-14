import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

export default async function handler(req) {
  if(req.method !== 'POST') return new Response('method error',{status:405});
  const body = await req.json();
  const saveData = {
    ...body,
    createTime: new Date().toLocaleString()
  };
  await redis.lpush("feedback_list",JSON.stringify(saveData));
  return Response.json({success:true});
}
