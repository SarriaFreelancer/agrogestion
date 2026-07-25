import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAgro } from '../../context/AgroContext';

export default function Configuraciones() {
  const {
    configuraciones,
    updateConfiguracion,
    currentClient,
    clients,
    updateClient,
    THEME_CONFIG
  } = useAgro();

  const isAdminUser = currentClient.modules?.includes('ALL');
  const [openSection, setOpenSection] = useState('apariencia');
  const isEnabled = (value) => Number(value) === 1;

  const handleToggle = (key) => {
    const currentValue = configuraciones[key];
    const nextValue = currentValue === 1 ? 0 : 1;
    updateConfiguracion(key, nextValue);
  };

  const handleLevelNameChange = (key, value) => {
    updateConfiguracion('estructuraNivelNombres', {
      ...configuraciones.estructuraNivelNombres,
      [key]: value
    });
  };

  const handleEstructuraNivelesChange = (value) => {
    updateConfiguracion('estructuraNiveles', Number(value));
  };

  const handleThemeChange = (newTheme) => {
    const clientKey = Object.keys(clients).find(k => clients[k].id === currentClient.id);
    if (clientKey) {
      updateClient(clientKey, currentClient.plan, currentClient.modules, newTheme);
    }
  };

  const sections = [
    { id: 'insumos',
      title: 'Insumos',
      description: 'Validaciones de productos y control de stock.'
    },
    { id: 'maquinaria',
      title: 'Maquinaria',
      description: 'Reglas de equipos y validación operativa.'
    },
    { id: 'manoObra',
      title: 'Mano de Obra',
      description: 'Control de nómina y personal requerido.'
    },
    { id: 'monitoreo',
      title: 'Monitoreo',
      description: 'Ajustes para capturas de campo y alertas agronómicas.'
    },
    { id: 'estructura',
      title: 'Estructura',
      description: 'Defina la cantidad de niveles de jerarquía y la descripción global de cada nivel.'
    },
    { id: 'maestros',
      title: 'Maestros',
      description: 'Habilite o desactive los catálogos que desea utilizar en el sistema.'
    },
    { id: 'apariencia',
      title: 'Apariencia',
      description: 'Temas visuales de la instancia.'
    },
    { id: 'instancia',
      title: 'Instancia',
      description: 'Datos de la cuenta activa.'
    }
  ];

  return (
    <div className="fade-in">
      <div className="header">
        <h1>Configuración del Sistema</h1>
        <p>Personalice su entorno de trabajo y ajuste las reglas de validación técnica.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {sections.map(section => {
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className="glass-card" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className="config-section-toggle"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
              >
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
                <ChevronDown size={18} className={isOpen ? 'open' : ''} />
              </button>

              {isOpen && section.id === 'insumos' && (
                <div className="config-section-body">
                  <div className="config-option-list" style={{ marginBottom: '1rem' }}>
                    {[{
                      id: 'config_insumos',
                      label: 'Bloque de Insumos',
                      desc: 'Activa o desactiva la sección operativa de insumos.'
                    }].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[rule.id])}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="config-option-list">
                    {[
                      { id: 'validarInsumos', label: 'Obligar Insumos', desc: 'Requiere productos en fertilizaciones.' },
                      { id: 'bloquearStockNegativo', label: 'Bloquear Stock Negativo', desc: 'Impide salidas sin existencias.' },
                      { id: 'registrarGpsInsumos', label: 'Registrar ubicación en insumos', desc: 'Captura coordenadas de inicio y fin para apuntes de insumos.' }
                    ].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[rule.id])}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && section.id === 'maquinaria' && (
                <div className="config-section-body">
                  <div className="config-option-list" style={{ marginBottom: '1rem' }}>
                    {[{
                      id: 'config_maq',
                      label: 'Bloque de Maquinaria',
                      desc: 'Activa o desactiva la sección operativa de maquinaria.'
                    }].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[rule.id])}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="config-option-list">
                    {[
                      { id: 'validarMaquinaria', label: 'Obligar Maquinaria', desc: 'Requiere equipo en labores mecánicas.' },
                      { id: 'registrarGpsMaquinaria', label: 'Registrar ubicación en maquinaria', desc: 'Captura coordenadas de inicio y fin para apuntes de maquinaria.' }
                    ].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[rule.id])}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && section.id === 'manoObra' && (
                <div className="config-section-body">
                  <div className="config-option-list" style={{ marginBottom: '1rem' }}>
                    {[{
                      id: 'config_mao',
                      label: 'Bloque de Mano de Obra',
                      desc: 'Activa o desactiva la sección operativa de mano de obra.'
                    }].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[rule.id])}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="config-option-list">
                    {[
                      { id: 'validarNomina', label: 'Obligar Nómina', desc: 'Requiere registro de personal.' },
                      { id: 'registrarGpsManoObra', label: 'Registrar ubicación en mano de obra', desc: 'Captura coordenadas de inicio y fin para apuntes de mano de obra.' }
                    ].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[rule.id])}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && section.id === 'monitoreo' && (
                <div className="config-section-body">
                  <div className="config-option-list">
                    {[
                      { id: 'registrarGpsMonitoreo', label: 'Registrar GPS', desc: 'Adjunta coordenadas al registro si están disponibles.' },
                      { id: 'mostrarAlertasMonitoreo', label: 'Mostrar alertas de rango', desc: 'Resalta valores fuera de los rangos definidos.' },
                      { id: 'permitirMuestrasMonitoreo', label: 'Permitir muestras adicionales', desc: 'Activa el registro de sub-muestras por monitoreo.' },
                      { id: 'permitirObservacionesMonitoreo', label: 'Permitir observaciones', desc: 'Agrega un campo de notas al formulario de monitoreo.' },
                      { id: 'validarVariablesRequeridasMonitoreo', label: 'Validar variables requeridas', desc: 'Impide guardar monitoreo si una variable marcada como requerida está vacía.' }
                    ].map(rule => (
                      <label key={rule.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={configuraciones[rule.id] === 1}
                          onChange={() => handleToggle(rule.id)}
                        />
                        <span>
                          <strong>{rule.label}</strong>
                          <small>{rule.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label className="input-label">Frecuencia predeterminada</label>
                    <select
                      className="input-field"
                      value={configuraciones.frecuenciaMonitoreo}
                      onChange={(e) => updateConfiguracion('frecuenciaMonitoreo', e.target.value)}
                    >
                      <option value="Diaria">Diaria</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Eventual">Eventual</option>
                    </select>
                  </div>
                </div>
              )}

              {isOpen && section.id === 'estructura' && (
                <div className="config-section-body">
                  <div className="input-group">
                    <label className="input-label">Niveles de jerarquía</label>
                    <select
                      className="input-field"
                      value={configuraciones.estructuraNiveles}
                      onChange={(e) => handleEstructuraNivelesChange(e.target.value)}
                    >
                      {[2, 3, 4].map(level => (
                        <option key={level} value={level}>{level} niveles</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                    {Array.from({ length: configuraciones.estructuraNiveles || 4 }, (_, index) => {
                      const nivelCount = configuraciones.estructuraNiveles || 4;
                      const isLastLevel = index === nivelCount - 1;
                      const key = isLastLevel ? 'nivel4' : `nivel${index + 1}`;
                      const levelNumber = isLastLevel ? 4 : index + 1;
                      return (
                        <div key={key} className="input-group">
                          <label className="input-label">Nombre global Nivel {levelNumber}</label>
                          <input
                            className="input-field"
                            value={configuraciones.estructuraNivelNombres?.[key] || ''}
                            onChange={(e) => handleLevelNameChange(key, e.target.value)}
                            placeholder={`Ej: ${['Sector', 'Finca', 'Lote', 'Suerte', 'Subnivel', 'Subnivel'][index]}`}
                            disabled={isLastLevel}
                            style={isLastLevel ? { opacity: 0.6, backgroundColor: 'var(--bg-muted)' } : {}}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isOpen && section.id === 'maestros' && (
                <div className="config-section-body">
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Seleccione los maestros que desea habilitar. Los que no estén seleccionados aparecerán ocultos en el Centro de Maestros.
                  </p>
                  <div className="config-option-list">
                    {[
                      { id: 'maestro_actividad', label: 'Actividades', icon: '📋' },
                      { id: 'maestro_maq', label: 'Maquinaria', icon: '🚜' },
                      { id: 'maestro_mao', label: 'Trabajadores', icon: '👤' },
                      { id: 'maestro_ins', label: 'Productos', icon: '📦' },
                      { id: 'maestro_proveedores', label: 'Proveedores', icon: '🏢' },
                      { id: 'maestro_cultivos', label: 'Cultivos', icon: '🌱' },
                      { id: 'maestro_controles', label: 'Controles Agro', icon: '🔬' },
                      { id: 'maestro_tp_act', label: 'Grupos de Actividad', icon: '🏷️' },
                      { id: 'maestro_tipos_maquinaria', label: 'Tipos de Maquinaria', icon: '⚙️' },
                      { id: 'maestro_cuadrillas', label: 'Cuadrillas', icon: '👥' },
                      { id: 'maestro_unidades', label: 'Unidades de Medida', icon: '📏' },
                      { id: 'maestro_tipos_productos', label: 'Tipos de Productos', icon: '🔖' }
                    ].map(maestro => (
                      <label key={maestro.id} className="config-option-row">
                        <input
                          type="checkbox"
                          checked={isEnabled(configuraciones[maestro.id])}
                          onChange={() => {
                            const currentValue = configuraciones[maestro.id];
                            const nextValue = Number(currentValue) === 1 ? 0 : 1;
                            updateConfiguracion(maestro.id, nextValue);
                          }}
                        />
                        <span>
                          <strong>{maestro.icon} {maestro.label}</strong>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && section.id === 'apariencia' && (
                <div className="config-section-body">
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Seleccione el esquema de colores para su instancia. Los cambios se aplican inmediatamente.
                  </p>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    {Object.entries(THEME_CONFIG).map(([name, colors]) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => handleThemeChange(name)}
                        className="theme-tile"
                        style={{
                          border: currentClient.theme === name ? '3px solid var(--primary-color)' : '1px solid var(--glass-border)'
                        }}
                      >
                        <span className="theme-swatch" style={{ background: colors.primary }} />
                        <span className="theme-label">
                          {name}
                          {currentClient.theme === name && <small>Activo</small>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && section.id === 'instancia' && (
                <div className="config-section-body">
                  <div className="grid-3" style={{ fontSize: '0.85rem' }}>
                    <div><strong>Empresa:</strong> {currentClient.name}</div>
                    <div><strong>Plan:</strong> {currentClient.plan}</div>
                    {isAdminUser && (
                      <>
                        <div><strong>Base:</strong> {currentClient.databaseName || `agroData_${currentClient.id}`}</div>
                        <div><strong>Usuario BD:</strong> {currentClient.databaseUser || `${currentClient.id}_user`}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
