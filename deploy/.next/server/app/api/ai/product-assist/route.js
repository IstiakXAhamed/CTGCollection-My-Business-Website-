"use strict";(()=>{var e={};e.id=8206,e.ids=[8206],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},72254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},47261:e=>{e.exports=require("node:util")},86092:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>R,patchFetch:()=>L,requestAsyncStorage:()=>A,routeModule:()=>C,serverHooks:()=>P,staticGenerationAsyncStorage:()=>N});var r={};a.r(r),a.d(r,{POST:()=>p,dynamic:()=>u});var s=a(49303),n=a(88716),i=a(60670),o=a(87070),c=a(90455),l=a(46578);let u="force-dynamic";async function d(e){let t=await (0,c.RA)(e);return t&&("admin"===t.role||"superadmin"===t.role||"ADMIN"===t.role||"SUPER_ADMIN"===t.role||"seller"===t.role||"SELLER"===t.role)?t:null}async function g(e){let t=process.env.GOOGLE_AI_API_KEY;if(!t)throw Error("GOOGLE_AI_API_KEY not configured");let a=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:e}]}],generationConfig:{temperature:.7,maxOutputTokens:2048}})});if(!a.ok)throw console.error("Gemini API error:",await a.text()),Error("AI generation failed");let r=await a.json();return r.candidates?.[0]?.content?.parts?.[0]?.text||""}async function p(e){try{if(!await d(e))return o.NextResponse.json({error:"Admin access required"},{status:401});let{action:t,productName:a,category:r,description:s,tone:n,language:i}=await e.json();if(!a)return o.NextResponse.json({error:"Product name is required"},{status:400});let c={};try{switch(t){case"description":c.suggestion=await h(a,r,n,i);break;case"tags":c.suggestion=await y(a,r);break;case"seo":c.suggestion=await x(a,r);break;case"analyze":c=await w(a);break;case"complete":c=await b(a);break;case"rewrite":c.suggestion=await f(s,n,i);break;default:return o.NextResponse.json({error:"Invalid action"},{status:400})}}catch(e){switch(console.log("AI failed, using fallback:",e.message),t){case"description":c.suggestion=k(a,r);break;case"tags":c.suggestion=O(a,r);break;case"seo":c.suggestion=S(a,r);break;case"analyze":c=v(a);break;case"complete":c=E(a);break;case"rewrite":c.suggestion=s}c.fallback=!0}return o.NextResponse.json({success:!0,...c})}catch(e){return o.NextResponse.json({error:e.message},{status:500})}}let m={professional:"Use professional, business-like language. Focus on features and quality.",luxury:"Use premium, sophisticated language. Emphasize exclusivity and elegance.",friendly:"Use warm, conversational tone. Make it feel personal and approachable.",urgent:'Create urgency. Use phrases like "Limited stock", "Don\'t miss out".',casual:"Use relaxed, everyday language. Keep it simple and relatable."};async function h(e,t,a,r){let s=m[a||"professional"]||m.professional,n=`You are a professional e-commerce copywriter for a Bangladeshi fashion and lifestyle store called "CTG Collection".

Write a compelling, detailed product description for: "${e}"
${t?`Category: ${t}`:""}

TONE: ${s}
LANGUAGE: Write in ${"bn"===(r||"en")?"Bengali (বাংলা)":"English"}

Requirements:
- 5-7 sentences, highly engaging, professional, and persuasive
- Highlight specific notes, materials, features, and target audience
- Use rich, sensory language and emotional appeal
- Mention craftsmanship, heritage, or modern appeal as appropriate
- Do NOT include prices or availability
- Do NOT use placeholder brackets like [color] or [size]
- Make it extremely specific to the actual product's known characteristics
- Match the luxury tone of "CTG Collection" (Premium Bangladeshi Store)

Product Description:`;return(await g(n)).trim()}async function f(e,t,a){let r=m[t||"professional"]||m.professional,s=`Improve and rewrite this text to make it more engaging and professional:

Original text: "${e}"

TONE: ${r}
LANGUAGE: Output in ${"bn"===(a||"en")?"Bengali":"English"}

Return ONLY the rewritten text, nothing else.`;return(await g(s)).trim()}async function y(e,t){let a=`Generate SEO-optimized tags for this product: "${e}"
${t?`Category: ${t}`:""}

Requirements:
- Return 8-12 relevant tags separated by commas
- Include product type, materials, style, occasion
- Include relevant Bengali/Bangladesh terms like "bangladesh", "ctg", "chittagong"
- Make tags lowercase
- No hashtags, just comma-separated words

Tags:`;return(await g(a)).trim().toLowerCase()}async function x(e,t){let a=`Create an SEO-optimized meta title for this product: "${e}"
${t?`Category: ${t}`:""}

Requirements:
- Max 60 characters
- Include main keyword
- Include "Silk Mart" brand
- Include a benefit or USP
- Format: Product Name | Benefit | Silk Mart

SEO Title:`;return(await g(a)).trim()}async function w(e){let t=`Analyze this product name and provide suggestions: "${e}"

You are helping a Bangladeshi e-commerce store manager. Respond in this exact JSON format:

{
  "productType": "detected product type (e.g., Fragrance, Shoes, Watches, Electronics)",
  "suggestedCategory": "best category from: Fashion, Electronics, Home & Living, Beauty, Sports, Accessories, Fragrance",
  "priceRange": {
    "min": minimum suggested price in BDT (number only),
    "max": maximum suggested price in BDT (number only)
  },
  "suggestedVariants": {
    "sizes": ["array of suggested sizes (e.g., 50ml, 100ml, 42, XL)"],
    "colors": ["array of common colors or variations"]
  },
  "keywords": ["5-7 SEO keywords, include brand and specific model"],
  "confidence": "high/medium/low",
  "reasoning": "Brief explanation of why this was categorized this way"
}

Return ONLY the JSON, no other text.`,a=await g(t);try{return(0,l.Og)(a,v(e))}catch(t){return v(e)}}async function b(e){let t=`You are an AI assistant for a Bangladeshi e-commerce store. Generate complete product details for: "${e}"

Return a JSON object with these fields:
{
  "description": "compelling 3-4 sentence product description",
  "category": "one of: Fashion, Electronics, Home & Living, Beauty, Sports, Accessories",
  "suggestedPrice": base price in BDT (number only),
  "salePrice": optional sale price in BDT (number only, or null),
  "tags": "comma-separated SEO tags",
  "seoTitle": "SEO meta title under 60 chars",
  "variants": {
    "sizes": ["suggested sizes if applicable"],
    "colors": ["suggested colors"]
  },
  "isFeatured": true or false based on popularity
}

Return ONLY the JSON, no other text.`,a=await g(t);try{return(0,l.Og)(a,E(e))}catch(t){return E(e)}}function k(e,t){let a=t?` from our ${t} collection`:"";return`Discover the ${e}${a}. Crafted with premium quality materials for exceptional comfort and style. This product features modern design elements perfect for any occasion. Experience the perfect blend of functionality and elegance with Silk Mart.`}function O(e,t){return[...e.toLowerCase().split(" ").filter(e=>e.length>2),...t?[t.toLowerCase()]:[],"premium","quality","ctg collection","bangladesh","chittagong","online shopping"].join(", ")}function S(e,t){return`${e} | Premium Quality | Silk Mart Bangladesh`}function v(e){let t=e.toLowerCase(),a="Fashion",r="Product",s=[],n={min:999,max:2999};return t.includes("shirt")||t.includes("tshirt")||t.includes("t-shirt")?(r="T-Shirt",s=["S","M","L","XL","XXL"],n={min:599,max:1499}):t.includes("shoe")||t.includes("sneaker")||t.includes("boot")?(r="Footwear",a="Sports",s=["39","40","41","42","43","44","45"],n={min:2999,max:8999}):t.includes("phone")||t.includes("laptop")||t.includes("headphone")?(r="Electronics",a="Electronics",s=[],n={min:4999,max:49999}):t.includes("watch")?(r="Watch",a="Accessories",s=[],n={min:1999,max:9999}):t.includes("bag")||t.includes("backpack")?(r="Bag",a="Accessories",s=[],n={min:1499,max:4999}):(t.includes("pant")||t.includes("jeans")||t.includes("trouser"))&&(r="Pants",s=["28","30","32","34","36","38"],n={min:1299,max:3499}),{productType:r,suggestedCategory:a,priceRange:n,suggestedVariants:{sizes:s,colors:["Black","White","Navy"]},keywords:[t,a.toLowerCase(),"online shopping","bangladesh","ctg collection"],confidence:"low"}}function E(e){let t=v(e);return{description:k(e,t.suggestedCategory),category:t.suggestedCategory,suggestedPrice:t.priceRange.max,salePrice:Math.round(.85*t.priceRange.max),tags:O(e,t.suggestedCategory),seoTitle:S(e,t.suggestedCategory),variants:t.suggestedVariants,isFeatured:!1}}let C=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/ai/product-assist/route",pathname:"/api/ai/product-assist",filename:"route",bundlePath:"app/api/ai/product-assist/route"},resolvedPagePath:"C:\\Users\\samia\\Desktop\\Learning Journey\\HostNin\\SilkMartWebSite\\app\\api\\ai\\product-assist\\route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:A,staticGenerationAsyncStorage:N,serverHooks:P}=C,R="/api/ai/product-assist/route";function L(){return(0,i.patchFetch)({serverHooks:P,staticGenerationAsyncStorage:N})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[8948,5972,8691,8840,6198],()=>a(86092));module.exports=r})();