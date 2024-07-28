import { PrismaClient } from '@prisma/client';
import { counselors, tester } from './initial';

const prisma = new PrismaClient();

const seed = async () => {
  // Upsert counselors
  for (const counselor of counselors) {
    await prisma.counselor.upsert({
      where: {
        id: counselor.id,
      },
      update: {
        ...counselor,
      },
      create: {
        ...counselor,
      },
    });
  }
  // Upser tester
  await prisma.user.upsert({
    where: {
      id: '80c13bb7-0b78-4eba-aef0-9b8e64f6ea43',
    },
    create: {
      ...tester,
    },
    update: {
      ...tester,
    },
  });
};

seed();
