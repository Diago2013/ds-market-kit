// DS Market Kit Seed — minimal starter data
// Replace with your own products!

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin account
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: '管理员',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin account created: admin@example.com / admin123');

  // Create a demo product (customize or remove)
  await prisma.product.upsert({
    where: { slug: 'starter-template' },
    update: {},
    create: {
      name: '网站源码模板',
      slug: 'starter-template',
      description: '一个完整可用的网站模板，包含前后端、数据库、支付系统等全套功能。适合快速启动你的数字产品业务。',
      price: 1999,          // cents — ¥19.99
      currency: 'cny',
      category: 'templates',
      imageUrl: '',
      stock: 9999,
      stripePriceId: '',
      isPublished: true,
    },
  });
  console.log('✅ Demo product created: 网站源码模板 ¥19.99');
  console.log('');
  console.log('🚀 DS Market Kit is ready! Run `npm run dev` to start.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
