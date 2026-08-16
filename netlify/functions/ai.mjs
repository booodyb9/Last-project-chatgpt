import { createServerClients, generateAssistantReply, analyzeLocationImage, generateAdminContent, requireAdmin, customerVisionAssistant } from '../../server/ai-core.js';
const buckets=new Map();
function allowed(ip,max){const now=Date.now(),c=buckets.get(ip);if(!c||c.resetAt<=now){buckets.set(ip,{count:1,resetAt:now+60000});return true}if(c.count>=max)return false;c.count++;return true}
const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
export const handler=async(event)=>{
 if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
 const route=event.path.split('/').pop(); const ip=event.headers['x-forwarded-for']?.split(',')[0]?.trim()||'unknown';
 if(!allowed(ip,route==='image'?5:15))return json(429,{error:'تم تجاوز حد الطلبات مؤقتاً. حاول بعد قليل.'});
 try{
  const body=JSON.parse(event.body||'{}'); const {supabase,ai}=createServerClients();
  if(route==='chat')return json(200,{reply:await generateAssistantReply({ai,supabase,messages:body.messages})});
  if(route==='image')return json(200,{analysis:await analyzeLocationImage({ai,image:body.image,note:body.note})});
  if(route==='vision-assistant')return json(200,{result:await customerVisionAssistant({ai,supabase,task:body.task,image:body.image,messages:body.messages})});
  if(route==='smart-search'){if(!body.query)return json(200,{result:'{"matchedIds":[]}'});return json(200,{result:await generateAdminContent({ai,task:'smart_search',title:body.query,content:body.siteData||'[]'})})}
  if(route==='admin'){const admin=await requireAdmin({headers:{authorization:event.headers.authorization||''}});if(!admin)return json(403,{error:'غير مصرح.'});return json(200,{result:await generateAdminContent({ai,...body})})}
  if(route==='generate-seo'){const admin=await requireAdmin({headers:{authorization:event.headers.authorization||''}});if(!admin)return json(403,{error:'غير مصرح.'});const raw=await generateAdminContent({ai,task:'seo',title:body.title,content:body.content});let p;try{p=JSON.parse(raw)}catch{p={metaDescription:raw}}return json(200,{title:p.metaTitle||p.title||'',description:p.metaDescription||p.description||'',keywords:p.keywords||''})}
  return json(404,{error:'Not found'});
 }catch(error){console.error('Netlify AI function failed:',error instanceof Error?error.message:'Unknown error');const m=error instanceof Error?error.message:'';if(/required|unsupported|too large|invalid/i.test(m))return json(400,{error:m});if(/Missing GEMINI_API_KEY/i.test(m))return json(503,{error:'خدمة الذكاء الاصطناعي غير مهيأة بعد.'});return json(500,{error:'تعذر إكمال الطلب حالياً.'})}
};
