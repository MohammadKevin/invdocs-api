const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const email = 'admin@mail.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: Role.super_admin,
    },
  });

  console.log('✅ Seed selesai');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());