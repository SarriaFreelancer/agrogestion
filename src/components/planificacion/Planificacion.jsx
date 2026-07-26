import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { confirmDialog } from '../../lib/swal';

export default function Planificacion() {
  const { 
    globalCultivo, gruposActividades, actividades, sectores, 
    planificaciones, addPlanificacion, updatePlanificacion, deletePlanificacion, 
    generarOrden, desvincularOrden, productos, unidades, configuraciones
  } = useAgro();
  
  // Tabs
  const [mainTab, setMainTab] = useState(''); // '' | 'planificar' | 'mostrar'

  // --- TAB: PLANIFICAR (Formulario) ---
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedActividad, setSelectedActividad] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedFinca, setSelectedFinca] = useState('');
  const [selectedLote, setSelectedLote] = useState('');
  const [selectedSuertes, setSelectedSuertes] = useState([]);
  
  const [overrideUnidad, setOverrideUnidad] = useState('');
  const [fechaPlanificada, setFechaPlanificada] = useState(new Date().toISOString().split('T')[0]);
  const [haAPlanificar, setHaAPlanificar] = useState('');
  const [tipoDistribucion, setTipoDistribucion] = useState('Semanal'); 
  const [porcentajes, setPorcentajes] = useState([100, 0, 0, 0, 0, 0, 0]);
  
  // Insumos / Productos
  const [productosPlanificados, setProductosPlanificados] = useState([]); // [{id, cantidad, dosis, unidad}]
  const [selectedProdToAdd, setSelectedProdToAdd] = useState('');

  const [mensajeExito, setMensajeExito] = useState('');

  // Lógicas de Planificar
  const actividadesDisponibles = actividades.filter(a => a.groupId === selectedGrupo && (globalCultivo === 'Todos' || a.cultivo === globalCultivo || a.cultivo === 'Todos'));
  const sectorObj = sectores.find(s => s.id === selectedSector);
  const fincasDisponibles = sectorObj ? sectorObj.fincas : [];
  const fincaObj = fincasDisponibles?.find(f => f.id === selectedFinca);
  const lotesDisponibles = fincaObj ? fincaObj.lotes : [];
  const loteObj = lotesDisponibles?.find(l => l.id === selectedLote);
  const suertesDisponibles = loteObj ? loteObj.suertes?.filter(s => globalCultivo === 'Todos' || s.cultivo === globalCultivo) : [];

  React.useEffect(() => {
    if (selectedActividad) {
      const actInfo = actividades.find(a => a.id === selectedActividad);
      setOverrideUnidad(actInfo?.unidadProduccion || 'Hectáreas');
      
      // Inherit standard products
      if (actInfo?.productosEstandar) {
        const standard = actInfo.productosEstandar.map(pid => {
          const p = productos.find(x => x.id === pid);
          return { id: pid, nombre: p?.nombre, cantidad: 0, dosis: 0, unidad: p?.unidadMedida || 'Litros' };
        });
        setProductosPlanificados(standard);
      } else {
        setProductosPlanificados([]);
      }
    }
  }, [selectedActividad, actividades, productos]);

  const unidadProd = overrideUnidad || 'Hectáreas';
  const knownFixedUnits = ['Hectáreas', 'Plantas', 'Tareas', 'Toneladas'];
  const unidadOptions = Array.from(new Set([...knownFixedUnits, ...unidades.map(u => u.name)]));

  const getSuerteCapacity = (suerte, unidad) => {
    if (unidad === 'Hectáreas') return Number(suerte.hectareas) || 0;
    if (unidad === 'Plantas') return Number(suerte.plantas) || 0;
    if (unidad === 'Tareas') return Number(suerte.tareas) || 0;
    if (unidad === 'Toneladas') return Number(suerte.toneladas) || 0;
    return (suerte.otrasUnidades || []).reduce((sum, item) => item.unidad === unidad ? sum + (Number(item.cantidad) || 0) : sum, 0);
  };

  const suertesSeleccionadas = suertesDisponibles.filter(su => selectedSuertes.includes(su.id));
  const totalCapacidadSeleccionada = suertesSeleccionadas.reduce((acc, s) => acc + getSuerteCapacity(s, unidadProd), 0);
  const cantidadDisponible = selectedSuertes.length > 0
    ? (totalCapacidadSeleccionada > 0 ? totalCapacidadSeleccionada : 'Libre')
    : 0;
  const esLibreRealmente = selectedSuertes.length > 0 ? totalCapacidadSeleccionada === 0 : false;

  React.useEffect(() => {
    if (cantidadDisponible !== 'Libre' && cantidadDisponible > 0 && selectedSuertes.length > 0) {
      setHaAPlanificar(cantidadDisponible);
    } else if (selectedSuertes.length === 0) {
      setHaAPlanificar('');
    }
  }, [cantidadDisponible, selectedSuertes]);

  const handlePorcentajeChange = (index, value) => {
    const newPorcentajes = [...porcentajes];
    newPorcentajes[index] = Number(value);
    setPorcentajes(newPorcentajes);
  };

  const handleDoubleClick = (index) => {
    const totalRestante = porcentajes.reduce((acc, curr, i) => i !== index ? acc + curr : acc, 0);
    const restante = 100 - totalRestante;
    if (restante >= 0 && restante <= 100) {
      handlePorcentajeChange(index, restante);
    }
  };

  const handleAutoDistribute = () => {
    const base = parseFloat((100 / 7).toFixed(2));
    const final = parseFloat((100 - (base * 6)).toFixed(2));
    setPorcentajes([base, base, base, base, base, base, final]);
  };

  const totalPorcentaje = Number(porcentajes.reduce((acc, curr) => acc + curr, 0).toFixed(2));

  const addProductoToPlan = () => {
    if (!selectedProdToAdd) return;
    const p = productos.find(x => x.id === selectedProdToAdd);
    if (productosPlanificados.some(x => x.id === p.id)) return alert("Ya está agregado.");
    setProductosPlanificados([...productosPlanificados, { id: p.id, nombre: p.nombre, cantidad: 0, dosis: 0, unidad: p.unidadMedida || 'Litros' }]);
    setSelectedProdToAdd('');
  };

  const updateProductoRow = (id, field, value) => {
    setProductosPlanificados(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        // Si cambia la dosis o el área (haAPlanificar), recalcular cantidad
        if (field === 'dosis' || field === 'cantidad') {
          // Si el usuario edita la cantidad directamente, se mantiene. 
          // Si edita la dosis, recalculamos: cantidad = dosis * hectareas
          if (field === 'dosis') {
            updated.cantidad = Number(value) * (Number(haAPlanificar) || 0);
          }
        }
        return updated;
      }
      return p;
    }));
  };

  const removeProductoFromPlan = (id) => {
    setProductosPlanificados(prev => prev.filter(p => p.id !== id));
  };

  const handleSavePlanificacion = () => {
    if (!selectedActividad || !selectedSector) {
      alert("Debes seleccionar al menos una actividad y un sector.");
      return;
    }

    const act = actividades.find(a => a.id === selectedActividad);

    // --- VALIDACIONES POR CONFIGURACION ---
    if (configuraciones.validarInsumos) {
      const esAplicacion = act?.clasificacion === 'Aplicación de insumos' || 
                           act?.clasificacion === 'Aplicación de fertilizantes' || 
                           act?.clasificacion === 'Fertirriego';
      if (esAplicacion && productosPlanificados.length === 0) {
        alert(`La configuración del sistema exige registrar INSUMOS para la actividad: ${act?.name}`);
        return;
      }
    }
    // --------------------------------------

    if (selectedSuertes.length === 0) {
      alert("Debes seleccionar al menos una suerte.");
      return;
    }
    if (!haAPlanificar || Number(haAPlanificar) <= 0) {
      alert("La cantidad a planificar debe ser mayor a 0.");
      return;
    }
    if (!esLibreRealmente && Number(haAPlanificar) > cantidadDisponible) {
      alert(`No puedes planificar más de lo disponible (${cantidadDisponible} ${unidadProd}).`);
      return;
    }
    
    const totalAPlanificar = Number(haAPlanificar);
    const suertesAProcesar = suertesDisponibles.filter(su => selectedSuertes.includes(su.id));
    const totalCapacidad = suertesAProcesar.reduce((acc, s) => acc + getSuerteCapacity(s, unidadProd), 0);

    suertesAProcesar.forEach(suerte => {
      const capacidadSuerte = getSuerteCapacity(suerte, unidadProd);
      const porcion = esLibreRealmente
        ? totalAPlanificar / suertesAProcesar.length
        : totalCapacidad === 0
          ? 0
          : (capacidadSuerte / totalCapacidad) * totalAPlanificar;

      const planItem = { id: `${Date.now().toString()}-${Math.floor(Math.random() * 1000)}-${suerte.id}`,
        fecha: fechaPlanificada || new Date().toISOString().split('T')[0],
        actividadId: act?.id || '',
        actividadNombre: act?.name || '',
        estructuraNombre: `${suerte.name} (${lotesDisponibles.find(l => l.id === selectedLote)?.name})`,
        cultivo: suerte.cultivo,
        hectareasPlaneadas: Number(porcion.toFixed(2)),
        unidadProduccion: unidadProd,
        tipoDistribucion,
        porcentajes: [...porcentajes],
        insumos: productosPlanificados.map(ins => ({
          ...ins,
          cantidad: Number((ins.cantidad * (porcion / totalAPlanificar || 1)).toFixed(4))
        })),
        estado: 'Borrador',
        ordenCode: null
      };

      addPlanificacion(planItem);
    });

    setMensajeExito(`¡Se generaron ${suertesAProcesar.length} planificaciones (borrador) exitosamente!`);
    setTimeout(() => setMensajeExito(''), 4000);
    
    setSelectedGrupo('');
    setSelectedActividad('');
    setHaAPlanificar('');
    setSelectedSuertes([]);
    setPorcentajes([100, 0, 0, 0, 0, 0, 0]);
    // Go to Mostrar tab after short delay
    setTimeout(() => setMainTab('mostrar'), 1000);
  };

  // --- TAB: MOSTRAR (Historial y Edición) ---
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  
  const [editPlan, setEditPlan] = useState(null);

  // Filtro de Fechas. Validamos el formato ISO de la fecha (YYYY-MM-DD).
  const planificacionesFiltradas = planificaciones.filter(p => {
    let pasafiltro = true;
    
    // Fallback: Si la fecha antigua venía en DD/MM/YYYY, intentar extraerla no es seguro. 
    // Usaremos un formateo básico si no tiene guiones.
    let planFecha = p.fecha;
    if (planFecha && planFecha.includes('/')) {
        const parts = planFecha.split('/');
        if (parts.length === 3) {
            planFecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }

    if (filtroFechaInicio && planFecha < filtroFechaInicio) pasafiltro = false;
    if (filtroFechaFin && planFecha > filtroFechaFin) pasafiltro = false;
    return pasafiltro;
  });

  const handleGenerarOrden = (planId) => {
    generarOrden(planId);
  };

  const handleDesvincular = async (planId) => {
    if (await confirmDialog('¿Seguro que deseas desvincular la orden? Esto la devolverá a borrador.', { title: 'Desvincular orden' })) {
      desvincularOrden(planId);
    }
  };

  const startEdit = (plan) => {
    let planDate = plan.fecha;
    if (planDate && planDate.includes('/')) {
        const parts = planDate.split('/');
        if (parts.length === 3) planDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    setEditPlan({
        ...JSON.parse(JSON.stringify(plan)),
        fecha: planDate
    });
  };

  const saveEdit = () => {
    updatePlanificacion(editPlan.id, editPlan);
    setEditPlan(null);
  };

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Módulo de Planificación</h1>
            <span className="badge badge-active text-[11px]">Programación & Órdenes</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Genera, edita y consulta planificaciones agrícolas para el cultivo <strong className="text-emerald-400 font-semibold">{globalCultivo}</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button className={`!m-0 ${mainTab === 'planificar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMainTab('planificar')}>
          <span>Nueva Planificación</span>
        </button>
        <button className={`!m-0 ${mainTab === 'mostrar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMainTab('mostrar')}>
          <span>Mostrar (Historial)</span>
        </button>
      </div>

      {mainTab === 'planificar' && (
        <div className="space-y-6 fade-in">
          {mensajeExito && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
              {mensajeExito}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lado izquierdo */}
            <div>
              <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  1. Actividad y Parámetros
                </h3>
                <div className="input-group">
                  <label className="input-label">Grupo de Actividad</label>
                  <select className="input-field" value={selectedGrupo} onChange={e => { setSelectedGrupo(e.target.value); setSelectedActividad(''); }}>
                    <option value="">-- Seleccionar Grupo --</option>
                    {gruposActividades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Actividad Específica</label>
                  <select className="input-field" value={selectedActividad} onChange={e => setSelectedActividad(e.target.value)} disabled={!selectedGrupo}>
                    <option value="">-- Seleccionar Actividad --</option>
                    {actividadesDisponibles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                
                <div className="grid-2" style={{gap: '1rem', marginTop: '1rem'}}>
                  <div className="input-group" style={{marginBottom: 0}}>
                    <label className="input-label">Fecha de Inicio</label>
                    <input type="date" className="input-field" value={fechaPlanificada} onChange={e => setFechaPlanificada(e.target.value)} />
                  </div>
                  <div className="input-group" style={{marginBottom: 0}}>
                    <label className="input-label">Unidad a Planificar</label>
                    <select className="input-field" value={overrideUnidad} onChange={e => setOverrideUnidad(e.target.value)} disabled={!selectedActividad}>
                      {unidadOptions.map((unidad) => (
                        <option key={unidad} value={unidad}>{unidad}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  2. Ubicación y Cantidad
                </h3>
                <div className="input-group">
                  <label className="input-label">Sector</label>
                  <select className="input-field" value={selectedSector} onChange={e => { setSelectedSector(e.target.value); setSelectedFinca(''); setSelectedLote(''); setSelectedSuertes([]); setHaAPlanificar(''); }}>
                    <option value="">-- Todos / Seleccionar --</option>
                    {sectores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Finca</label>
                  <select className="input-field" value={selectedFinca} onChange={e => { setSelectedFinca(e.target.value); setSelectedLote(''); setSelectedSuertes([]); setHaAPlanificar(''); }} disabled={!selectedSector}>
                    <option value="">-- Todas / Seleccionar --</option>
                    {fincasDisponibles?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Lote</label>
                  <select className="input-field" value={selectedLote} onChange={e => { setSelectedLote(e.target.value); setSelectedSuertes([]); setHaAPlanificar(''); }} disabled={!selectedFinca}>
                    <option value="">-- Todos / Seleccionar --</option>
                    {lotesDisponibles?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Suertes (Selección Múltiple)</label>
                  {suertesDisponibles.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input type="checkbox" checked={selectedSuertes.length === suertesDisponibles.length} onChange={(e) => {
                          if(e.target.checked) setSelectedSuertes(suertesDisponibles.map(s => s.id));
                          else setSelectedSuertes([]);
                          setHaAPlanificar('');
                        }}/>
                        Seleccionar Todas
                      </label>
                      {suertesDisponibles.map(s => {
                        const extraUnidadInfo = (s.otrasUnidades || []).map(u => `${u.cantidad} ${u.unidad}`).join(', ');
                        return (
                          <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={selectedSuertes.includes(s.id)} onChange={(e) => {
                              if(e.target.checked) setSelectedSuertes([...selectedSuertes, s.id]);
                              else setSelectedSuertes(selectedSuertes.filter(id => id !== s.id));
                              setHaAPlanificar('');
                            }} />
                            {s.name} - {s.hectareas} ha, {s.plantas||0} pl, {s.tareas||0} tar{extraUnidadInfo ? `, ${extraUnidadInfo}` : ''}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontStyle: 'italic', padding: '0.5rem', fontSize: '0.9rem' }}>Selecciona un Lote primero</div>
                  )}
                </div>

                {selectedSuertes.length > 0 && (
                  <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f4f6f8', borderRadius: '8px', border: '1px solid #d1d5db'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <span style={{fontWeight: 'bold'}}>{esLibreRealmente ? 'Unidad Libre (Sin Límite):' : `Total ${unidadProd} Disponibles:`}</span>
                      <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>{cantidadDisponible} {esLibreRealmente ? '' : unidadProd}</span>
                    </div>
                    <div className="input-group" style={{marginBottom: 0}}>
                      <label className="input-label">Cantidad a Planificar ({unidadProd})</label>
                      <input type="number" className="input-field" value={haAPlanificar} onChange={e => setHaAPlanificar(e.target.value)} max={esLibreRealmente ? undefined : cantidadDisponible} placeholder="Ej. 5" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lado derecho */}
            <div>
              <div className="glass-card">
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>3. Distribución del Tiempo (%)</span>
                  {tipoDistribucion === 'Semanal' && (
                    <button onClick={handleAutoDistribute} style={{fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                      Distribuir Automático
                    </button>
                  )}
                </h3>
                
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="input-label">Tipo de Planificación</label>
                  <select className="input-field" value={tipoDistribucion} onChange={e => setTipoDistribucion(e.target.value)}>
                    <option value="Semanal">Semanal (7 Días)</option>
                    <option value="Mensual">Mensual (1 Mes)</option>
                  </select>
                </div>

                {tipoDistribucion === 'Semanal' ? (
                  <div>
                    <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Asigna el porcentaje. <strong style={{color: 'var(--primary-color)'}}>Tip: Doble clic en un campo para autocompletar.</strong>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia, idx) => (
                        <div key={dia} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: '0.9rem' }}>{dia}</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="number" className="input-field" style={{ width: '80px', padding: '0.4rem' }} min="0" max="100" step="0.01"
                              value={porcentajes[idx]} onChange={(e) => handlePorcentajeChange(idx, e.target.value)} onDoubleClick={() => handleDoubleClick(idx)}
                            />
                            <span>%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: totalPorcentaje === 100 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', color: totalPorcentaje === 100 ? 'var(--primary-color)' : 'var(--danger)' }}>
                      Total Distribuido: {totalPorcentaje}%
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f4f6f8', borderRadius: '8px' }}>
                      <label style={{ fontWeight: 'bold' }}>Total Mensual</label>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>100%</span>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                  <button 
                    className="btn-primary" 
                    disabled={(tipoDistribucion === 'Semanal' && totalPorcentaje !== 100) || !haAPlanificar}
                    style={{ opacity: ((tipoDistribucion === 'Semanal' && totalPorcentaje !== 100) || !haAPlanificar) ? 0.5 : 1 }}
                    onClick={handleSavePlanificacion}
                  >
                    Guardar Planificación
                  </button>
                </div>
              </div>

              {/* Sección de Insumos Condicional */}
              {selectedActividad && (['Aplicación de insumos', 'Aplicación de fertilizantes', 'Fertirriego'].includes(actividades.find(a => a.id ===selectedActividad)?.clasificacion)) && (
                <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    1.1 Selección de Insumos/Productos
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <select className="input-field" value={selectedProdToAdd} onChange={e=>setSelectedProdToAdd(e.target.value)}>
                      <option value="">-- Agregar Producto --</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.unidadMedida})</option>)}
                    </select>
                    <button className="btn-secondary" onClick={addProductoToPlan}>+ Agregar</button>
                  </div>

                  {productosPlanificados.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Producto</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Dosis (u/ha)</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Cant. Total</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosPlanificados.map(p => (
                          <tr key={p.id}>
                            <td style={{ padding: '0.5rem' }}>{p.nombre}</td>
                            <td style={{ padding: '0.5rem' }}><input type="number" className="input-field" style={{ padding: '0.2rem' }} value={p.dosis} onChange={e=>updateProductoRow(p.id, 'dosis', e.target.value)} /></td>
                            <td style={{ padding: '0.5rem' }}><input type="number" className="input-field" style={{ padding: '0.2rem' }} value={p.cantidad} onChange={e=>updateProductoRow(p.id, 'cantidad', e.target.value)} /> <small>{p.unidad}</small></td>
                            <td style={{ padding: '0.5rem' }}><button onClick={()=>removeProductoFromPlan(p.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === 'mostrar' && (
        <div className="fade-in">
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Filtros de Búsqueda</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="input-label">Desde Fecha</label>
                <input type="date" className="input-field" value={filtroFechaInicio} onChange={e => setFiltroFechaInicio(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="input-label">Hasta Fecha</label>
                <input type="date" className="input-field" value={filtroFechaFin} onChange={e => setFiltroFechaFin(e.target.value)} />
              </div>
              <button className="btn-secondary" onClick={() => {setFiltroFechaInicio(''); setFiltroFechaFin('');}}>Limpiar</button>
            </div>
          </div>

          <div className="glass-card">
            <h3>Planificaciones Registradas</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
              Solo puedes editar o borrar planificaciones que no estén en ejecución.
            </p>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid var(--primary-light)', color: 'var(--primary-dark)'}}>
                    <th style={{padding: '0.8rem 0.5rem'}}>Fecha Inicial</th>
                    <th style={{padding: '0.8rem 0.5rem'}}>Actividad</th>
                    <th style={{padding: '0.8rem 0.5rem'}}>Ubicación</th>
                    <th style={{padding: '0.8rem 0.5rem'}}>Cantidad</th>
                    <th style={{padding: '0.8rem 0.5rem'}}>Código Orden</th>
                    <th style={{padding: '0.8rem 0.5rem', textAlign: 'center'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {planificacionesFiltradas.length > 0 ? planificacionesFiltradas.map(plan => {
                    const enEjecucion = plan.ejecuciones && plan.ejecuciones.length > 0;
                    return (
                      <tr key={plan.id} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '0.8rem 0.5rem'}}>{plan.fecha}</td>
                        <td style={{padding: '0.8rem 0.5rem', fontWeight: 'bold'}}>{plan.actividadNombre}</td>
                        <td style={{padding: '0.8rem 0.5rem'}}>{plan.estructuraNombre}</td>
                        <td style={{padding: '0.8rem 0.5rem'}}>{plan.hectareasPlaneadas} {plan.unidadProduccion || 'ha'}</td>
                        <td style={{padding: '0.8rem 0.5rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>
                          {plan.ordenCode ? plan.ordenCode : <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>Borrador</span>}
                        </td>
                        <td style={{padding: '0.8rem 0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                          {plan.ordenCode ? (
                            <>
                              <span className={`badge ${enEjecucion ? 'badge-active' : 'badge-inactive'}`}>
                                {enEjecucion ? 'En Ejecución' : 'Orden Generada'}
                              </span>
                              {!enEjecucion && (
                                <button className="btn-secondary" onClick={() => handleDesvincular(plan.id)} style={{fontSize:'0.7rem', padding:'0.2rem 0.4rem'}}>Desvincular</button>
                              )}
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleGenerarOrden(plan.id)} className="btn-primary" style={{fontSize:'0.7rem', padding:'0.2rem 0.4rem'}}>Generar Orden</button>
                              <button onClick={() => startEdit(plan)} className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.2rem 0.4rem'}}>Editar</button>
                              <button onClick={() => handleBorrar(plan.id)} className="btn-danger" style={{background:'#d32f2f', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'0.7rem', padding:'0.2rem 0.4rem'}}>Borrar</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="6" style={{padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)'}}>No hay planificaciones en este rango de fechas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
      {editPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', background: '#fff' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Editar Planificación (Borrador)</h3>
            <p><strong>Actividad:</strong> {editPlan.actividadNombre}</p>
            <p style={{marginBottom: '1rem'}}><strong>Ubicación:</strong> {editPlan.estructuraNombre}</p>

            <div className="input-group">
              <label className="input-label">Fecha Planificada</label>
              <input type="date" className="input-field" value={editPlan.fecha} onChange={e => setEditPlan({...editPlan, fecha: e.target.value})} />
            </div>
            
            <div className="grid-2" style={{gap: '1rem'}}>
              <div className="input-group">
                <label className="input-label">Cantidad</label>
                <input type="number" className="input-field" value={editPlan.hectareasPlaneadas} onChange={e => setEditPlan({...editPlan, hectareasPlaneadas: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label className="input-label">Unidad</label>
                <select className="input-field" value={editPlan.unidadProduccion} onChange={e => setEditPlan({...editPlan, unidadProduccion: e.target.value})}>
                  <option value="Hectáreas">Hectáreas (Área Neta)</option>
                  <option value="Plantas">Plantas</option>
                  <option value="Tareas">Tareas</option>
                  <option value="Toneladas">Toneladas</option>
                  <option value="Jornales">Jornales</option>
                  <option value="Horas">Horas</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setEditPlan(null)}>Cancelar</button>
              <button className="btn-primary" onClick={saveEdit}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
