import { prisma } from "./prisma.js";

function parseUserAgent(uaString) {
  let browser = "Desconocido", operatingSystem = "Desconocido", device = "Desktop";
  const ua = (uaString || "").toLowerCase();
  
  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari")) browser = "Safari";
  
  if (ua.includes("windows")) operatingSystem = "Windows";
  else if (ua.includes("mac")) operatingSystem = "macOS";
  else if (ua.includes("linux")) operatingSystem = "Linux";
  else if (ua.includes("android")) { operatingSystem = "Android"; device = "Móvil"; }
  else if (ua.includes("iphone") || ua.includes("ipad")) { operatingSystem = "iOS"; device = "Móvil"; }
  
  return { browser, operatingSystem, device };
}

/**
 * Registra una acción en el AuditLog de la base de datos
 */
export async function logActivity(req, data) {
  try {
    const userId = req.user?.id ? Number(req.user.id) : null;
    const companyId = req.user?.companyId ? Number(req.user.companyId) : null;
    const uaString = req.headers['user-agent'] || "";
    const ip = req.headers['x-forwarded-for']?.split(",")[0] || req.ip || "127.0.0.1";
    
    const { browser, operatingSystem, device } = parseUserAgent(uaString);
    
    // Redactar campos sensibles
    const sanitize = (obj) => {
      if (!obj) return null;
      const copy = { ...obj };
      ["password", "salt", "secret", "token", "key", "contrasena"].forEach(k => {
        if (k in copy) copy[k] = "[REDACTADO]";
      });
      return copy;
    };

    await prisma.auditLog.create({
      data: {
        companyId, 
        userId,
        module: data.module, 
        action: data.action,
        entity: data.entity, 
        entityId: data.entityId ? String(data.entityId) : null,
        description: data.description,
        oldValues: sanitize(data.oldValues),
        newValues: sanitize(data.newValues),
        ip, 
        browser, 
        operatingSystem, 
        device,
        country: "Local", // Aquí podrías integrar GeoIP
        city: "Localhost",
      }
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}

/**
 * Registra un intento de inicio de sesión
 */
export async function logLoginAttempt(req, data) {
  try {
    const uaString = req.headers['user-agent'] || "";
    const ip = req.headers['x-forwarded-for']?.split(",")[0] || req.ip || "127.0.0.1";
    const { browser, operatingSystem, device } = parseUserAgent(uaString);
    
    let companyId = null;
    
    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId }, select: { companyId: true }
      });
      companyId = user?.companyId ?? null;
    }

    await prisma.loginHistory.create({
      data: {
        userId: data.userId, 
        email: data.email, 
        companyId,
        ip, 
        browser, 
        operatingSystem, 
        device,
        country: "Local", 
        city: "Localhost",
        status: data.status, 
        reason: data.reason,
      }
    });

    if (data.status === "SUCCESS" && data.userId) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { lastLogin: new Date() }
      });
    }
  } catch (error) {
    console.error("[LOGIN_LOG_ERROR]", error);
  }
}
