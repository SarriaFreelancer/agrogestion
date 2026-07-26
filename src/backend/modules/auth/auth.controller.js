import prisma from '../../database/prisma.js';
import { resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../core/constants/schemas.js';
import sql from 'mssql';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-development-only';

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan credenciales' });

  try {
    // 1. Verificar si es un usuario administrador global
    const globalUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true, company: true }
    });

    if (globalUser && globalUser.role?.name === 'SUPERADMIN') {
      // Comparación temporal sin hash si el sistema antiguo no usaba hash para superadmins
      // En un sistema real esto usaría bcrypt.compare()
      if (globalUser.password === password) {
        
        // Generar Token JWT
        const token = jwt.sign({ id: globalUser.id, role: globalUser.role.name }, JWT_SECRET, { expiresIn: '12h' });

        // Guardar sesión
        await prisma.userSession.create({
          data: {
            userId: globalUser.id,
            token,
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
          }
        });

        return res.json({
          success: true,
          token,
          user: {
            id: globalUser.id,
            nombres: globalUser.firstName,
            apellidos: globalUser.lastName,
            correo: globalUser.email,
            rol: globalUser.role.name
          },
          isGlobalAdmin: true
        });
      }
    }

    // 2. Si no es admin global o si tiene un tenant asignado
    if (globalUser && globalUser.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: globalUser.companyId },
        include: { server: true }
      });

      if (!company) {
        return res.status(404).json({ success: false, message: 'El tenant asociado no existe.' });
      }

      if (company.status === 'INACTIVE') {
        return res.status(403).json({ success: false, message: 'El cliente está suspendido.' });
      }

      // 3. Conectarse a la BD del cliente y verificar la contraseña (legacy system fallback)
      // Esto se mantiene para compatibilidad con bases de datos antiguas de clientes
      const server = company.server;
      const connectionData = {
        server: server?.host,
        port: server?.port,
        username: server?.username,
        password: server?.password
      };
      
      const actualEngine = server?.engine || 'MYSQL';
      
      let isValid = false;
      let userData = null;

      try {
        if (actualEngine === 'MYSQL') {
          const conn = await getMySqlConnection(connectionData, company.databaseName);
          const [rows] = await conn.execute(`SELECT * FROM usuarios WHERE correo = ?`, [email]);
          await conn.end();
          if (rows.length && rows[0].contrasena === password) {
            isValid = true;
            userData = rows[0];
          }
        } else if (actualEngine === 'SQLSERVER') {
          const pool = await sql.connect(getSqlServerConfig(connectionData, company.databaseName));
          const request = pool.request();
          request.input('correo', email);
          const result = await request.query(`SELECT * FROM usuarios WHERE correo = @correo`);
          await sql.close();
          if (result.recordset.length && result.recordset[0].contrasena === password) {
            isValid = true;
            userData = result.recordset[0];
          }
        }
      } catch (err) {
        console.warn("Fallo al conectar a DB de tenant:", err.message);
      }

      if (isValid && userData) {
        // Generar JWT
        const token = jwt.sign({ id: globalUser.id, role: globalUser.role?.name || 'USER', tenant: company.id }, JWT_SECRET, { expiresIn: '12h' });

        await prisma.userSession.create({
          data: {
            userId: globalUser.id,
            token,
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
          }
        });

        return res.json({
          success: true,
          token,
          user: {
            id: globalUser.id,
            nombres: globalUser.firstName,
            apellidos: globalUser.lastName,
            correo: globalUser.email,
            rol: globalUser.role?.name,
            tenantId: company.id
          },
          client: {
            id: company.id,
            name: company.name,
            databaseEngine: company.server?.engine,
            databaseName: company.databaseName
          },
          isGlobalAdmin: false
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Usuario no encontrado o contraseña incorrecta' });

  } catch (error) {
    console.error('Error en /api/login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

export const directorio = async (req, res) => {
  try {
    const { correo, cliente_codigo } = req.body;
    if (!correo || !cliente_codigo) return res.status(400).json({ success: false, message: 'Faltan datos.' });
    
    // Convertir de viejo formato a Prisma
    const company = await prisma.company.findFirst({ where: { name: cliente_codigo } });
    if(!company) return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });

    let user = await prisma.user.findUnique({ where: { email: correo }});
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: correo,
          firstName: correo.split('@')[0],
          lastName: '',
          password: '',
          companyId: company.id
        }
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id }
      });
    }

    res.json({ success: true, message: 'Usuario registrado en directorio global con Prisma.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
