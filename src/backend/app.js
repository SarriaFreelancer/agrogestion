import express from 'express';
import cors from 'cors';
import saasRoutes from './routes/saas.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenant/tenant.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import clientsRoutes from './modules/clients/clients.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import agroRoutes from './modules/agro/agro.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Root API Explorer
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>AgroGestión SaaS — API Gateway & Explorer</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f3f4f6; margin: 0; padding: 2rem; }
        .container { max-width: 900px; margin: 0 auto; background: rgba(18, 25, 38, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h1 { color: #10B981; font-size: 2rem; margin-top: 0; display: flex; align-items: center; gap: 0.5rem; }
        .badge { background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.25rem; transition: transform 0.2s, border-color 0.2s; }
        .card:hover { transform: translateY(-3px); border-color: #10B981; }
        .card h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #ffffff; }
        .card a { color: #38BDF8; text-decoration: none; font-weight: bold; font-size: 0.9rem; font-family: monospace; display: block; margin-top: 0.5rem; }
        .card a:hover { text-decoration: underline; color: #7DD3FC; }
        .status-box { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10B981; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1>🌾 AgroGestión API Gateway</h1>
          <span class="badge">v2.5.0 ONLINE</span>
        </div>
        <p style="color: #9CA3AF;">Gateway backend y microservicios para la plataforma integral agropecuaria y teledetección.</p>
        
        <div class="status-box">
          <strong style="color: #34D399;">✓ Microservicios Activos:</strong><br>
          • Backend Express Gateway (Puerto 3000): <strong>Activo</strong><br>
          • Microservicio Python IA & Satélite NDVI (Puerto 8000): <strong>Activo</strong><br>
          • Base de Datos & Sincronización PWA: <strong>Lista</strong>
        </div>

        <h2>Endpoints Disponibles (JSON REST)</h2>
        <div class="grid">
          <div class="card">
            <h3>🏢 Empresas Clientes</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Catálogo de empresas e inquilinos SaaS.</p>
            <a href="/api/empresas" target="_blank">GET /api/empresas</a>
          </div>

          <div class="card">
            <h3>🌳 Estructura 6 Niveles</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Zona &rarr; Sector &rarr; Finca &rarr; Lote &rarr; Suerte &rarr; Válvula.</p>
            <a href="/api/estructura" target="_blank">GET /api/estructura</a>
          </div>

          <div class="card">
            <h3>🌱 Cultivos</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Caña, Café, Aguacate Hass, Palma, etc.</p>
            <a href="/api/cultivos" target="_blank">GET /api/cultivos</a>
          </div>

          <div class="card">
            <h3>🚜 Maquinaria & Drones</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Tractores, cosechadoras, pulverizadoras.</p>
            <a href="/api/maquinarias" target="_blank">GET /api/maquinarias</a>
          </div>

          <div class="card">
            <h3>🧪 Insumos & Fertilizantes</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Urea, DAP, KCl, agroquímicos y biológicos.</p>
            <a href="/api/productos" target="_blank">GET /api/productos</a>
          </div>

          <div class="card">
            <h3>📋 Labores & Tarifas</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Catálogo de actividades agrícolas estándar.</p>
            <a href="/api/actividades" target="_blank">GET /api/actividades</a>
          </div>

          <div class="card">
            <h3>🛡️ Auditoría de Acciones</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Bitácora de operaciones y trazabilidad.</p>
            <a href="/api/auditoria" target="_blank">GET /api/auditoria</a>
          </div>

          <div class="card">
            <h3>✨ Copiloto IA & Satélite</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Health check del microservicio Python.</p>
            <a href="/api/ai/health" target="_blank">GET /api/ai/health</a>
          </div>

          <div class="card">
            <h3>📊 Dashboard KPIs</h3>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 0;">Métricas consolidadas de producción y clima.</p>
            <a href="/api/dashboard/kpis" target="_blank">GET /api/dashboard/kpis</a>
          </div>
        </div>

        <p style="text-align: center; color: #6B7280; font-size: 0.85rem; margin-top: 2rem;">
          Acceda a la aplicación web PWA en <a href="http://localhost:5173" style="color: #10B981;">http://localhost:5173</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

// Legacy
app.use('/api/saas', saasRoutes);

// Modular Monolith & Agro Core Routes
app.use('/api', agroRoutes); // empresas, estructura, cultivos, actividades, productos, maquinarias, auditoria, dashboard/kpis, overview
app.use('/api', authRoutes); // login, directorio
app.use('/api', tenantRoutes); // test-connection, init-db
app.use('/api/global-admins', adminRoutes);
app.use('/api/clientes', clientsRoutes);
app.use('/api', syncRoutes); // sync-data, load-data
app.use('/api/billing', billingRoutes); // suscripciones y facturacion
app.use('/api/ai', aiRoutes); // microservicio python ia & satelite

export default app;
