"use strict";exports.id=4020,exports.ids=[4020,7356],exports.modules={72331:(t,i,a)=>{a.d(i,{prisma:()=>d});var e=a(53524);let o=globalThis,d=o.prisma??new e.PrismaClient({log:["error"]});o.prisma=d},44020:(t,i,a)=>{a.d(i,{F1:()=>l,Fb:()=>J,Qc:()=>p,jQ:()=>Z});var e=a(72331),o=a(55315),d=a.n(o),s=a(92048),r=a.n(s);function n(){let t="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",i="";for(let a=0;a<6;a++)i+=t.charAt(Math.floor(Math.random()*t.length));return i}async function p(t){try{let i=await e.prisma.order.findUnique({where:{id:t},include:{address:!0,user:{select:{name:!0,email:!0}},items:{include:{product:!0}}}});if(!i)return null;if(!i.verificationCode){let a=n();for(let t=0;t<10&&await e.prisma.order.findUnique({where:{verificationCode:a}});t++)a=n();await e.prisma.order.update({where:{id:t},data:{verificationCode:a}}),i.verificationCode=a}return{...i,address:{name:i.address.name,phone:i.address.phone,address:i.address.address,city:i.address.city,district:i.address.district,postalCode:i.address.postalCode},items:i.items.map(t=>({quantity:t.quantity,price:t.price,product:{name:t.product.name,hasWarranty:t.product.hasWarranty||!1,warrantyPeriod:t.product.warrantyPeriod},variantInfo:t.variantInfo}))}}catch(t){return console.error("Error getting order for receipt:",t),null}}async function l(t){let i;try{let t=d().join(process.cwd(),"public","logo.png");r().existsSync(t)&&(i=`data:image/png;base64,${r().readFileSync(t).toString("base64")}`)}catch{}return J(t,await X(),i)}let c=t=>new Date(t).toLocaleDateString("en-BD",{day:"numeric",month:"long",year:"numeric"}),g=t=>{if(!t)return"-";try{let i=JSON.parse(t);return`${i.size||""}${i.color?" / "+i.color:""}`||"-"}catch{return"-"}},f=t=>`
  <button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;background:${t};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:inherit;display:flex;align-items:center;gap:8px;">📄 Download Receipt</button>
`,x=`
  @media print { 
    body { padding: 0 !important; background: white !important; } 
    .receipt { box-shadow: none !important; } 
    button { display: none !important; }
  }
`,m=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8f9fa;padding:30px;color:#333}
.receipt{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 2px 15px rgba(0,0,0,0.08)}
.header{padding:40px;border-bottom:3px solid #1a365d}
.header-content{display:flex;justify-content:space-between;align-items:flex-start}
.brand{display:flex;align-items:center;gap:12px}
.brand h1{font-size:24px;color:#1a365d}
.brand p{color:#666;font-size:12px}
.invoice-box{text-align:right}
.invoice-box h2{color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase}
.invoice-box .num{font-size:20px;font-weight:700;color:#1a365d}
.invoice-box .date{color:#666;font-size:13px;margin-top:4px}
.body{padding:40px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:30px}
.box h4{font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px;margin-bottom:8px}
.box p{margin:3px 0;font-size:14px}
.box .name{font-weight:600}
table{width:100%;border-collapse:collapse}
th{background:#f8f9fa;padding:12px;text-align:left;font-size:11px;text-transform:uppercase;color:#666;font-weight:600}
td{padding:14px 12px;border-bottom:1px solid #eee}
.totals{margin-top:24px;background:#f8f9fa;padding:24px;border-radius:4px}
.total-row{display:flex;justify-content:space-between;padding:6px 0}
.total-row.grand{font-size:20px;font-weight:700;border-top:2px solid #1a365d;padding-top:16px;margin-top:10px}
.payment{margin-top:20px;padding:16px;border:1px solid #e2e8f0;border-radius:4px;display:flex;justify-content:space-between;align-items:center}
.status{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600}
.paid{background:#dcfce7;color:#166534}
.pending{background:#fef3c7;color:#92400e}
.warranty{margin-top:16px;padding:16px;background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px}
.warranty h4{color:#166534;font-size:13px;margin-bottom:8px}
.warranty ul{padding-left:20px;color:#166534;font-size:13px}
.verify{margin-top:20px;padding:14px;background:#f1f5f9;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
.verify-code{font-family:monospace;font-size:18px;font-weight:700;letter-spacing:3px;color:#1a365d}
.footer{padding:24px 40px;background:#1a365d;color:#fff;text-align:center}
.footer p{font-size:12px;opacity:0.8}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="header-content">
      <div class="brand">
        ${i?`<img src="${i}" style="height:48px;border-radius:8px">`:'<div style="width:48px;height:48px;background:#1a365d;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px">C</div>'}
        <div><h1>Silk Mart</h1><p>Premium Fashion & Lifestyle</p></div>
      </div>
      <div class="invoice-box">
        <h2>Invoice</h2>
        <div class="num">${t.orderNumber}</div>
        <div class="date">${c(t.createdAt)}</div>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="row">
      <div class="box"><h4>Bill To</h4><p class="name">${t.address.name}</p><p>${t.user?.email||t.guestEmail||""}</p><p>${t.address.phone}</p></div>
      <div class="box"><h4>Ship To</h4><p class="name">${t.address.name}</p><p>${t.address.address}</p><p>${t.address.city}, ${t.address.district}</p></div>
    </div>
    <table><thead><tr><th>Item</th><th>Variant</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?'<br><span style="font-size:11px;color:#16a34a">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Warranty")+"</span>":""}</td><td>${g(t.variantInfo)}</td><td style="text-align:center">${t.quantity}</td><td style="text-align:right">৳${t.price.toLocaleString()}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
    </tbody></table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row" style="color:#16a34a"><span>Discount${t.couponCode?" ("+t.couponCode+")":""}</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
    <div class="payment"><div><strong>Payment:</strong> ${"cod"===t.paymentMethod?"Cash on Delivery":"Online Payment"}</div><span class="status ${"paid"===t.paymentStatus?"paid":"pending"}">${"paid"===t.paymentStatus?"✓ Paid":"Pending"}</span></div>
    ${t.items.filter(t=>t.product.hasWarranty).length>0?`<div class="warranty"><h4>🛡️ Warranty Coverage</h4><ul>${t.items.filter(t=>t.product.hasWarranty).map(t=>`<li>${t.product.name} - ${t.product.warrantyPeriod||"Warranty"}</li>`).join("")}</ul></div>`:""}
    ${t.verificationCode?`<div class="verify"><span style="font-size:12px;color:#666">Verification Code</span><span class="verify-code">${t.verificationCode}</span></div>`:""}
  </div>
  <div class="footer"><p>Thank you for shopping with Silk Mart! • support@silkmart.com</p></div>
</div>
${f("#1a365d")}
</body></html>`,b=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#fff;padding:60px;color:#111}
.receipt{max-width:700px;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:40px;border-bottom:1px solid #eee}
.brand h1{font-size:18px;font-weight:400;letter-spacing:2px}
.invoice-info{text-align:right;font-size:13px;color:#888}
.invoice-info .num{font-size:14px;color:#111;font-weight:500;margin-top:4px}
.section{padding:40px 0;border-bottom:1px solid #eee}
.section-title{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:16px}
.info-row{display:flex;gap:80px}
.info-col p{margin:2px 0;font-size:14px;font-weight:300}
.info-col .name{font-weight:500}
.items{padding:40px 0;border-bottom:1px solid #eee}
.item{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f5f5f5}
.item:last-child{border:none}
.item-name{font-weight:500;font-size:14px}
.item-details{font-size:12px;color:#888;margin-top:2px}
.item-price{font-weight:500;text-align:right}
.totals{padding:30px 0;display:flex;flex-direction:column;align-items:flex-end}
.total-row{display:flex;justify-content:space-between;width:200px;padding:6px 0;font-size:14px}
.total-row.grand{font-size:18px;font-weight:600;border-top:1px solid #111;padding-top:14px;margin-top:8px}
.meta{display:flex;justify-content:space-between;align-items:center;padding:20px 0;font-size:13px;color:#666}
.verify-code{font-family:monospace;font-size:16px;font-weight:500;letter-spacing:2px;color:#111}
.footer{text-align:center;padding-top:40px;font-size:11px;color:#999}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="brand"><h1>SILK MART</h1></div>
    <div class="invoice-info"><div>Invoice</div><div class="num">${t.orderNumber}</div><div style="margin-top:8px">${c(t.createdAt)}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Billing & Shipping</div>
    <div class="info-row">
      <div class="info-col"><p class="name">${t.address.name}</p><p>${t.address.phone}</p><p>${t.user?.email||t.guestEmail||""}</p></div>
      <div class="info-col"><p>${t.address.address}</p><p>${t.address.city}, ${t.address.district}</p></div>
    </div>
  </div>
  <div class="items">
    <div class="section-title">Items</div>
    ${t.items.map(t=>`<div class="item"><div><div class="item-name">${t.product.name}</div><div class="item-details">${g(t.variantInfo)} • Qty: ${t.quantity}${t.product.hasWarranty?" • \uD83D\uDEE1️ "+(t.product.warrantyPeriod||"Warranty"):""}</div></div><div class="item-price">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
  </div>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
    <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
    ${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
    <div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
  </div>
  <div class="meta">
    <div>${"cod"===t.paymentMethod?"Cash on Delivery":"Online Payment"} • ${"paid"===t.paymentStatus?"Paid":"Pending"}</div>
    ${t.verificationCode?`<div class="verify-code">${t.verificationCode}</div>`:""}
  </div>
  <div class="footer">CTG Collection • support@silkmart.com</div>
</div>
${f("#111")}
</body></html>`,v=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8f5f0;padding:40px;color:#3d3425}
.receipt{max-width:750px;margin:0 auto;background:#fffef9;border:1px solid #e8e0d0;box-shadow:0 4px 20px rgba(0,0,0,0.06)}
.header{padding:40px;text-align:center;border-bottom:2px solid #c9a959}
.brand h1{font-family:'Playfair Display',serif;font-size:32px;color:#5c4a2a;font-weight:500}
.brand p{color:#a08060;font-size:12px;letter-spacing:2px;margin-top:4px}
.invoice-num{display:inline-block;margin-top:20px;padding:8px 24px;border:1px solid #c9a959;color:#c9a959;font-size:12px;letter-spacing:1px}
.body{padding:40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:40px}
.info-card{padding:20px;background:#fdf9f0;border-radius:4px}
.info-card h4{font-family:'Playfair Display',serif;font-size:14px;color:#5c4a2a;margin-bottom:10px}
.info-card p{font-size:13px;margin:3px 0;color:#666}
.items{border:1px solid #e8e0d0}
.item-header{display:grid;grid-template-columns:2fr 1fr 0.5fr 1fr 1fr;background:#f8f5f0;padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999}
.item-row{display:grid;grid-template-columns:2fr 1fr 0.5fr 1fr 1fr;padding:16px;border-bottom:1px solid #f0ebe0;align-items:center}
.item-row:last-child{border:none}
.item-name{font-weight:500}
.warranty-badge{display:inline-block;font-size:10px;background:#f0fdf4;color:#166534;padding:2px 8px;border-radius:10px;margin-top:4px}
.totals{margin-top:30px;padding:24px;background:#5c4a2a;color:#fff;border-radius:4px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;opacity:0.9}
.total-row.grand{font-size:22px;font-weight:600;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:16px;margin-top:10px}
.verify{margin-top:20px;padding:16px;border:2px dashed #c9a959;text-align:center;border-radius:4px}
.verify-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px}
.verify-code{font-family:monospace;font-size:24px;font-weight:600;letter-spacing:4px;color:#c9a959;margin-top:6px}
.footer{padding:30px;text-align:center;border-top:1px solid #e8e0d0}
.footer p{font-family:'Playfair Display',serif;font-size:14px;color:#5c4a2a}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${i?`<img src="${i}" style="height:50px;margin-bottom:12px">`:""}
    <div class="brand"><h1>Silk Mart</h1><p>PREMIUM FASHION</p></div>
    <div class="invoice-num">INVOICE ${t.orderNumber}</div>
    <div style="margin-top:12px;font-size:13px;color:#888">${c(t.createdAt)}</div>
  </div>
  <div class="body">
    <div class="info-grid">
      <div class="info-card"><h4>Customer Details</h4><p><strong>${t.address.name}</strong></p><p>${t.user?.email||t.guestEmail||""}</p><p>${t.address.phone}</p></div>
      <div class="info-card"><h4>Delivery Address</h4><p><strong>${t.address.name}</strong></p><p>${t.address.address}</p><p>${t.address.city}, ${t.address.district}</p></div>
    </div>
    <div class="items">
      <div class="item-header"><span>Product</span><span>Variant</span><span style="text-align:center">Qty</span><span style="text-align:right">Price</span><span style="text-align:right">Total</span></div>
      ${t.items.map(t=>`<div class="item-row"><div><div class="item-name">${t.product.name}</div>${t.product.hasWarranty?'<div class="warranty-badge">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Warranty")+"</div>":""}</div><div>${g(t.variantInfo)}</div><div style="text-align:center">${t.quantity}</div><div style="text-align:right">৳${t.price.toLocaleString()}</div><div style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Grand Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
    ${t.verificationCode?`<div class="verify"><div class="verify-label">Verification Code</div><div class="verify-code">${t.verificationCode}</div></div>`:""}
  </div>
  <div class="footer"><p>Thank you for choosing Silk Mart</p></div>
</div>
${f("#c9a959")}
</body></html>`,h=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#e8f0fe;padding:30px;color:#333}
.receipt{max-width:800px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:0}
.header-top{padding:30px 40px;display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:12px}
.brand h1{font-size:22px;font-weight:700}
.invoice-badge{background:rgba(255,255,255,0.2);padding:8px 20px;border-radius:4px;font-weight:600}
.header-info{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,0.1);padding:16px 40px}
.header-info div{font-size:12px}
.header-info strong{display:block;font-size:14px;margin-top:4px}
.body{padding:40px}
.info-boxes{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.info-box{border:1px solid #e5e7eb;padding:20px;border-radius:8px}
.info-box h4{font-size:11px;text-transform:uppercase;color:#1e40af;letter-spacing:1px;margin-bottom:10px;border-bottom:2px solid #1e40af;padding-bottom:6px;display:inline-block}
.info-box p{margin:3px 0;font-size:13px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#1e40af;color:#fff;padding:12px;text-align:left;font-size:11px;text-transform:uppercase}
td{padding:14px 12px;border-bottom:1px solid #e5e7eb}
.totals{background:#f8fafc;padding:20px;border-radius:8px}
.total-row{display:flex;justify-content:space-between;padding:6px 0}
.total-row.grand{font-size:20px;font-weight:700;color:#1e40af;border-top:2px solid #1e40af;padding-top:12px;margin-top:8px}
.footer-info{display:flex;justify-content:space-between;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb}
.payment-status{padding:8px 16px;border-radius:4px;font-size:12px;font-weight:600}
.paid{background:#16a34a;color:#fff}
.pending{background:#f59e0b;color:#fff}
.verify-code{font-family:monospace;font-size:18px;font-weight:700;letter-spacing:3px;color:#1e40af}
.footer{background:#1e40af;color:#fff;padding:20px 40px;text-align:center;font-size:13px}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="header-top">
      <div class="brand">${i?`<img src="${i}" style="height:40px;border-radius:6px">`:""}<h1>Silk Mart</h1></div>
      <div class="invoice-badge">INVOICE</div>
    </div>
    <div class="header-info">
      <div>Invoice No.<strong>${t.orderNumber}</strong></div>
      <div>Date<strong>${c(t.createdAt)}</strong></div>
      <div>Status<strong>${t.status.charAt(0).toUpperCase()+t.status.slice(1)}</strong></div>
      <div>Payment<strong>${"paid"===t.paymentStatus?"PAID":"PENDING"}</strong></div>
    </div>
  </div>
  <div class="body">
    <div class="info-boxes">
      <div class="info-box"><h4>Bill To</h4><p><strong>${t.address.name}</strong></p><p>${t.user?.email||t.guestEmail||""}</p><p>${t.address.phone}</p></div>
      <div class="info-box"><h4>Ship To</h4><p><strong>${t.address.name}</strong></p><p>${t.address.address}</p><p>${t.address.city}, ${t.address.district}</p></div>
    </div>
    <table><thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?'<br><span style="color:#16a34a;font-size:11px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Warranty")+"</span>":""}</td><td>${g(t.variantInfo)}</td><td>${t.quantity}</td><td style="text-align:right">৳${t.price.toLocaleString()}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
    </tbody></table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row" style="color:#16a34a"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Total Due</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
    <div class="footer-info">
      <div><strong>Payment:</strong> ${"cod"===t.paymentMethod?"Cash on Delivery":"Online Payment"} <span class="payment-status ${"paid"===t.paymentStatus?"paid":"pending"}">${"paid"===t.paymentStatus?"PAID":"PENDING"}</span></div>
      ${t.verificationCode?`<div><strong>Verify:</strong> <span class="verify-code">${t.verificationCode}</span></div>`:""}
    </div>
  </div>
  <div class="footer">CTG Collection • Thank you for your business!</div>
</div>
${f("#1e40af")}
</body></html>`,y=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#fdf2f8,#faf5ff);padding:40px;color:#333}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,0.08);overflow:hidden}
.header{background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;padding:40px;text-align:center}
.brand h1{font-size:24px;font-weight:600}
.brand p{opacity:0.8;font-size:12px;margin-top:4px}
.invoice-num{display:inline-block;margin-top:16px;padding:8px 20px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:13px}
.body{padding:40px}
.info-pills{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:30px}
.pill{flex:1;min-width:200px;padding:16px 20px;background:linear-gradient(135deg,#fdf2f8,#faf5ff);border-radius:12px}
.pill-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;margin-bottom:6px}
.pill-value{font-size:14px;font-weight:500}
.items{margin-bottom:24px}
.item{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#fafafa;border-radius:12px;margin-bottom:8px}
.item-left{display:flex;align-items:center;gap:12px}
.item-icon{width:40px;height:40px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px}
.item-name{font-weight:500}
.item-meta{font-size:12px;color:#888}
.item-price{font-weight:600;font-size:15px}
.totals{background:linear-gradient(135deg,#1f2937,#374151);color:#fff;padding:24px;border-radius:16px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.8}
.total-row.grand{font-size:20px;font-weight:600;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:14px;margin-top:8px}
.verify{margin-top:20px;text-align:center;padding:16px;background:#faf5ff;border-radius:12px}
.verify-code{font-family:monospace;font-size:20px;font-weight:600;letter-spacing:3px;background:linear-gradient(135deg,#ec4899,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.footer{text-align:center;padding:24px;font-size:12px;color:#888}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${i?`<img src="${i}" style="height:50px;margin-bottom:12px;border-radius:12px">`:""}
    <div class="brand"><h1>Silk Mart</h1><p>Premium Fashion & Lifestyle</p></div>
    <div class="invoice-num">${t.orderNumber} • ${c(t.createdAt)}</div>
  </div>
  <div class="body">
    <div class="info-pills">
      <div class="pill"><div class="pill-label">Customer</div><div class="pill-value">${t.address.name}<br><span style="font-size:12px;color:#888">${t.address.phone}</span></div></div>
      <div class="pill"><div class="pill-label">Delivery</div><div class="pill-value">${t.address.city}<br><span style="font-size:12px;color:#888">${t.address.district}</span></div></div>
      <div class="pill"><div class="pill-label">Payment</div><div class="pill-value">${"cod"===t.paymentMethod?"COD":"Online"}<br><span style="font-size:12px;color:${"paid"===t.paymentStatus?"#16a34a":"#f59e0b"}">${"paid"===t.paymentStatus?"✓ Paid":"Pending"}</span></div></div>
    </div>
    <div class="items">
      ${t.items.map(t=>`<div class="item"><div class="item-left"><div class="item-icon">📦</div><div><div class="item-name">${t.product.name}</div><div class="item-meta">${g(t.variantInfo)} \xd7 ${t.quantity}${t.product.hasWarranty?" • \uD83D\uDEE1️":""}</div></div></div><div class="item-price">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
    ${t.verificationCode?`<div class="verify"><div style="font-size:11px;color:#888;margin-bottom:4px">VERIFICATION</div><div class="verify-code">${t.verificationCode}</div></div>`:""}
  </div>
  <div class="footer">Thank you for shopping! ❤️</div>
</div>
${f("#8b5cf6")}
</body></html>`,u=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;padding:40px;color:#fff}
.receipt{max-width:700px;margin:0 auto;background:#111;border:1px solid #333;overflow:hidden}
.gold-line{height:3px;background:linear-gradient(90deg,#0a0a0a,#d4af37,#0a0a0a)}
.header{padding:40px;text-align:center;background:#0a0a0a;border-bottom:1px solid #222}
.header h1{font-family:'Playfair Display',serif;font-size:32px;color:#d4af37;letter-spacing:3px}
.header p{color:#666;font-size:11px;margin-top:6px;letter-spacing:2px}
.invoice-badge{display:inline-block;margin-top:20px;padding:10px 30px;border:1px solid #d4af37;color:#d4af37;font-size:12px;letter-spacing:1px}
.body{padding:40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:36px}
.info-box{padding:20px;border:1px solid #222;background:#0a0a0a}
.info-box h4{color:#d4af37;font-size:10px;letter-spacing:2px;margin-bottom:10px}
.info-box p{color:#888;font-size:13px;line-height:1.8}
.items{margin-bottom:30px}
.item{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #222}
.item:first-child{border-top:1px solid #222}
.item-name{font-weight:500;color:#fff}
.item-meta{color:#666;font-size:12px;margin-top:4px}
.item-price{color:#d4af37;font-weight:600;font-size:16px}
.totals{background:#0a0a0a;border:1px solid #222;padding:24px}
.total-row{display:flex;justify-content:space-between;padding:8px 0;color:#888}
.total-row.grand{color:#d4af37;font-size:20px;font-family:'Playfair Display',serif;border-top:1px solid #333;padding-top:16px;margin-top:10px}
.verify{margin-top:24px;text-align:center;padding:16px;border:1px solid #333}
.verify-code{font-family:monospace;font-size:24px;letter-spacing:6px;color:#d4af37}
.footer{padding:24px;text-align:center;background:#0a0a0a;color:#444;font-size:11px;letter-spacing:1px}
${x}
</style></head><body>
<div class="receipt">
  <div class="gold-line"></div>
  <div class="header">
    ${i?`<img src="${i}" style="height:50px;margin-bottom:16px;border-radius:8px">`:""}
    <h1>SILK MART</h1>
    <p>PREMIUM FASHION & LIFESTYLE</p>
    <div class="invoice-badge">${t.orderNumber} • ${c(t.createdAt)}</div>
  </div>
  <div class="body">
    <div class="info-grid">
      <div class="info-box"><h4>CUSTOMER</h4><p><strong style="color:#fff">${t.address.name}</strong><br>${t.address.phone}<br>${t.user?.email||""}</p></div>
      <div class="info-box"><h4>DELIVERY</h4><p>${t.address.address}<br>${t.address.city}, ${t.address.district}</p></div>
    </div>
    <div class="items">
      ${t.items.map(t=>`<div class="item"><div><div class="item-name">${t.product.name}${t.product.hasWarranty?' <span style="color:#d4af37">✦</span>':""}</div><div class="item-meta">${g(t.variantInfo)} \xd7 ${t.quantity}</div></div><div class="item-price">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
    ${t.verificationCode?`<div class="verify"><div style="color:#666;font-size:10px;letter-spacing:2px;margin-bottom:8px">VERIFICATION</div><div class="verify-code">${t.verificationCode}</div></div>`:""}
  </div>
  <div class="gold-line"></div>
  <div class="footer">THANK YOU FOR YOUR PURCHASE</div>
</div>
${f("#d4af37")}
</body></html>`,$=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#fafafa;padding:40px;color:#111}
.receipt{max-width:600px;margin:0 auto;background:#fff;padding:60px 50px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.header{text-align:center;margin-bottom:50px}
.header h1{font-size:18px;font-weight:600;letter-spacing:4px;margin-bottom:4px}
.header p{color:#999;font-size:11px}
.divider{height:1px;background:#eee;margin:30px 0}
.invoice-num{text-align:center;font-size:11px;color:#666;margin-bottom:40px}
.invoice-num span{display:block;font-size:20px;font-weight:500;color:#111;margin-top:4px}
.section{margin-bottom:36px}
.section-title{font-size:9px;letter-spacing:2px;color:#999;margin-bottom:16px;text-transform:uppercase}
.info-centered{text-align:center;line-height:1.8}
.items-list{border-top:1px solid #eee;border-bottom:1px solid #eee;padding:20px 0}
.item{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #f0f0f0}
.item:last-child{border-bottom:none}
.item-name{font-weight:500}
.item-details{color:#888;font-size:12px}
.totals{padding-top:20px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;color:#666;font-size:14px}
.total-row.grand{font-size:18px;color:#111;font-weight:600;margin-top:10px;padding-top:16px;border-top:1px solid #eee}
.verify-section{text-align:center;margin-top:30px;padding:20px;background:#fafafa}
.verify-code{font-family:monospace;font-size:22px;letter-spacing:4px;font-weight:600}
.footer{text-align:center;margin-top:40px;font-size:12px;color:#999}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${i?`<img src="${i}" style="height:40px;margin-bottom:16px">`:""}
    <h1>SILK MART</h1>
    <p>Premium Fashion</p>
  </div>
  <div class="invoice-num">Invoice<span>${t.orderNumber}</span>${c(t.createdAt)}</div>
  <div class="section">
    <div class="section-title">Customer</div>
    <div class="info-centered"><strong>${t.address.name}</strong><br>${t.address.phone}</div>
  </div>
  <div class="section">
    <div class="section-title">Delivery</div>
    <div class="info-centered">${t.address.address}<br>${t.address.city}, ${t.address.district}</div>
  </div>
  <div class="items-list">
    ${t.items.map(t=>`<div class="item"><div><div class="item-name">${t.product.name}</div><div class="item-details">${g(t.variantInfo)} \xd7 ${t.quantity}${t.product.hasWarranty?" • \uD83D\uDEE1️ "+(t.product.warrantyPeriod||"Warranty"):""}</div></div><div>৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
  </div>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
    <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
    ${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
    <div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
  </div>
  ${t.verificationCode?`<div class="verify-section"><div style="color:#999;font-size:9px;letter-spacing:2px;margin-bottom:8px">VERIFICATION CODE</div><div class="verify-code">${t.verificationCode}</div></div>`:""}
  <div class="footer">Thank you for shopping with us</div>
</div>
${f("#111")}
</body></html>`,w=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#fef7e9;padding:40px;color:#3d2914}
.receipt{max-width:650px;margin:0 auto;background:#fffdf8;border:3px double #d4a373;padding:8px}
.inner{border:1px solid #e6d5b8;padding:30px}
.header{text-align:center;padding-bottom:24px;border-bottom:2px dotted #d4a373}
.header h1{font-family:'Courier Prime',monospace;font-size:28px;letter-spacing:2px}
.header p{color:#8b7355;font-size:12px;margin-top:4px}
.dotted{border-top:2px dotted #d4a373;margin:20px 0}
.info-section{display:flex;justify-content:space-between;padding:16px 0}
.info-block h4{font-family:'Courier Prime',monospace;font-size:11px;color:#8b7355;margin-bottom:6px}
.info-block p{font-size:13px}
.invoice-center{text-align:center;padding:16px 0}
.invoice-center .num{font-family:'Courier Prime',monospace;font-size:18px;font-weight:700}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{font-family:'Courier Prime',monospace;font-size:11px;text-align:left;padding:10px 0;border-bottom:2px dotted #d4a373}
td{padding:12px 0;border-bottom:1px dotted #e6d5b8;font-size:13px}
.totals{text-align:right;padding-top:16px}
.total-row{font-size:14px;padding:6px 0}
.total-row.grand{font-family:'Courier Prime',monospace;font-size:22px;font-weight:700;border-top:2px dotted #d4a373;padding-top:12px;margin-top:8px}
.verify{text-align:center;padding:16px;margin-top:16px;border:1px dashed #d4a373;background:#fef7e9}
.verify-code{font-family:'Courier Prime',monospace;font-size:20px;letter-spacing:4px}
.footer{text-align:center;padding-top:20px;color:#8b7355;font-size:12px;font-style:italic}
${x}
</style></head><body>
<div class="receipt"><div class="inner">
  <div class="header">
    ${i?`<img src="${i}" style="height:45px;margin-bottom:12px">`:""}
    <h1>SILK MART</h1>
    <p>Premium Fashion & Lifestyle</p>
  </div>
  <div class="dotted"></div>
  <div class="invoice-center"><div style="font-size:11px;color:#8b7355">INVOICE</div><div class="num">${t.orderNumber}</div><div style="font-size:12px;color:#8b7355">${c(t.createdAt)}</div></div>
  <div class="dotted"></div>
  <div class="info-section">
    <div class="info-block"><h4>BILL TO:</h4><p>${t.address.name}<br>${t.address.phone}</p></div>
    <div class="info-block" style="text-align:right"><h4>SHIP TO:</h4><p>${t.address.city}<br>${t.address.district}</p></div>
  </div>
  <table><thead><tr><th>ITEM</th><th>QTY</th><th style="text-align:right">AMOUNT</th></tr></thead><tbody>
    ${t.items.map(t=>`<tr><td>${t.product.name}${t.product.hasWarranty?' <span style="font-size:10px;color:#8b7355">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Warranty")+"</span>":""}<br><span style="color:#8b7355;font-size:11px">${g(t.variantInfo)}</span></td><td>${t.quantity}</td><td style="text-align:right">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
  </tbody></table>
  <div class="totals">
    <div class="total-row">Subtotal: ৳${t.subtotal.toLocaleString()}</div>
    <div class="total-row">Shipping: ৳${t.shippingCost.toLocaleString()}</div>
    ${t.discount>0?`<div class="total-row">Discount: -৳${t.discount.toLocaleString()}</div>`:""}
    <div class="total-row grand">TOTAL: ৳${t.total.toLocaleString()}</div>
  </div>
  ${t.verificationCode?`<div class="verify"><div style="font-size:10px;color:#8b7355;margin-bottom:6px">VERIFICATION CODE</div><div class="verify-code">${t.verificationCode}</div></div>`:""}
  <div class="footer">~ Thank you for your patronage ~</div>
</div></div>
${f("#d4a373")}
</body></html>`,z=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f0f4f8;padding:40px;color:#1e293b}
.receipt{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding:40px;border-bottom:1px solid #e2e8f0}
.brand h1{font-size:22px;font-weight:700;color:#0f172a}
.brand p{color:#64748b;font-size:11px;margin-top:2px}
.invoice-box{text-align:right}
.invoice-box .label{font-size:10px;color:#94a3b8;letter-spacing:1px}
.invoice-box .number{font-size:24px;font-weight:700;color:#0f172a;margin-top:4px}
.invoice-box .date{font-size:12px;color:#64748b;margin-top:4px}
.body{padding:40px}
.address-row{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-bottom:36px}
.address-box h4{font-size:10px;color:#94a3b8;letter-spacing:1px;margin-bottom:8px}
.address-box p{font-size:14px;line-height:1.7}
.table-header{display:grid;grid-template-columns:3fr 1fr 1fr 1fr;background:#f8fafc;padding:14px 20px;font-size:10px;font-weight:600;color:#64748b;letter-spacing:1px;border-radius:8px 8px 0 0}
.row{display:grid;grid-template-columns:3fr 1fr 1fr 1fr;padding:16px 20px;border-bottom:1px solid #f1f5f9;align-items:center}
.row:hover{background:#fafbfc}
.item-name{font-weight:500}
.item-variant{font-size:12px;color:#94a3b8}
.summary{display:flex;justify-content:flex-end;margin-top:24px}
.summary-box{min-width:280px;padding:24px;background:#0f172a;color:#fff;border-radius:12px}
.summary-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}
.summary-row.grand{font-size:20px;font-weight:600;opacity:1;border-top:1px solid #334155;padding-top:14px;margin-top:10px}
.verify-footer{display:flex;justify-content:space-between;align-items:center;margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0}
.payment-badge{padding:8px 16px;border-radius:20px;font-size:12px;font-weight:500}
.paid{background:#dcfce7;color:#166534}
.pending{background:#fef3c7;color:#92400e}
.verify-code{font-family:monospace;font-size:16px;letter-spacing:3px;font-weight:600;color:#0f172a}
.footer{text-align:center;padding:24px;background:#f8fafc;color:#64748b;font-size:12px}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="brand">${i?`<img src="${i}" style="height:40px;margin-bottom:8px">`:""}<h1>Silk Mart</h1><p>Premium Fashion & Lifestyle</p></div>
    <div class="invoice-box"><div class="label">INVOICE</div><div class="number">${t.orderNumber}</div><div class="date">${c(t.createdAt)}</div></div>
  </div>
  <div class="body">
    <div class="address-row">
      <div class="address-box"><h4>BILL TO</h4><p><strong>${t.address.name}</strong><br>${t.user?.email||""}<br>${t.address.phone}</p></div>
      <div class="address-box"><h4>SHIP TO</h4><p>${t.address.address}<br>${t.address.city}, ${t.address.district}<br>${t.address.postalCode||""}</p></div>
    </div>
    <div class="table-header"><span>DESCRIPTION</span><span>VARIANT</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
    ${t.items.map(t=>`<div class="row"><div><div class="item-name">${t.product.name}${t.product.hasWarranty?" \uD83D\uDEE1️":""}</div></div><div class="item-variant">${g(t.variantInfo)}</div><div style="text-align:center">${t.quantity}</div><div style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
    <div class="summary">
      <div class="summary-box">
        <div class="summary-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
        <div class="summary-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
        ${t.discount>0?`<div class="summary-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
        <div class="summary-row grand"><span>Total Due</span><span>৳${t.total.toLocaleString()}</span></div>
      </div>
    </div>
    <div class="verify-footer">
      <span class="payment-badge ${"paid"===t.paymentStatus?"paid":"pending"}">${"cod"===t.paymentMethod?"COD":"Paid Online"} • ${"paid"===t.paymentStatus?"✓ Paid":"Pending"}</span>
      ${t.verificationCode?`<span class="verify-code">${t.verificationCode}</span>`:""}
    </div>
  </div>
  <div class="footer">Thank you for shopping with Silk Mart • support@silkmart.com</div>
</div>
${f("#0f172a")}
</body></html>`,S=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#1e3a5f,#172554);padding:40px;color:#fff}
.receipt{max-width:700px;margin:0 auto;background:#fff;color:#1e3a5f;border-radius:2px;overflow:hidden}
.header{position:relative;padding:50px 40px;background:linear-gradient(135deg,#1e3a5f,#172554);color:#fff;text-align:center;overflow:hidden}
.monogram{position:absolute;top:-30px;left:50%;transform:translateX(-50%);font-family:'Playfair Display',serif;font-size:180px;font-weight:700;opacity:0.08;color:#fff;line-height:1}
.header-content{position:relative;z-index:1}
.header h1{font-family:'Playfair Display',serif;font-size:24px;margin-top:40px}
.header p{opacity:0.6;font-size:11px;margin-top:4px}
.badge{display:inline-block;margin-top:16px;padding:8px 24px;border:1px solid rgba(255,255,255,0.3);font-size:12px;letter-spacing:1px}
.body{padding:40px}
.info-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.card{padding:20px;background:#f8fafc;border-radius:8px}
.card h4{font-size:9px;color:#94a3b8;letter-spacing:1.5px;margin-bottom:8px}
.card p{font-size:14px}
.items{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.items-header{display:grid;grid-template-columns:2fr 1fr 1fr;padding:12px 16px;background:#f8fafc;font-size:10px;color:#64748b;font-weight:600}
.item-row{display:grid;grid-template-columns:2fr 1fr 1fr;padding:16px;border-top:1px solid #f1f5f9;align-items:center}
.totals{margin-top:24px;padding:24px;background:linear-gradient(135deg,#1e3a5f,#172554);color:#fff;border-radius:8px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}
.total-row.grand{font-size:22px;font-family:'Playfair Display',serif;font-weight:600;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:14px;margin-top:10px}
.verify{text-align:center;margin-top:20px;padding:16px;border:1px dashed #cbd5e1}
.verify-code{font-family:monospace;font-size:20px;letter-spacing:4px;color:#1e3a5f;font-weight:600}
.footer{text-align:center;padding:24px;background:#f8fafc;color:#64748b;font-size:12px}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="monogram">SM</div>
    <div class="header-content">
      ${i?`<img src="${i}" style="height:45px;margin-bottom:12px;border-radius:8px">`:""}
      <h1>Silk Mart</h1>
      <p>PREMIUM FASHION & LIFESTYLE</p>
      <div class="badge">INVOICE ${t.orderNumber}</div>
    </div>
  </div>
  <div class="body">
    <div style="text-align:center;margin-bottom:24px;color:#64748b;font-size:13px">${c(t.createdAt)}</div>
    <div class="info-cards">
      <div class="card"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
      <div class="card"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div>
    </div>
    <div class="items">
      <div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
      ${t.items.map(t=>`<div class="item-row"><div><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="font-size:10px;color:#94a3b8">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"War.")+"</span>":""}<br><span style="font-size:12px;color:#94a3b8">${g(t.variantInfo)}</span></div><div style="text-align:center">${t.quantity}</div><div style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
    ${t.verificationCode?`<div class="verify"><div style="font-size:10px;color:#94a3b8;margin-bottom:6px">VERIFICATION</div><div class="verify-code">${t.verificationCode}</div></div>`:""}
  </div>
  <div class="footer">Thank you for choosing Silk Mart</div>
</div>
${f("#1e3a5f")}
</body></html>`,k=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#f1f5f9;padding:40px}
.receipt{max-width:750px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)}
.header{background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);padding:48px 40px;color:#fff;text-align:center}
.header h1{font-size:28px;font-weight:600}.header p{opacity:0.8;font-size:12px;margin-top:4px}
.badge{display:inline-block;margin-top:16px;padding:8px 24px;background:rgba(255,255,255,0.2);border-radius:24px;font-size:12px}
.body{padding:40px}.info{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
.info-box{padding:20px;background:#f8fafc;border-radius:12px}
.info-box h4{font-size:10px;color:#94a3b8;letter-spacing:1px;margin-bottom:8px}
table{width:100%;border-collapse:collapse}th{text-align:left;padding:12px;background:#f1f5f9;font-size:11px;color:#64748b}
td{padding:14px 12px;border-bottom:1px solid #f1f5f9}
.totals{background:#0f172a;color:#fff;padding:24px;border-radius:12px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}
.total-row.grand{font-size:20px;opacity:1;border-top:1px solid #334155;padding-top:12px;margin-top:8px}
.footer{text-align:center;color:#94a3b8;padding:24px;font-size:12px}
${x}</style></head><body>
<div class="receipt">
<div class="header">${i?`<img src="${i}" style="height:45px;margin-bottom:12px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p>
<div class="badge">${t.orderNumber} • ${c(t.createdAt)}</div></div>
<div class="body"><div class="info">
<div class="info-box"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="info-box"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="font-size:10px;color:#fff;background:rgba(255,255,255,0.2);padding:2px 6px;border-radius:4px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Wty")+"</span>":""}<br><span style="color:#94a3b8;font-size:12px">${g(t.variantInfo)}</span></td><td>${t.quantity}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you! • support@silkmart.com</div>
</div>${f("#3b82f6")}</body></html>`,I=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#e5e7eb;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.1)}
.header{background:#374151;color:#fff;padding:32px;display:flex;justify-content:space-between;align-items:center}
.brand h1{font-size:20px}.brand p{opacity:0.7;font-size:11px}
.invoice-num{font-size:20px;font-weight:600}
.body{padding:32px}.row{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:24px}
.box{padding:16px;border:1px solid #e5e7eb;border-radius:6px}
.box h4{font-size:10px;color:#6b7280;margin-bottom:8px}
table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:10px;text-align:left;font-size:11px;color:#6b7280}
td{padding:12px 10px;border-bottom:1px solid #f3f4f6}
.totals{background:#374151;color:#fff;padding:20px;border-radius:6px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid #4b5563;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#9ca3af;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header"><div class="brand">${i?`<img src="${i}" style="height:32px;margin-right:10px;vertical-align:middle">`:""}
<h1 style="display:inline;vertical-align:middle">CTG Collection</h1><p>Premium Fashion</p></div>
<div class="invoice-num">${t.orderNumber}</div></div>
<div class="body"><div style="color:#6b7280;font-size:12px;margin-bottom:16px">${c(t.createdAt)}</div>
<div class="row"><div class="box"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="box"><h4>SHIPPING</h4><p>${t.address.city}, ${t.address.district}</p></div></div>
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${t.items.map(t=>`<tr><td>${t.product.name}${t.product.hasWarranty?' <span style="font-size:10px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Wty")+"</span>":""}<br><span style="color:#9ca3af;font-size:11px">${g(t.variantInfo)}</span></td><td style="text-align:center">${t.quantity}</td><td style="text-align:right">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for your order</div></div>${f("#374151")}</body></html>`,D=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:linear-gradient(135deg,#0369a1,#0284c7);padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
.header{background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;padding:36px;text-align:center}
.header h1{font-size:24px}.header p{opacity:0.8;font-size:11px;margin-top:2px}
.invoice-badge{display:inline-block;margin-top:14px;padding:8px 20px;border:1px solid rgba(255,255,255,0.3);border-radius:4px;font-size:13px}
.body{padding:36px}.cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
.card{padding:18px;background:#f0f9ff;border-radius:8px;border-left:3px solid #0284c7}
.card h4{font-size:10px;color:#0369a1;margin-bottom:6px}
.items{border:1px solid #e0f2fe;border-radius:8px;overflow:hidden}
.items-header{background:#e0f2fe;padding:12px 16px;font-size:10px;color:#0369a1;display:grid;grid-template-columns:2fr 1fr 1fr}
.item-row{padding:14px 16px;border-bottom:1px solid #e0f2fe;display:grid;grid-template-columns:2fr 1fr 1fr;align-items:center}
.totals{background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;padding:20px;border-radius:8px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#64748b;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header">${i?`<img src="${i}" style="height:40px;margin-bottom:10px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p>
<div class="invoice-badge">${t.orderNumber}</div></div>
<div class="body"><div style="text-align:center;color:#64748b;font-size:12px;margin-bottom:20px">${c(t.createdAt)}</div>
<div class="cards"><div class="card"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div></div>
<div class="items"><div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
${t.items.map(t=>`<div class="item-row"><div><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="color:#0369a1;font-size:10px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Wty")+"</span>":""}<br><span style="color:#64748b;font-size:11px">${g(t.variantInfo)}</span></div><div style="text-align:center">${t.quantity}</div><div style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for shopping!</div></div>${f("#0284c7")}</body></html>`,L=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#fdf2f8;padding:40px}
.receipt{max-width:650px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(236,72,153,0.1)}
.header{background:linear-gradient(135deg,#ec4899,#f472b6);color:#fff;padding:40px;text-align:center}
.header h1{font-family:'DM Serif Display',serif;font-size:28px;letter-spacing:1px}.header p{opacity:0.8;font-size:11px;margin-top:4px}
.body{padding:36px}
.invoice-info{text-align:center;margin-bottom:28px}.invoice-info .num{font-size:18px;font-weight:600;color:#be185d}
.cards{display:flex;gap:16px;margin-bottom:24px}
.card{flex:1;padding:18px;background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-radius:12px}
.card h4{font-size:9px;color:#be185d;letter-spacing:1px;margin-bottom:6px}
.items{margin-bottom:24px}.item{padding:14px 0;border-bottom:1px solid #fce7f3;display:flex;justify-content:space-between}
.item-name{font-weight:500}.item-meta{color:#9ca3af;font-size:11px}
.totals{background:linear-gradient(135deg,#be185d,#ec4899);color:#fff;padding:24px;border-radius:16px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#be185d;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header">${i?`<img src="${i}" style="height:40px;margin-bottom:12px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p></div>
<div class="body"><div class="invoice-info"><div style="color:#9ca3af;font-size:11px">Invoice</div>
<div class="num">${t.orderNumber}</div><div style="color:#9ca3af;font-size:12px">${c(t.createdAt)}</div></div>
<div class="cards"><div class="card"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div></div>
<div class="items">${t.items.map(t=>`<div class="item"><div><div class="item-name">${t.product.name}${t.product.hasWarranty?" \uD83D\uDEE1️":""}</div><div class="item-meta">${g(t.variantInfo)} \xd7 ${t.quantity}</div></div><div style="font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you! ♡</div></div>${f("#ec4899")}</body></html>`,T=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#ecfdf5;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(16,185,129,0.1)}
.header{background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:36px;display:flex;justify-content:space-between}
.brand h1{font-size:22px}.brand p{opacity:0.8;font-size:11px}
.invoice-box{text-align:right}.invoice-box span{display:block;opacity:0.7;font-size:11px}.invoice-box strong{font-size:18px}
.body{padding:36px}.info{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
.info-card{padding:18px;background:#f0fdf4;border-radius:8px;border-left:3px solid #10b981}
.info-card h4{color:#059669;font-size:10px;margin-bottom:6px}
table{width:100%;border-collapse:collapse}th{background:#f0fdf4;padding:12px;text-align:left;font-size:10px;color:#059669}
td{padding:14px 12px;border-bottom:1px solid #ecfdf5}
.totals{background:#065f46;color:#fff;padding:24px;border-radius:10px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.8}.total-row.grand{font-size:20px;opacity:1;border-top:1px solid #047857;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#6b7280;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header"><div class="brand">${i?`<img src="${i}" style="height:36px;margin-bottom:8px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p></div>
<div class="invoice-box"><span>Invoice</span><strong>${t.orderNumber}</strong><span>${c(t.createdAt)}</span></div></div>
<div class="body"><div class="info">
<div class="info-card"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="info-card"><h4>DELIVERY</h4><p>${t.address.city}, ${t.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="color:#059669;font-size:10px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Wty")+"</span>":""}<br><span style="color:#9ca3af;font-size:11px">${g(t.variantInfo)}</span></td><td style="text-align:center">${t.quantity}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you!</div></div>${f("#10b981")}</body></html>`,C=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
.header{background:#4c1d95;color:#fff;padding:40px;text-align:center}
.header h1{font-size:26px}.header p{opacity:0.7;font-size:11px;margin-top:4px}
.badge{display:inline-block;margin-top:16px;padding:8px 20px;background:rgba(255,255,255,0.1);border-radius:4px;font-size:13px}
.body{padding:36px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
.info-box{padding:18px;background:#faf5ff;border-radius:10px}
.info-box h4{color:#7c3aed;font-size:10px;margin-bottom:8px}
.items{border-radius:10px;overflow:hidden;border:1px solid #e9d5ff}
.items-header{background:#f3e8ff;padding:12px 16px;font-size:10px;color:#7c3aed;font-weight:600;display:grid;grid-template-columns:2fr 1fr 1fr}
.item-row{padding:14px 16px;border-bottom:1px solid #f3e8ff;display:grid;grid-template-columns:2fr 1fr 1fr}
.totals{background:#4c1d95;color:#fff;padding:24px;border-radius:12px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}.total-row.grand{font-size:20px;opacity:1;border-top:1px solid #6d28d9;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#7c3aed;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header">${i?`<img src="${i}" style="height:45px;margin-bottom:12px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p>
<div class="badge">${t.orderNumber} • ${c(t.createdAt)}</div></div>
<div class="body"><div class="info-grid">
<div class="info-box"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="info-box"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div></div>
<div class="items"><div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
${t.items.map(t=>`<div class="item-row"><div><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="font-size:10px">\uD83D\uDEE1️</span>':""}<br><span style="color:#9ca3af;font-size:11px">${g(t.variantInfo)}</span></div><div style="text-align:center">${t.quantity}</div><div style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for shopping!</div></div>${f("#7c3aed")}</body></html>`,E=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#fffbeb;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;border:2px solid #fcd34d;overflow:hidden}
.header{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;padding:36px;text-align:center}
.header h1{font-size:24px}.header p{opacity:0.8;font-size:11px;margin-top:4px}
.body{padding:36px}.invoice-row{display:flex;justify-content:space-between;padding:12px 0;margin-bottom:20px;border-bottom:2px solid #fcd34d}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.card{padding:16px;background:#fffbeb;border-radius:8px}.card h4{color:#b45309;font-size:10px;margin-bottom:6px}
table{width:100%;border-collapse:collapse}th{background:#fef3c7;padding:10px;text-align:left;font-size:11px;color:#b45309}
td{padding:12px 10px;border-bottom:1px solid #fef3c7}
.totals{background:linear-gradient(135deg,#b45309,#d97706);color:#fff;padding:22px;border-radius:10px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid #f59e0b;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#b45309;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header">${i?`<img src="${i}" style="height:40px;margin-bottom:10px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p></div>
<div class="body"><div class="invoice-row"><span style="color:#b45309">Invoice: <strong>${t.orderNumber}</strong></span><span style="color:#92400e">${c(t.createdAt)}</span></div>
<div class="cards"><div class="card"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${t.address.city}, ${t.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="color:#b45309;font-size:10px">\uD83D\uDEE1️</span>':""}<br><span style="color:#9ca3af;font-size:11px">${g(t.variantInfo)}</span></div><td style="text-align:center">${t.quantity}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you!</div></div>${f("#d97706")}</body></html>`,P=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#f1f5f9;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.header{background:#1e293b;color:#fff;padding:32px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}
.brand h1{font-size:20px}.brand p{opacity:0.6;font-size:11px}
.invoice-box{text-align:right;font-size:13px}.invoice-box strong{display:block;font-size:16px;margin-top:2px}
.body{padding:32px}.info-row{display:flex;gap:24px;margin-bottom:24px}
.info-box{flex:1;padding:16px;background:#f8fafc;border-radius:6px;border-left:3px solid #64748b}
.info-box h4{color:#64748b;font-size:10px;margin-bottom:6px}
table{width:100%;border-collapse:collapse}th{background:#f8fafc;padding:10px;text-align:left;font-size:10px;color:#64748b}
td{padding:12px 10px;border-bottom:1px solid #f1f5f9}
.totals{margin-top:20px;padding:20px;background:#1e293b;color:#fff;border-radius:6px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.7}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid #334155;padding-top:10px;margin-top:6px}
.footer{text-align:center;padding:24px;color:#94a3b8;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header"><div class="brand">${i?`<img src="${i}" style="height:32px;margin-right:10px;vertical-align:middle">`:""}
<h1 style="display:inline;vertical-align:middle">CTG Collection</h1><p>Premium Fashion</p></div>
<div class="invoice-box">${c(t.createdAt)}<strong>${t.orderNumber}</strong></div></div>
<div class="body"><div class="info-row">
<div class="info-box"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="info-box"><h4>SHIPPING</h4><p>${t.address.city}, ${t.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="font-size:10px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Wty")+"</span>":""}<br><span style="color:#94a3b8;font-size:11px">${g(t.variantInfo)}</span></td><td style="text-align:center">${t.quantity}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for your order</div></div>${f("#64748b")}</body></html>`,N=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#f0fdfa;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(20,184,166,0.1)}
.header{background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:40px;text-align:center}
.header h1{font-size:26px}.header p{opacity:0.8;font-size:11px;margin-top:4px}
.invoice-pill{display:inline-block;margin-top:14px;padding:8px 20px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:12px}
.body{padding:36px}.info-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
.card{padding:18px;background:#f0fdfa;border-radius:12px}.card h4{color:#0d9488;font-size:10px;margin-bottom:6px}
.items{border:1px solid #ccfbf1;border-radius:12px;overflow:hidden}
.items-header{background:#ccfbf1;padding:12px 16px;font-size:10px;color:#0d9488;font-weight:600;display:grid;grid-template-columns:2fr 1fr 1fr}
.item-row{padding:14px 16px;border-bottom:1px solid #ccfbf1;display:grid;grid-template-columns:2fr 1fr 1fr}
.totals{background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:24px;border-radius:14px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.8}.total-row.grand{font-size:20px;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#0d9488;font-size:12px}
${x}</style></head><body><div class="receipt">
<div class="header">${i?`<img src="${i}" style="height:42px;margin-bottom:12px">`:""}
<h1>Silk Mart</h1><p>Premium Fashion</p>
<div class="invoice-pill">${t.orderNumber} • ${c(t.createdAt)}</div></div>
<div class="body"><div class="info-cards">
<div class="card"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div></div>
<div class="items"><div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
${t.items.map(t=>`<div class="item-row"><div><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="color:#0d9488;font-size:10px">\uD83D\uDEE1️ '+(t.product.warrantyPeriod||"Wty")+"</span>":""}<br><span style="color:#94a3b8;font-size:11px">${g(t.variantInfo)}</span></div><div style="text-align:center">${t.quantity}</div><div style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you!</div></div>${f("#14b8a6")}</body></html>`,M=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:linear-gradient(180deg,#0f172a,#1e293b);padding:40px}
.receipt{max-width:720px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.gold-bar{height:4px;background:linear-gradient(90deg,#d4af37,#f5d87a,#d4af37)}
.header{background:#0f172a;color:#fff;padding:48px;text-align:center;position:relative}
.header h1{font-family:'Playfair Display',serif;font-size:32px;letter-spacing:2px;color:#d4af37}.header p{opacity:0.6;font-size:11px;margin-top:6px;letter-spacing:2px}
.badge{display:inline-block;margin-top:20px;padding:10px 28px;border:1px solid #d4af37;color:#d4af37;font-size:12px;letter-spacing:1px}
.body{padding:40px}.info{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:32px}
.info-box{padding:20px;border:1px solid #e2e8f0;border-radius:4px}.info-box h4{color:#d4af37;font-size:10px;letter-spacing:1px;margin-bottom:8px}
table{width:100%;border-collapse:collapse}th{background:#0f172a;color:#d4af37;padding:12px;text-align:left;font-size:10px;letter-spacing:1px}
td{padding:14px 12px;border-bottom:1px solid #f1f5f9}
.totals{background:#0f172a;color:#fff;padding:24px;border-radius:4px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7;font-size:14px}
.total-row.grand{font-size:22px;font-family:'Playfair Display',serif;color:#d4af37;opacity:1;border-top:1px solid #334155;padding-top:14px;margin-top:10px}
.footer{padding:28px;background:#0f172a;text-align:center;color:#64748b;font-size:11px;letter-spacing:1px}
${x}</style></head><body><div class="receipt">
<div class="gold-bar"></div>
<div class="header">${i?`<img src="${i}" style="height:50px;margin-bottom:16px">`:""}
<h1>Silk</h1><p>MART</p>
<div class="badge">${t.orderNumber}</div></div>
<div class="body"><div style="text-align:center;color:#94a3b8;font-size:12px;margin-bottom:28px">${c(t.createdAt)}</div>
<div class="info"><div class="info-box"><h4>CUSTOMER</h4><p><strong>${t.address.name}</strong><br>${t.address.phone}</p></div>
<div class="info-box"><h4>DELIVERY</h4><p>${t.address.city}<br>${t.address.district}</p></div></div>
<table><thead><tr><th>ITEM</th><th style="text-align:center">QTY</th><th style="text-align:right">AMOUNT</th></tr></thead><tbody>
${t.items.map(t=>`<tr><td><strong>${t.product.name}</strong>${t.product.hasWarranty?' <span style="color:#d4af37;font-size:10px">\uD83D\uDEE1️</span>':""}<br><span style="color:#94a3b8;font-size:11px">${g(t.variantInfo)}</span></td><td style="text-align:center">${t.quantity}</td><td style="text-align:right;font-weight:600">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
${t.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
<div class="total-row grand"><span>TOTAL</span><span>৳${t.total.toLocaleString()}</span></div></div></div>
<div class="gold-bar"></div>
<div class="footer">THANK YOU FOR CHOOSING SILK MART</div></div>${f("#d4af37")}</body></html>`,O=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8fafc;padding:40px;color:#1e293b;line-height:1.5;font-size:14px}
.receipt{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border:1px solid #e2e8f0}
.header{padding:40px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-start}
.logo-area{flex:1}
.logo-area h1{font-size:24px;font-weight:600;letter-spacing:-0.5px;color:#0f172a;margin-bottom:4px}
.logo-area p{font-size:13px;color:#64748b}
.invoice-details{text-align:right}
.invoice-details h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;font-weight:600}
.invoice-details p{font-size:16px;font-weight:500;color:#0f172a}
.meta-grid{display:grid;grid-template-columns:repeat(3,1fr);padding:30px 40px;gap:20px;border-bottom:1px solid #e2e8f0;background:#fafafa}
.meta-item h3{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;font-weight:600}
.meta-item p{font-size:14px;color:#334155;font-weight:500}
.table-container{padding:0 40px}
table{width:100%;border-collapse:collapse;margin:30px 0}
th{text-align:left;padding:12px 0;border-bottom:2px solid #0f172a;color:#0f172a;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:16px 0;border-bottom:1px solid #e2e8f0;vertical-align:top}
.item-main{display:flex;flex-direction:column;gap:4px}
.item-name{font-weight:500;color:#0f172a;font-size:14px}
.item-variant{color:#64748b;font-size:12px}
.warranty-badge{display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:11px;color:#475569;margin-top:4px;width:fit-content;border:1px solid #cbd5e1}
.totals-area{padding:0 40px 40px;display:flex;justify-content:flex-end}
.totals-box{width:300px}
.total-row{display:flex;justify-content:space-between;padding:8px 0;color:#64748b}
.grand-total{display:flex;justify-content:space-between;padding:16px 0;border-top:2px solid #0f172a;margin-top:8px;font-weight:600;font-size:18px;color:#0f172a}
.footer{text-align:center;padding:30px;background:#fafafa;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="logo-area">
      ${i?`<img src="${i}" style="height:40px;margin-bottom:16px;display:block">`:""}
      <h1>Silk Mart</h1>
      <p>Premium E-Commerce Store</p>
    </div>
    <div class="invoice-details">
      <h2>Invoice Number</h2>
      <p>${t.orderNumber}</p>
      <div style="margin-top:12px">
        <h2>Date</h2>
        <p>${c(t.createdAt)}</p>
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <h3>Billed To</h3>
      <p>${t.address.name}</p>
      <p>${t.address.phone}</p>
      <p>${t.address.address}</p>
    </div>
    <div class="meta-item">
      <h3>Shipping To</h3>
      <p>${t.address.city}, ${t.address.district}</p>
      <p>${t.address.postalCode||""}</p>
    </div>
    <div class="meta-item">
      <h3>Payment Method</h3>
      <p style="text-transform:uppercase">${"cod"===t.paymentMethod?"Cash on Delivery":t.paymentMethod}</p>
      <p>${"paid"===t.paymentStatus?"✅ PAID":"⏳ PENDING"}</p>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width:50%">Item Description</th>
          <th style="text-align:center;width:15%">Qty</th>
          <th style="text-align:right;width:15%">Price</th>
          <th style="text-align:right;width:20%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${t.items.map(t=>`
        <tr>
          <td>
            <div class="item-main">
              <span class="item-name">${t.product.name}</span>
              ${t.variantInfo?`<span class="item-variant">${g(t.variantInfo)}</span>`:""}
              ${t.product.hasWarranty?`
                <div class="warranty-badge">
                  <span>🛡️</span>
                  <span>${t.product.warrantyPeriod||"Warranty Included"}</span>
                </div>
              `:""}
            </div>
          </td>
          <td style="text-align:center">${t.quantity}</td>
          <td style="text-align:right">৳${t.price.toLocaleString()}</td>
          <td style="text-align:right;font-weight:500">৳${(t.price*t.quantity).toLocaleString()}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <div class="totals-area">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row" style="color:#16a34a"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="grand-total"><span>Total Due</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with Silk Mart</p>
    <p style="margin-top:8px">For support, contact us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL||"support@ctgcollection.com"}</p>
  </div>
</div>
${f("#0f172a")}
</body></html>`,A=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Lato',sans-serif;background:#f9f9f9;padding:60px;color:#111}
.receipt{max-width:800px;margin:0 auto;background:#fff;padding:80px;box-shadow:0 30px 60px rgba(0,0,0,0.05);position:relative}
.header{text-align:center;margin-bottom:60px;position:relative}
.brand h1{font-family:'Playfair Display',serif;font-size:36px;letter-spacing:1px;font-weight:400;margin-bottom:8px}
.brand p{font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#888}
.meta-line{display:flex;justify-content:center;gap:30px;margin-top:24px;border-top:1px solid #eee;border-bottom:1px solid #eee;padding:12px 0}
.meta-item{font-size:11px;text-transform:uppercase;letter-spacing:1px}
.meta-item span{font-weight:600;margin-left:6px}
.address-section{display:flex;justify-content:space-between;margin:60px 0;font-size:12px;line-height:1.8}
.address-col h4{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:12px;font-style:italic;font-weight:400}
.items-table{width:100%;border-collapse:collapse;margin:60px 0}
.items-table th{text-align:left;font-family:'Playfair Display',serif;font-style:italic;font-weight:400;font-size:14px;border-bottom:1px solid #111;padding-bottom:12px}
.items-table td{padding:20px 0;border-bottom:1px solid #eee;font-size:13px}
.totals-section{display:flex;justify-content:flex-end;margin-top:40px}
.totals-box{width:300px}
.totals-row{display:flex;justify-content:space-between;margin-bottom:10px;font-size:12px}
.totals-row.grand{font-size:18px;font-family:'Playfair Display',serif;border-top:1px solid #111;padding-top:16px;margin-top:10px;font-style:italic}
.footer{text-align:center;margin-top:80px;font-size:10px;letter-spacing:2px;color:#888;text-transform:uppercase}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${i?`<img src="${i}" style="height:60px;margin-bottom:20px">`:""}
    <div class="brand"><h1>Silk Mart</h1><p>Est. 2024</p></div>
    <div class="meta-line">
      <div class="meta-item">No. <span>${t.orderNumber}</span></div>
      <div class="meta-item">Date <span>${c(t.createdAt)}</span></div>
      <div class="meta-item">Status <span>${t.paymentStatus.toUpperCase()}</span></div>
    </div>
  </div>
  <div class="address-section">
    <div class="address-col">
      <h4>Billed To</h4>
      <p>${t.address.name}<br>${t.user?.email||""}<br>${t.address.phone}</p>
    </div>
    <div class="address-col" style="text-align:right">
      <h4>Shipped To</h4>
      <p>${t.address.address}<br>${t.address.city}, ${t.address.district}</p>
    </div>
  </div>
  <table class="items-table">
    <thead><tr><th>Item Description</th><th>Variant</th><th>Qty</th><th style="text-align:right">Price</th></tr></thead>
    <tbody>
      ${t.items.map(t=>`<tr><td>${t.product.name}</td><td>${g(t.variantInfo)}</td><td>${t.quantity}</td><td style="text-align:right">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="totals-section">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="totals-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="totals-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="totals-row grand"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
  </div>
  <div class="footer">Thank you for your patronage • support@silkmart.com</div>
</div>
${f("#111")}
</body></html>`,j=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Mono',monospace;background:#f0f2f5;padding:40px;color:#333}
.receipt{max-width:800px;margin:0 auto;background:#fff;border:2px solid #333;padding:20px;box-shadow:10px 10px 0px rgba(0,0,0,0.1)}
.grid-container{display:grid;grid-template-columns:repeat(12, 1fr);gap:20px;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}
.header-l{grid-column:span 8}
.header-r{grid-column:span 4;text-align:right;border-left:1px solid #333;padding-left:20px}
h1{font-size:24px;text-transform:uppercase;letter-spacing:-1px}
.label{font-size:10px;text-transform:uppercase;color:#666;margin-bottom:4px}
.value{font-size:14px;font-weight:700}
.info-section{display:grid;grid-template-columns:1fr 1fr;gap:20px;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}
.info-box{background:#f0f0f0;padding:15px;border:1px solid #333}
.items-table{width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #333}
.items-table th{background:#333;color:#fff;padding:10px;text-align:left;font-size:11px}
.items-table td{padding:12px 10px;border-bottom:1px solid #333;font-size:12px}
.item-meta{font-size:10px;color:#666}
.totals-grid{display:grid;grid-template-columns:repeat(2, 1fr);gap:20px}
.total-box{border:1px solid #333;padding:15px}
.total-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px}
.total-row.grand{font-weight:700;font-size:16px;border-top:1px dashed #333;padding-top:10px;margin-top:10px}
.footer{text-align:center;font-size:10px;margin-top:40px;border-top:1px solid #333;padding-top:10px}
${x}
</style></head><body>
<div class="receipt">
  <div class="grid-container">
    <div class="header-l">
      <h1>Silk Mart</h1>
      <p style="font-size:11px">SYSTEM GENERATED INVOICE // V.2.0</p>
    </div>
    <div class="header-r">
      <div class="label">INVOICE ID</div>
      <div class="value">#${t.orderNumber}</div>
      <div class="label" style="margin-top:10px">DATE_TIME</div>
      <div class="value">${c(t.createdAt)}</div>
    </div>
  </div>
  <div class="info-section">
    <div class="info-box"><div class="label">CLIENT_DATA</div><div>${t.address.name}</div><div>${t.address.phone}</div></div>
    <div class="info-box"><div class="label">DESTINATION</div><div>${t.address.address}</div><div>${t.address.city}, ${t.address.district}</div></div>
  </div>
  <table class="items-table">
    <thead><tr><th>ITEM_SPEC</th><th>VARIANT_ID</th><th>QTY_UNIT</th><th style="text-align:right">COST_CALC</th></tr></thead>
    <tbody>
      ${t.items.map(t=>`<tr><td>${t.product.name}${t.product.hasWarranty?" [WARRANTY_ACTIVE]":""}</td><td>${g(t.variantInfo)}</td><td>${t.quantity}</td><td style="text-align:right">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="totals-grid">
    <div>
      <div class="label">PAYMENT_STATUS</div>
      <div class="value" style="color:${"paid"===t.paymentStatus?"#000":"red"}">${t.paymentStatus.toUpperCase()}</div>
      <div class="label" style="margin-top:10px">METHOD</div>
      <div class="value">${"cod"===t.paymentMethod?"CASH_ON_DELIVERY":"DIGITAL_PAYMENT"}</div>
    </div>
    <div class="total-box">
      <div class="total-row"><span>SUB_TOTAL</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>SHIPPING_FEE</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row"><span>PROMO_DISC</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>FINAL_TOTAL</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
  </div>
  <div class="footer">END OF TRANSMISSION // SILK MART SYSTEMS</div>
</div>
${f("#333")}
</body></html>`,q=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Montserrat:wght@300;400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Montserrat',sans-serif;background:#1a1a1a;padding:50px;color:#f0f0f0}
.receipt{max-width:750px;margin:0 auto;background:#111;color:#d4af37;padding:60px 80px;box-shadow:0 20px 40px rgba(0,0,0,0.5);border:1px solid #333}
.header{text-align:center;margin-bottom:60px;position:relative}
.header:after{content:'';display:block;width:40px;height:2px;background:#d4af37;margin:30px auto 0}
.brand h1{font-family:'Bodoni Moda',serif;font-size:42px;letter-spacing:2px;font-weight:400;color:#fff}
.invoice-num{text-align:center;font-size:12px;letter-spacing:4px;color:#888;margin-bottom:50px}
.info-row{display:flex;justify-content:space-between;margin-bottom:60px;font-size:12px;color:#aaa;line-height:2}
.items-list{margin-bottom:60px;border-top:1px solid #333;border-bottom:1px solid #333}
.item-row{padding:25px 0;display:flex;justify-content:space-between;align-items:center}
.item-row:not(:last-child){border-bottom:1px solid #222}
.item-name{font-family:'Bodoni Moda',serif;font-size:18px;color:#fff;margin-bottom:4px}
.item-meta{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666}
.totals{text-align:right}
.total-row{display:flex;justify-content:flex-end;gap:40px;margin-bottom:12px;font-size:13px;color:#888}
.total-row.grand{font-size:24px;font-family:'Bodoni Moda',serif;color:#d4af37;margin-top:20px}
.footer{text-align:center;margin-top:80px;font-size:9px;letter-spacing:3px;color:#555}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${i?`<img src="${i}" style="height:50px;margin-bottom:20px;filter:invert(1)">`:""}
    <h1>Silk Mart</h1>
  </div>
  <div class="invoice-num">No. ${t.orderNumber} • ${c(t.createdAt)}</div>
  <div class="info-row">
    <div>
      <div style="color:#d4af37;margin-bottom:10px">PREPARED FOR</div>
      <div>${t.address.name}</div>
      <div>${t.address.city}</div>
    </div>
    <div style="text-align:right">
      <div style="color:#d4af37;margin-bottom:10px">DELIVERY TO</div>
      <div>${t.address.address}</div>
      <div>${t.address.district}</div>
    </div>
  </div>
  <div class="items-list">
    ${t.items.map(t=>`<div class="item-row"><div><div class="item-name">${t.product.name}</div><div class="item-meta">${g(t.variantInfo)} / QTY ${t.quantity}${t.product.hasWarranty?" • \uD83D\uDEE1️ WTY INCL":""}</div></div><div style="font-size:16px">৳${(t.price*t.quantity).toLocaleString()}</div></div>`).join("")}
  </div>
  <div class="totals">
    <div class="total-row"><span>SUBTOTAL</span><span>৳${t.subtotal.toLocaleString()}</span></div>
    <div class="total-row"><span>SHIPPING</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
    ${t.discount>0?`<div class="total-row"><span>DISCOUNT</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
    <div class="total-row grand"><span>TOTAL</span><span>৳${t.total.toLocaleString()}</span></div>
  </div>
  <div class="footer">AUTHENTIC LUXURY • SILK MART</div>
</div>
${f("#d4af37")}
</body></html>`,R=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Roboto',sans-serif;background:#f3f6f8;padding:40px;color:#1e293b}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.shield-header{background:#0e7490;color:#fff;padding:30px;display:flex;justify-content:space-between;align-items:center}
.shield-title h1{font-size:24px;font-weight:700;display:flex;align-items:center;gap:10px}
.trust-badge{background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px}
.verified-bar{background:#0891b2;color:#fff;padding:10px 30px;font-size:12px;display:flex;justify-content:space-between;font-weight:500}
.body{padding:30px}
.warranty-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.w-box{border:1px solid #e2e8f0;padding:15px;border-radius:8px;position:relative}
.w-box h4{font-size:11px;color:#64748b;margin-bottom:5px;text-transform:uppercase}
.w-box-icon{position:absolute;top:15px;right:15px;color:#cbd5e1;font-size:20px}
.product-item{background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:12px;border:1px solid #e2e8f0}
.p-header{display:flex;justify-content:space-between;margin-bottom:8px}
.p-name{font-weight:600;font-size:14px}
.p-price{font-weight:700}
.p-warranty{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#166534;background:#dcfce7;padding:4px 10px;border-radius:4px;margin-top:8px}
.totals-area{background:#ecfeff;padding:20px;border-radius:8px;margin-top:20px;border:1px solid #cffafe}
.t-row{display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px}
.t-row.final{font-weight:700;font-size:18px;color:#0e7490;border-top:1px solid #a5f3fc;padding-top:10px;margin-top:10px}
.footer{text-align:center;padding:20px;font-size:12px;color:#64748b}
${x}
</style></head><body>
<div class="receipt">
  <div class="shield-header">
    <div class="shield-title">
       ${i?`<img src="${i}" style="height:36px;border-radius:4px">`:""}
       <span>Silk Mart</span>
    </div>
    <div class="trust-badge">🛡️ Verified Purchase</div>
  </div>
  <div class="verified-bar">
    <span>Pass ID: ${t.verificationCode||"N/A"}</span>
    <span>Date: ${c(t.createdAt)}</span>
  </div>
  <div class="body">
    <div class="warranty-grid">
       <div class="w-box"><h4>Customer</h4><div style="font-weight:500">${t.address.name}</div><div>${t.address.phone}</div><div class="w-box-icon">👤</div></div>
       <div class="w-box"><h4>Delivery</h4><div>${t.address.city}, ${t.address.district}</div><div class="w-box-icon">📍</div></div>
    </div>
    <div class="items-list">
      <h3 style="font-size:12px;color:#64748b;margin-bottom:12px;text-transform:uppercase">Product Manifest</h3>
      ${t.items.map(t=>`
        <div class="product-item">
          <div class="p-header">
            <span class="p-name">${t.product.name}</span>
            <span class="p-price">৳${(t.price*t.quantity).toLocaleString()}</span>
          </div>
          <div style="font-size:12px;color:#64748b">${g(t.variantInfo)} x ${t.quantity}</div>
          ${t.product.hasWarranty?`<div class="p-warranty">🛡️ Covered: ${t.product.warrantyPeriod||"Standard Warranty"}</div>`:""}
        </div>
      `).join("")}
    </div>
    <div class="totals-area">
       <div class="t-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
       <div class="t-row"><span>Shipping & Handling</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
       ${t.discount>0?`<div class="t-row" style="color:#059669"><span>Promotional Savings</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
       <div class="t-row final"><span>Amount Paid</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
  </div>
  <div class="footer">Thank you for shopping with Silk Mart. All warranty claims require this receipt.</div>
</div>
${f("#0e7490")}
</body></html>`,Y=(t,i)=>`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Jost',sans-serif;background:#fff;padding:50px;color:#2c3e50}
.receipt{max-width:700px;margin:0 auto;position:relative}
.sidebar{position:absolute;top:0;left:-20px;bottom:0;width:5px;background:#e74c3c}
.header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:60px}
h1{font-family:'Dancing Script',cursive;font-size:48px;color:#e74c3c;line-height:1}
.invoice-label{font-weight:600;letter-spacing:1px;font-size:14px}
.invoice-id{font-size:24px;font-weight:300}
.grid{display:grid;grid-template-columns:1fr 1.5fr;gap:40px;margin-bottom:50px}
.col-label{font-size:11px;color:#95a5a6;text-transform:uppercase;margin-bottom:8px;letter-spacing:1px}
.col-content{font-size:15px;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:40px}
th{text-align:left;font-weight:500;color:#95a5a6;font-size:12px;padding:15px 0;border-bottom:1px solid #eee}
td{padding:20px 0;border-bottom:1px solid #f9f9f9;font-size:15px}
.t-price{text-align:right;font-weight:500}
.grand-box{background:#fdf2f1;padding:30px;border-radius:0 20px 0 20px;width:300px;margin-left:auto}
.grand-row{display:flex;justify-content:space-between;margin-bottom:10px}
.grand-total{font-size:24px;color:#e74c3c;font-weight:600;border-top:2px solid #edc2be;padding-top:15px;margin-top:10px}
.sign-area{margin-top:60px;text-align:right}
.sign-line{display:inline-block;width:200px;border-top:1px solid #ccc;padding-top:10px;text-align:center;font-size:12px;color:#95a5a6}
.signature{font-family:'Dancing Script',cursive;font-size:24px;color:#e74c3c;display:block;margin-bottom:-10px}
.footer{margin-top:50px;font-size:10px;color:#bdc3c7;text-align:center}
${x}
</style></head><body>
<div class="receipt">
  <div class="sidebar"></div>
  <div class="header">
    <div>
      <h1>Silk Mart</h1>
      <div style="font-size:12px;color:#7f8c8d;margin-top:5px;margin-left:5px">boutique collection</div>
    </div>
    <div style="text-align:right">
      <div class="invoice-label">INVOICE</div>
      <div class="invoice-id">#${t.orderNumber}</div>
    </div>
  </div>
  <div class="grid">
     <div>
       <div class="col-label">Billed To</div>
       <div class="col-content">${t.address.name}<br>${t.address.phone}</div>
       <div class="col-label" style="margin-top:20px">Date</div>
       <div class="col-content">${c(t.createdAt)}</div>
     </div>
     <div>
       <div class="col-label">Shipping Details</div>
       <div class="col-content">${t.address.address}<br>${t.address.city}, ${t.address.district}</div>
       <div class="col-text" style="font-size:13px;color:#7f8c8d;margin-top:10px">${t.user?.email||""}</div>
     </div>
  </div>
  <table>
    <thead><tr><th>Item Name</th><th>Variant</th><th>Qty</th><th class="t-price">Price</th></tr></thead>
    <tbody>
      ${t.items.map(t=>`<tr><td>${t.product.name}${t.product.hasWarranty?' <span style="font-size:10px;color:#e74c3c">\uD83D\uDEE1️</span>':""}</td><td style="color:#7f8c8d;font-size:13px">${g(t.variantInfo)}</td><td>${t.quantity}</td><td class="t-price">৳${(t.price*t.quantity).toLocaleString()}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="grand-box">
     <div class="grand-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
     <div class="grand-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
     ${t.discount>0?`<div class="grand-row"><span>Discount</span><span>-৳${t.discount.toLocaleString()}</span></div>`:""}
     <div class="grand-row grand-total"><span>Total</span><span>৳${t.total.toLocaleString()}</span></div>
  </div>
  <div class="sign-area">
    <span class="signature">Silk Mart</span>
    <div class="sign-line">Authorized Signature</div>
  </div>
  <div class="footer">Thank you for choosing Silk Mart. We appreciate your business.</div>
</div>
${f("#e74c3c")}
</body></html>`,W=(t,i)=>m(t,i).replace(/#1a365d/g,"#10b981").replace(/#fff/g,"#ecfdf5"),U=(t,i)=>m(t,i).replace(/#1a365d/g,"#27272a").replace(/#fff/g,"#fafafa"),V=(t,i)=>v(t,i).replace(/#b8860b/g,"#b45309").replace(/#fffef5/g,"#fef3c7"),F=(t,i)=>k(t,i).replace(/#3b82f6/g,"#0369a1").replace(/#8b5cf6/g,"#38bdf8"),Q=(t,i)=>I(t,i).replace(/#374151/g,"#44403c").replace(/#e5e7eb/g,"#fafaf9"),H=(t,i)=>b(t,i).replace(/#111/g,"#cbd5e1").replace(/#333/g,"#94a3b8"),_=(t,i)=>m(t,i).replace(/#1a365d/g,"#dc2626"),B=(t,i)=>m(t,i).replace(/#1a365d/g,"#1e40af"),G=(t,i)=>b(t,i).replace(/#111/g,"#94a3b8").replace(/#333/g,"#64748b"),K=(t,i)=>`
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Receipt ${t.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:30px;color:#333}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.3)}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:35px 40px;display:flex;justify-content:space-between;align-items:center}
.brand{color:#fff}
.brand h1{font-size:28px;font-weight:700;margin-bottom:4px}
.brand h1 span{font-weight:400;font-style:italic}
.brand p{font-size:13px;opacity:0.9}
.order-box{background:rgba(255,255,255,0.2);padding:12px 20px;border-radius:10px;text-align:center;backdrop-filter:blur(10px)}
.order-box small{color:rgba(255,255,255,0.8);font-size:10px;text-transform:uppercase;letter-spacing:1px}
.order-box p{color:#fff;font-size:14px;font-weight:700;margin-top:4px}
.body{padding:35px 40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:25px;margin-bottom:30px}
.info-section{background:#f8fafc;border-radius:12px;padding:20px;border-left:4px solid #667eea}
.info-section h4{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#667eea;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.info-section p{font-size:14px;margin:4px 0;color:#374151}
.info-section .name{font-weight:600;font-size:16px;color:#1f2937}
.payment-badge{display:inline-flex;align-items:center;gap:6px;background:#10b981;color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;margin-top:8px}
table{width:100%;border-collapse:collapse;margin:24px 0}
th{background:#f1f5f9;padding:14px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:600}
td{padding:16px 12px;border-bottom:1px solid #e2e8f0;font-size:14px}
td:last-child{text-align:right;font-weight:600;color:#667eea}
.product-name{font-weight:600;color:#1f2937}
.variant{font-size:12px;color:#94a3b8}
.totals{background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);padding:24px;border-radius:12px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px}
.total-row.grand{font-size:20px;font-weight:700;color:#667eea;border-top:2px solid #e2e8f0;padding-top:16px;margin-top:10px}
.footer{padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0}
.footer h3{font-size:18px;font-weight:700;color:#1f2937;margin-bottom:4px}
.footer p{color:#667eea;font-size:13px}
.email{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:15px;font-size:13px;color:#64748b}
.disclaimer{font-size:11px;color:#94a3b8;margin-top:10px}
${x}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="brand">
      ${i?`<img src="${i}" style="height:45px;margin-bottom:8px;border-radius:8px">`:""}
      <h1>SILK <span>MART</span></h1>
      <p>Premium Fashion & Lifestyle</p>
    </div>
    <div class="order-box">
      <small>Order Number</small>
      <p>${t.orderNumber}</p>
    </div>
  </div>
  
  <div class="body">
    <div class="info-grid">
      <div class="info-section">
        <h4>📋 Order Details</h4>
        <p>${c(t.createdAt)}</p>
        <p>Payment: 💳 ${"cod"===t.paymentMethod?"Cash on Delivery":"Online Payment"}</p>
        <div class="payment-badge">✓ ${"paid"===t.paymentStatus?"Payment Confirmed":"Payment Pending"}</div>
      </div>
      <div class="info-section">
        <h4>📍 Delivery Address</h4>
        <p class="name">${t.address.name}</p>
        <p>${t.address.phone}</p>
        <p>${t.address.address}</p>
        <p>${t.address.city}, ${t.address.district}${t.address.postalCode?" - "+t.address.postalCode:""}</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Variant</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${t.items.map(t=>`
          <tr>
            <td class="product-name">${t.product.name}${t.product.hasWarranty?' <span style="font-size:10px;color:#667eea">\uD83D\uDEE1️</span>':""}</td>
            <td class="variant">${g(t.variantInfo)}</td>
            <td style="text-align:center">${t.quantity}</td>
            <td style="text-align:right">৳${t.price.toLocaleString()}</td>
            <td>৳${(t.price*t.quantity).toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${t.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${t.shippingCost.toLocaleString()}</span></div>
      ${t.discount>0?`<div class="total-row"><span>Discount</span><span style="color:#10b981">-৳${t.discount.toLocaleString()}</span></div>`:""}
      <div class="total-row grand"><span>Grand Total</span><span>৳${t.total.toLocaleString()}</span></div>
    </div>
  </div>
  
  <div class="footer">
    <h3>Silk Mart</h3>
    <p>Thank you for shopping with us!</p>
    <div class="email">📧 support@silkmart.com</div>
    <p class="disclaimer">This is a computer-generated receipt. No signature required.</p>
  </div>
</div>
${f("#667eea")}
</body></html>`;function J(t,i="1",a){switch(i){case"1":default:return m(t,a);case"2":return b(t,a);case"3":return v(t,a);case"4":return h(t,a);case"5":return y(t,a);case"6":return u(t,a);case"7":return $(t,a);case"8":return w(t,a);case"9":return z(t,a);case"10":return S(t,a);case"11":return k(t,a);case"12":return I(t,a);case"13":return D(t,a);case"14":return L(t,a);case"15":return T(t,a);case"16":return C(t,a);case"17":return E(t,a);case"18":return P(t,a);case"19":return N(t,a);case"20":return M(t,a);case"21":return O(t,a);case"22":return A(t,a);case"23":return j(t,a);case"24":return q(t,a);case"25":return R(t,a);case"26":return Y(t,a);case"27":return W(t,a);case"28":return U(t,a);case"29":return V(t,a);case"30":return F(t,a);case"31":return Q(t,a);case"32":return H(t,a);case"33":return _(t,a);case"34":return B(t,a);case"35":return G(t,a);case"36":return K(t,a)}}async function X(){try{let t=await e.prisma.siteSetting.findUnique({where:{key:"receiptTemplate"}});return t?.value||"1"}catch{return"1"}}async function Z(t){try{let i;let a=await e.prisma.order.findUnique({where:{id:t},include:{address:!0,user:{select:{name:!0,email:!0}},items:{include:{product:!0}}}});if(!a)return null;if(!a.verificationCode){let i=n();for(let t=0;t<10&&await e.prisma.order.findUnique({where:{verificationCode:i}});t++)i=n();await e.prisma.order.update({where:{id:t},data:{verificationCode:i}}),a.verificationCode=i}let o={...a,address:{name:a.address.name,phone:a.address.phone,address:a.address.address,city:a.address.city,district:a.address.district,postalCode:a.address.postalCode},items:a.items.map(t=>({quantity:t.quantity,price:t.price,product:{name:t.product.name,hasWarranty:t.product.hasWarranty||!1,warrantyPeriod:t.product.warrantyPeriod},variantInfo:t.variantInfo}))};try{let t=d().join(process.cwd(),"public","logo.png");r().existsSync(t)&&(i=`data:image/png;base64,${r().readFileSync(t).toString("base64")}`)}catch{}let s=await X(),p=J(o,s,i),l=d().join(process.cwd(),"public","receipts");r().existsSync(l)||r().mkdirSync(l,{recursive:!0});let c=`receipt-${a.orderNumber}.html`;return r().writeFileSync(d().join(l,c),p),await e.prisma.order.update({where:{id:t},data:{receiptUrl:`/receipts/${c}`}}),`/receipts/${c}`}catch(t){return console.error("Error generating receipt:",t),null}}}};