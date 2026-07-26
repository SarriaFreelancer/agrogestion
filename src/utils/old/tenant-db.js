/**
 * Helpers para Inyección del Tenant en Express
 * Esto reemplaza al getSessionCompanyId() de Next.js, 
 * esperando que el middleware de Express haya inyectado req.user
 */

/**
 * Inyecta automáticamente { companyId } en cláusulas WHERE de Prisma
 * basado en el req.user inyectado por tu middleware de autenticación.
 */
export function withTenantWhere(req, whereClause = {}) {
  // Si no hay usuario, lanzamos error (protección básica)
  if (!req.user) throw new Error('No autorizado: Sesión inválida.');
  
  // Si es SUPERADMIN, no filtramos por companyId (ve todo)
  if (req.user.role === 'SUPERADMIN') {
    return whereClause;
  }
  
  const companyId = req.user.companyId;
  if (!companyId) throw new Error('Usuario sin empresa asignada');
  
  return { ...whereClause, companyId: Number(companyId) };
}

/**
 * Inyecta automáticamente { companyId } en datos de creación.
 */
export function withTenantData(req, dataClause) {
  if (!req.user) throw new Error('No autorizado: Sesión inválida.');
  
  const companyId = req.user.companyId;
  
  if (companyId && dataClause.companyId === undefined) {
    return { ...dataClause, companyId: Number(companyId) };
  }
  
  return dataClause;
}
