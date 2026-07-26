# AgroGestión

AgroGestión es una plataforma agrícola integral diseñada para la planificación, ejecución y monitoreo de actividades en el campo. Permite a las empresas agrícolas gestionar de forma eficiente sus operaciones, inventarios, recursos humanos (mano de obra), maquinaria y la toma de decisiones basada en datos.

## Propósito del Proyecto

El objetivo principal de AgroGestión es llevar la planificación de las actividades a realizar en el campo y gerenciar la información para facilitar la toma de decisiones. Esto incluye:
- **Estructura Agrícola:** Gestión de Sectores, Fincas, Lotes y Suertes.
- **Maestros (Catálogos Base):** Control de Cultivos, Actividades, Trabajadores, Cuadrillas, Insumos, Productos, Proveedores, etc.
- **Planificación:** Programación de labores de campo, asignación de recursos y estimación de costos.
- **Ejecución:** Registro en tiempo real (o diferido) de las labores realizadas en campo, incluyendo uso de insumos, horas máquina y mano de obra.
- **Monitoreo y Mantenimiento:** Evaluaciones fitosanitarias, controles de calidad y gestión de maquinaria.

## Configuración y Entorno

El proyecto está construido con un enfoque fullstack utilizando:
- **Frontend:** React + Vite, estructurado de forma modular (por dominios).
- **Backend:** Node.js (Express) integrado para servir API y conexiones a base de datos.
- **Base de Datos:** Prisma ORM, con arquitectura multi-tenant (múltiples clientes/empresas, cada uno con su propia configuración de base de datos).

### Prerrequisitos
- Node.js (v18+)
- pnpm (Gestor de paquetes recomendado)
- Base de datos (SQL Server, MySQL, Postgres u Oracle) configurada.

### Comandos Principales

- Instalar dependencias:
  ```bash
  pnpm install
  ```
- Iniciar el servidor (Frontend + Backend + Sincronización Prisma):
  ```bash
  pnpm run start
  ```
- Construir para producción:
  ```bash
  pnpm run build
  ```

## Arquitectura Multi-Tenant

AgroGestión soporta múltiples empresas (clientes) desde una sola instancia de código. Cada cliente tiene sus propias bases de datos. El usuario administrador global puede gestionar las instancias de los clientes, suspender accesos y administrar la infraestructura global desde el módulo de "Gestión Empresas".
