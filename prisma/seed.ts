// eslint-disable-next-line @typescript-eslint/no-require-imports
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Super admin
  const existing = await prisma.admin.findUnique({ where: { email: 'admin@hajj.com' } });
  if (!existing) {
    const hashed = await bcrypt.hash('Admin@123456', 10);
    const admin = await prisma.admin.create({
      data: {
        full_name: 'Super Admin',
        email: 'admin@hajj.com',
        password: hashed,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ Super admin created:', admin.email);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Sample hajj package
  // const pkg = await prisma.package.upsert({
  //   where: { package_id: BigInt(1) },
  //   update: {},
  //   create: {
  //     package_title: 'باقة الحج المميزة 2025',
  //     package_type: 'HAJJ',
  //     category: 'VIP',
  //     description: 'باقة حج شاملة مع إقامة فندقية 5 نجوم',
  //     duration_days: 21,
  //     price_per_person: 15000,
  //     max_participants: 50,
  //   },
  // });
  // console.log('✅ Package created:', pkg.package_title);

  // Sample umrah package
//   const pkg2 = await prisma.package.upsert({
//     where: { package_id: BigInt(2) },
//     update: {},
//     create: {
//       package_title: 'باقة العمرة الاقتصادية',
//       package_type: 'UMRAH',
//       category: 'ECONOMY',
//       description: 'باقة عمرة بأسعار مناسبة',
//       duration_days: 10,
//       price_per_person: 5000,
//       max_participants: 30,
//     },
//   });
//   console.log('✅ Package created:', pkg2.package_title);
 }

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
