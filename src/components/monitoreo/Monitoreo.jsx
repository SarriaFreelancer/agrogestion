import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';

export default function Monitoreo() {
  const { 
    sectores, 
    controlesAgro, 
    registrosControles, 
    addRegistroControl, 
    editRegistroControl,
    deleteRegistroControl,
    globalCultivo,
    configuraciones
  } = useAgro();

  const [editingId, setEditingId] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  // Hierarchy Selection State
  const [selSector, setSelSector] = useState('');
  const [selFinca, setSelFinca] = useState('');
  const [selLote, setSelLote] = useState('');
  const [selSuerte, setSelSuerte] = useState('');
  const [selectedControl, setSelectedControl] = useState(null);

  // Main Values (El primero)
  const [mainValores, setMainValores] = useState({});

  // Sub-muestras (Las demás)
  const [muestras, setMuestras] = useState([]);
  const [currentMuestraValores, setCurrentMuestraValores] = useState({});

  const buildSampleFromBase = () => {
    const base = Object.keys(currentMuestraValores).length === 0 ? mainValores : currentMuestraValores;
    return Object.keys(base).length === 0 ? null : { id: Date.now().toString(), valores: { ...base }, origen: 'muestra' };
  };

  const getAllMuestras = () => [{ id: 'principal', valores: mainValores, origen: 'principal' }, ...muestras];

  const getSumByVariable = (varId) => {
    return getAllMuestras().reduce((sum, m) => {
      const value = Number(m.valores?.[varId]);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  };

  // Derivations
  const fincasDisponibles = sectores.find(s => s.id === selSector)?.fincas || [];
  const lotesDisponibles = fincasDisponibles.find(f => f.id === selFinca)?.lotes || [];
  const suertesDisponibles = lotesDisponibles.find(l => l.id === selLote)?.suertes || [];
  const suertesFiltradas = globalCultivo === 'Todos' ? suertesDisponibles : suertesDisponibles.filter(s => s.cultivo === globalCultivo);

  const handleAddMuestra = () => {
    const nuevaMuestra = buildSampleFromBase();
    if (!nuevaMuestra) return alert("Ingrese valores para la muestra o capture primero el monitoreo principal");
    setMuestras([...muestras, nuevaMuestra]);
    setCurrentMuestraValores({});
  };

  const validateRequiredVariables = () => {
    if (!configuraciones.validarVariablesRequeridasMonitoreo) return null;
    if (!selectedControl) return null;
    const missing = selectedControl.variables
      .filter(v => v.requerida)
      .filter(v => mainValores[v.id] === undefined || mainValores[v.id] === '')
      .map(v => v.nombre);
    return missing.length ? missing : null;
  };

  const handleSave = () => {
    if (!selSuerte || !selLote || !selFinca || !selSector || !selectedControl) return alert("Seleccione sector, finca, lote, suerte y tipo de control");
    if (Object.keys(mainValores).length === 0) return alert("Debe ingresar los valores del monitoreo principal");
    const missingRequired = validateRequiredVariables();
    if (missingRequired) return alert(`Complete las variables requeridas: ${missingRequired.join(', ')}`);

    const sectorData = sectores.find(s => s.id === selSector) || {};
    const fincaData = fincasDisponibles.find(f => f.id === selFinca) || {};
    const loteData = lotesDisponibles.find(l => l.id === selLote) || {};
    const suerteData = suertesFiltradas.find(s => s.id === selSuerte) || {};

    const registro = {
      sectorId: selSector,
      sectorNombre: sectorData.name || '',
      fincaId: selFinca,
      fincaNombre: fincaData.name || '',
      loteId: selLote,
      loteNombre: loteData.name || '',
      suerteId: selSuerte,
      suerteNombre: suerteData.name || '',
      lat: configuraciones.registrarGpsMonitoreo ? suerteData.lat : null,
      lng: configuraciones.registrarGpsMonitoreo ? suerteData.lng : null,
      controlId: id,
      controlNombre: selectedControl.nombre,
      valores: mainValores, // El Monitoreo Principal
      muestras: getAllMuestras(),   // Incluye la muestra principal y las adicionales
      cultivo: suerteData.cultivo,
      observaciones: configuraciones.permitirObservacionesMonitoreo ? observaciones : '',
      frecuencia: configuraciones.frecuenciaMonitoreo
    }

    if (editingId) {
      editRegistroControl(editingId, registro);
      alert("Cambios guardados. Puede continuar capturando muestras o finalizar.");
      resetValuesKeepSelection();
    } else {
      addRegistroControl(registro);
      resetForm();
      alert("Monitoreo guardado con éxito");
    }
  };

  const resetForm = () => {
    setSelSector(''); setSelFinca(''); setSelLote(''); setSelSuerte('');
    setSelectedControl(null); setMuestras([]); setMainValores({}); setCurrentMuestraValores({});
    setObservaciones('');
    setEditingId(null);
  };

  const resetValuesKeepSelection = () => {
    setMainValores({});
    setCurrentMuestraValores({});
    setObservaciones('');
  };

  const handleEdit = (reg) => {
    setEditingId(id);
    setSelectedControl(controlesAgro.find(c => c.id === reg.controlId));
    const loadedMuestras = reg.muestras || [];
    if (loadedMuestras.length > 0 && loadedMuestras[0]?.origen === 'principal') {
      setMainValores(loadedMuestras[0].valores || {});
      setMuestras(loadedMuestras.slice(1));
    } else {
      setMainValores(reg.valores || {});
      setMuestras(loadedMuestras);
    }
    setSelSector(reg.sectorId || '');
    setSelFinca(reg.fincaId || '');
    setSelLote(reg.loteId || '');
    setSelSuerte(reg.suerteId || '');
    // Nota: Para los selectores jerárquicos se requeriría una búsqueda inversa completa
  };

  const getRangoInfo = (variable, valor) => {
    if (variable.tipo !== 'numérico' || !valor) return null;
    const num = Number(valor);
    return variable.rangos?.find(r => num >= r.min && num <= r.max);
  };

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-contrast)] tracking-tight">
              {editingId ? 'Editando Monitoreo' : 'Ejecución de Monitoreo'}
            </h1>
            <span className="badge badge-active text-[11px]">Fitosanitario & Campo</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Captura el monitoreo principal y añade sub-muestras por suerte o cultivo activo
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '1', minWidth: '320px' }}>
          <h3>1. Ubicación Jerárquica</h3>
          <div className="grid-2" style={{ marginTop: '1.5rem', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Sector</label>
              <select className="input-field" value={selSector} onChange={e => { setSelSector(e.target.value); setSelFinca(''); setSelLote(''); setSelSuerte(''); }}>
                <option value="">Seleccione...</option>
                {sectores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Finca</label>
              <select className="input-field" value={selFinca} onChange={e => { setSelFinca(e.target.value); setSelLote(''); setSelSuerte(''); }} disabled={!selSector}>
                <option value="">Seleccione...</option>
                {fincasDisponibles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Lote</label>
              <select className="input-field" value={selLote} onChange={e => { setSelLote(e.target.value); setSelSuerte(''); }} disabled={!selFinca}>
                <option value="">Seleccione...</option>
                {lotesDisponibles.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Suerte</label>
              <select className="input-field" value={selSuerte} onChange={e => setSelSuerte(e.target.value)} disabled={!selLote}>
                <option value="">Seleccione...</option>
                {suertesFiltradas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '1.5rem' }}>
            <label className="input-label">Tipo de Control Agronómico</label>
            <select className="input-field" onChange={(e) => { setSelectedControl(controlesAgro.find(c => c.id === e.target.value)); setMainValores({}); setMuestras([]); }} value={selectedControl?.id || ''}>
              <option value="">Seleccione el control...</option>
              {controlesAgro.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {selectedControl && selSuerte && (
            <>
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff8e1', borderRadius: '12px', border: '1px solid #ffecb3' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#7a4f01' }}>
                  Configuración actual: <strong>{configuraciones.frecuenciaMonitoreo}</strong> • GPS {configuraciones.registrarGpsMonitoreo ? 'activado' : 'desactivado'} • Alertas {configuraciones.mostrarAlertasMonitoreo ? 'visibles' : 'ocultas'}
                </p>
              </div>

              {/* MONITOREO PRINCIPAL */}
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f4f8', borderRadius: '12px', border: '1px solid #d1d9e6' }}>
                <h4 style={{ color: 'var(--primary-dark)' }}>2. Monitoreo Principal (Referencia)</h4>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedControl.variables?.map(v => {
                    const rango = getRangoInfo(v, mainValores[v.id]);
                    return (
                      <div key={v.id} className="input-group">
                        <label className="input-label">{v.nombre} {rango && <small style={{color: rango.color}}>({rango.mensaje})</small>}</label>
                        {v.tipo === 'numérico' && <input type="number" className="input-field" value={mainValores[v.id] || ''} onChange={e => setMainValores({...mainValores, [v.id]: e.target.value})} style={{ borderLeft: rango ? `5px solid ${rango.color}` : '' }} />}
                        {v.tipo === 'texto' && <input className="input-field" value={mainValores[v.id] || ''} onChange={e => setMainValores({...mainValores, [v.id]: e.target.value})} />}
                        {v.tipo === 'booleano' && (
                          <select className="input-field" value={mainValores[v.id] || ''} onChange={e => setMainValores({...mainValores, [v.id]: e.target.value})}>
                            <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {configuraciones.permitirObservacionesMonitoreo && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid #cfd8dc' }}>
                  <label className="input-label">Observaciones del monitoreo</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Anote detalles, condiciones o recomendaciones"
                  />
                </div>
              )}

              {configuraciones.permitirMuestrasMonitoreo ? (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#e8f5e9', borderRadius: '12px', border: '1px solid #4caf50' }}>
                  <h4 style={{ color: '#2e7d32' }}>3. Muestras Adicionales (Opcional)</h4>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Captura valores para plantas específicas dentro de este mismo punto.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedControl.variables?.map(v => (
                      <div key={v.id} className="input-group">
                        <label className="input-label">{v.nombre}</label>
                        {v.tipo === 'numérico' && <input type="number" className="input-field" value={currentMuestraValores[v.id] || ''} onChange={e => setCurrentMuestraValores({...currentMuestraValores, [v.id]: e.target.value})} />}
                        {v.tipo === 'texto' && <input className="input-field" value={currentMuestraValores[v.id] || ''} onChange={e => setCurrentMuestraValores({...currentMuestraValores, [v.id]: e.target.value})} />}
                        {v.tipo === 'booleano' && (
                          <select className="input-field" value={currentMuestraValores[v.id] || ''} onChange={e => setCurrentMuestraValores({...currentMuestraValores, [v.id]: e.target.value})}>
                            <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                          </select>
                        )}
                      </div>
                    ))}
                    <button onClick={handleAddMuestra} className="btn-secondary" style={{ border: '1px solid #4caf50', color: '#2e7d32' }}>+ Añadir Muestra a la Lista</button>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#f1f8e9', borderRadius: '10px', border: '1px solid #c8e6c9' }}>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#2e7d32' }}>
                      Total de muestras: {getAllMuestras().length}
                    </p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                        <strong>Muestra Principal</strong>
                        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.4rem' }}>
                          {selectedControl.variables?.map(v => `${v.nombre}: ${mainValores[v.id] || '-'}`).join(' · ')}
                        </div>
                      </div>
                      {muestras.map((m, i) => (
                        <div key={m.id || i} style={{ padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #c8e6c9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>Submuestra #{i+1}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.25rem' }}>
                              {selectedControl.variables?.map(v => `${v.nombre}: ${m.valores[v.id] || '-'}`).join(' · ')}
                            </div>
                          </div>
                          <button onClick={() => setMuestras(muestras.filter(x => x.id !== m.id))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#444' }}>
                      Suma total por variable:
                      <ul style={{ margin: '0.4rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
                        {selectedControl.variables?.filter(v => v.tipo === 'numérico').map(v => (
                          <li key={v.id}>{v.nombre}: {getSumByVariable(v.id)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff3e0', borderRadius: '12px', border: '1px solid #ffcc80' }}>
                  <p style={{ margin: 0, color: '#8d6e63' }}>Las muestras adicionales están desactivadas en la configuración de monitoreo.</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button onClick={handleSave} className="btn-primary" style={{ padding: '1rem', fontSize: '1rem' }}>
                  {editingId ? '💾 GUARDAR CAMBIOS' : '✅ GUARDAR'}
                </button>
                <button onClick={resetValuesKeepSelection} className="btn-secondary" style={{ padding: '1rem', fontSize: '0.95rem', border: '1px solid #2196f3', color: '#1976d2' }}>
                  🔄 LIMPIAR VALORES
                </button>
              </div>
              {editingId && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={resetForm} className="btn-secondary" style={{ padding: '0.8rem', fontSize: '0.9rem' }}>← Volver a Inicio</button>
                  <button onClick={() => { setEditingId(null); resetForm(); }} className="btn-secondary" style={{ padding: '0.8rem', fontSize: '0.9rem', border: '1px solid #2196f3', color: '#1976d2' }}>✓ Finalizar</button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="glass-card" style={{ flex: '1.5', minWidth: '360px' }}>
          <h3>Historial de Monitoreos</h3>
          <div style={{ marginTop: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
            {registrosControles.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>No hay registros.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '0.5rem' }}>Fecha / Sector / Finca / Lote / Suerte</th>
                    <th style={{ padding: '0.5rem' }}>Control</th>
                    <th style={{ padding: '0.5rem' }}>Muestras</th>
                    <th style={{ padding: '0.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {[...registrosControles].reverse().map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <small>{new Date(r.fecha).toLocaleDateString()}</small>
                        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.35rem' }}>
                          <strong>{r.sectorNombre}</strong><br />
                          {r.fincaNombre} / {r.loteNombre} / {r.suerteNombre}
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>{r.controlNombre}</td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <span className="badge badge-info">{r.muestras?.length || 0} adicionales</span>
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                        <button onClick={() => deleteRegistroControl(r.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
