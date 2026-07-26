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
      name: c.name,
      databaseEngine: c.server?.engine || '',
      databaseName: c.databaseName || '',
      status: c.status,
      planId: c.planId,
      createdAt: c.createdAt
    }));
    
    res.json({ success: true, data: formattedClients });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const createClient = async (req, res) => {
  try {
    const { name, databaseEngine, databaseName, databaseUser, databasePassword, connectionData, planId } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: 'El nombre es obligatorio.' });
    
    // Crear el servidor para este cliente o buscar uno existente si la arquitectura fuera diferente
    const newServer = await prisma.server.create({
      data: {
        name: `Server-${name}`,
        engine: databaseEngine === 'SQL Server' ? 'SQLSERVER' : (databaseEngine === 'PostgreSQL' ? 'POSTGRESQL' : 'MYSQL'),
        host: connectionData?.server || 'localhost',
        port: parseInt(connectionData?.port) || 3306,
        username: databaseUser || connectionData?.username || '',
        password: databasePassword || connectionData?.password || ''
      }
    });

    const newCompany = await prisma.company.create({
      data: {
        name,
        planId: planId || 'BASIC',
        databaseName: databaseName || '',
        status: 'ACTIVE',
        serverId: newServer.id
      }
    });
    
    res.json({ success: true, message: 'Cliente creado.', data: newCompany });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const updateClient = async (req, res) => {
  try {
    const { name, databaseEngine, databaseName, databaseUser, databasePassword, connectionData, status, planId } = req.body;
    
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
      data: {
        name,
        databaseName,
        status: status === 'Activo' ? 'ACTIVE' : (status || company.status),
        planId: planId || company.planId
      }
    });

    res.json({ success: true, message: 'Cliente actualizado.', data: updated });
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
