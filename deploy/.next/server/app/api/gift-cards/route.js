"use strict";(()=>{var e={};e.id=5220,e.ids=[5220],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},83664:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>v,patchFetch:()=>y,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>f});var s={};t.r(s),t.d(s,{GET:()=>x,POST:()=>l,dynamic:()=>u});var o=t(49303),a=t(88716),i=t(60670),n=t(87070),p=t(84770),d=t.n(p),c=t(55245);let u="force-dynamic";async function l(e){try{let{amount:r,recipientEmail:t,recipientName:s,senderName:o,message:a}=await e.json();if(!r||r<100||r>5e4)return n.NextResponse.json({error:"Amount must be between ৳100 and ৳50,000"},{status:400});if(!t||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))return n.NextResponse.json({error:"Invalid recipient email"},{status:400});if(!s?.trim()||!o?.trim())return n.NextResponse.json({error:"Recipient and sender names are required"},{status:400});let i="GC"+d().randomBytes(6).toString("hex").toUpperCase(),p=new Date;p.setFullYear(p.getFullYear()+1);let u={id:d().randomUUID(),code:i,amount:r,balance:r,recipientEmail:t,recipientName:s,senderName:o,message:a,status:"active",expiresAt:p.toISOString(),createdAt:new Date().toISOString()};try{let e=c.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}),s=`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 40px; color: white; text-align: center; }
            .code { font-size: 32px; font-family: monospace; letter-spacing: 4px; margin: 20px 0; }
            .amount { font-size: 48px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>🎁 You've received a Gift Card!</h1>
              <p>From: ${o}</p>
              <div class="amount">৳${r}</div>
              <p>Your Gift Card Code:</p>
              <div class="code">${i}</div>
              ${a?`<p style="font-style: italic;">"${a}"</p>`:""}
              <p>Valid until: ${p.toLocaleDateString()}</p>
            </div>
            <p style="text-align: center; margin-top: 20px;">
              <a href="https://silkmartbd.com/shop" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none;">
                Shop Now
              </a>
            </p>
          </div>
        </body>
        </html>
      `;await e.sendMail({from:`"Silk Mart" <${process.env.SMTP_USER}>`,to:t,subject:`🎁 ${o} sent you a ৳${r} Gift Card!`,html:s})}catch(e){console.error("Failed to send gift card email:",e)}return n.NextResponse.json({success:!0,giftCard:u})}catch(e){return console.error("Gift card creation error:",e),n.NextResponse.json({error:e.message||"Failed to create gift card"},{status:500})}}async function x(e){try{return n.NextResponse.json({giftCards:[]})}catch(e){return console.error("Get gift cards error:",e),n.NextResponse.json({error:e.message},{status:500})}}let m=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/gift-cards/route",pathname:"/api/gift-cards",filename:"route",bundlePath:"app/api/gift-cards/route"},resolvedPagePath:"C:\\Users\\samia\\Desktop\\Learning Journey\\HostNin\\SilkMartWebSite\\app\\api\\gift-cards\\route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:g,staticGenerationAsyncStorage:f,serverHooks:h}=m,v="/api/gift-cards/route";function y(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:f})}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[8948,5972,5245],()=>t(83664));module.exports=s})();