"use strict";(()=>{var e={};e.id=2748,e.ids=[2748,7356],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},73533:(e,i,r)=>{r.r(i),r.d(i,{originalPathname:()=>x,patchFetch:()=>h,requestAsyncStorage:()=>m,routeModule:()=>u,serverHooks:()=>g,staticGenerationAsyncStorage:()=>f});var t={};r.r(t),r.d(t,{POST:()=>p,dynamic:()=>c});var a=r(49303),o=r(88716),s=r(60670),n=r(87070),d=r(72331),l=r(30307);let c="force-dynamic";async function p(e){try{let i=await e.json(),r=i.email?.toLowerCase().trim(),t=i.code;if(!r||!t)return n.NextResponse.json({message:"Email and verification code are required"},{status:400});let a=await (0,l.VP)(r,t,"email_verify");if(!a.success)return n.NextResponse.json({message:a.message},{status:400});let o=await d.prisma.user.update({where:{email:r},data:{emailVerified:!0,verificationToken:null,verificationExpiry:null}});return n.NextResponse.json({success:!0,message:"Email verified successfully! You can now log in.",user:{id:o.id,email:o.email,name:o.name,emailVerified:o.emailVerified}})}catch(e){return console.error("Email verification error:",e),n.NextResponse.json({message:"Failed to verify email"},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/auth/verify-email/route",pathname:"/api/auth/verify-email",filename:"route",bundlePath:"app/api/auth/verify-email/route"},resolvedPagePath:"C:\\Users\\samia\\Desktop\\Learning Journey\\HostNin\\SilkMartWebSite\\app\\api\\auth\\verify-email\\route.ts",nextConfigOutput:"standalone",userland:t}),{requestAsyncStorage:m,staticGenerationAsyncStorage:f,serverHooks:g}=u,x="/api/auth/verify-email/route";function h(){return(0,s.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:f})}},72331:(e,i,r)=>{r.d(i,{prisma:()=>o});var t=r(53524);let a=globalThis,o=a.prisma??new t.PrismaClient({log:["error"]});a.prisma=o},30307:(e,i,r)=>{r.d(i,{D_:()=>o,VP:()=>s,zk:()=>n});var t=r(72331),a=r(36119);async function o(e,i,r){await t.prisma.verificationCode.deleteMany({where:{email:e,type:i}});let a=Math.floor(1e5+9e5*Math.random()).toString(),o=new Date(Date.now()+3e5);return await t.prisma.verificationCode.create({data:{code:a,type:i,email:e,userId:r,expiresAt:o}}),a}async function s(e,i,r){let a=await t.prisma.verificationCode.findFirst({where:{email:e,type:r,used:!1},orderBy:{createdAt:"desc"}});return a?new Date>a.expiresAt?(await t.prisma.verificationCode.delete({where:{id:a.id}}),{success:!1,message:"Verification code expired. Please request a new code."}):a.attempts>=5?(await t.prisma.verificationCode.delete({where:{id:a.id}}),{success:!1,message:"Too many failed attempts. Please request a new code."}):a.code!==i?(await t.prisma.verificationCode.update({where:{id:a.id},data:{attempts:{increment:1}}}),{success:!1,message:`Invalid code. ${4-a.attempts} attempts remaining.`}):(await t.prisma.verificationCode.update({where:{id:a.id},data:{used:!0}}),{success:!0,message:"Code verified successfully",userId:a.userId||void 0}):{success:!1,message:"No verification code found. Please request a new code."}}async function n(e,i,r){let t=`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #2563eb; margin: 0; }
        .code-box { background: #f0f9ff; border: 2px dashed #2563eb; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
        .code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace; }
        .message { color: #666; line-height: 1.6; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; color: #92400e; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>🛒 CTG Collection</h1>
        </div>
        
        <p class="message">
          ${"email_verify"===r?"Thank you for registering! Please use the code below to verify your email address:":"You requested a login verification code. Enter this code to complete your sign in:"}
        </p>
        
        <div class="code-box">
          <div class="code">${i}</div>
        </div>
        
        <p class="message">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div class="warning">
          ⚠️ If you didn't request this code, please ignore this email. Someone may have entered your email by mistake.
        </div>
        
        <div class="footer">
          <p>CTG Collection - Premium E-Commerce Store</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{return await (0,a.sendEmailWithAttachments)({to:e,subject:"email_verify"===r?"Verify Your Email - CTG Collection":"Login Verification Code - CTG Collection",html:t}),!0}catch(e){return console.error("Failed to send verification email:",e),!1}}}};var i=require("../../../../webpack-runtime.js");i.C(e);var r=e=>i(i.s=e),t=i.X(0,[8948,5972,5245,6119],()=>r(73533));module.exports=t})();