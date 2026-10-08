import { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Database, SlidersHorizontal, Layers, Tractor, Users, Package, 
  Building2, Sprout, Microscope, ChevronDown, ChevronUp, 
  FolderTree, Wrench, UsersRound, Scale, Tag, Sparkles
} from 'lucide-react';

// Import components from separate folders
import ActividadesTab from '@/modules/core/presentation/maestros/actividades/ActividadesTab';
import GruposTab from '@/modules/core/presentation/maestros/actividades/GruposTab';
import MaquinariaTab from '@/modules/core/presentation/maestros/maquinaria/MaquinariaTab';
import TiposMaquinariaTab from '@/modules/core/presentation/maestros/maquinaria/TiposTab';
import TrabajadoresTab from '@/modules/core/presentation/maestros/personal/TrabajadoresTab';
import CuadrillasTab from '@/modules/core/presentation/maestros/personal/CuadrillasTab';
import ProductosTab from '@/modules/core/presentation/maestros/productos/ProductosTab';
import TiposProductosTab from '@/modules/core/presentation/maestros/productos/TiposTab';
import UnidadesTab from '@/modules/core/presentation/maestros/unidades/UnidadesTab';
import ControlesTab from '@/modules/core/presentation/maestros/controles/ControlesTab';
import CultivosTab from '@/modules/core/presentation/maestros/cultivos/CultivosTab';
import ProveedoresTab from '@/modules/core/presentation/maestros/proveedores/ProveedoresTab';

