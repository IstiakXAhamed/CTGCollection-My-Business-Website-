"use strict";(()=>{var e={};e.id=9118,e.ids=[9118,7356],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},26309:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>h,requestAsyncStorage:()=>f,routeModule:()=>l,serverHooks:()=>m,staticGenerationAsyncStorage:()=>x});var s={};t.r(s),t.d(s,{POST:()=>c,dynamic:()=>u});var o=t(49303),i=t(88716),a=t(60670),n=t(87070),d=t(72331),p=t(36119);let u="force-dynamic";async function c(e){try{let r=await e.json(),{action:t,code:s}=r,o=r.email?.toLowerCase().trim();if(!o)return n.NextResponse.json({error:"Email is required"},{status:400});if("request_code"===t||!t){let e=await d.prisma.user.findUnique({where:{email:o}});if(!e)return n.NextResponse.json({success:!0,message:"If that email exists, a verification code will be sent."});await d.prisma.verificationCode.deleteMany({where:{email:o,type:"password_reset"}});let r=Math.floor(1e5+9e5*Math.random()).toString(),t=new Date(Date.now()+3e5);await d.prisma.verificationCode.create({data:{code:r,type:"password_reset",email:o,userId:e.id,expiresAt:t}});let s=`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
            .content { padding: 40px; text-align: center; }
            .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #667eea; background: #f0f4ff; padding: 20px 30px; border-radius: 12px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Code</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #333;">Hi ${e.name},</p>
              <p style="color: #666;">Use the following code to reset your password:</p>
              
              <div class="code">${r}</div>
              
              <div class="warning">
                <p style="margin: 0;">⏰ This code expires in 5 minutes</p>
              </div>
              
              <p style="color: #888; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Silk Mart - Premium E-Commerce Store</p>
            </div>
          </div>
        </body>
        </html>
      `;try{await (0,p.sendEmailWithAttachments)({to:o,subject:`🔐 Your Password Reset Code: ${r}`,html:s})}catch(e){console.error("Email send error:",e)}return n.NextResponse.json({success:!0,message:"Verification code sent! Check your email."})}if("verify_code"===t){if(!s)return n.NextResponse.json({error:"Verification code is required"},{status:400});if(!await d.prisma.verificationCode.findFirst({where:{email:o,code:s,type:"password_reset",expiresAt:{gt:new Date}}}))return n.NextResponse.json({error:"Invalid or expired code"},{status:400});return n.NextResponse.json({success:!0,message:"Code verified! You can now set a new password.",verified:!0})}return n.NextResponse.json({error:"Invalid action"},{status:400})}catch(e){return console.error("Forgot password error:",e),n.NextResponse.json({error:"Failed to process request"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/auth/forgot-password/route",pathname:"/api/auth/forgot-password",filename:"route",bundlePath:"app/api/auth/forgot-password/route"},resolvedPagePath:"C:\\Users\\samia\\Desktop\\Learning Journey\\HostNin\\SilkMartWebSite\\app\\api\\auth\\forgot-password\\route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:f,staticGenerationAsyncStorage:x,serverHooks:m}=l,g="/api/auth/forgot-password/route";function h(){return(0,a.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:x})}},72331:(e,r,t)=>{t.d(r,{prisma:()=>i});var s=t(53524);let o=globalThis,i=o.prisma??new s.PrismaClient({log:["error"]});o.prisma=i}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[8948,5972,5245,6119],()=>t(26309));module.exports=s})();