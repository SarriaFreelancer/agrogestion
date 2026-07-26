import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';

export default function Ejecucion() {
  const { planificaciones, ejecutarPlanificacion, trabajadores, cuadrillas, actividades, unidades, maquinarias, tiposMaquinaria, productos, configuraciones, ajustarStock } = useAgro();
  
  const [searchCode, setSearchCode] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [activePlan, setActivePlan] = useState(null);
  
  // View Toggle (Control vs Reporte)
  const [mainTab, setMainTab] = useState('control');

  // Ejecución de la Orden
  const [haEjecutadas, setHaEjecutadas] = useState('');
  const [errorMsj, setErrorMsj] = useState('');

  // Cuadrilla / Destajo
  const [trabajadoresAgregados, setTrabajadoresAgregados] = useState([]);
  const [selectedTrabajador, setSelectedTrabajador] = useState('');
  const [selectedCuadrilla, setSelectedCuadrilla] = useState('');
  const [selectedMaquinariaId, setSelectedMaquinariaId] = useState('');
  const [selectedImplementosIds, setSelectedImplementosIds] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  // Insumos / Producción Real
  const [insumosEjecutados, setInsumosEjecutados] = useState([]);
  const [produccionReal, setProduccionReal] = useState('');
  const [unidadProduccionReal, setUnidadProduccionReal] = useState('Toneladas');

  // Tiempos y Medidores
  const [horaInicio, setHoraInicio] = useState('07:00');
  const [horaFin, setHoraFin] = useState('16:00');
  const [horometroInicial, setHorometroInicial] = useState(0);
  const [horometroFinal, setHorometroFinal] = useState(0);
  const [ubicacionInicio, setUbicacionInicio] = useState(null);
  const [ubicacionFin, setUbicacionFin] = useState(null);
  const [ubicacionStatus, setUbicacionStatus] = useState('');
  
  // Checkbox (Bulk Select)
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkUnidadProd, setBulkUnidadProd] = useState('Hectáreas');
  const [bulkCantidadProd, setBulkCantidadProd] = useState('');
  const [bulkUnidad, setBulkUnidad] = useState('Hectáreas');
  const [bulkCantidad, setBulkCantidad] = useState('');
  const [bulkTarifa, setBulkTarifa] = useState('');

  const ordenes = planificaciones.filter(p => p.ordenCode);

  const ordenesFiltradas = ordenes.filter(o => {
    const matchCode = o.ordenCode.includes(searchCode.trim().toUpperCase());
    const matchEstado = filterEstado === 'Todos' || o.estado === filterEstado;
    return matchCode && matchEstado;
  });

  const handleVerDetalle = (plan) => {
    setActivePlan(plan);
    setErrorMsj('');
    setHaEjecutadas('');
    setTrabajadoresAgregados([]);
    setSelectedRows([]);
    
    // Load planned inputs
    if (plan.insumos) {
      setInsumosEjecutados(plan.insumos.map(i => ({ ...i })));
    } else {
      setInsumosEjecutados([]);
    }
    setProduccionReal('');
    const actInfo = actividades.find(a => a.name === plan.actividadNombre);
    setUnidadProduccionReal(actInfo?.unidadProduccion || 'Toneladas');
    
    // Reset time/meters
    setHoraInicio('07:00');
    setHoraFin('16:00');
    setHorometroInicial(0);
    setHorometroFinal(0);
    setSelectedMaquinariaId('');
    setSelectedDriverId('');
    setUbicacionInicio(null);
    setUbicacionFin(null);
    setUbicacionStatus('');
  };

  const getActividadInfo = () => {
    if (!activePlan) return null;
    return actividades.find(a => a.id === activePlan.actividadId) || 
           actividades.find(a => a.name === activePlan.actividadNombre);
  };

  const captureUbicacion = (tipo) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUbicacionStatus('Geolocalización no disponible en este dispositivo.');
      return;
    }

    setUbicacionStatus(`Obteniendo ubicación de ${tipo}...`);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacion = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        };
        if (tipo === 'inicio') setUbicacionInicio(ubicacion);
        else setUbicacionFin(ubicacion);
        setUbicacionStatus(`Ubicación ${tipo} registrada: ${ubicacion.lat.toFixed(6)}, ${ubicacion.lng.toFixed(6)}`);
      },
      (error) => {
        setUbicacionStatus(`Error GPS: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  const getElapsedMinutes = () => {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const formatLocation = (loc) => loc ? `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}` : 'No registrada';

  const formatElapsedLabel = () => {
    const diff = getElapsedMinutes();
    if (diff < 0) return 'Error (fin antes de inicio)';
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  const addIndividual = () => {
    if(!selectedTrabajador) return;
    const t = trabajadores.find(x => x.id === selectedTrabajador);
    if(trabajadoresAgregados.some(x => x.id === x.id)) return alert("Ya está en la lista.");

    const actInfo = getActividadInfo();
    const unidadProd = actInfo?.unidadProduccion || 'Hectáreas';
    const unidadPago = actInfo?.unidadMedida || 'Hectáreas';
    const tarifa = actInfo?.tarifaBase || 0;

    // If activity is mechanical, ensure machinery and driver are selected
    if (actInfo?.tipo && actInfo.tipo.toLowerCase().includes('mec')) {
      if (!selectedMaquinariaId) {
        alert('Debe seleccionar una maquinaria para actividades mecánicas.');
        return;
      }
      if (!selectedDriverId) {
        alert('Debe seleccionar un chofer para la maquinaria.');
        return;
      }
    }

    setTrabajadoresAgregados([...trabajadoresAgregados, { ...t, unidadProduccion: unidadProd, cantidadProd: 0, unidadMedida: unidadPago, cantidad: 0, tarifaBase: tarifa, total: 0 }]);
    setSelectedTrabajador('');
  };



  const addCuadrilla = () => {
    if(!selectedCuadrilla) return;
    const actInfo = getActividadInfo();

    // If activity is mechanical, ensure machinery and driver are selected
    if (actInfo?.tipo && actInfo.tipo.toLowerCase().includes('mec')) {
      if (!selectedMaquinariaId) {
        alert('Debe seleccionar una maquinaria para actividades mecánicas.');
        return;
      }
      if (!selectedDriverId) {
        alert('Debe seleccionar un chofer para la maquinaria.');
        return;
      }
    }

    const unidadProd = actInfo?.unidadProduccion || 'Hectáreas';
    const unidadPago = actInfo?.unidadMedida || 'Hectáreas';
    const tarifa = actInfo?.tarifaBase || 0;

    // Filter workers by cuadrillaId
    const integrantes = trabajadores.filter(t => t.cuadrillaId === selectedCuadrilla);
    
    const nuevos = [];
    integrantes.forEach(t => {
      if(!trabajadoresAgregados.some(x => x.id === x.id)) {
        nuevos.push({ 
          ...t, 
          unidadProduccion: unidadProd, 
          cantidadProd: 0, 
          unidadMedida: unidadPago, 
          cantidad: 0, 
          tarifaBase: tarifa, 
          total: 0,
          maquinariaId: selectedMaquinariaId,
          driverId: selectedDriverId,
          implementosIds: selectedImplementosIds
        });
      }
    });

    setTrabajadoresAgregados([...trabajadoresAgregados, ...nuevos]);
    setSelectedCuadrilla('');
  };

  const handleUpdateRow = (id, field, value) => {
    setTrabajadoresAgregados(trabajadoresAgregados.map(t => {
      if(t.id === id) {
        const updated = { ...t, [field]: value };
        updated.total = Number(updated.cantidad) * Number(updated.tarifaBase);
        return updated;
      }
      return t;
    }));
  };

  const handleRemoveRow = (id) => {
    setTrabajadoresAgregados(trabajadoresAgregados.filter(t => t.id !== id));
    setSelectedRows(selectedRows.filter(rowId => rowId !== id));
  };

  const handleUpdateInsumo = (id, field, value) => {
    setInsumosEjecutados(prev => prev.map(ins => {
      if (ins.id === id) {
        const updated = { ...ins, [field]: value };
        if (field === 'dosis') {
          updated.cantidad = Number(value) * (Number(haEjecutadas) || 0);
        }
        return updated;
      }
      return ins;
    }));
  };

  const handleAddInsumoExtra = (prodId) => {
    const p = productos.find(x => x.id === prodId);
    if (!p) return;
    if (insumosEjecutados.some(x => x.id === x.id)) return alert("Ya existe.");
    setInsumosEjecutados([...insumosEjecutados, { id: id, nombre: p.nombre, cantidad: 0, dosis: 0, unidad: p.unidadMedida || 'Litros' }]);
  };

  const handleSelectRow = (id) => {
    if(selectedRows.includes(id)) setSelectedRows(selectedRows.filter(r => r !== id));
    else setSelectedRows([...selectedRows, id]);
  };

  const handleSelectAll = (e) => {
    if(e.target.checked) setSelectedRows(trabajadoresAgregados.map(t => t.id));
    else setSelectedRows([]);
  };

  const handleBulkApply = () => {
    if(selectedRows.length === 0) return alert("Selecciona al menos un trabajador.");
    setTrabajadoresAgregados(trabajadoresAgregados.map(t => {
      if(selectedRows.includes(id)) {
        const updated = { ...t };
        if(bulkUnidadProd) updated.unidadProduccion = bulkUnidadProd;
        if(bulkCantidadProd !== '') updated.cantidadProd = Number(bulkCantidadProd);
        if(bulkUnidad) updated.unidadMedida = bulkUnidad;
        if(bulkCantidad !== '') updated.cantidad = Number(bulkCantidad);
        if(bulkTarifa !== '') updated.tarifaBase = Number(bulkTarifa);
        updated.total = Number(updated.cantidad) * Number(updated.tarifaBase);
        return updated;
      }
      return t;
    }));
  };

  const handleEjecutar = () => {
    const planeadas = activePlan.hectareasPlaneadas;
    const yaEjecutadas = activePlan.hectareasEjecutadas || 0;
    const pendiente = planeadas - yaEjecutadas;
    const ejecutadasHoy = Number(haEjecutadas);

    if (!haEjecutadas || ejecutadasHoy <= 0) {
      setErrorMsj('Debes ingresar una cantidad válida mayor a 0 para el avance de la orden.');
      return;
    }

    if (ejecutadasHoy > pendiente) {
      setErrorMsj(`No puedes ejecutar más de lo pendiente (${pendiente} ha).`);
      return;
    }

    // --- VALIDACIONES POR CONFIGURACION ---
    const actInfo = getActividadInfo();

    if (configuraciones.validarInsumos) {
      const esAplicacion = actInfo?.clasificacion === 'Aplicación de insumos' || 
                           actInfo?.clasificacion === 'Aplicación de fertilizantes' || 
                           actInfo?.clasificacion === 'Fertirriego';
      if (esAplicacion && insumosEjecutados.length === 0) {
        setErrorMsj(`Error de Configuración: Esta labor requiere registro de insumos.`);
        return;
      }
    }

    if (configuraciones.validarMaquinaria) {
      if (actInfo?.tipo === 'Mecánica' && !selectedMaquinariaId) {
        setErrorMsj(`Error de Configuración: Se requiere seleccionar maquinaria para labores mecánicas.`);
        return;
      }
    }

    if (configuraciones.validarNomina) {
      if (trabajadoresAgregados.length === 0) {
        setErrorMsj(`Error de Configuración: Debe registrar al menos un trabajador para esta labor.`);
        return;
      }
    }

    if (configuraciones.bloquearStockNegativo) {
       for (const ins of insumosEjecutados) {
         const p = productos.find(x => x.id === x.id);
         if (p && p.stockActual < ins.cantidad) {
           setErrorMsj(`Error de Configuración: No hay stock suficiente para ${p.nombre}. Stock Actual: ${p.stockActual}`);
           return;
         }
       }
    }
    // --------------------------------------

    // Filtrar trabajadores que tengan al menos cantidad > 0
    const laborDetalle = trabajadoresAgregados.filter(t => Number(t.cantidad) > 0).map(t => ({ ...t, maquinariaId: selectedMaquinariaId || null, driverId: selectedDriverId || null, implementosIds: selectedImplementosIds || [] }));

    const elapsedMinutes = getElapsedMinutes();
    const requiereUbicacion = (
      (configuraciones.registrarGpsInsumos && insumosEjecutados.length > 0) ||
      (configuraciones.registrarGpsMaquinaria && selectedMaquinariaId) ||
      (configuraciones.registrarGpsManoObra && trabajadoresAgregados.length > 0)
    );
    const geoDisponible = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    if (elapsedMinutes < 0) {
      setErrorMsj('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    if (requiereUbicacion && geoDisponible && (!ubicacionInicio || !ubicacionFin)) {
      setErrorMsj('Debe capturar la ubicación de inicio y fin según la configuración activa.');
      return;
    }

    ejecutarPlanificacion(id, ejecutadasHoy, laborDetalle, {
      insumos: insumosEjecutados,
      produccionReal,
      unidadProduccionReal,
      horaInicio,
      horaFin,
      horometroInicial,
      horometroFinal,
      maquinariaId: selectedMaquinariaId,
      ubicacionInicio,
      ubicacionFin,
      tiempoTranscurridoMinutos: elapsedMinutes,
      tiempoTranscurridoLabel: formatElapsedLabel()
    });
    
    const nuevoTotal = yaEjecutadas + ejecutadasHoy;
    const nuevoEstado = nuevoTotal >= planeadas ? 'Completada' : 'En Ejecución';
    const nuevaEjecucion = { id: Date.now().toString(), 
      fecha: new Date().toLocaleString(), 
      cantidad: ejecutadasHoy,
      laborDetalle,
      ubicacionInicio,
      ubicacionFin,
      tiempoTranscurridoMinutos: elapsedMinutes,
      tiempoTranscurridoLabel: formatElapsedLabel()
    };
    
    setActivePlan({ 
      ...activePlan, 
      estado: nuevoEstado, 
      hectareasEjecutadas: nuevoTotal,
      ejecuciones: [...(activePlan.ejecuciones || []), nuevaEjecucion]
    });
    
    setErrorMsj('');
    setHaEjecutadas('');
    setTrabajadoresAgregados([]);
    setSelectedRows([]);
    setSelectedMaquinariaId('');
    setSelectedDriverId('');
    setSelectedImplementosIds([]);
    setUbicacionInicio(null);
    setUbicacionFin(null);
    setUbicacionStatus('');
    alert('¡Actividad y nómina registrada con éxito!');
  };

  const totalNominaDia = trabajadoresAgregados.reduce((acc, t) => acc + (t.total || 0), 0);

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-contrast)] tracking-tight">Ejecución & Control de Labores</h1>
            <span className="badge badge-active text-[11px]">Operación en Campo</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Registro de avance por orden de trabajo, liquidación de destajo y seguimiento de insumos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button className={`!m-0 ${mainTab === 'control' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMainTab('control')}>
          <span>Control de Órdenes</span>
        </button>
        <button className={`!m-0 ${mainTab === 'reporte' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMainTab('reporte')}>
          <span>Reporte de Nómina Global</span>
        </button>
      </div>

      {mainTab === 'control' ? (
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
        
        {/* Panel Izquierdo: Buscador y Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3>Buscar Órdenes</h3>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="input-label">Código de Orden</label>
              <input className="input-field" value={searchCode} onChange={e => setSearchCode(e.target.value)} placeholder="Ej. PLN-12345"/>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Estado</label>
              <select className="input-field" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Orden Generada">Nueva</option>
                <option value="En Ejecución">En Ejecución</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Resultados ({ordenesFiltradas.length})</h4>
            <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ordenesFiltradas.length > 0 ? ordenesFiltradas.map(ord => (
                <div key={ord.id} onClick={() => handleVerDetalle(ord)}
                  style={{ 
                    padding: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                    background: activePlan?.id === ord.id ? 'var(--primary-color)' : '#fff',
                    color: activePlan?.id === ord.id ? '#fff' : 'inherit',
                    boxShadow: activePlan?.id === ord.id ? '0 4px 10px rgba(46,125,50,0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{ord.ordenCode}</span><span style={{ fontSize: '0.8rem' }}>{ord.estado}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', opacity: activePlan?.id === ord.id ? 0.9 : 0.7 }}>
                    {ord.actividadNombre} <br/> {ord.estructuraNombre}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron órdenes.</div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Detalle, Nómina y Ejecución */}
        <div>
          {activePlan ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div>
                <h2 style={{ color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  {activePlan.ordenCode}
                  <span className={`badge ${activePlan.estado === 'Orden Generada' ? 'badge-info' : (activePlan.estado === 'Completada' ? 'badge-active' : 'badge-production')}`} style={{ float: 'right' }}>
                    {activePlan.estado}
                  </span>
                </h2>
                <div className="grid-4" style={{ gap: '1rem' }}>
                  <div><span style={{ fontWeight: 'bold' }}>Actividad:</span><br/>{activePlan.actividadNombre}</div>
                  <div><span style={{ fontWeight: 'bold' }}>Ubicación:</span><br/>{activePlan.estructuraNombre}</div>
                  <div><span style={{ fontWeight: 'bold' }}>Total Planeado:</span><br/>{activePlan.hectareasPlaneadas} {getActividadInfo()?.unidadProduccion || 'ha'}</div>
                  <div><span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>Pendiente:</span><br/>{activePlan.hectareasPlaneadas - (activePlan.hectareasEjecutadas || 0)} {getActividadInfo()?.unidadProduccion || 'ha'}</div>
                </div>
              </div>

              {activePlan.estado !== 'Completada' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* PASO 1: TIEMPOS Y MAQUINARIA */}
                  <div className="glass-card" style={{ borderLeft: '5px solid var(--primary-color)' }}>
                    <h3 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Paso 1: Control de Tiempos y Maquinaria</h3>
                    
                    <div className="grid-2" style={{ gap: '2rem', marginBottom: '1.5rem' }}>
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Hora Inicio</label>
                          <input type="time" className="input-field" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Hora Fin</label>
                          <input type="time" className="input-field" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
                        <div>
                          <small style={{ color: 'var(--primary-dark)', fontWeight: 'bold', display: 'block' }}>Duración Estimada:</small>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {formatElapsedLabel()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <button type="button" className="btn-secondary" onClick={() => captureUbicacion('inicio')}>
                          Capturar ubicación de inicio
                        </button>
                        <small style={{ color: ubicacionInicio ? 'var(--primary-dark)' : '#666' }}>
                          {ubicacionInicio ? formatLocation(ubicacionInicio) : 'Inicio no registrada'}
                        </small>
                      </div>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <button type="button" className="btn-secondary" onClick={() => captureUbicacion('fin')}>
                          Capturar ubicación de fin
                        </button>
                        <small style={{ color: ubicacionFin ? 'var(--primary-dark)' : '#666' }}>
                          {ubicacionFin ? formatLocation(ubicacionFin) : 'Fin no registrada'}
                        </small>
                      </div>
                    </div>

                    {ubicacionStatus && (
                      <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>{ubicacionStatus}</p>
                    )}

                    {getActividadInfo()?.tipo?.toLowerCase().includes('mec') && (
                      <div style={{ padding: '1rem', background: 'rgba(46, 125, 50, 0.05)', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Medidores de Maquinaria</h4>
                        <div className="grid-3" style={{ gap: '1rem' }}>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Vehículo</label>
                            <select className="input-field" value={selectedMaquinariaId} onChange={e => {
                              setSelectedMaquinariaId(e.target.value);
                              const m = maquinarias.find(maq => maq.id === e.target.value);
                              if (m) {
                                setHorometroInicial(m.horometroActual || 0);
                                setHorometroFinal(m.horometroActual || 0);
                              }
                            }}>
                              <option value="">Seleccionar Maquinaria...</option>
                              {maquinarias.filter(m => {
                                const tipo = tiposMaquinaria.find(t => t.id === m.tipoId);
                                return tipo?.nombre !== 'Implemento';
                              }).map(m => (
                                <option key={m.id} value={cultivo.id}>{m.id} - {m.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Horómetro Inicial</label>
                            <input type="number" step="0.1" className="input-field" value={horometroInicial} onChange={e => setHorometroInicial(Number(e.target.value))} />
                          </div>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Horómetro Final</label>
                            <input type="number" step="0.1" className="input-field" value={horometroFinal} onChange={e => setHorometroFinal(Number(e.target.value))} />
                          </div>
                        </div>
                        <div style={{ marginTop: '0.8rem', textAlign: 'right' }}>
                          <small style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                            Uso del Horómetro: {(horometroFinal - horometroInicial).toFixed(2)} horas de motor
                          </small>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PASO 2: AVANCE Y PRODUCCION */}
                  <div className="glass-card" style={{ borderLeft: '5px solid #ff9800' }}>
                    <h3 style={{ color: '#e65100', marginBottom: '1rem' }}>Paso 2: Avance de Orden y Producción</h3>
                    <div className="grid-3" style={{ gap: '1rem' }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Hectáreas/Unidades Ejecutadas</label>
                        <input type="number" className="input-field" style={{ border: '2px solid #ff9800' }} value={haEjecutadas} onChange={e => {
                          setHaEjecutadas(e.target.value);
                          setInsumosEjecutados(prev => prev.map(ins => ({ ...ins, cantidad: (Number(ins.dosis) || 0) * Number(e.target.value) })));
                        }} placeholder="Cantidad ejecutada hoy" />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Producción Obtenida</label>
                        <input type="number" className="input-field" value={produccionReal} onChange={e => setProduccionReal(e.target.value)} placeholder="Cant. Cosechada/Producida" />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Unidad de Producción</label>
                        <select className="input-field" value={unidadProduccionReal} onChange={e => setUnidadProduccionReal(e.target.value)}>
                          {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PASO 3: INSUMOS */}
                  {insumosEjecutados.length > 0 && (
                    <div className="glass-card" style={{ borderLeft: '5px solid #2196f3' }}>
                      <h3 style={{ color: '#0d47a1', marginBottom: '1rem' }}>Paso 3: Consumo de Insumos</h3>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <select className="input-field" onChange={e => { if(e.target.value) handleAddInsumoExtra(e.target.value); e.target.value = ''; }}>
                          <option value="">-- Agregar Insumo no planificado --</option>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.unidadMedida})</option>)}
                        </select>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead><tr style={{ borderBottom: '1px solid #ddd' }}><th style={{ textAlign: 'left', padding: '0.5rem' }}>Producto</th><th style={{ textAlign: 'left', padding: '0.5rem' }}>Dosis</th><th style={{ textAlign: 'left', padding: '0.5rem' }}>Total Utilizado</th></tr></thead>
                        <tbody>
                          {insumosEjecutados.map(ins => {
                            const prodInMaestro = productos.find(px => px.id === px.id);
                            const currentStock = prodInMaestro?.stockActual || 0;
                            const isOverStock = Number(ins.cantidad) > currentStock;
                            return (
                              <tr key={ins.id || ins.nombre} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>{ins.nombre}<br/><small style={{ color: isOverStock ? 'var(--danger)' : '#666' }}>Stock: {currentStock} {ins.unidad}</small></td>
                                <td style={{ padding: '0.5rem' }}><input type="number" className="input-field" style={{ padding: '0.2rem', width: '70px' }} value={ins.dosis} onChange={e => handleUpdateInsumo(ins.id, 'dosis', e.target.value)} /></td>
                                <td style={{ padding: '0.5rem' }}>
                                  <input type="number" className="input-field" style={{ padding: '0.2rem', width: '90px', border: isOverStock ? '2px solid red' : '' }} value={ins.cantidad} onChange={e => handleUpdateInsumo(ins.id, 'cantidad', e.target.value)} />
                                  <small> {ins.unidad}</small>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* PASO 4: PERSONAL */}
                  <div className="glass-card" style={{ borderLeft: '5px solid #673ab7' }}>
                    <h3 style={{ color: '#4527a0', marginBottom: '1rem' }}>Paso 4: Personal y Nómina (Destajo)</h3>
                    
                    {getActividadInfo()?.tipo?.toLowerCase().includes('mec') && (
                      <div className="input-group">
                        <label className="input-label">Chofer Principal</label>
                        <select className="input-field" value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)}>
                          <option value="">Seleccionar Chofer...</option>
                          {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="grid-2" style={{ gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Agregar Trabajador</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select className="input-field" value={selectedTrabajador} onChange={e=>setSelectedTrabajador(e.target.value)}>
                            <option value="">Buscar...</option>
                            {trabajadores.map(t=><option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>)}
                          </select>
                          <button className="btn-secondary" onClick={addIndividual}>+</button>
                        </div>
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Agregar Cuadrilla</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select className="input-field" value={selectedCuadrilla} onChange={e=>setSelectedCuadrilla(e.target.value)}>
                            <option value="">Buscar...</option>
                            {cuadrillas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>
                          <button className="btn-secondary" onClick={addCuadrilla}>+</button>
                        </div>
                      </div>
                    </div>

                    {trabajadoresAgregados.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        
                        {selectedRows.length > 0 && (
                          <div className="glass-card" style={{ background: '#e3f2fd', marginBottom: '1rem', border: '1px solid #2196f3' }}>
                            <h4 style={{ color: '#0d47a1', marginBottom: '1rem' }}>⚡ Aplicación Masiva ({selectedRows.length} seleccionados)</h4>
                            <div className="grid-3" style={{ gap: '1rem' }}>
                              <div className="input-group" style={{marginBottom:0}}>
                                <label className="input-label">Cant. Producción (Avance)</label>
                                <input type="number" className="input-field" value={bulkCantidadProd} onChange={e=>setBulkCantidadProd(e.target.value)} placeholder="Ej. 5.5" />
                              </div>
                              <div className="input-group" style={{marginBottom:0}}>
                                <label className="input-label">U. Producción</label>
                                <select className="input-field" value={bulkUnidadProd} onChange={e=>setBulkUnidadProd(e.target.value)}>
                                  {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                </select>
                              </div>
                              <div className="input-group" style={{marginBottom:0}}>
                                <label className="input-label">Cant. Pago (Jornales/Ton/etc)</label>
                                <input type="number" className="input-field" value={bulkCantidad} onChange={e=>setBulkCantidad(e.target.value)} placeholder="Ej. 1" />
                              </div>
                              <div className="input-group" style={{marginBottom:0}}>
                                <label className="input-label">U. Medida (Pago)</label>
                                <select className="input-field" value={bulkUnidad} onChange={e=>setBulkUnidad(e.target.value)}>
                                  {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                </select>
                              </div>
                              <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 0 }}>
                                <button className="btn-primary" onClick={handleBulkApply} style={{ width: '100%', padding: '0.6rem' }}>Aplicar a Selección</button>
                              </div>
                            </div>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                              * La tarifa de pago se toma automáticamente del maestro de actividades ({getActividadInfo()?.tarifaBase || 0} $).
                            </p>
                          </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead style={{ background: '#eee' }}>
                            <tr>
                              <th style={{ padding: '0.5rem' }}><input type="checkbox" onChange={handleSelectAll} /></th>
                              <th style={{ padding: '0.5rem' }}>Nombre</th>
                              <th style={{ padding: '0.5rem' }}>Cant. Pago</th>
                              <th style={{ padding: '0.5rem' }}>Total</th>
                              <th style={{ padding: '0.5rem' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {trabajadoresAgregados.map(t => (
                              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}><input type="checkbox" checked={selectedRows.includes(t.id)} onChange={()=>handleSelectRow(t.id)} /></td>
                                <td style={{ padding: '0.5rem' }}><strong>{t.nombre}</strong><br/><small>{t.cargo}</small></td>
                                <td style={{ padding: '0.5rem' }}><input type="number" className="input-field" style={{ width: '70px', padding: '0.2rem' }} value={t.cantidad} onChange={e=>handleUpdateRow(t.id, 'cantidad', e.target.value)} /></td>
                                <td style={{ padding: '0.5rem' }}>${t.total.toFixed(2)}</td>
                                <td style={{ padding: '0.5rem' }}><button onClick={()=>handleRemoveRow(t.id)} style={{ color: 'red', border: 'none', background: 'none' }}>✖</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', padding: '1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
                    {errorMsj && <p style={{ color: 'red', marginBottom: '1rem' }}>{errorMsj}</p>}
                    <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }} onClick={handleEjecutar}>FINALIZAR Y GUARDAR APUNTE</button>
                  </div>

                </div>
              )}

              {/* Historial de Ejecuciones y Detalle */}
              <div>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Historial de Ejecuciones</h3>
                {activePlan.ejecuciones && activePlan.ejecuciones.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activePlan.ejecuciones.map((ej, index) => (
                      <div key={index} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{ej.fecha}</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>Avance: {ej.cantidad} ha</span>
                        </div>
                        {(ej.ubicacionInicio || ej.ubicacionFin || ej.tiempoTranscurridoLabel) && (
                          <div style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                            {ej.ubicacionInicio && <span><strong>Inicio:</strong> {ej.ubicacionInicio.lat.toFixed(6)}, {ej.ubicacionInicio.lng.toFixed(6)}</span>}
                            {ej.ubicacionFin && <span><strong>Fin:</strong> {ej.ubicacionFin.lat.toFixed(6)}, {ej.ubicacionFin.lng.toFixed(6)}</span>}
                            {ej.tiempoTranscurridoLabel && <span><strong>Tiempo:</strong> {ej.tiempoTranscurridoLabel}</span>}
                          </div>
                        )}
                        {ej.laborDetalle && ej.laborDetalle.length > 0 ? (
                          <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Personal Asociado ({ej.laborDetalle.length}):</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {ej.laborDetalle.map((lab, i) => (
                                <span key={i} style={{ background: 'var(--primary-light)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span><strong>{lab.nombre}:</strong></span>
                                  <span>[Prod: {lab.cantidadProd} {lab.unidadProduccion}]</span>
                                  <span>[Pago: {lab.cantidad} {lab.unidadMedida} - ${lab.total.toFixed(2)}]</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#999' }}>Sin desglose de personal.</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No hay registros de ejecución todavía.</p>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>← Selecciona una orden de la lista</h3>
              <p>Podrás registrar el avance de hectáreas y asignar trabajadores para calcular sus pagos por destajo.</p>
            </div>
          )}
        </div>
      </div>
      ) : (
        <ReporteNomina planificaciones={planificaciones} trabajadores={trabajadores} />
      )}
    </div>
  );
}

function ReporteNomina({ planificaciones, trabajadores }) {
  // Extraer todos los detalles de labor en una sola lista plana
  const todosLosPagos = [];
  planificaciones.forEach(plan => {
    if (plan.ejecuciones) {
      plan.ejecuciones.forEach(ej => {
        if (ej.laborDetalle) {
          ej.laborDetalle.forEach(lab => {
            todosLosPagos.push({
              ordenCode: plan.ordenCode,
              actividad: plan.actividadNombre,
              fecha: ej.fecha,
              ...lab
            });
          });
        }
      });
    }
  });

  const totalGeneral = todosLosPagos.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <div className="glass-card fade-in">
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>Historial Global de Destajo (Nómina)</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Aquí se muestra el desglose completo de todo el personal y lo que han ejecutado/ganado a través de todas las órdenes del sistema.
      </p>

      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', borderRadius: '8px'}}>
          <thead>
            <tr style={{background: 'var(--primary-light)', color: '#fff'}}>
              <th style={{padding: '0.8rem'}}>Fecha</th>
              <th style={{padding: '0.8rem'}}>Orden / Actividad</th>
              <th style={{padding: '0.8rem'}}>Trabajador</th>
              <th style={{padding: '0.8rem'}}>Producción Reportada</th>
              <th style={{padding: '0.8rem'}}>Unidades Pagadas</th>
              <th style={{padding: '0.8rem'}}>Monto Ganado ($)</th>
            </tr>
          </thead>
          <tbody>
            {todosLosPagos.length > 0 ? todosLosPagos.map((pago, idx) => (
              <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '0.8rem'}}>{pago.fecha}</td>
                <td style={{padding: '0.8rem'}}><strong>{pago.ordenCode}</strong><br/><span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{pago.actividad}</span></td>
                <td style={{padding: '0.8rem', fontWeight: 'bold'}}>{pago.nombre} {pago.apellido}</td>
                <td style={{padding: '0.8rem'}}>{pago.cantidadProd} {pago.unidadProduccion}</td>
                <td style={{padding: '0.8rem'}}>{pago.cantidad} {pago.unidadMedida} a ${pago.tarifaBase}</td>
                <td style={{padding: '0.8rem', fontWeight: 'bold', color: 'var(--primary-dark)'}}>${(pago.total || 0).toFixed(2)}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)'}}>No se han registrado ejecuciones con detalle de personal.</td></tr>
            )}
          </tbody>
          {todosLosPagos.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="5" style={{padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem'}}>Total Nómina Registrada:</td>
                <td style={{padding: '1rem', fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '1.2rem'}}>${totalGeneral.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
