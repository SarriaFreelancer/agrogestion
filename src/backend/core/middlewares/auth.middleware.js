import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-development-only';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificamos si el usuario y la sesión aún existen
    const userSession = await prisma.userSession.findUnique({
      where: { token },
      include: { user: { include: { role: true } } }
    });

    if (!userSession || userSession.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Sesión expirada o inválida' });
    }

    // Guardamos el usuario en request
    req.user = userSession.user;
    req.session = userSession;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};
