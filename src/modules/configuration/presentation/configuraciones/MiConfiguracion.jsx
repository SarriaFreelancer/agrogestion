import React from 'react';
import { Database, Settings2, KeyRound, UserRound } from 'lucide-react';
import { useAgro } from '@/providers/AgroContext';

export default function MiConfiguracion() {
  const { currentClient, clients, updateClient, THEME_CONFIG } = useAgro();

  const handleThemeChange = (newTheme) => {
    const clientKey = Object.keys(clients).find(k => clients[k].id === currentClient.id);
    if (clientKey) {
      updateClient(clientKey, currentClient.plan, currentClient.modules, newTheme);
    }
  };

  return (
    <div className="fade-in">
      <div className="header">
        <h1 style={{ color: 'white' }}>Mi Configuración</h1>
        <p style={{ color: '#9ca3af' }}>Personalice su entorno de trabajo y preferencias del sistema.</p>
      </div>

      <div className="glass-card" style={{ backgroundColor: '#1a1d24', borderColor: '#1f2937' }}>
        <h3 style={{ color: 'white' }}>🎨 Apariencia y Tema</h3>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Seleccione el esquema de colores que mejor se adapte a su empresa o preferencia personal.
        </p>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {THEME_CONFIG && Object.entries(THEME_CONFIG).map(([name, colors]) => (
            <div 
              key={name}
              onClick={() => handleThemeChange(name)}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                border: currentClient?.theme === name ? '3px solid var(--primary-color)' : '1px solid #374151',
                overflow: 'hidden',
                transition: 'all 0.3s',
                transform: currentClient?.theme === name ? 'scale(1.02)' : 'none',
                boxShadow: currentClient?.theme === name ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
                backgroundColor: '#14151a'
              }}
            >
              <div style={{ height: '60px', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <strong>{name}</strong>
              </div>
              <div style={{ padding: '0.8rem', display: 'flex', gap: '5px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors.light }}></div>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors.dark }}></div>
                <div style={{ marginLeft: 'auto' }}>
                  {currentClient?.theme === name && <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>✓ Activo</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem', backgroundColor: '#1a1d24', borderColor: '#1f2937' }}>
        <h3 style={{ color: 'white' }}>ℹ️ Información de la Cuenta</h3>
        <div className="grid-2" style={{ marginTop: '1rem', gap: '2rem' }}>
          <div>
            <label className="input-label" style={{ color: '#9ca3af' }}>Empresa / Instancia</label>
            <input 
              className="input-field" 
              value={currentClient?.name || ''} 
              disabled 
              style={{ backgroundColor: '#14151a', color: 'white', borderColor: '#374151' }}
            />
          </div>
          <div>
            <label className="input-label" style={{ color: '#9ca3af' }}>Nivel de Plan</label>
            <div style={{ padding: '0.8rem', background: '#14151a', borderRadius: '8px', fontWeight: 'bold', color: 'var(--primary-color)', border: '1px solid #374151' }}>
              Plan {currentClient?.plan || ''}
            </div>
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
          * Los cambios de plan y módulos deben ser solicitados al administrador global.
        </p>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem', backgroundColor: '#1a1d24', borderColor: '#1f2937' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <Database size={22} style={{ color: 'white' }} />
          <div>
            <h3 style={{ color: 'white' }}>Datos de Conexión</h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.3rem' }}>
              Información técnica de acceso y configuración de la instancia.
            </p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem', marginTop: '1rem' }}>
          <div className="input-group">
            <label className="input-label" style={{ color: '#9ca3af' }}>
              <Settings2 size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              ID Instancia
            </label>
            <input
              className="input-field"
              value={currentClient?.instanceId || currentClient?.id || ''}
              disabled
              style={{ opacity: 0.7, backgroundColor: '#14151a', color: 'white', borderColor: '#374151' }}
            />
          </div>
          <div className="input-group">
            <label className="input-label" style={{ color: '#9ca3af' }}>
              <Database size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Base de Datos
            </label>
            <input
              className="input-field"
              value={currentClient?.databaseName || ''}
              disabled
              style={{ opacity: 0.7, backgroundColor: '#14151a', color: 'white', borderColor: '#374151' }}
            />
          </div>
          <div className="input-group">
            <label className="input-label" style={{ color: '#9ca3af' }}>
              <UserRound size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Usuario BD
            </label>
            <input
              className="input-field"
              value={currentClient?.databaseUser || ''}
              disabled
              style={{ opacity: 0.7, backgroundColor: '#14151a', color: 'white', borderColor: '#374151' }}
            />
          </div>
          <div className="input-group">
            <label className="input-label" style={{ color: '#9ca3af' }}>
              <KeyRound size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Contraseña BD
            </label>
            <input
              className="input-field"
              type="password"
              value={currentClient?.databasePassword || ''}
              disabled
              style={{ opacity: 0.7, backgroundColor: '#14151a', color: 'white', borderColor: '#374151' }}
            />
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
          ℹ️ Estos datos son de solo lectura. Para modificarlos, contacte al administrador global.
        </p>
      </div>
    </div>
  );
}
