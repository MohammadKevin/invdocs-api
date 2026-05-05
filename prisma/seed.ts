import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const email = 'admin@mail.com';
  const passwordPlain = 'admin123';

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('⚠️ Super admin sudah ada, skip...');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
      role: Role.super_admin,
    },
  });

  console.log('✅ Super admin berhasil dibuat');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', passwordPlain);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