export default function Maestros() {
  const { 
    globalCultivo, cultivos, addCultivo, editCultivo, deleteCultivo,
    actividades, addActividad, editActividad, deleteActividad,
    gruposActividades, addGrupo, editGrupo, deleteGrupo,
    maquinarias, addMaquinaria, editMaquinaria, deleteMaquinaria,
    tiposMaquinaria, addTipoMaquinaria, editTipoMaquinaria, deleteTipoMaquinaria,
    trabajadores, addTrabajador, editTrabajador, deleteTrabajador,
    cuadrillas, addCuadrilla, editCuadrilla, deleteCuadrilla,
    unidades, addUnidad, editUnidad, deleteUnidad,
    productos, addProducto, editProducto, deleteProducto, ajustarStock,
    tiposProductos, addTipoProducto, editTipoProducto, deleteTipoProducto,
    controlesAgro, addControlAgro, editControlAgro, deleteControlAgro,
    proveedores, addProveedor, editProveedor, deleteProveedor,
    configuraciones
  } = useAgro();

  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState('actividades');
  const [showTipos, setShowTipos] = useState(false);
  const isEnabled = (value) => Number(value) === 1;

  const actividadesFiltradas = globalCultivo === 'Todos' 
    ? (actividades || []) 
    : (actividades || []).filter(a => a.cultivo === globalCultivo || a.cultivo === 'Todos');

  const masterVisibility = {
    actividades: 'maestro_actividad',
    maquinaria: 'maestro_maq',
    trabajadores: 'maestro_mao',
    productos: 'maestro_ins',
    proveedores: 'maestro_proveedores',
    cultivos: 'maestro_cultivos',
    controles: 'maestro_controles',
    grupos: 'maestro_tp_act',
    tiposMaquinaria: 'maestro_tipos_maquinaria',
    cuadrillas: 'maestro_cuadrillas',
    unidades: 'maestro_unidades',
    tiposProductos: 'maestro_tipos_productos'
  };

  const mainMasters = [
    { id: 'actividades', label: 'Actividades', icon: <Layers size={18} />, count: (actividades || []).length, permission: 'Maestros', badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
    { id: 'maquinaria', label: 'Maquinaria', icon: <Tractor size={18} />, count: (maquinarias || []).length, permission: 'Maestros', badgeColor: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' },
    { id: 'trabajadores', label: 'Trabajadores', icon: <Users size={18} />, count: (trabajadores || []).length, permission: 'Maestros', badgeColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' },
    { id: 'productos', label: 'Productos & Insumos', icon: <Package size={18} />, count: (productos || []).length, permission: 'Maestros', badgeColor: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30' },
    { id: 'proveedores', label: 'Proveedores', icon: <Building2 size={18} />, count: (proveedores || []).length, permission: 'Maestros', badgeColor: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30' },
    { id: 'cultivos', label: 'Cultivos', icon: <Sprout size={18} />, count: (cultivos || []).length, permission: 'Maestros', badgeColor: 'bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/30' },
    { id: 'controles', label: 'Controles Agronómicos', icon: <Microscope size={18} />, count: (controlesAgro || []).length, permission: 'Monitoreo', badgeColor: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30' }
  ].filter(m => hasPermission(m.permission) && isEnabled(configuraciones?.[masterVisibility[m.id]]));

  const typesMasters = [
    { id: 'grupos', label: 'Grupos de Actividad', icon: <FolderTree size={16} />, count: (gruposActividades || []).length },
    { id: 'tiposMaquinaria', label: 'Tipos de Maquinaria', icon: <Wrench size={16} />, count: (tiposMaquinaria || []).length },
    { id: 'cuadrillas', label: 'Cuadrillas de Campo', icon: <UsersRound size={16} />, count: (cuadrillas || []).length },
    { id: 'unidades', label: 'Unidades de Medida', icon: <Scale size={16} />, count: (unidades || []).length },
    { id: 'tiposProductos', label: 'Tipos de Insumo', icon: <Tag size={16} />, count: (tiposProductos || []).length }
  ].filter(m => isEnabled(configuraciones?.[masterVisibility[m.id]]));

  const totalCatalogsCount = typesMasters.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 fade-in p-4 md:p-8 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="glass-card !p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text-contrast)] tracking-tight">Centro de Maestros</h1>
              <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium">
                Catálogos estandarizados para operaciones, maquinaria, insumos y cuadrillas agrícolas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 dark:bg-black/30 p-2 rounded-xl border border-slate-200 dark:border-white/10">
          <span className="text-xs text-[var(--text-muted)] font-medium px-2">Cultivo Filtro:</span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[var(--primary-color)] text-white shadow">
            {globalCultivo}
          </span>
        </div>
      </div>

      {/* Selector de Pestañas Principales */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2.5 items-center">
          {mainMasters.map(m => {
            const isActive = activeTab === m.id;
            return (
              <button 
                key={m.id} 
                onClick={() => { setActiveTab(m.id); setShowTipos(false); }} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  isActive 
                    ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/25 scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 text-[var(--text-contrast)] border-slate-200 dark:border-white/10 hover:border-[var(--primary-color)]/40 hover:bg-[var(--primary-color)]/10'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[var(--primary-color)]'}>
                  {m.icon}
                </span>
                <span>{m.label}</span>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                  isActive ? 'bg-white/20 text-white border-white/30' : m.badgeColor
                }`}>
                  {m.count}
                </span>
              </button>
            );
          })}
          
          <button 
            onClick={() => setShowTipos(!showTipos)} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
              showTipos || typesMasters.some(t => t.id === activeTab)
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20' 
                : 'bg-white dark:bg-slate-900 text-[var(--text-contrast)] border-slate-200 dark:border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10'
            }`}
          >
            <SlidersHorizontal size={18} className={showTipos || typesMasters.some(t => t.id === activeTab) ? "text-white" : "text-amber-600 dark:text-amber-400"} />
            <span>Catálogos & Tipos</span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
              {totalCatalogsCount}
            </span>
            {showTipos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Submenú de Catálogos & Tipos */}
        {showTipos && (
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/20 flex flex-wrap gap-2.5 backdrop-blur-md fade-in shadow-md">
            <div className="w-full flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>Subcatálogos y Clasificaciones Paramétricas</span>
            </div>
            {typesMasters.map(m => {
              const isActive = activeTab === m.id;
              return (
                <button 
                  key={m.id} 
                  onClick={() => setActiveTab(m.id)} 
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    isActive 
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-[1.02]' 
                      : 'bg-white dark:bg-slate-800 text-[var(--text-contrast)] border-slate-200 dark:border-white/10 hover:border-amber-400/40 hover:bg-amber-500/10'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}>{m.icon}</span>
                  <span>{m.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-black/30 text-white' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    {m.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contenido de la Tabla Seleccionada */}
      <div className={activeTab ? "glass-card !p-6 border border-white/10 shadow-xl" : "glass-card !p-12 text-center"}>
        {!activeTab && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center text-[var(--primary-color)] mb-4 shadow-inner">
              <Database size={40} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-contrast)] mb-2">Seleccione un maestro para comenzar</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
              Explore y edite los catálogos de maquinaria, personal, productos, actividades, cultivos y configuraciones agronómicas.
            </p>
          </div>
        )}
        
        {activeTab === 'actividades' && <ActividadesTab data={actividadesFiltradas} grupos={gruposActividades} unidades={unidades} cultivos={cultivos} addActividad={addActividad} editActividad={editActividad} deleteActividad={deleteActividad} globalCultivo={globalCultivo} />}
        {activeTab === 'cultivos' && <CultivosTab data={cultivos} onAdd={addCultivo} onEdit={editCultivo} onDelete={deleteCultivo} />}
        {activeTab === 'grupos' && <GruposTab data={gruposActividades} onAdd={addGrupo} onEdit={editGrupo} onDelete={deleteGrupo} />}
        {activeTab === 'maquinaria' && <MaquinariaTab data={maquinarias} tipos={tiposMaquinaria} addMaquinaria={addMaquinaria} editMaquinaria={editMaquinaria} deleteMaquinaria={deleteMaquinaria} />}
        {activeTab === 'tiposMaquinaria' && <TiposMaquinariaTab data={tiposMaquinaria} onAdd={addTipoMaquinaria} onEdit={editTipoMaquinaria} onDelete={deleteTipoMaquinaria} />}
        {activeTab === 'trabajadores' && <TrabajadoresTab data={trabajadores} cuadrillas={cuadrillas} addTrabajador={addTrabajador} editTrabajador={editTrabajador} deleteTrabajador={deleteTrabajador} />}
        {activeTab === 'cuadrillas' && <CuadrillasTab data={cuadrillas} trabajadores={trabajadores} addCuadrilla={addCuadrilla} editCuadrilla={editCuadrilla} deleteCuadrilla={deleteCuadrilla} />}
        {activeTab === 'unidades' && <UnidadesTab data={unidades} onAdd={addUnidad} onEdit={editUnidad} onDelete={deleteUnidad} />}
        {activeTab === 'productos' && <ProductosTab data={productos} tipos={tiposProductos} onAdd={addProducto} onEdit={editProducto} onDelete={deleteProducto} ajustarStock={ajustarStock} />}
        {activeTab === 'tiposProductos' && <TiposProductosTab data={tiposProductos} onAdd={addTipoProducto} onEdit={editTipoProducto} onDelete={deleteTipoProducto} />}
        {activeTab === 'proveedores' && <ProveedoresTab data={proveedores} addProveedor={addProveedor} editProveedor={editProveedor} deleteProveedor={deleteProveedor} />}
        {activeTab === 'controles' && <ControlesTab data={controlesAgro} onAdd={addControlAgro} onEdit={editControlAgro} onDelete={deleteControlAgro} />}
      </div>
    </div>
  );
}
