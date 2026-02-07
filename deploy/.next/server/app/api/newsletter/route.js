"use strict";(()=>{var e={};e.id=5497,e.ids=[5497,7356],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},76309:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>h,patchFetch:()=>w,requestAsyncStorage:()=>x,routeModule:()=>b,serverHooks:()=>f,staticGenerationAsyncStorage:()=>g});var s={};t.r(s),t.d(s,{DELETE:()=>m,GET:()=>d,POST:()=>p,dynamic:()=>l});var o=t(49303),i=t(88716),a=t(60670),n=t(87070),u=t(72331),c=t(36119);let l="force-dynamic";async function p(e){try{let{email:r,source:t,discountCode:s}=await e.json();if(!r||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))return n.NextResponse.json({error:"Valid email is required"},{status:400});let o=await u.prisma.newsletterSubscriber.findUnique({where:{email:r}});if(o){if(o.isActive)return n.NextResponse.json({success:!1,message:"You are already subscribed to our newsletter!"},{status:400});await u.prisma.newsletterSubscriber.update({where:{email:r},data:{isActive:!0,unsubscribedAt:null,confirmedAt:new Date}})}else await u.prisma.newsletterSubscriber.create({data:{email:r,source:t||"footer",discountCode:s||null,confirmedAt:new Date}});console.log("\uD83D\uDD14 Newsletter: Attempting to send welcome email to:",r),console.log("\uD83D\uDD14 SMTP Config - Host:",process.env.SMTP_HOST,"User:",process.env.SMTP_USER?"SET":"NOT SET");let i=`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
          .content { padding: 40px; text-align: center; }
          .code-box { background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .code { font-size: 28px; font-family: monospace; color: #3b82f6; font-weight: bold; letter-spacing: 3px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Silk Mart! 🎉</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Thank you for subscribing to our newsletter!</p>
            <p style="color: #666;">You'll now receive exclusive offers, new arrivals, and special discounts directly in your inbox.</p>
            ${s?`
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your exclusive welcome discount:</p>
                <div class="code">${s}</div>
                <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">Use at checkout for your discount!</p>
              </div>
            `:""}
            <a href="https://silkmartbd.com/shop" class="button">Start Shopping →</a>
          </div>
          <div class="footer">
            <p>Silk Mart - Premium E-Commerce Store</p>
            <p>You can unsubscribe at any time from your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `,a=!1;try{a=await (0,c.sendEmailWithAttachments)({to:r,subject:s?`🎁 Welcome! Here's Your ${s} Discount Code`:"\uD83C\uDF89 Welcome to Silk Mart Newsletter!",html:i}),console.log("\uD83D\uDD14 Newsletter email send result:",a?"SUCCESS":"FAILED")}catch(e){console.error("\uD83D\uDD14 Newsletter email error:",e.message||e)}return n.NextResponse.json({success:!0,message:a?"Successfully subscribed! Check your email for confirmation.":"Subscribed! (Email may arrive shortly)",emailSent:a})}catch(e){return console.error("Newsletter subscription error:",e),n.NextResponse.json({error:e.message||"Subscription failed"},{status:500})}}async function d(e){try{let{searchParams:r}=new URL(e.url),t=parseInt(r.get("page")||"1"),s=parseInt(r.get("limit")||"50"),[o,i]=await Promise.all([u.prisma.newsletterSubscriber.findMany({where:{isActive:!0},orderBy:{createdAt:"desc"},take:s,skip:(t-1)*s}),u.prisma.newsletterSubscriber.count({where:{isActive:!0}})]);return n.NextResponse.json({subscribers:o,total:i,pages:Math.ceil(i/s),currentPage:t})}catch(e){return console.error("Get subscribers error:",e),n.NextResponse.json({error:e.message},{status:500})}}async function m(e){try{let{email:r}=await e.json();if(!r)return n.NextResponse.json({error:"Email is required"},{status:400});return await u.prisma.newsletterSubscriber.update({where:{email:r},data:{isActive:!1,unsubscribedAt:new Date}}),n.NextResponse.json({success:!0,message:"Unsubscribed successfully"})}catch(e){return console.error("Unsubscribe error:",e),n.NextResponse.json({error:"Unsubscribe failed"},{status:500})}}let b=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/newsletter/route",pathname:"/api/newsletter",filename:"route",bundlePath:"app/api/newsletter/route"},resolvedPagePath:"C:\\Users\\samia\\Desktop\\Learning Journey\\HostNin\\SilkMartWebSite\\app\\api\\newsletter\\route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:x,staticGenerationAsyncStorage:g,serverHooks:f}=b,h="/api/newsletter/route";function w(){return(0,a.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:g})}},72331:(e,r,t)=>{t.d(r,{prisma:()=>i});var s=t(53524);let o=globalThis,i=o.prisma??new s.PrismaClient({log:["error"]});o.prisma=i}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[8948,5972,5245,6119],()=>t(76309));module.exports=s})();