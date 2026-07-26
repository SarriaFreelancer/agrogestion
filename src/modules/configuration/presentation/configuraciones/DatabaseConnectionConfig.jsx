import React, { useState, useEffect } from 'react';
import { Database, Server, Key, Lock, Network, Settings2, HardDrive } from 'lucide-react';
import { apiUrl } from '@/utils/api';

const DATABASE_ENGINES = {
  'SQL Server': {
    label: 'SQL Server',
    defaultPort: 1433,
    fields: ['server', 'port', 'database', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (Web)', '3 Capas (API)'],
    description: 'Microsoft SQL Server en local o en la nube',
    icon: '🗄️'
  },
  'Oracle': {
    label: 'Oracle Database',
    defaultPort: 1521,
    fields: ['server', 'port', 'connectionType', 'tnsName', 'sid', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (Web)', '3 Capas (API)'],
    description: 'Oracle Database con conexión SID o TNS',
    icon: '🔴'
  },
  'MySQL': {
    label: 'MySQL / MariaDB',
    defaultPort: 3306,
    fields: ['server', 'port', 'database', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (Web)', '3 Capas (API)'],
    description: 'MySQL o MariaDB',
    icon: '🐬'
  },
  'PostgreSQL': {
    label: 'PostgreSQL',
    defaultPort: 5432,
    fields: ['server', 'port', 'database', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (Web)', '3 Capas (API)'],
    description: 'PostgreSQL',
    icon: '🐘'
  },
  'AWS RDS': {
    label: 'AWS RDS',
    defaultPort: 3306,
    fields: ['endpoint', 'port', 'engineType', 'database', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (Serverless)', '3 Capas (EC2)', 'Microservicios'],
    description: 'Amazon RDS (MySQL, PostgreSQL, MariaDB, Oracle)',
    icon: '☁️'
  },
  'Azure SQL': {
    label: 'Azure SQL Database',
    defaultPort: 1433,
    fields: ['serverName', 'database', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (App Service)', '3 Capas (API)', 'Microservicios'],
    description: 'Microsoft Azure SQL Database',
    icon: '🔵'
  },
  'Google Cloud SQL': {
    label: 'Google Cloud SQL',
    defaultPort: 3306,
    fields: ['instanceConnectionName', 'server', 'engineType', 'database', 'username', 'password', 'architecture'],
    architectures: ['2 Capas', '3 Capas (Cloud Run)', '3 Capas (App Engine)'],
    description: 'Google Cloud SQL',
    icon: '🌐'
  }
};

export default function DatabaseConnectionConfig({ 
  clientData, 
  onUpdate,
  isNewClient = false
}) {
  const [databaseEngine, setDatabaseEngine] = useState(clientData?.databaseEngine || 'SQL Server');
  const [connectionData, setConnectionData] = useState(clientData?.connectionData || {});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testMessage, setTestMessage] = useState('');

  const engine = DATABASE_ENGINES[databaseEngine];

  useEffect(() => {
    if (isNewClient && !clientData?.databaseEngine) {
      setDatabaseEngine('SQL Server');
    }
  }, []);

  const handleEngineChange = (newEngine) => {
    setDatabaseEngine(newEngine);
    const newData = {
      ...connectionData,
      port: DATABASE_ENGINES[newEngine].defaultPort
    };
    setConnectionData(newData);
    onUpdate({
      databaseEngine: newEngine,
      connectionData: newData
    });
    setTestResult(null);
  };

  const handleConnectionFieldChange = (field, value) => {
    const newData = { ...connectionData, [field]: value };
    setConnectionData(newData);
    onUpdate({
      databaseEngine,
      connectionData: newData
    });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestMessage('');

    const { server, endpoint, serverName, instanceConnectionName, port, username, password, sid, tnsName } = connectionData;
    const host = server || endpoint || serverName || instanceConnectionName;
    
    if (!host || !port || !username || !password) {
      setIsTesting(false);
      setTestResult('error');
      setTestMessage('Por favor complete todos los campos requeridos (Servidor, Puerto, Usuario, Contraseña).');
      return;
    }

    if (databaseEngine === 'Oracle' && connectionData.connectionType === 'SID' && !sid) {
      setIsTesting(false);
      setTestResult('error');
      setTestMessage('Por favor ingrese el SID de Oracle.');
      return;
    }
    
    if (databaseEngine === 'Oracle' && connectionData.connectionType === 'TNS' && !tnsName) {
      setIsTesting(false);
      setTestResult('error');
      setTestMessage('Por favor ingrese el Nombre TNS de Oracle.');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/test-connection'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine: databaseEngine, connectionData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult('success');
        setTestMessage(`${data.message}. Inicializando estructura de tablas...`);

        try {
          const initRes = await fetch(apiUrl('/api/init-db'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ engine: databaseEngine, connectionData })
          });
          const initData = await initRes.json();
          if (initData.success) {
            setTestMessage(`${data.message}. ${initData.message}`);
          } else {
            setTestMessage(`${data.message}. Pero falló la creación de tablas: ${initData.message}`);
          }
        } catch (e) {
          setTestMessage(`${data.message}. Pero hubo un error al crear tablas: ${e.message}`);
        }

      } else {
        setTestResult('error');
        setTestMessage(data.message);
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage(`No se pudo conectar al servidor de validación local (asegúrate de que el backend esté ejecutándose en el puerto 3000). Error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const renderFieldInput = (fieldName) => {
    const commonProps = {
      className: 'input-field',
      value: connectionData[fieldName] || '',
      onChange: (e) => handleConnectionFieldChange(fieldName, e.target.value)
    };

    const fieldConfigs = {
      'server': {
        label: 'Servidor',
        placeholder: 'localhost o 192.168.1.100',
        icon: Network
      },
      'endpoint': {
        label: 'Endpoint RDS',
        placeholder: 'xxxx.us-east-1.rds.amazonaws.com',
        icon: Network
      },
      'serverName': {
        label: 'Nombre del Servidor',
        placeholder: 'servidor.database.windows.net',
        icon: Network
      },
      'instanceConnectionName': {
        label: 'Nombre Conexión Instancia',
        placeholder: 'project:region:instance',
        icon: Network
      },
      'port': {
        label: 'Puerto',
        placeholder: engine?.defaultPort || 1433,
        type: 'number',
        icon: Settings2
      },
      'database': {
        label: 'Base de Datos',
        placeholder: 'nombre_base_datos',
        icon: Database
      },
      'sid': {
        label: 'SID Oracle',
        placeholder: 'ORCL o nombre del SID',
        icon: Database
      },
      'tnsName': {
        label: 'Nombre TNS',
        placeholder: 'alias definido en tnsnames.ora',
        icon: Database
      },
      'username': {
        label: 'Usuario',
        placeholder: 'usuario_bd',
        icon: Lock
      },
      'password': {
        label: 'Contraseña',
        type: 'password',
        placeholder: '••••••••',
        icon: Key
      },
      'engineType': {
        label: 'Tipo Motor',
        type: 'select',
        options: ['mysql', 'mariadb', 'postgres', 'oracle', 'sqlserver'],
        icon: Database
      },
      'connectionType': {
        label: 'Tipo Conexión',
        type: 'select',
        options: ['SID', 'TNS'],
        icon: Settings2
      },
      'architecture': {
        label: 'Arquitectura',
        type: 'select',
        options: engine?.architectures || [],
        icon: HardDrive
      }
    };

    const config = fieldConfigs[fieldName];
    if (!config) return null;

    const Icon = config.icon;

    if (config.type === 'select') {
      return (
        <div key={fieldName} className="input-group">
          <label className="input-label">
            <Icon size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {config.label}
          </label>
          <select {...commonProps}>
            <option value="">Seleccionar...</option>
            {config.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={fieldName} className="input-group">
        <label className="input-label">
          <Icon size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
          {config.label}
        </label>
        <input
          {...commonProps}
          type={config.type || 'text'}
          placeholder={config.placeholder}
        />
      </div>
    );
  };

  // Mostrar campos condicionales para Oracle
  const shouldShowTnsFields = databaseEngine === 'Oracle' && 
    connectionData.connectionType === 'TNS';
  const shouldShowSidFields = databaseEngine === 'Oracle' && 
    connectionData.connectionType === 'SID';

  return (
    <div className="database-connection-config">
      <div className="config-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem' }}>{engine?.icon}</div>
          <div>
            <h3 style={{ margin: 0 }}>Motor de Base de Datos</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
              {engine?.description}
            </p>
          </div>
        </div>

        <div className="database-engines-grid">
          {Object.entries(DATABASE_ENGINES).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={`engine-selector ${databaseEngine === key ? 'active' : ''}`}
              onClick={() => handleEngineChange(key)}
              style={{
                padding: '1rem',
                border: databaseEngine === key ? '2px solid var(--primary-color)' : '1px solid #ddd',
                borderRadius: '8px',
                background: databaseEngine === key ? 'rgba(var(--primary-rgb), 0.1)' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{config.icon}</div>
              <strong>{config.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="config-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={18} />
          Configuración de Conexión
        </h4>

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {engine?.fields.map(field => {
            // Mostrar u ocultar campos condicionales
            if (databaseEngine === 'Oracle') {
              if (field === 'sid' && !shouldShowSidFields) return null;
              if (field === 'tnsName' && !shouldShowTnsFields) return null;
            }
            return renderFieldInput(field);
          })}
        </div>

        {/* Info box para Oracle con opciones de conexión */}
        {databaseEngine === 'Oracle' && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0f7ff',
            border: '1px solid #b3d9ff',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#0066cc'
          }}>
            <strong>💡 Conexión Oracle:</strong>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
              <li><strong>SID:</strong> Conexión directa al servidor (requiere puerto y SID)</li>
              <li><strong>TNS:</strong> Conexión mediante archivo tnsnames.ora configurado</li>
            </ul>
          </div>
        )}

        {/* Info box para AWS */}
        {databaseEngine === 'AWS RDS' && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#fff5e6',
            border: '1px solid #ffe6b3',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#cc6600'
          }}>
            <strong>💡 AWS RDS:</strong>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
              <li>Endpoint disponible en AWS Console (RDS Dashboard)</li>
              <li>Puerto por defecto: MySQL (3306), PostgreSQL (5432), SQL Server (1433)</li>
              <li>Asegúrese que el security group permita acceso</li>
            </ul>
          </div>
        )}

        {/* Info box para Azure */}
        {databaseEngine === 'Azure SQL' && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#e6f2ff',
            border: '1px solid #99d6ff',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#003366'
          }}>
            <strong>💡 Azure SQL:</strong>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
              <li>Servidor: nombreservidor.database.windows.net</li>
              <li>Configure firewall rules para permitir IP origen</li>
              <li>Puertos: SQL Server (1433) - no se puede cambiar</li>
            </ul>
          </div>
        )}
      </div>

      <div className="config-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardDrive size={18} />
          Topología de la Solución
        </h4>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Seleccione la arquitectura de despliegue para esta base de datos:
        </p>
        <div style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>2 Capas:</strong> <span style={{ color: '#666' }}>Cliente directo → BD (desarrollo local)</span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>3 Capas (Web):</strong> <span style={{ color: '#666' }}>Cliente → Servidor Web → BD</span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>3 Capas (API):</strong> <span style={{ color: '#666' }}>Cliente → API REST/GraphQL → BD</span>
          </div>
          {databaseEngine === 'AWS RDS' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Serverless:</strong> <span style={{ color: '#666' }}>AWS Lambda → RDS (escala automática)</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Microservicios:</strong> <span style={{ color: '#666' }}>Contenedores Docker/ECS → RDS</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="config-section" style={{ 
        marginTop: '2rem', 
        paddingTop: '2rem', 
        borderTop: '1px solid #eee',
        background: '#f9f9f9',
        padding: '1rem',
        borderRadius: '6px'
      }}>
        <h4 style={{ marginBottom: '1rem' }}>📋 Resumen de Configuración</h4>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div><strong>Motor:</strong> {engine?.label}</div>
          <div><strong>Servidor:</strong> {connectionData.server || connectionData.endpoint || connectionData.serverName || connectionData.instanceConnectionName || '(no configurado)'}</div>
          <div><strong>Puerto:</strong> {connectionData.port || engine?.defaultPort}</div>
          {connectionData.database && <div><strong>Base de datos:</strong> {connectionData.database}</div>}
          {connectionData.architecture && <div><strong>Arquitectura:</strong> {connectionData.architecture}</div>}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <button 
          type="button"
          className="btn-primary" 
          onClick={handleTestConnection}
          disabled={isTesting}
          style={{ padding: '0.8rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isTesting ? 'wait' : 'pointer', opacity: isTesting ? 0.7 : 1 }}
        >
          {isTesting ? 'Probando...' : '🔌 Probar Conexión'}
        </button>
        
        {testResult && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            background: testResult === 'success' ? '#e8f5e9' : '#ffebee',
            color: testResult === 'success' ? '#2e7d32' : '#c62828',
            border: `1px solid ${testResult === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
            width: '100%',
            transition: 'all 0.3s'
          }}>
            <strong>{testResult === 'success' ? '✅ Éxito:' : '❌ Error:'}</strong> {testMessage}
          </div>
        )}
      </div>
    </div>
  );
}
