import express from 'express';
import cors from 'cors';
import saasRoutes from './routes/saas.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenant/tenant.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import clientsRoutes from './modules/clients/clients.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Legacy
app.use('/api/saas', saasRoutes);

// Modular Monolith Routes
app.use('/api', authRoutes); // login, directorio
app.use('/api', tenantRoutes); // test-connection, init-db
app.use('/api/global-admins', adminRoutes);
app.use('/api/clientes', clientsRoutes);
app.use('/api', syncRoutes); // sync-data, load-data

export default app;
