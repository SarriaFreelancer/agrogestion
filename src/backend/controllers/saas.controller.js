import prisma from '../database/prisma.js';

export const getMigrationStats = async (req, res) => {
  try {
    const migratedCompaniesCount = await prisma.company.count();

    const legacyClients = [
      { codigo: 'C001', nombre: 'AgroIndustrias del Norte', plan: 'PRO', estado: 'Activo', base_datos: 'agro_norte_db' },
      { codigo: 'C002', nombre: 'Finca El Paraíso', plan: 'BASIC', estado: 'Activo', base_datos: 'finca_paraiso_prod' }
    ];

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
    
    const legacyClient = { 
      codigo: clientCode || 'C001', 
      nombre: 'AgroIndustrias del Norte', 
      plan: 'PRO', 
      estado: 'Activo' 
    };

    const newCompany = await prisma.company.upsert({
      where: { name: legacyClient.nombre },
      update: {}, 
      create: {
        name: legacyClient.nombre,
        planId: legacyClient.plan,
        status: legacyClient.estado === 'Activo' ? 'ACTIVE' : 'INACTIVE',
        databaseName: `tenant_${legacyClient.codigo.toLowerCase()}`,
        databaseType: 'SHARED',
      }
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
