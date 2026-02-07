"use strict";exports.id=6198,exports.ids=[6198,455],exports.modules={90455:(e,t,r)=>{r.d(t,{Gv:()=>c,RA:()=>d,V3:()=>u,c_:()=>i,verifyToken:()=>l});var a=r(98691),n=r(6091),s=r(6176);r(71615);let o=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key");async function i(e){return a.ZP.hash(e,10)}async function c(e,t){return a.ZP.compare(e,t)}async function u(e){return new n.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(o)}async function l(e){try{return(await (0,s._)(e,o)).payload}catch(e){return null}}async function d(e){try{let t=e.cookies.get("token")?.value;if(!t)return null;let a=await l(t);if(!a)return null;let{prisma:n}=await r.e(7356).then(r.bind(r,72331)),s=await n.user.findUnique({where:{id:a.userId},select:{id:!0,email:!0,role:!0,name:!0,isActive:!0,permissions:!0}});if(!s||!1===s.isActive)return null;return{id:s.id,userId:s.id,email:s.email,name:s.name,role:s.role,permissions:s.permissions||[]}}catch(e){return console.error("verifyAuth error:",e),null}}},46578:(e,t,r)=>{async function a(e,t){let r=process.env.GOOGLE_AI_API_KEY?.trim();if(!r)throw Error("GOOGLE_AI_API_KEY not configured");let a=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:e}]}],generationConfig:{temperature:t?.temperature??.7,maxOutputTokens:t?.maxTokens??2048}})});if(!a.ok)throw Error("AI request failed");let n=await a.json();return n.candidates?.[0]?.content?.parts?.[0]?.text||""}function n(e,t){try{try{return JSON.parse(e)}catch(e){}let r=e.match(/```(?:json)?\s*([\s\S]*?)\s*```/);if(r&&r[1])try{return JSON.parse(r[1])}catch(e){}let a=e.search(/[{[]/),n=e.search(/[}\]][^}\]]*$/);if(-1!==a&&-1!==n&&n>a){let t=e.substring(a,n+1);try{return JSON.parse(t)}catch(e){}}return console.warn("Failed to parse AI JSON:",e),t}catch(e){return console.error("Error in parseAIJSON:",e),t}}async function s(e,t){try{let r=`Write a compelling, detailed 5-7 sentence product description for "${e}"${t?` in ${t}`:""} for a premium Bangladeshi e-commerce store "CTG Collection". 
    Highlight specific features, luxury appeal, and sensory details. Make it extremely professional and engaging. Return ONLY the description, no placeholders.`,n=await a(r);return{success:!0,result:n.trim()}}catch(e){return{success:!1,error:e.message}}}async function o(e){try{let t=`Analyze this product: "${e}". Return JSON with: { "category": "...", "priceRange": { "min": number, "max": number } (in BDT), "sizes": [...], "colors": [...], "tags": [...] }. Return ONLY valid JSON.`,r=await a(t,{temperature:.3}),s=n(r,{});return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}async function i(e,t){try{let r=t?.orderStatus?`Order Status: ${t.orderStatus}`:"",n=`You are a helpful customer support agent for CTG Collection (Bangladesh e-commerce).
Customer message: "${e}"
${r}

Write a professional, helpful response in 2-3 sentences. Be polite and solution-oriented. If about order, provide tracking info or next steps.`,s=await a(n);return{success:!0,result:s.trim()}}catch(e){return{success:!1,error:e.message,fallback:!0,result:"Thank you for contacting us. Our team will get back to you shortly."}}}async function c(e){try{let t=`Customer message: "${e}"
Generate 3 quick reply options for support agent. Return as JSON array: ["reply1", "reply2", "reply3"]. Keep each under 50 words.`,r=await a(t,{temperature:.5}),s=n(r,[]);return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}async function u(e,t){try{let r=`Analyze this product review:
Text: "${e}"
Rating: ${t}/5

Return JSON: {
  "sentiment": "positive/negative/neutral",
  "isSpam": true/false,
  "isInappropriate": true/false,
  "keyPoints": ["..."],
  "suggestedResponse": "...",
  "qualityScore": 1-10
}
Return ONLY valid JSON.`,s=await a(r,{temperature:.2}),o=n(s,{});return{success:!0,result:o}}catch(e){return{success:!1,error:e.message}}}async function l(e,t,r){try{let n=`Write a ${t>=4?"thank you":"apologetic"} response to this review:
Product: ${r}
Rating: ${t}/5
Review: "${e}"

Keep it professional, 2-3 sentences. If negative, offer to help resolve issues.`,s=await a(n);return{success:!0,result:s.trim()}}catch(e){return{success:!1,error:e.message}}}async function d(e){try{let t=`Generate 5 creative coupon/promo code ideas for a Bangladesh e-commerce store.
${e.occasion?`Occasion: ${e.occasion}`:""}
${e.targetAudience?`Target: ${e.targetAudience}`:""}
${e.discountType?`Type: ${e.discountType}`:""}

Return JSON array: [{ "code": "EXAMPLE20", "name": "...", "description": "...", "discountPercent": 20, "validDays": 7 }, ...]
Use creative, memorable codes. Return ONLY valid JSON array.`,r=await a(t),s=n(r,[]);return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}async function m(e,t){try{let r=`Write an engaging store announcement for CTG Collection:
Topic: ${e}
Type: ${t}

Return JSON: {
  "title": "Catchy headline (max 60 chars)",
  "content": "Full announcement (100-150 words)",
  "emoji": "relevant emoji",
  "cta": "Call to action button text"
}
Make it exciting and action-oriented. Return ONLY valid JSON.`,s=await a(r),o=n(s,{});return{success:!0,result:o}}catch(e){return{success:!1,error:e.message}}}async function p(e){try{let t=`Analyze this e-commerce data and provide insights:
Period: ${e.period}
Total Orders: ${e.totalOrders}
Revenue: ৳${e.totalRevenue.toLocaleString()}
Top Products: ${e.topProducts.join(", ")}

Provide 3-4 actionable business insights in JSON: {
  "summary": "Quick overview sentence",
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "trend": "up/down/stable"
}
Return ONLY valid JSON.`,r=await a(t),s=n(r,{});return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}async function g(e,t){try{let r=`Generate SEO content for: "${e}" (${t} page)
Store: CTG Collection (Bangladesh e-commerce)

Return JSON: {
  "metaTitle": "Max 60 chars, include keywords",
  "metaDescription": "Max 160 chars, compelling and keyword-rich",
  "h1": "Main heading",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
Return ONLY valid JSON.`,s=await a(r),o=n(s,{});return{success:!0,result:o}}catch(e){return{success:!1,error:e.message}}}async function h(e,t){try{let r=`Translate the following text to ${"bn"===t?"Bengali":"English"}. Keep the tone and meaning accurate.

Text: "${e}"

Return ONLY the translated text, nothing else.`,n=await a(r,{temperature:.2});return{success:!0,result:n.trim()}}catch(e){return{success:!1,error:e.message}}}async function y(e,t){try{let r=`Write an order ${e} email for CTG Collection:
Order ID: ${t.orderId}
Customer: ${t.customerName}
Items: ${t.items.join(", ")}
Total: ৳${t.total}

Return JSON: {
  "subject": "Email subject line",
  "heading": "Main heading",
  "body": "Email body (2-3 paragraphs)",
  "cta": "Call to action if applicable"
}
Be warm, professional. Include relevant info for ${e} emails. Return ONLY valid JSON.`,s=await a(r),o=n(s,{});return{success:!0,result:o}}catch(e){return{success:!1,error:e.message}}}async function f(e,t){try{let r=`Write a marketing email for CTG Collection:
Campaign: ${e}
Target: ${t}

Return JSON: {
  "subject": "Catchy subject line (max 50 chars)",
  "preheader": "Preview text (max 100 chars)",
  "heading": "Main heading",
  "body": "Email content (150-200 words)",
  "cta": "Call to action button text"
}
Make it compelling and action-oriented. Return ONLY valid JSON.`,s=await a(r),o=n(s,{});return{success:!0,result:o}}catch(e){return{success:!1,error:e.message}}}async function O(e,t){try{let r={product_name:`Suggest 5 similar product names based on: "${e}". Return JSON array: ["name1", "name2", ...]`,category:`Suggest appropriate categories for product: "${e}". Return JSON array of 3 best matching categories.`,tags:`Suggest 10 SEO-optimized tags for: "${e}". Return JSON array.`,price:`Suggest appropriate price range in BDT for: "${e}". Return JSON: {"min": number, "max": number, "recommended": number}`},s=await a(r[t],{temperature:.4}),o="price"===t?n(s,{}):n(s,[]);return{success:!0,result:o}}catch(e){return{success:!1,error:e.message}}}async function w(e,t,r){try{let s=r?.language||"en",o=r?.includeEmoji!==!1?"Include relevant emojis.":"No emojis.",i={facebook_post:{format:"Facebook post with hook, body, CTA",length:"100-150 words"},instagram_caption:{format:"Instagram caption with hook and hashtags",length:"50-100 words + 10 hashtags"},email_campaign:{format:"Email with subject, preheader, body, CTA",length:"200-250 words"},ad_copy:{format:"Ad headline + description",length:"Headline 10 words max, description 30 words max"},sms:{format:"SMS promotional text",length:"Max 160 characters"}}[e],c=`Create ${e.replace(/_/g," ")} for CTG Collection:

Topic/Product: ${t}
Format: ${i.format}
Length: ${i.length}
Language: ${"bn"===s?"Bengali (বাংলা)":"English"}
${o}

Return JSON with appropriate fields for ${e}. Return ONLY valid JSON.`,u=await a(c),l=n(u,{});return{success:!0,result:l}}catch(e){return console.error("Marketing AI Error:",e),{success:!0,result:{subject:`Special Offer: ${t}`,headline:t,preheader:"Don't miss out on our latest updates!",body:`Check out ${t} at CTG Collection. We have amazing deals tailored just for you. Visit our store today to explore the collection.`,text:`Check out ${t} at CTG Collection! Shop now.`,cta:"Shop Now",hashtags:"#CTGCollection #Fashion #Style"},error:e.message}}}async function $(e){try{let t=`Analyze this customer data and create a persona:

Orders: ${e.totalOrders}
Avg Order Value: ৳${e.avgOrderValue}
Top Categories: ${e.topCategories.join(", ")}
Last Order: ${e.lastOrderDate}

Return JSON: {
  "segment": "VIP/Regular/New/At-Risk",
  "persona": "Brief description",
  "preferences": ["preference1", "preference2"],
  "recommendations": ["product recommendation 1", "product recommendation 2"],
  "retentionStrategy": "How to keep this customer"
}
Return ONLY valid JSON.`,r=await a(t,{temperature:.4}),s=n(r,{});return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}async function S(e){try{let t=`Predict inventory needs for this product:

Product: ${e.name}
Category: ${e.category}
Current Stock: ${e.currentStock}
Sales (30 days): ${e.salesLast30Days}
Sales (7 days): ${e.salesLast7Days}

Return JSON: {
  "dailyRate": estimated daily sales (number),
  "daysUntilStockout": number,
  "restockRecommendation": number to restock,
  "urgency": "critical/high/medium/low",
  "reason": "Brief explanation"
}
Return ONLY valid JSON.`,r=await a(t,{temperature:.2}),s=n(r,{});return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}async function N(e){try{let t=`Analyze this order for potential fraud indicators:

Order Value: ৳${e.orderValue}
Payment: ${e.paymentMethod}
Shipping: ${e.shippingAddress}
Customer's Previous Orders: ${e.customerOrderCount}
Items in Order: ${e.itemCount}

Return JSON: {
  "riskScore": 1-100,
  "riskLevel": "low/medium/high/critical",
  "flags": ["flag1", "flag2"],
  "recommendation": "approve/review/reject",
  "reason": "Brief explanation"
}
Return ONLY valid JSON.`,r=await a(t,{temperature:.2}),s=n(r,{});return{success:!0,result:s}}catch(e){return{success:!1,error:e.message}}}r.d(t,{F0:()=>N,IM:()=>o,L:()=>l,Lm:()=>g,Mj:()=>u,OX:()=>h,Og:()=>n,Q4:()=>d,Te:()=>w,Un:()=>m,X_:()=>i,_B:()=>c,_U:()=>p,eL:()=>a,gj:()=>y,iy:()=>f,kW:()=>$,nw:()=>O,oK:()=>S,pL:()=>s})}};