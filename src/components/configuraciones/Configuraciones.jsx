import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Switch } from '../ui/Switch';

function Configuraciones() {
  const { currentClient, configuraciones, updateConfiguracion, currentUser, updateClient, clients, setCurrentClient, THEME_CONFIG } = useAgro();
  const isAdminUser = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador' || currentUser?.modulos?.includes('ALL');

  const [activeTab, setActiveTab] = useState('monitoreo');

  const isEnabled = (val) => Number(val) === 1;

  const handleToggle = (key) => {
    const currentValue = configuraciones[key];
    const nextValue = Number(currentValue) === 1 ? 0 : 1;
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
    const clientKey = Object.keys(clients || {}).find(k => (clients[k]?.id || k) === currentClient.id);
    if (clientKey && typeof updateClient === 'function') {
      updateClient(clientKey, currentClient.plan, currentClient.modules, newTheme);
    }
    if (typeof setCurrentClient === 'function') {
      setCurrentClient({ ...currentClient, theme: newTheme });
    }
    if (typeof updateConfiguracion === 'function') {
      updateConfiguracion('tema', newTheme);
    }
  };

  const menuSections = [
    {
      title: 'CONFIGURACIÓN GENERAL',
      items: [
        { id: 'datos_empresa', label: 'Datos de Empresa', icon: '🏢' },
        { id: 'seguridad', label: 'Seguridad & Sesión', icon: '🛡️' },
        { id: 'respaldos', label: 'Respaldos y SMTP', icon: '🗄️' },
        { id: 'importacion', label: 'Importación Masiva', icon: '☁️' },
        { id: 'datos_prueba', label: 'Datos de Prueba', icon: '🗃️' }
      ]
    },
    {
      title: 'CONFIGURACIÓN OPERATIVA',
      items: [
        { id: 'insumos', label: 'Insumos', icon: '📦' },
        { id: 'maquinaria', label: 'Maquinaria', icon: '🚜' },
        { id: 'mano_obra', label: 'Mano de Obra', icon: '👥' },
        { id: 'monitoreo', label: 'Monitoreo', icon: '🔬' },
        { id: 'estructura', label: 'Estructura', icon: '🗺️' },
        { id: 'maestros', label: 'Maestros', icon: '📚' },
        { id: 'apariencia', label: 'Apariencia', icon: '🎨' },
        { id: 'instancia', label: 'Instancia', icon: '⚙️' }
      ]
    }
  ];

  if (isAdminUser) {
    menuSections.push({
      title: 'GESTIÓN DE INFRAESTRUCTURA',
      items: [
        { id: 'servidores', label: 'Servidores (Inquilinos)', icon: '🖥️' },
        { id: 'registros', label: 'Registros del Sistema', icon: '📋' }
      ]
    });
  }

  const renderContent = () => {
    if (activeTab === 'monitoreo') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                🔬
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Monitoreo</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Configure las opciones de monitoreo de su sistema</p>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary">Monitoreo Activo</h4>
                <p className="text-[11px] text-[var(--text-muted)]">Todas las funciones están habilitadas</p>
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            {[
              { id: 'monitoreo_gps', label: 'GPS del Registrador', desc: 'Adjunta coordenadas al registro si están disponibles.', icon: '📍' },
              { id: 'monitoreo_alertas', label: 'Mostrar alertas de rango', desc: 'Resalta valores fuera de los rangos definidos.', icon: '🔔' },
              { id: 'monitoreo_adicionales', label: 'Permitir muestras adicionales', desc: 'Activa el registro de sub-muestras por monitoreo.', icon: '🧪' },
              { id: 'monitoreo_obs', label: 'Permitir observaciones', desc: 'Agrega un campo de notas al formulario de monitoreo.', icon: '📝' },
              { id: 'monitoreo_req', label: 'Variables validar requeridas', desc: 'Impide guardar monitoreo si una variable marcada como requerida está vacía.', icon: '⚙️' }
            ].map(opt => (
              <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-[var(--glass-border)] hover:border-primary/30 transition-colors group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary group-hover:border-primary/30 transition-colors">
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[var(--text-contrast)]">{opt.label}</h4>
                    <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 pr-2">
                  <Switch 
                    checked={isEnabled(configuraciones[opt.id] ?? 1)} 
                    onCheckedChange={() => handleToggle(opt.id)} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/10 rounded-tl-full blur-2xl pointer-events-none"></div>
            <span className="text-xl">💡</span>
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-primary mb-1">Consejo</h4>
              <p className="text-xs text-[var(--text-muted)]">Estas configuraciones se aplican a todos los formularios de monitoreo del sistema.</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'insumos') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                📦
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Insumos</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Validaciones de productos y control de stock.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'config_insumos', label: 'Bloque de Insumos', desc: 'Activa o desactiva la sección operativa de insumos.', icon: '📦' },
              { id: 'validarInsumos', label: 'Obligar Insumos', desc: 'Requiere productos en fertilizaciones.', icon: '⚠️' },
              { id: 'bloquearStockNegativo', label: 'Bloquear Stock Negativo', desc: 'Impide salidas sin existencias.', icon: '🛑' },
              { id: 'registrarGpsInsumos', label: 'Registrar ubicación GPS', desc: 'Captura coordenadas para apuntes de insumos.', icon: '📍' }
            ].map(opt => (
              <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-[var(--glass-border)] hover:border-primary/30 transition-colors group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary transition-colors">
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[var(--text-contrast)]">{opt.label}</h4>
                    <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 pr-2">
                  <Switch 
                    checked={isEnabled(configuraciones[opt.id] ?? (opt.id === 'config_insumos' ? 1 : 0))} 
                    onCheckedChange={() => handleToggle(opt.id)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'maquinaria') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                🚜
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Maquinaria</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Reglas de equipos y validación operativa.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'config_maq', label: 'Bloque de Maquinaria', desc: 'Activa o desactiva la sección operativa de maquinaria.', icon: '🚜' },
              { id: 'validarMaquinaria', label: 'Obligar Maquinaria', desc: 'Requiere equipo en labores mecánicas.', icon: '⚠️' },
              { id: 'registrarGpsMaquinaria', label: 'Registrar ubicación GPS', desc: 'Captura coordenadas para apuntes de maquinaria.', icon: '📍' }
            ].map(opt => (
              <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-[var(--glass-border)] hover:border-primary/30 transition-colors group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary transition-colors">
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[var(--text-contrast)]">{opt.label}</h4>
                    <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 pr-2">
                  <Switch 
                    checked={isEnabled(configuraciones[opt.id] ?? (opt.id === 'config_maq' ? 1 : 0))} 
                    onCheckedChange={() => handleToggle(opt.id)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'mano_obra') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                👥
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Mano de Obra</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Control de nómina y personal requerido.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'config_mao', label: 'Bloque de Mano de Obra', desc: 'Activa o desactiva la sección operativa de mano de obra.', icon: '👥' },
              { id: 'validarNomina', label: 'Obligar Nómina', desc: 'Requiere registro de personal en las labores.', icon: '📋' },
              { id: 'registrarGpsManoObra', label: 'Registrar ubicación GPS', desc: 'Captura coordenadas para apuntes de mano de obra.', icon: '📍' }
            ].map(opt => (
              <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-[var(--glass-border)] hover:border-primary/30 transition-colors group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary transition-colors">
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[var(--text-contrast)]">{opt.label}</h4>
                    <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 pr-2">
                  <Switch 
                    checked={isEnabled(configuraciones[opt.id] ?? (opt.id === 'config_mao' ? 1 : 0))} 
                    onCheckedChange={() => handleToggle(opt.id)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'estructura') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                🗺️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Estructura</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Defina los niveles de jerarquía y sus descripciones.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-[var(--glass-border)] rounded-xl p-6 mb-6">
            <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">Niveles de jerarquía</label>
            <select
              className="w-full bg-[#0d131f] border border-[var(--glass-border)] rounded-lg px-4 py-2.5 text-[var(--text-contrast)] focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={configuraciones.estructuraNiveles || 4}
              onChange={(e) => handleEstructuraNivelesChange(e.target.value)}
            >
              {[2, 3, 4].map(level => (
                <option key={level} value={level}>{level} niveles</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: configuraciones.estructuraNiveles || 4 }, (_, index) => {
              const nivelCount = configuraciones.estructuraNiveles || 4;
              const isLastLevel = index === nivelCount - 1;
              const key = isLastLevel ? 'nivel4' : `nivel${index + 1}`;
              const levelNumber = isLastLevel ? 4 : index + 1;
              return (
                <div key={key} className="bg-[#111827] border border-[var(--glass-border)] rounded-xl p-5">
                  <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">Nombre global Nivel {levelNumber}</label>
                  <input
                    type="text"
                    className="w-full bg-[#0d131f] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-[var(--text-contrast)] focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    value={configuraciones.estructuraNivelNombres?.[key] || ''}
                    onChange={(e) => handleLevelNameChange(key, e.target.value)}
                    placeholder={`Ej: ${['Sector', 'Finca', 'Lote', 'Suerte', 'Subnivel', 'Subnivel'][index]}`}
                    disabled={isLastLevel}
                  />
                  {isLastLevel && <p className="text-xs text-gray-500 mt-2">El último nivel siempre representa la unidad mínima productiva.</p>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === 'maestros') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                📚
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Maestros</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Habilite o desactive los catálogos en el sistema.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'maestro_actividad', label: 'Actividades', icon: '📝' },
              { id: 'maestro_maq', label: 'Maquinaria', icon: '🚜' },
              { id: 'maestro_mao', label: 'Trabajadores', icon: '👥' },
              { id: 'maestro_ins', label: 'Productos', icon: '📦' },
              { id: 'maestro_proveedores', label: 'Proveedores', icon: '🏢' },
              { id: 'maestro_cultivos', label: 'Cultivos', icon: '🌱' },
              { id: 'maestro_controles', label: 'Controles Agro', icon: '🔬' },
              { id: 'maestro_tp_act', label: 'Grupos de Actividad', icon: '🗂️' },
              { id: 'maestro_tipos_maquinaria', label: 'Tipos de Maquinaria', icon: '⚙️' },
              { id: 'maestro_cuadrillas', label: 'Cuadrillas', icon: '🧑‍🤝‍🧑' },
              { id: 'maestro_unidades', label: 'Unidades de Medida', icon: '📏' },
              { id: 'maestro_tipos_productos', label: 'Tipos de Productos', icon: '🔖' }
            ].map(maestro => (
              <div key={maestro.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-[var(--glass-border)] hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{maestro.icon}</span>
                  <span className="text-sm font-semibold text-[var(--text-contrast)]">{maestro.label}</span>
                </div>
                <Switch 
                  checked={isEnabled(configuraciones[maestro.id] ?? 1)} 
                  onCheckedChange={() => handleToggle(maestro.id)} 
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'instancia') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20 shadow-md">
                ⚙️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Instancia</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Datos y estado de la cuenta activa.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-[var(--glass-border)] rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Empresa</p>
              <p className="text-lg font-bold text-[var(--text-contrast)]">{currentClient?.name || 'Agro Empresa'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plan</p>
              <p className="text-lg font-bold text-primary-light">{currentClient?.plan || 'Standard'}</p>
            </div>
            {isAdminUser && (
              <>
                <div className="pt-4 border-t border-[var(--glass-border)]">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Base de Datos</p>
                  <p className="text-base text-[var(--text-muted)] font-mono">{currentClient?.databaseName || `agroData_${currentClient?.id}`}</p>
                </div>
                <div className="pt-4 border-t border-[var(--glass-border)]">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Usuario BD</p>
                  <p className="text-base text-[var(--text-muted)] font-mono">{currentClient?.databaseUser || `${currentClient?.id}_user`}</p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'apariencia') {
      const themes = [
        { id: 'Verde Agro', label: 'Verde Agro', desc: 'Inspirado en la naturaleza y el crecimiento agrícola.', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop' },
        { id: 'Azul Océano', label: 'Azul Océano', desc: 'Transmite confianza, estabilidad y profundidad.', img: 'https://images.unsplash.com/photo-1498623116890-37e912163d5d?q=80&w=800&auto=format&fit=crop' },
        { id: 'Tierra Café', label: 'Tierra Café', desc: 'Conexión con la tierra, calidez y naturalidad.', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop' },
        { id: 'Púrpura Real', label: 'Púrpura Real', desc: 'Elegancia, sofisticación y liderazgo.', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
        { id: 'Naranja Atardecer', label: 'Naranja Atardecer', desc: 'Energía, creatividad y optimismo.', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop' },
        { id: 'Gris Carbón', label: 'Gris Carbón', desc: 'Modernidad, equilibrio y profesionalismo.', img: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=800&auto=format&fit=crop' },
        { id: 'Tema Principal', label: 'Tema Principal', desc: 'El tono pizarra profundo de las tarjetas originales.', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
        { id: 'Noche Clásica', label: 'Noche Clásica', desc: 'Un modo negro absoluto de alto contraste.', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop' },
        { id: 'Modo Nocturno', label: 'Modo Nocturno', desc: 'Interfaz oscura para ambientes de baja luz.', img: 'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=800&auto=format&fit=crop' },
        { id: 'Blanco Completo', label: 'Blanco Completo', desc: 'Diseño limpio y minimalista de alto contraste.', img: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=800&auto=format&fit=crop' }
      ];

      return (
        <div className="space-y-6 w-full max-w-5xl fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-2xl border border-[var(--glass-border)]">
                🎨
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-contrast)] tracking-tight">Apariencia</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Seleccione el esquema de colores para su instancia</p>
              </div>
            </div>
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] px-4 py-3 rounded-xl flex items-center gap-3 max-w-sm">
              <div className="w-6 h-6 shrink-0 rounded-full bg-white/5 border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] text-xs">
                ℹ️
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-primary mb-0.5">Información</h4>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">El cambio de apariencia se aplicará inmediatamente en toda la plataforma.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#111827] border border-[var(--glass-border)] rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <h4 className="text-[15px] font-semibold text-[var(--text-contrast)]">Modo Claro / Oscuro</h4>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Alterna la base de la interfaz (los colores primarios del tema se mantendrán).</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${configuraciones.modoOscuro === 0 ? 'text-primary' : 'text-gray-500'}`}>Claro</span>
              <Switch 
                checked={configuraciones.modoOscuro !== 0} 
                onCheckedChange={() => handleToggle('modoOscuro')} 
              />
              <span className={`text-xs font-semibold ${configuraciones.modoOscuro !== 0 ? 'text-primary' : 'text-gray-500'}`}>Oscuro</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map(theme => {
              const isActive = currentClient.theme === theme.id || (theme.id === 'Verde Agro' && !currentClient.theme);
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative text-left rounded-xl overflow-hidden border transition-all duration-300 group
                    ${isActive 
                      ? 'border-primary shadow-lg bg-[#111827]' 
                      : 'border-[var(--glass-border)] bg-[#111827] hover:border-white/20'
                    }
                  `}
                >
                  <div className="h-32 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent z-10"></div>
                    <img src={theme.img} alt={theme.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {isActive && (
                      <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-4 relative z-20">
                    <h4 className="text-base font-bold text-white mb-1">{theme.label}</h4>
                    <p className="text-xs text-white leading-relaxed mb-4 min-h-[36px]">{theme.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary shadow-sm' : 'border border-gray-600 bg-transparent'}`}></div>
                        <span className="text-xs font-semibold text-white">
                          {isActive ? 'Tema Activo' : 'Seleccionar Tema'}
                        </span>
                      </div>
                      <div className="w-12 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: THEME_CONFIG?.[theme.id]?.primary || 'gray' }}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="text-4xl block mb-4 text-gray-600">🚧</span>
          <h3 className="text-xl font-bold text-white mb-2">Módulo en Construcción</h3>
          <p className="text-gray-400">Las configuraciones para esta sección estarán disponibles pronto.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full fade-in gap-5 p-0 bg-transparent">
      {/* Sidebar de Configuración */}
      <div className="w-[280px] border-r border-[var(--glass-border)] flex-shrink-0 z-10 bg-[var(--sidebar-bg)] flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-8 shrink-0 bg-transparent flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--sidebar-text)] leading-tight mb-1">Configuración</h1>
          <p className="text-[13px] text-[var(--sidebar-text-muted)] leading-normal">Administre sus preferencias</p>
        </div>

        {/* Lista de Navegación Ordenada */}
        <div className="px-4 pb-6 overflow-y-auto custom-scrollbar flex-1 space-y-7">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              {/* Título de Categoría */}
              <div className="flex items-center gap-2 px-2 mb-2">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-[var(--sidebar-text-muted)] leading-none">
                  {section.title}
                </h3>
              </div>

              {/* Botones de Ítems */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group ${
                        isActive 
                          ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20' 
                          : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--input-bg)]'
                      }`}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'text-[var(--sidebar-text)]' : 'text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text)]'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="truncate tracking-wide leading-tight text-left">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent p-6 lg:p-10">
        {renderContent()}
      </div>
    </div>
  );
}

export default Configuraciones;
