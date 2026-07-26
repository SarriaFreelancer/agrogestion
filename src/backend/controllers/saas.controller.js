import { prisma } from '../../utils/prisma.js';
import { logActivity } from '../../utils/audit.js';

// Simularemos la importación de la conexión a la base de datos antigua
// En tu servidor actual, usarías getMySqlConnection o similar para consultar los clientes
export const getMigrationStats = async (req, res) => {
  try {
    // 1. Contar empresas en el sistema SaaS (Prisma)
    const migratedCompaniesCount = await prisma.company.count();

    // 2. Aquí iría la consulta a tu tabla antigua 'clientes'
    // Para propósitos de esta implementación, devolveremos un mock basado
    // en la estructura de tu server.js actual
    const legacyClients = [
      { codigo: 'C001', nombre: 'AgroIndustrias del Norte', plan: 'PRO', estado: 'Activo', base_datos: 'agro_norte_db' },
      { codigo: 'C002', nombre: 'Finca El Paraíso', plan: 'BASIC', estado: 'Activo', base_datos: 'finca_paraiso_prod' }
    ];

    // Cruzar información para ver cuáles ya están migradas
    const migratedCompanies = await prisma.company.findMany({ select: { name: true } });
    const migratedNames = new Set(migratedCompanies.map(c => c.name));

    const pendingClients = legacyClients.filter(c => !migratedNames.has(c.nombre));

    res.json({
      success: true,
      data: {
        legacyTotal: legacyClients.length,
        migratedTotal: migratedCompaniesCount,
        pendingTotal: pendingClients.length,
        legacyClients: legacyClients.map(c => ({
          ...c,
          isMigrated: migratedNames.has(c.nombre)
        }))
      }
    });
  } catch (error) {
    console.error("Error en getMigrationStats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const runMigration = async (req, res) => {
  try {
    const { clientCode } = req.body;

    // Aquí consultarías tu BD antigua para obtener los datos reales del cliente
    // const [legacyClient] = await oldDb.query('SELECT * FROM clientes WHERE codigo = ?', [clientCode]);
    
    // Mock de los datos del cliente antiguo para el ejemplo
    const legacyClient = { 
      codigo: clientCode || 'C001', 
      nombre: 'AgroIndustrias del Norte', 
      plan: 'PRO', 
      estado: 'Activo' 
    };

    // Crear la empresa en el nuevo modelo Multi-Tenant
    const newCompany = await prisma.company.upsert({
      where: { name: legacyClient.nombre },
      update: {}, // Si ya existe, no hace nada
      create: {
        name: legacyClient.nombre,
        planId: legacyClient.plan,
        status: legacyClient.estado === 'Activo' ? 'ACTIVE' : 'INACTIVE',
        databaseName: `tenant_${legacyClient.codigo.toLowerCase()}`,
        databaseType: 'SHARED',
      }
    });

    // Opcional: Crear el usuario administrador de esa empresa si no existe
    // ...

    // Registrar en auditoría
    await logActivity(req, {
      module: 'SaaS',
      action: 'MIGRATE',
      entity: 'Company',
      entityId: newCompany.id,
      description: `Migración exitosa del cliente monolítico ${legacyClient.codigo}`,
      newValues: newCompany
    });

    res.json({ success: true, message: 'Migración completada con éxito', company: newCompany });
  } catch (error) {
    console.error("Error en runMigration:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getServers = async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      include: {
        _count: {
          select: { companies: true }
        }
      }
    });
    res.json({ success: true, data: servers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
