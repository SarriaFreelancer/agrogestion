import { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Database, SlidersHorizontal, Layers, Tractor, Users, Package, Building2, Sprout, Microscope, ChevronDown, ChevronUp, Search } from 'lucide-react';

// Import components from separate folders
import ActividadesTab from './actividades/ActividadesTab';
import GruposTab from './actividades/GruposTab';
import MaquinariaTab from './maquinaria/MaquinariaTab';
import TiposMaquinariaTab from './maquinaria/TiposTab';
import TrabajadoresTab from './personal/TrabajadoresTab';
import CuadrillasTab from './personal/CuadrillasTab';
import ProductosTab from './productos/ProductosTab';
import TiposProductosTab from './productos/TiposTab';
import UnidadesTab from './unidades/UnidadesTab';
import ControlesTab from './controles/ControlesTab';
import CultivosTab from './cultivos/CultivosTab';
import ProveedoresTab from './proveedores/ProveedoresTab';

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
    configuraciones,
    hasPermission
  } = useAgro();

  const [activeTab, setActiveTab] = useState(null);
  const [showTipos, setShowTipos] = useState(false);
  const isEnabled = (value) => Number(value) === 1;

  const actividadesFiltradas = globalCultivo === 'Todos' ? actividades : actividades.filter(a => a.cultivo === globalCultivo || a.cultivo === 'Todos');

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
    { id: 'actividades', label: 'Actividades', icon: <Layers size={18} />, permission: 'Maestros' },
    { id: 'maquinaria', label: 'Maquinaria', icon: <Tractor size={18} />, permission: 'Maestros' },
    { id: 'trabajadores', label: 'Trabajadores', icon: <Users size={18} />, permission: 'Maestros' },
    { id: 'productos', label: 'Productos', icon: <Package size={18} />, permission: 'Maestros' },
    { id: 'proveedores', label: 'Proveedores', icon: <Building2 size={18} />, permission: 'Maestros' },
    { id: 'cultivos', label: 'Cultivos', icon: <Sprout size={18} />, permission: 'Maestros' },
    { id: 'controles', label: 'Controles Agro', icon: <Microscope size={18} />, permission: 'Monitoreo' }
  ].filter(m => hasPermission(m.permission) && isEnabled(configuraciones[masterVisibility[m.id]]));

  const typesMasters = [
    { id: 'grupos', label: 'Grupos de Actividad' },
    { id: 'tiposMaquinaria', label: 'Tipos de Maquinaria' },
    { id: 'cuadrillas', label: 'Cuadrillas' },
    { id: 'unidades', label: 'Unidades de Medida' },
    { id: 'tiposProductos', label: 'Tipos de Productos' }
  ].filter(m => isEnabled(configuraciones[masterVisibility[m.id]]));

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-contrast)] tracking-tight">Centro de Maestros</h1>
            <span className="badge badge-info text-[11px]">Catálogos Base</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Gestión y mantenimiento de tablas maestros. Cultivo activo: <strong className="text-primary-light font-semibold">{globalCultivo}</strong>
          </p>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          {mainMasters.map(m => (
            <button 
              key={m.id} 
              onClick={() => { setActiveTab(m.id); setShowTipos(false); }} 
              className={activeTab === m.id ? "btn-primary !m-0" : "btn-secondary !m-0"}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
          
          <button 
            onClick={() => setShowTipos(!showTipos)} 
            className={`!m-0 ${showTipos ? "btn-primary" : "btn-secondary"}`}
          >
            <SlidersHorizontal size={18} />
            <span>Catálogos & Tipos</span>
            {showTipos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showTipos && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap gap-2 backdrop-blur-md fade-in">
            {typesMasters.map(m => (
              <button 
                key={m.id} 
                onClick={() => setActiveTab(m.id)} 
                className={`!m-0 text-xs ${activeTab === m.id ? "btn-primary" : "btn-secondary"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenido de la Tabla Seleccionada */}
      <div className={activeTab ? "glass-card !p-6" : "glass-card !p-12 text-center"}>
        {!activeTab && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light mb-4">
              <Database size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-contrast)] mb-2">Seleccione un maestro para comenzar</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
              Explore y edite los catálogos de maquinaria, personal, productos, cultivos y configuraciones estructurales del sistema.
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
