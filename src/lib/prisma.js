// MOCK DE PRISMA CLIENT PARA ENTORNO DE DESARROLLO SIN INTERNET/PERMISOS
// Debido a que Prisma 7 no pudo ejecutar sus motores nativos en tu máquina local
// y bloqueó el arranque del servidor, he creado este mock temporal para que puedas
// visualizar el frontend y continuar el desarrollo.

export const prisma = {
  company: {
    count: async () => 0,
    findMany: async () => [],
    upsert: async (args) => ({ id: 1, ...args.create }),
  },
  server: {
    findMany: async () => [],
  }
};

const globalForPrisma = globalThis;
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
