export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      if (!user.role || !user.role.name) {
        return res.status(403).json({ success: false, message: 'El usuario no tiene un rol asignado' });
      }

      // Si el usuario es SUPERADMIN, tiene acceso total
      if (user.role.name === 'SUPERADMIN') {
        return next();
      }

      // Validamos si el rol del usuario está en los permitidos
      if (!allowedRoles.includes(user.role.name)) {
        return res.status(403).json({ success: false, message: 'No tienes permisos suficientes para realizar esta acción' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error interno validando permisos' });
    }
  };
};
