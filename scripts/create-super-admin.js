// scripts/create-super-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // تحقق من عدم وجود super admin من قبل
  const existing = await prisma.admin.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (existing) {
    console.log('⚠️  Super Admin already exists:', existing.email);
    console.log('   إذا كنت نسيت كلمة السر، احذفه يدوياً من pgAdmin ثم شغّل السكريبت');
    return;
  }

  const email = 'super@hajj.com';
  const plainPassword = 'SuperAdmin@2026';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      full_name: 'Super Admin',
      email: email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      is_active: true,
    },
  });

  console.log('✅ Super Admin created successfully!');
  console.log('   Email:    ', admin.email);
  console.log('   Password: ', plainPassword);
  console.log('   Role:     ', admin.role);
  console.log('');
  console.log('⚠️  احفظ كلمة السر في مكان آمن وغيّرها بعد أول تسجيل دخول');
}

main()
  .catch((error) => {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });