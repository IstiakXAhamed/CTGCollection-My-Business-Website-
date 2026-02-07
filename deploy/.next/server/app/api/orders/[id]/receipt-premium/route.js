"use strict";(()=>{var e={};e.id=6624,e.ids=[6624,7356,455],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},55315:e=>{e.exports=require("path")},72254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},47261:e=>{e.exports=require("node:util")},43261:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>w,patchFetch:()=>$,requestAsyncStorage:()=>y,routeModule:()=>f,serverHooks:()=>v,staticGenerationAsyncStorage:()=>b});var i={};r.r(i),r.d(i,{GET:()=>h,dynamic:()=>m});var o=r(49303),n=r(88716),a=r(60670),s=r(87070),d=r(90455),p=r(72331),l=r(55315),c=r.n(l),u=r(92048),x=r.n(u);async function g(e){try{let t;let r=await p.prisma.order.findUnique({where:{id:e},include:{address:!0,user:{select:{name:!0,email:!0}},items:{include:{product:!0}}}});if(!r)return null;let i={...r,address:{name:r.address.name,phone:r.address.phone,address:r.address.address,city:r.address.city,district:r.address.district,postalCode:r.address.postalCode},items:r.items.map(e=>({quantity:e.quantity,price:e.price,product:{name:e.product.name,hasWarranty:e.product.hasWarranty||!1,warrantyPeriod:e.product.warrantyPeriod||null},variantInfo:e.variantInfo}))};try{let e=c().join(process.cwd(),"public","logo.png");if(x().existsSync(e)){let r=x().readFileSync(e);t=`data:image/png;base64,${r.toString("base64")}`}}catch(e){}let o=function(e,t){let r=e.address.name,i=e.user?.email||e.guestEmail||"",o=new Date(e.createdAt).toLocaleDateString("en-BD",{day:"numeric",month:"long",year:"numeric"}),n=e.items.map(e=>{let t=e.variantInfo?(()=>{try{return JSON.parse(e.variantInfo)}catch{return null}})():null,r=t?`${t.size||""}${t.color?" / "+t.color:""}`:"";return`
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
          <strong style="color: #222;">${e.product.name}</strong>
          ${r?`<div style="color: #888; font-size: 13px;">${r}</div>`:""}
          ${e.product.hasWarranty?`<div style="color: #16a34a; font-size: 12px; margin-top: 4px;">🛡️ ${e.product.warrantyPeriod||"Warranty"}</div>`:""}
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #eee; text-align: center; color: #666;">${e.quantity}</td>
        <td style="padding: 16px 0; border-bottom: 1px solid #eee; text-align: right; color: #666;">৳${e.price.toLocaleString()}</td>
        <td style="padding: 16px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #222;">৳${(e.price*e.quantity).toLocaleString()}</td>
      </tr>
    `}).join(""),a=e.items.filter(e=>e.product.hasWarranty);return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${e.orderNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
      color: #333;
      line-height: 1.6;
    }
    .receipt {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: #1a1a2e;
      color: white;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-box {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 700;
    }
    .brand-tagline {
      font-size: 12px;
      opacity: 0.7;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.7;
      margin-bottom: 4px;
    }
    .invoice-title .number {
      font-size: 18px;
      font-weight: 700;
    }
    .invoice-title .date {
      font-size: 13px;
      opacity: 0.7;
      margin-top: 4px;
    }
    .body { padding: 40px; }
    .info-row {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
    }
    .info-box {
      flex: 1;
    }
    .info-box h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-bottom: 8px;
    }
    .info-box p {
      margin: 4px 0;
    }
    .info-box .name {
      font-weight: 600;
      font-size: 16px;
      color: #222;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      text-align: left;
      padding: 12px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      border-bottom: 2px solid #222;
    }
    th:nth-child(2), th:nth-child(3) { text-align: center; }
    th:last-child { text-align: right; }
    .totals {
      margin-top: 30px;
      border-top: 2px solid #222;
      padding-top: 20px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }
    .totals-row.discount { color: #16a34a; }
    .totals-row.grand {
      font-size: 20px;
      font-weight: 700;
      padding-top: 16px;
      margin-top: 8px;
      border-top: 1px solid #ddd;
    }
    .payment-info {
      background: #f8f8f8;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .payment-method {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .payment-icon {
      font-size: 24px;
    }
    .payment-status {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-paid {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .warranty-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
    }
    .warranty-box h4 {
      color: #166534;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .warranty-box ul {
      margin: 0;
      padding-left: 20px;
      color: #166534;
    }
    .warranty-box li {
      margin: 6px 0;
      font-size: 14px;
    }
    .footer {
      background: #fafafa;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .footer-brand {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }
    .footer p {
      color: #888;
      font-size: 13px;
      margin: 4px 0;
    }
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #1a1a2e;
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      font-family: inherit;
    }
    .print-btn:hover { background: #2a2a4e; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo-section">
        ${t?`<img src="${t}" alt="Logo" style="height: 50px; width: auto; border-radius: 8px;">`:'<div class="logo-box">C</div>'}
        <div>
          <div class="brand-name">CTG Collection</div>
          <div class="brand-tagline">Premium Fashion & Lifestyle</div>
        </div>
      </div>
      <div class="invoice-title">
        <h2>Invoice</h2>
        <div class="number">${e.orderNumber}</div>
        <div class="date">${o}</div>
      </div>
    </div>
    
    <div class="body">
      <div class="info-row">
        <div class="info-box">
          <h4>Bill To</h4>
          <p class="name">${r}</p>
          ${i?`<p>${i}</p>`:""}
          <p>${e.address.phone}</p>
        </div>
        <div class="info-box">
          <h4>Ship To</h4>
          <p class="name">${e.address.name}</p>
          <p>${e.address.address}</p>
          <p>${e.address.city}, ${e.address.district}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${n}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>৳${e.subtotal.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>Shipping</span>
          <span>৳${e.shippingCost.toLocaleString()}</span>
        </div>
        ${e.discount>0?`
        <div class="totals-row discount">
          <span>Discount${e.couponCode?` (${e.couponCode})`:""}</span>
          <span>-৳${e.discount.toLocaleString()}</span>
        </div>
        `:""}
        <div class="totals-row grand">
          <span>Total</span>
          <span>৳${e.total.toLocaleString()}</span>
        </div>
      </div>
      
      <div class="payment-info">
        <div class="payment-method">
          <span class="payment-icon">${"cod"===e.paymentMethod?"\uD83D\uDCB5":"\uD83D\uDCB3"}</span>
          <div>
            <div style="font-weight: 600;">${"cod"===e.paymentMethod?"Cash on Delivery":"Online Payment"}</div>
          </div>
        </div>
        <div class="payment-status ${"paid"===e.paymentStatus?"status-paid":"status-pending"}">
          ${"paid"===e.paymentStatus?"✓ Paid":"Pending"}
        </div>
      </div>
      
      ${a.length>0?`
      <div class="warranty-box">
        <h4>🛡️ Warranty Information</h4>
        <ul>
          ${a.map(e=>`<li><strong>${e.product.name}</strong> — ${e.product.warrantyPeriod||"Warranty Included"}</li>`).join("")}
        </ul>
      </div>
      `:""}
    </div>
    
    <div class="footer">
      <div class="footer-brand">CTG Collection</div>
      <p>Thank you for shopping with us!</p>
      <p style="margin-top: 12px;">📧 ctgcollection2@gmail.com</p>
    </div>
  </div>
  
  <button class="print-btn" onclick="window.print()">
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z"/></svg>
    Print
  </button>
</body>
</html>
  `}(i,t),n=c().join(process.cwd(),"public","receipts");x().existsSync(n)||x().mkdirSync(n,{recursive:!0});let a=`receipt-premium-${r.orderNumber}.html`;return x().writeFileSync(c().join(n,a),o),`/receipts/${a}`}catch(e){return console.error("Error generating receipt:",e),null}}let m="force-dynamic";async function h(e,{params:t}){try{if(!await (0,d.RA)(e))return s.NextResponse.json({error:"Unauthorized"},{status:401});let r=t.id,i=await g(r);if(!i)return s.NextResponse.json({error:"Failed to generate receipt"},{status:500});return s.NextResponse.json({receiptUrl:i,type:"premium"})}catch(e){return s.NextResponse.json({error:e.message},{status:500})}}let f=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/orders/[id]/receipt-premium/route",pathname:"/api/orders/[id]/receipt-premium",filename:"route",bundlePath:"app/api/orders/[id]/receipt-premium/route"},resolvedPagePath:"C:\\Users\\samia\\Desktop\\Learning Journey\\HostNin\\SilkMartWebSite\\app\\api\\orders\\[id]\\receipt-premium\\route.ts",nextConfigOutput:"standalone",userland:i}),{requestAsyncStorage:y,staticGenerationAsyncStorage:b,serverHooks:v}=f,w="/api/orders/[id]/receipt-premium/route";function $(){return(0,a.patchFetch)({serverHooks:v,staticGenerationAsyncStorage:b})}},90455:(e,t,r)=>{r.d(t,{Gv:()=>d,RA:()=>c,V3:()=>p,c_:()=>s,verifyToken:()=>l});var i=r(98691),o=r(6091),n=r(6176);r(71615);let a=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key");async function s(e){return i.ZP.hash(e,10)}async function d(e,t){return i.ZP.compare(e,t)}async function p(e){return new o.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(a)}async function l(e){try{return(await (0,n._)(e,a)).payload}catch(e){return null}}async function c(e){try{let t=e.cookies.get("token")?.value;if(!t)return null;let i=await l(t);if(!i)return null;let{prisma:o}=await r.e(7356).then(r.bind(r,72331)),n=await o.user.findUnique({where:{id:i.userId},select:{id:!0,email:!0,role:!0,name:!0,isActive:!0,permissions:!0}});if(!n||!1===n.isActive)return null;return{id:n.id,userId:n.id,email:n.email,name:n.name,role:n.role,permissions:n.permissions||[]}}catch(e){return console.error("verifyAuth error:",e),null}}},72331:(e,t,r)=>{r.d(t,{prisma:()=>n});var i=r(53524);let o=globalThis,n=o.prisma??new i.PrismaClient({log:["error"]});o.prisma=n}};var t=require("../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[8948,5972,8691,8840],()=>r(43261));module.exports=i})();