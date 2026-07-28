import prisma from '../../database/prisma.js';

export const getClients = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
        users: true,
        server: true
      }
    });
    
    // Mapear al formato esperado por el frontend si es necesario
    const formattedClients = companies.map(c => ({
      id: c.id,
      nit: c.nit || '',
      name: c.name,
      pais: c.country || 'Colombia',
      ciudad: c.city || '',
      status: c.status,
      estado: c.status === 'ACTIVE' ? 'Activa' : 'Inactiva',
      plan: c.planId || 'Basico',
      planId: c.planId,
      maxUsuarios: c.maxUsers || 10,
      maxPlantas: c.maxPlantas || 2,
      modulosPrincipales: c.modulosPrincipales || ['Dashboard'],
      modulosConfiguracion: c.modulosConfiguracion || ['Usuarios'],
      createdAt: c.createdAt
    }));
    
    res.json({ success: true, data: formattedClients });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const createClient = async (req, res) => {
  try {
    const { 
      nit, name, pais, ciudad, estado, plan, 
      maxUsuarios, maxPlantas, modulosPrincipales, modulosConfiguracion 
    } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: 'El nombre es obligatorio.' });
    
    const newCompany = await prisma.company.create({
      data: {
        nit,
        name,
        country: pais || 'Colombia',
        city: ciudad,
        planId: plan || 'Basico',
        maxUsers: parseInt(maxUsuarios) || 10,
        maxPlantas: parseInt(maxPlantas) || 2,
        modulosPrincipales: modulosPrincipales || ['Dashboard'],
        modulosConfiguracion: modulosConfiguracion || ['Usuarios'],
        status: estado === 'Activa' ? 'ACTIVE' : 'INACTIVE',
      }
    });
    
    res.json({ success: true, message: 'Empresa creada.', data: newCompany });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const updateClient = async (req, res) => {
  try {
    const { 
      nit, name, pais, ciudad, estado, plan, 
      maxUsuarios, maxPlantas, modulosPrincipales, modulosConfiguracion 
    } = req.body;
    
    const company = await prisma.company.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    const updated = await prisma.company.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nit: nit !== undefined ? nit : company.nit,
        name: name !== undefined ? name : company.name,
        country: pais !== undefined ? pais : company.country,
        city: ciudad !== undefined ? ciudad : company.city,
        planId: plan !== undefined ? plan : company.planId,
        maxUsers: maxUsuarios !== undefined ? parseInt(maxUsuarios) : company.maxUsers,
        maxPlantas: maxPlantas !== undefined ? parseInt(maxPlantas) : company.maxPlantas,
        modulosPrincipales: modulosPrincipales !== undefined ? modulosPrincipales : company.modulosPrincipales,
        modulosConfiguracion: modulosConfiguracion !== undefined ? modulosConfiguracion : company.modulosConfiguracion,
        status: estado ? (estado === 'Activa' ? 'ACTIVE' : 'INACTIVE') : company.status
      }
    });

    res.json({ success: true, message: 'Empresa actualizada.', data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const deleteClient = async (req, res) => {
  try {
    await prisma.company.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Cliente eliminado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const updateClientDbConfig = async (req, res) => {
  try {
    const { databaseEngine, databaseName, databaseUser, databasePassword, connectionData } = req.body;
    
    const company = await prisma.company.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { server: true }
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    if (company.server) {
      await prisma.server.update({
        where: { id: company.server.id },
        data: {
          engine: databaseEngine === 'SQL Server' ? 'SQLSERVER' : (databaseEngine === 'PostgreSQL' ? 'POSTGRESQL' : 'MYSQL'),
          host: connectionData?.server || company.server.host,
          port: parseInt(connectionData?.port) || company.server.port,
          username: databaseUser || connectionData?.username || company.server.username,
          password: databasePassword || connectionData?.password || company.server.password
        }
      });
    }

    const updated = await prisma.company.update({
      where: { id: parseInt(req.params.id) },
      data: { databaseName },
      include: { server: true }
    });
    
    res.json({ success: true, message: 'Configuración de base de datos actualizada.', data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
