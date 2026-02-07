"use strict";exports.id=6119,exports.ids=[6119],exports.modules={36119:(e,t,o)=>{o.r(t),o.d(t,{sendAccountDeactivatedEmail:()=>u,sendAccountDeletedEmail:()=>m,sendAccountReactivatedEmail:()=>h,sendEmailWithAttachments:()=>d,sendLoyaltyUpdateEmail:()=>p,sendNewOrderSellerEmail:()=>y,sendOrderConfirmation:()=>a,sendOrderConfirmationWithPDF:()=>s,sendOrderStatusUpdate:()=>l,sendPayoutStatusEmail:()=>x,sendReceiptEmail:()=>i,sendRefundStatusEmail:()=>f,sendRoleChangeEmail:()=>g,sendShippingNotification:()=>n,sendTierUpdateEmail:()=>c});let r=o(55245).createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});async function a(e){let t=e.items.map(e=>`
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${e.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${e.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${e.price.toFixed(2)}</td>
    </tr>
  `).join(""),o=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .order-number { background: #f7f7f7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .order-number span { font-size: 24px; font-weight: bold; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7f7f7; padding: 12px; text-align: left; }
        .totals { background: #f7f7f7; padding: 15px; border-radius: 8px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { font-size: 20px; font-weight: bold; color: #667eea; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed</h1>
          <p>Thank you for shopping with CTG Collection</p>
        </div>
        
        <div class="content">
          <p>Hi ${e.customerName},</p>
          <p>Great news! Your order has been confirmed and is being processed.</p>
          
          <div class="order-number">
            <p style="margin: 0; color: #666;">Order Number</p>
            <span>${e.orderNumber}</span>
          </div>
          
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${t}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>৳${e.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Shipping:</span>
              <span>৳${e.shipping.toFixed(2)}</span>
            </div>
            ${e.discount>0?`
            <div class="totals-row" style="color: green;">
              <span>Discount:</span>
              <span>-৳${e.discount.toFixed(2)}</span>
            </div>
            `:""}
            <div class="totals-row total-final">
              <span>Total:</span>
              <span>৳${e.total.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Delivery Address</h3>
          <p style="background: #f7f7f7; padding: 15px; border-radius: 8px;">${e.address}</p>
          
          <h3>Payment Method</h3>
          <p><span style="display:inline-block; width:10px; height:10px; background-color:${"cod"===e.paymentMethod?"#f59e0b":"#10b981"}; border-radius:50%; margin-right:5px; vertical-align:middle;"></span>${"cod"===e.paymentMethod?"Cash on Delivery":"Paid Online"}</p>
          
          <center>
            <a href="https://silkmartbd.com/dashboard/orders" class="button">
              View Your Orders
            </a>
          </center>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at ctgcollection2@gmail.com</p>
          <p>\xa9 ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{return await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER||"noreply@ctgcollection.com"}>`,to:e.to,subject:`Order Confirmed - ${e.orderNumber}`,html:o}),console.log(`Order confirmation email sent to ${e.to}`),!0}catch(e){return console.error("Failed to send email:",e),!1}}async function n(e,t,o){let a=`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .tracking { background: #f7f7f7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #11998e; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Order Has Shipped</h1>
        </div>
        <div class="content">
          <p>Great news! Order <strong>${t}</strong> is on its way to you.</p>
          
          <div class="tracking">
            <p style="margin: 0 0 10px; color: #666;">Tracking Number</p>
            <div class="tracking-number">${o}</div>
          </div>
          
          <p>You can track your package using the tracking number above.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{return await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER||"noreply@ctgcollection.com"}>`,to:e,subject:`Your Order Has Shipped - ${t}`,html:a}),!0}catch(e){return console.error("Failed to send shipping email:",e),!1}}async function i(e){let t=`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Receipt is Ready</h1>
        </div>
        <div class="content">
          <p>Hi ${e.customerName},</p>
          <p>Thank you for your purchase! Your payment has been confirmed.</p>
          <p>Please find your receipt attached to this email. You can also download it from your dashboard.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-weight: bold; color: #166534;">Order: ${e.orderNumber}</p>
            <p style="margin: 5px 0 0; color: #15803d;">✓ Payment Confirmed</p>
          </div>
          
          <center>
            <a href="https://silkmartbd.com/dashboard/orders" class="button">
              View Order Details
            </a>
          </center>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>Questions? Contact us at ctgcollection2@gmail.com</p>
          <p>\xa9 ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,a=[];if(e.receiptPath){let t=o(92048),r=o(55315),n=e.receiptPath.startsWith("/")?e.receiptPath.slice(1):e.receiptPath,i=r.join(process.cwd(),"public",n);if(console.log("Attempting to attach receipt from:",i),t.existsSync(i)){let o=t.readFileSync(i,"utf8");a.push({filename:`Receipt-${e.orderNumber}.html`,content:o,contentType:"text/html"}),console.log("Receipt file attached successfully")}else console.log("Receipt file not found at path:",i),e.receiptHtml&&(a.push({filename:`Receipt-${e.orderNumber}.html`,content:e.receiptHtml,contentType:"text/html"}),console.log("Using receipt HTML content as fallback"))}else e.receiptHtml&&(a.push({filename:`Receipt-${e.orderNumber}.html`,content:e.receiptHtml,contentType:"text/html"}),console.log("Using receipt HTML content directly"));console.log("Total attachments:",a.length);try{return await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER||"noreply@ctgcollection.com"}>`,to:e.to,subject:`Your Receipt - Order ${e.orderNumber}`,html:t,attachments:a.length>0?a:void 0}),console.log(`Receipt email sent to ${e.to} with ${a.length} attachment(s)`),!0}catch(e){return console.error("Failed to send receipt email:",e),!1}}async function d(e){try{let t=Array.isArray(e.to)?e.to.join(", "):e.to;return await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER||"noreply@ctgcollection.com"}>`,to:t,subject:e.subject,html:e.html,attachments:e.attachments||[]}),!0}catch(e){return console.error("Failed to send email with attachments:",e),!1}}async function s(e){let t=e.items.map(e=>`
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${e.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${e.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${e.price.toFixed(2)}</td>
    </tr>
  `).join(""),o=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .order-number { background: #f7f7f7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .order-number span { font-size: 24px; font-weight: bold; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7f7f7; padding: 12px; text-align: left; }
        .totals { background: #f7f7f7; padding: 15px; border-radius: 8px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { font-size: 20px; font-weight: bold; color: #667eea; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .pdf-notice { background: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .pdf-notice p { margin: 0; color: #2e7d32; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed</h1>
          <p>Thank you for shopping with CTG Collection</p>
        </div>
        
        <div class="content">
          <p>Hi ${e.customerName},</p>
          <p>Great news! Your order has been confirmed and is being processed.</p>
          
          <div class="pdf-notice">
            <p><strong>Your Receipt is attached to this email</strong></p>
          </div>
          
          <div class="order-number">
            <p style="margin: 0; color: #666;">Order Number</p>
            <span>${e.orderNumber}</span>
          </div>
          
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${t}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>৳${e.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Shipping:</span>
              <span>৳${e.shipping.toFixed(2)}</span>
            </div>
            ${e.discount>0?`
            <div class="totals-row" style="color: green;">
              <span>Discount:</span>
              <span>-৳${e.discount.toFixed(2)}</span>
            </div>
            `:""}
            <div class="totals-row total-final">
              <span>Total:</span>
              <span>৳${e.total.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Delivery Address</h3>
          <p style="background: #f7f7f7; padding: 15px; border-radius: 8px;">${e.address}</p>
          
          <h3>Payment Method</h3>
          <p><span style="display:inline-block; width:10px; height:10px; background-color:${"cod"===e.paymentMethod?"#f59e0b":"#10b981"}; border-radius:50%; margin-right:5px; vertical-align:middle;"></span>${"cod"===e.paymentMethod?"Cash on Delivery":"Paid Online"}</p>
          
          <center>
            <a href="https://silkmartbd.com/dashboard/orders" class="button">
              View Your Orders
            </a>
          </center>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at ctgcollection2@gmail.com</p>
          <p>\xa9 ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,a=[];e.pdfBuffer&&e.pdfBuffer.length>0?(a.push({filename:`Receipt-${e.orderNumber}.pdf`,content:e.pdfBuffer,contentType:"application/pdf"}),console.log("PDF attachment added, size:",e.pdfBuffer.length,"bytes")):e.htmlContent&&(a.push({filename:`Receipt-${e.orderNumber}.html`,content:e.htmlContent,contentType:"text/html"}),console.log("HTML receipt attachment added, length:",e.htmlContent.length));try{return await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER||"noreply@ctgcollection.com"}>`,to:e.to,subject:`Order Confirmed - ${e.orderNumber} 📎 Receipt Attached`,html:o,attachments:a}),console.log(`Order confirmation with PDF sent to ${e.to}, attachments: ${a.length}`),!0}catch(e){return console.error("Failed to send order confirmation with PDF:",e),!1}}async function l(e,t){let o={processing:{subject:`Order #${t.orderNumber} is Processing`,title:"Order Processing",body:"Your order is being processed and will be shipped soon."},shipped:{subject:`Order #${t.orderNumber} has Shipped!`,title:"Order Shipped",body:"Great news! Your order is on its way."},delivered:{subject:`Order #${t.orderNumber} Delivered`,title:"Order Delivered",body:"Your order has been delivered. We hope you enjoy your purchase!"},cancelled:{subject:`Order #${t.orderNumber} Cancelled`,title:"Order Cancelled",body:"Your order has been cancelled."},confirmed:{subject:`Order #${t.orderNumber} Confirmed`,title:"Order Confirmed",body:"Your order has been confirmed and we are preparing it."},pending:{subject:`Order #${t.orderNumber} Pending`,title:"Order Pending",body:"Your order is currently pending."}}[t.status]||{subject:`Order #${t.orderNumber} Update`,title:"Order Update",body:`Your order status has been updated to ${t.status}.`},a={processing:"#3b82f6",shipped:"#8b5cf6",delivered:"#10b981",cancelled:"#ef4444",pending:"#f59e0b",confirmed:"#10b981"}[t.status]||"#666666",n=t.message?`
    <div style="background-color: #f8f9fa; border-left: 4px solid ${a}; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #555;"><strong>Note from Admin:</strong></p>
      <p style="margin: 5px 0 0 0;">${t.message}</p>
    </div>
  `:"",i=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${a}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 5px 15px; background: ${a}20; color: ${a}; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: ${a}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body style="background-color: #f5f5f5;">
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">${o.title}</h1>
        </div>
        <div class="content">
          <p>Hi ${t.customerName},</p>
          <div style="text-align: center;">
            <div class="status-badge">${t.status.toUpperCase()}</div>
          </div>
          <p>${o.body}</p>
          
          ${n}
          
          <div style="text-align: center;">
            <a href="https://silkmartbd.com/dashboard/orders" class="button">View Order</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let t=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:o.subject,html:i});return console.log("Order status email sent:",t.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function c(e,t){let o={Bronze:"background: linear-gradient(135deg, #df8944 0%, #a0522d 100%); box-shadow: 0 4px 6px -1px rgba(160, 82, 45, 0.4);",Silver:"background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%); box-shadow: 0 4px 6px -1px rgba(156, 163, 175, 0.4); color: #374151;",Gold:"background: linear-gradient(135deg, #fbbf24 0%, #b45309 100%); box-shadow: 0 4px 6px -1px rgba(180, 83, 9, 0.4);",Platinum:"background: linear-gradient(135deg, #e0e7ff 0%, #6366f1 100%); box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);"}[t.tierName]||"background: linear-gradient(135deg, #3b82f6, #1d4ed8);",a="Bronze"===t.tierName?"#a0522d":"Silver"===t.tierName?"#4b5563":"Gold"===t.tierName?"#b45309":"#4338ca",n=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { ${o} color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
        .tier-badge { display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 10px 0; backdrop-filter: blur(5px); }
        .button { display: inline-block; padding: 12px 24px; background: ${a}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
        .benefits { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: left; }
        .benefits h3 { margin-top: 0; }
        .benefits ul { padding-left: 20px; }
        .benefits li { margin-bottom: 5px; }
      </style>
    </head>
    <body style="background-color: #f5f5f5;">
      <div class="container">
        <div class="header">
          <h1>Congratulations!</h1>
          <p>You've reached a new level</p>
          <div class="tier-badge">${t.tierName} Member</div>
        </div>
        <div class="content">
          <p>Hi ${t.customerName},</p>
          <p>We are thrilled to inform you that your membership status has been upgraded to <strong>${t.tierName}</strong>!</p>
          
          <p>This exclusive status unlocks new privileges designed just for you.</p>
          
          ${t.benefits&&t.benefits.length>0?`
          <div class="benefits">
            <h3>Your ${t.tierName} Benefits:</h3>
            <ul>
              ${t.benefits.map(e=>`<li>${e}</li>`).join("")}
            </ul>
          </div>
          `:""}
          
          <div style="text-align: center;">
            <a href="https://silkmartbd.com/dashboard" class="button">View My Benefits</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let o=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:`Welcome to ${t.tierName} Membership!`,html:n});return console.log("Tier update email sent:",o.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function p(e,t){let o=t.points>0,a=o?"#10b981":"#f59e0b",n=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${a}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
        .points-badge { font-size: 32px; font-weight: bold; margin: 10px 0; color: ${a}; }
        .button { display: inline-block; padding: 12px 24px; background: ${a}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body style="background-color: #f5f5f5;">
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">${t.type}</h1>
        </div>
        <div class="content">
          <p>Hi ${t.customerName},</p>
          <div style="text-align: center;">
            <div class="points-badge">${o?"+":""}${t.points} Points</div>
            <p style="font-size: 18px; font-weight: 500;">${t.message||(o?"Added to your wallet!":"Redeemed from your wallet")}</p>
          </div>
          
          <p>Use your points to get discounts on your next purchase!</p>
          
          <div style="text-align: center;">
            <a href="https://silkmartbd.com/dashboard/loyalty" class="button">Check Balance</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let o=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:`You got ${t.points} points! - ${t.type}`,html:n});return console.log("Loyalty email sent:",o.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function g(e,t){let o={customer:"Customer",seller:"Seller",admin:"Admin",superadmin:"Super Admin"}[t.newRole]||t.newRole,a=["admin","seller","superadmin"].includes(t.newRole)&&"customer"===t.oldRole,n=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${a?"#10b981":"#6366f1"} 0%, ${a?"#059669":"#4f46e5"} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .role-badge { display: inline-block; background: ${a?"#dcfce7":"#e0e7ff"}; color: ${a?"#166534":"#4338ca"}; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${a?"Congratulations!":"Account Update"}</h1>
          <p>${a?"You have been promoted!":"Your role has changed"}</p>
        </div>
        <div class="content">
          <p>Dear ${t.customerName},</p>
          ${a?"<p>We are thrilled to inform you that you have been <strong>promoted</strong> to a new role on CTG Collection!</p>":"<p>Your account role has been updated.</p>"}
          
          <div style="text-align: center;">
            <p>Your new role:</p>
            <span class="role-badge">${o}</span>
          </div>
          
          ${a?`
            <p>As a ${o}, you now have access to additional features and responsibilities. We trust you will continue to be an excellent member of our team!</p>
          `:""}
          
          <p>If you have any questions about your new role, please don't hesitate to contact us.</p>
          
          <div style="text-align: center;">
            <a href="https://silkmartbd.com/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for being part of CTG Collection!</p>
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let t=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:a?`Congratulations! You've been promoted to ${o}`:"Your account role has been updated",html:n});return console.log("Role change email sent:",t.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function u(e,t){let o=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Temporarily Deactivated</h1>
        </div>
        <div class="content">
          <p>Dear ${t},</p>
          <p>We regret to inform you that your account on CTG Collection has been temporarily deactivated.</p>
          <p>This may have occurred due to:</p>
          <ul>
            <li>A review of account activity</li>
            <li>Administrative action</li>
            <li>Your request</li>
          </ul>
          <p>If you believe this was done in error or would like to discuss reactivating your account, please contact our support team.</p>
          <p>We value your membership and hope to welcome you back soon.</p>
        </div>
        <div class="footer">
          <p>Need help? Contact us at support@ctgcollection.com</p>
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let t=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:"Your CTG Collection Account Has Been Deactivated",html:o});return console.log("Deactivation email sent:",t.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function h(e,t){let o=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome Back!</h1>
          <p>Your account has been reactivated</p>
        </div>
        <div class="content">
          <p>Dear ${t},</p>
          <p>Great news! Your account on CTG Collection has been reactivated. You can now log in and access all features.</p>
          <p>We're happy to have you back!</p>
          <div style="text-align: center;">
            <a href="https://silkmartbd.com/login" class="button">Log In Now</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let t=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:"Welcome Back! Your CTG Collection Account is Reactivated",html:o});return console.log("Reactivation email sent:",t.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function m(e,t){let o=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Removed</h1>
        </div>
        <div class="content">
          <p>Dear ${t},</p>
          <p>We're writing to confirm that your account on CTG Collection has been removed from our system.</p>
          <p>All your personal data has been deleted in accordance with our privacy policy.</p>
          <p>If you did not request this action or believe this was done in error, please contact our support team immediately.</p>
          <p>We're sorry to see you go. If you ever wish to return, you're always welcome to create a new account.</p>
          <p>Thank you for having been part of our community.</p>
        </div>
        <div class="footer">
          <p>Questions? Contact us at support@ctgcollection.com</p>
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;try{let t=await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER}>`,to:e,subject:"Your CTG Collection Account Has Been Removed",html:o});return console.log("Account deleted email sent:",t.messageId),!0}catch(e){return console.error("Email sending failed:",e),!1}}async function b(e){try{return await r.sendMail({from:`"CTG Collection" <${process.env.SMTP_USER||"noreply@ctgcollection.com"}>`,...e}),!0}catch(e){return console.error("Email failed:",e),!1}}async function f(e,t,o,r){return b({to:e,subject:`Refund Request ${o} - Order #${t}`,html:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Refund Request Update</h2>
      <p>Your refund request for Order <strong>#${t}</strong> has been <strong>${o}</strong>.</p>
      ${r?`<p><strong>Admin Note:</strong> ${r}</p>`:""}
      <p>If you have any questions, please contact support.</p>
    </div>
  `})}async function x(e,t,o,r){return b({to:e,subject:`Payout Request ${o}`,html:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${"paid"===o?"green":"#2563eb"};">Payout Update</h2>
      <p>Your payout request for <strong>${t} BDT</strong> has been <strong>${o}</strong>.</p>
      ${r?`<p><strong>Note:</strong> ${r}</p>`:""}
      <p>Check your wallet dashboard for more details.</p>
    </div>
  `})}async function y(e,t,o){return b({to:e,subject:`New Order Received! #${t}`,html:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: green;">New Order! 🎉</h2>
      <p>You have received a new order <strong>#${t}</strong>.</p>
      <p>Estimated Earnings: <strong>${o} BDT</strong></p>
      <p>Please login to your dashboard to process this order.</p>
    </div>
  `})}}};