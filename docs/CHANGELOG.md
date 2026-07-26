# Registro de Cambios y Desarrollo (Changelog)

Este documento registra la evolución arquitectónica y el desarrollo de los módulos de **AgroGestión**.

## [1.1.0] - Refactorización de Arquitectura y Limpieza
- **Refactorización de AgroContext**: El mega-archivo `AgroContext.jsx` se desglosó en Custom Hooks especializados agrupados por dominios (Estructura, Operaciones, Monitoreo, etc.) y una subcarpeta especializada para Maestros (`src/providers/hooks/maestros/`) con un hook para cada catálogo (Cultivos, Actividades, etc.).
- **Limpieza de Mocks**: Traslado de datos hardcodeados a `src/providers/mocks.js`.
- **Automatización BD**: Se implementó script automático `seed.js` ejecutado en el arranque (`pnpm run start`) para garantizar la creación del usuario Super Administrador (`superadmin@sarriatech.com`) y sincronización automática de Prisma.
- **Multitenant (Fase 1)**: Eliminación del selector manual de instancias en UI. Ahora la asignación y permisos se manejan internamente a través del rol (SUPERADMIN ve todo, otros usuarios ven lo correspondiente a su Tenant).

## [1.0.0] - Versión Inicial y MVP (Migración)
- **Migración a React+Vite**: Conversión del sistema original a un entorno moderno con Vite y TailwindCSS.
- **Módulos Base**: Implementación de Dashboard, Estructura Agrícola, Maestros, Planificación, Ejecución, Monitoreo y Mantenimiento.
- **Conexión Backend Dinámica**: Implementación inicial de la API en Express con soporte dinámico para SQL Server, MySQL, Postgres y Oracle utilizando Prisma como ORM para la base de datos principal de administración.
