import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  // 1. Crear el rol SUPERADMIN si no existe
  let superadminRole = await prisma.role.findUnique({
    where: { name: 'SUPERADMIN' }
  });

  if (!superadminRole) {
    superadminRole = await prisma.role.create({
      data: { name: 'SUPERADMIN' }
    });
    console.log('Rol SUPERADMIN creado.');
  }

  // 2. Crear el rol ADMIN si no existe
  let adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' }
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { name: 'ADMIN' }
    });
    console.log('Rol ADMIN creado.');
  }

  // 3. Crear el rol USER si no existe
  let userRole = await prisma.role.findUnique({
    where: { name: 'USER' }
  });

  if (!userRole) {
    userRole = await prisma.role.create({
      data: { name: 'USER' }
    });
    console.log('Rol USER creado.');
  }

  // 4. Crear el usuario superadmin si no existe
  const superadminEmail = 'superadmin@sarriatech.com';
  let superadmin = await prisma.user.findUnique({
    where: { email: superadminEmail }
  });

  if (!superadmin) {
    superadmin = await prisma.user.create({
      data: {
        email: superadminEmail,
        password: 'Superadmin123', // En un ambiente real, esto debe estar hasheado con bcrypt
        name: 'Super Administrador',
        roleId: superadminRole.id
      }
    });
    console.log('Usuario superadmin creado exitosamente.');
  } else {
    // Asegurarse de que tenga el rol correcto
    if (superadmin.roleId !== superadminRole.id) {
      await prisma.user.update({
        where: { id: superadmin.id },
        data: { roleId: superadminRole.id }
      });
      console.log('Rol de superadmin actualizado.');
    } else {
      console.log('Usuario superadmin ya existía.');
    }
  }

  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
