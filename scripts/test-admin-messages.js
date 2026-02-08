
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminMessages() {
  console.log('🚀 Testing Admin Message Creation...');

  try {
    // 1. Find an Admin
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      console.log('⚠️ No admin user found. Creating dummy missing item message without user link.');
    } else {
      console.log(`✅ Found Admin: ${admin.email}`);
    }

    // 2. Create ContactMessage
    const message = await prisma.contactMessage.create({
      data: {
        name: 'Test Bot',
        email: 'bot@test.com',
        subject: 'TEST: Missing Item Alert',
        message: 'This is a test message to verify the Admin Alert system.',
        isRead: false
      }
    });
    console.log(`✅ ContactMessage Created! ID: ${message.id}`);

    // 3. Create Notification (if admin exists)
    if (admin) {
      const notif = await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'stock_alert',
          title: 'TEST: Missing Item',
          message: 'Test notification for missing item.',
          link: '/admin/messages'
        }
      });
      console.log(`✅ Notification Created! ID: ${notif.id}`);
    }

    console.log('\n🎉 DB Write Test Passed!');

    // Cleanup
    await prisma.contactMessage.delete({ where: { id: message.id } });
    console.log('🧹 Cleaned up test message.');

  } catch (e) {
    console.error('❌ Error testing admin messages:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminMessages();
