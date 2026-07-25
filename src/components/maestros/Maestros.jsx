import { useState } from 'react';
import { useAgro } from '../../context/AgroContext';

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
    { id: 'actividades', label: 'Actividades', icon: '📋', permission: 'Maestros' },
    { id: 'maquinaria', label: 'Maquinaria', icon: '🚜', permission: 'Maestros' },
    { id: 'trabajadores', label: 'Trabajadores', icon: '👤', permission: 'Maestros' },
    { id: 'productos', label: 'Productos', icon: '📦', permission: 'Maestros' },
    { id: 'proveedores', label: 'Proveedores', icon: '🏢', permission: 'Maestros' },
    { id: 'cultivos', label: 'Cultivos', icon: '🌱', permission: 'Maestros' },
    { id: 'controles', label: 'Controles Agro', icon: '🔬', permission: 'Monitoreo' }
  ].filter(m => hasPermission(m.permission) && isEnabled(configuraciones[masterVisibility[m.id]]));

  const typesMasters = [
    { id: 'grupos', label: 'Grupos de Actividad' },
    { id: 'tiposMaquinaria', label: 'Tipos de Maquinaria' },
    { id: 'cuadrillas', label: 'Cuadrillas' },
    { id: 'unidades', label: 'Unidades de Medida' },
    { id: 'tiposProductos', label: 'Tipos de Productos' }
  ].filter(m => isEnabled(configuraciones[masterVisibility[m.id]]));

  return (
    <div className="fade-in">
      <div className="header">
        <h1>Centro de Maestros</h1>
        <p>Seleccione un catálogo para gestionar la información base. Cultivo: <strong>{globalCultivo}</strong></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {mainMasters.map(m => (
            <button 
              key={m.id} 
              onClick={() => { setActiveTab(m.id); setShowTipos(false); }} 
              className={activeTab === m.id ? "btn-primary" : "btn-secondary"}
              style={{ padding: '0.7rem 1rem', minWidth: '128px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
          
          <button 
            onClick={() => setShowTipos(!showTipos)} 
            className={showTipos ? "btn-primary" : "btn-secondary"}
            style={{ padding: '0.7rem 1rem', minWidth: '128px', fontSize: '0.88rem', background: showTipos ? '' : '#455a64', color: 'white' }}
          >
            ⚙️ Catálogos y Tipos {showTipos ? '▲' : '▼'}
          </button>
        </div>

        {showTipos && (
          <div className="glass-card" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.05)', padding: '0.8rem' }}>
            {typesMasters.map(m => (
              <button 
                key={m.id} 
                onClick={() => setActiveTab(m.id)} 
                className={activeTab === m.id ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={activeTab ? "glass-card" : ""}>
        {!activeTab && (
          <div style={{ textAlign: 'center', padding: '2.75rem', color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3>Seleccione un maestro para comenzar a gestionar</h3>
            <p>Aquí podrá editar los catálogos de maquinaria, personal, productos y configuraciones del sistema.</p>
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

