import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';

export default function Reportes() {
  const { 
    planificaciones, actividades, maquinarias, sectores, 
    productos, registrosControles, movimientosInventario, controlesAgro, cultivos
  } = useAgro();
  
  const [activeTab, setActiveTab] = useState('actividades'); 
  const [subTabActividades, setSubTabActividades] = useState('insumos'); 
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [searchOrden, setSearchOrden] = useState('');
  const [fCultivo, setFCultivo] = useState('Todos');

  // Filtros Jerárquicos
  const [fSector, setFSector] = useState('');
  const [fFincaCode, setFFincaCode] = useState(''); 
  const [fLote, setFLote] = useState('');
  const [fSuerte, setFSuerte] = useState('');

  const sectorObj = sectores.find(s => s.name === fSector);
  const fincasDisponibles = sectorObj?.fincas || [];
  const fincaObj = fincasDisponibles.find(f => f.id === fFincaCode);
  const lotesDisponibles = fincaObj?.lotes || [];
  const suertesDisponibles = lotesDisponibles.find(l => l.name === fLote)?.suertes || [];

  const getJerarquia = (suerteId, suerteNombre) => {
    for (const s of sectores) {
      for (const f of (s.fincas || [])) {
        for (const l of (f.lotes || [])) {
          const found = l.suertes?.find(su => (su.id && id == suerteId) || (su.name && su.name === suerteNombre));
          if (found) return { 
            sector: s.name, 
            sectorCodigo: s.id || 'N/A',
            planta: s.plantaCliente || 'N/A', 
            finca: f.name, 
            fincaCodigo: f.id, 
            lote: l.name 
          };
        }
      }
    }
    return { sector: 'N/A', sectorCodigo: 'N/A', planta: 'N/A', finca: 'N/A', fincaCodigo: 'N/A', lote: 'N/A' };
  };

  const filterByDate = (data) => {
    return data.filter(item => {
      const fechaStr = item.fecha || item.fechaRegistro;
      if (!fechaStr) return true;
      const fechaItem = new Date(fechaStr).getTime();
      const matchDesde = !fechaDesde || fechaItem >= new Date(fechaDesde).getTime();
      const matchHasta = !fechaHasta || fechaItem <= new Date(fechaHasta).getTime();
      return matchDesde && matchHasta;
    });
  };

  const filterByCultivo = (cultivo) => {
    return fCultivo === 'Todos' || cultivo === fCultivo;
  };

  const aplanarSuertes = () => {
    const filas = [];
    sectores.forEach(s => {
      s.fincas?.forEach(f => {
        f.lotes?.forEach(l => {
          l.suertes?.forEach(su => {
            filas.push({ sector: s.name, sectorCodigo: s.id || 'N/A', planta: s.plantaCliente || 'N/A', finca: f.name, fincaCodigo: f.id, lote: l.name, ...su });
          });
        });
      });
    });
    return filas.filter(su =>
      (!fSector || su.sector === fSector) &&
      (!fFincaCode || su.fincaCodigo === fFincaCode) &&
      (!fLote || su.lote === fLote) &&
      (!fSuerte || su.name === fSuerte) &&
      filterByCultivo(su.cultivo)
    );
  };

  const activFiltradas = () => {
    const filas = [];
    planificaciones.forEach(p => {
      const jerarquia = getJerarquia(p.estructuraId, p.estructuraNombre.split('(')[0].trim());
      const actInfo = actividades.find(a => a.id === p.actividadId);
      p.ejecuciones?.forEach(ej => {
        const base = {
          ...ej,
          ...jerarquia,
          suerte: p.estructuraNombre.split('(')[0].trim(),
          ordenCode: p.ordenCode,
          actividad: p.actividadNombre,
          cultivo: p.cultivo || '',
          cantProduccion: ej.produccionReal || 0,
          unidadProduccion: ej.unidadProduccionReal || actInfo?.unidadProduccion || 'ha',
          cantPago: ej.haEjecutadas || ej.cantidad || 0,
          unidadPago: actInfo?.unidadMedida || 'ha',
          tarifaBase: actInfo?.tarifaBase || 0
        };
        if (subTabActividades === 'insumos') {
          (ej.insumos || [{ nombre: 'Sin Insumos', dosis: 0, cantidad: 0, unidad: '' }]).forEach(ins => { 
            const prod = productos.find(x => x.id === x.id);
            filas.push({ 
              ...base, 
              insumo: ins.nombre, 
              dosis: ins.dosis, 
              cantInsumo: ins.cantidad, 
              unidadInsumo: ins.unidad,
              tarifaProducto: prod?.tarifaBase || 0,
              costoInsumo: (ins.cantidad * (prod?.tarifaBase || 0))
            }); 
          });
        } else if (subTabActividades === 'nomina') {
          (ej.laborDetalle || []).forEach(lab => { 
            filas.push({ 
              ...base, 
              trabajador: `${lab.nombre} ${lab.apellido}`, 
              unidadProdTrab: lab.unidadProduccion || base.unidadProduccion,
              cantProdTrab: lab.cantidadProd || 0,
              unidadPagoTrab: lab.unidadMedida || base.unidadPago,
              cantPagoTrab: lab.cantidad || 0,
              tarifaTrab: lab.tarifaBase || 0,
              totalPago: lab.total || 0
            }); 
          });
        } else if (subTabActividades === 'maquinaria') {
          if (ej.maquinariaId) {
            const maq = maquinarias.find(m => m.id === ej.maquinariaId);
            filas.push({ 
              ...base, 
              maquinaria: maq?.id || 'N/A',
              maquinariaNombre: maq?.nombre || 'N/A',
              tarifaMaquinaria: maq?.tarifaBase || 0
            });
          }
        }
      });
    });
    return filterByDate(filas).filter(f =>
      (!fSector || f.sector === fSector) &&
      (!fFincaCode || f.fincaCodigo === fFincaCode) &&
      (!searchOrden || f.ordenCode?.includes(searchOrden)) &&
      filterByCultivo(f.cultivo)
    );
  };

  const aplanarRentabilidad = () => {
    const data = [];
    planificaciones.forEach(p => {
      const jerarquia = getJerarquia(p.estructuraId, p.estructuraNombre.split('(')[0].trim());
      p.ejecuciones?.forEach(ej => {
        data.push({
          ...jerarquia,
          suerte: p.estructuraNombre.split('(')[0].trim(),
          actividad: p.actividadNombre,
          fecha: ej.fecha,
          cultivo: p.cultivo || '',
          costoInsumos: ej.costosDesglose?.insumos || 0,
          costoMO: ej.costosDesglose?.manoObra || 0,
          costoMaq: ej.costosDesglose?.maquinaria || 0,
          costoTotal: ej.costoTotal || 0,
          orden: p.ordenCode
        });
      });
    });
    return filterByDate(data).filter(r =>
      (!fSector || r.sector === fSector) &&
      (!fFincaCode || r.fincaCodigo === fFincaCode) &&
      (!fLote || r.lote === fLote) &&
      (!fSuerte || r.suerte === fSuerte) &&
      (!searchOrden || r.orden?.includes(searchOrden)) &&
      filterByCultivo(r.cultivo)
    );
  };

  const aplanarKardex = () => {
    const data = movimientosInventario.map(m => {
      const prod = productos.find(p => p.id === m.productoId);
      return { ...m, productoNombre: prod?.nombre || 'Desconocido', unidad: prod?.unidadMedida || '' };
    }).reverse();
    return filterByDate(data);
  };

  const getSumByVariable = (registro, varId) => {
    const muestras = registro.muestras || [{ valores: registro.valores }];
    return muestras.reduce((sum, m) => {
      const value = Number(m.valores?.[varId]);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  };

  const getVariableDisplay = (registro, varId, variable) => {
    if (variable.tipo === 'numérico') {
      return getSumByVariable(registro, varId);
    }
    const muestras = registro.muestras || [{ valores: registro.valores }];
    const firstValue = muestras[0]?.valores?.[varId];
    return firstValue || '-';
  };

  const getMonitoreoVariableMetadata = (registros) => {
    const metadata = new Map();
    registros.forEach(m => {
      const control = controlesAgro.find(c => c.id === m.controlId);
      control?.variables?.forEach(v => {
        if (!metadata.has(id)) {
          metadata.set(id, v);
        }
      });
    });
    return metadata;
  };

  const handleDownloadXLS = () => {
    let headers = []; let rowsHtml = "";
    let fileName = `Reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.xls`;

    if (activeTab === 'inventario') {
      headers = ["Planta / Cliente", "Sector", "Finca (Nombre)", "Lote", "Suerte", "Hectáreas"];
      rowsHtml = aplanarSuertes().map(s => `<tr><td>${s.planta}</td><td>${s.sector}</td><td>${s.finca}</td><td>${s.lote}</td><td><strong>${s.id}</strong> - ${s.name}</td><td>${s.hectareas} ha</td></tr>`).join('');
    } else if (activeTab === 'rentabilidad') {
      headers = ["Planta / Cliente", "Fecha", "Orden", "Suerte", "Total ($)"];
      rowsHtml = aplanarRentabilidad().map(r => `<tr><td>${r.planta}</td><td>${r.fecha}</td><td>${r.orden}</td><td>${r.suerte}</td><td style="font-weight:bold; color:var(--primary-dark)">$${r.costoTotal.toLocaleString()}</td></tr>`).join('');
    } else if (activeTab === 'kardex') {
      headers = ["Fecha", "Producto", "Tipo", "Cant.", "Motivo"];
      rowsHtml = aplanarKardex().map(m => `<tr><td>${new Date(m.fecha).toLocaleString()}</td><td>${m.productoNombre}</td><td style="color: ${m.tipo === 'Entrada' ? '#2e7d32' : '#d32f2f'}; font-weight:bold;">${m.tipo}</td><td>${m.cantidad} ${m.unidad}</td><td>${m.motivo}</td></tr>`).join('');
    } else if (activeTab === 'monitoreo') {
      const monitoreos = filterByDate(registrosControles).filter(r => filterByCultivo(r.cultivo));
      headers = ["Fecha", "Sector", "Finca", "Lote", "Suerte", "Control"];
      
      const variablesMetadata = getMonitoreoVariableMetadata(monitoreos);
      variablesMetadata.forEach(v => {
        const label = v.tipo === 'numérico' ? `${v.nombre} (Suma)` : v.nombre;
        headers.push(label);
      });
      
      headers.push("Muestras");
      
      rowsHtml = monitoreos.map(m => {
        let row = `<tr><td>${new Date(m.fecha).toLocaleDateString()}</td><td>${m.sectorNombre || 'N/A'}</td><td>${m.fincaNombre || 'N/A'}</td><td>${m.loteNombre || 'N/A'}</td><td><strong>${m.suerteNombre}</strong></td><td>${m.controlNombre}</td>`;
        
        variablesMetadata.forEach(variable => {
          const display = getVariableDisplay(m, variable.id, variable);
          row += `<td style="font-weight: bold; color: #1976d2;">${display}</td>`;
        });
        
        row += `<td>${m.muestras?.length || 0}</td></tr>`;
        return row;
      }).join('');
    } else if (activeTab === 'actividades') {
      if (subTabActividades === 'insumos') {
        headers = ["Planta / Cliente", "Fecha", "Orden", "Sector", "Finca", "Lote", "Suerte", "Actividad", "Cant. Prod", "Un. Prod", "Cant. Pago", "Un. Pago", "Insumo", "Cant. Insumo", "Un. Insumo", "Tarifa", "Costo"];
        rowsHtml = activFiltradas().map(f => `<tr><td>${f.planta}</td><td>${f.fecha}</td><td>${f.ordenCode}</td><td>${f.sector}</td><td>${f.finca}</td><td>${f.lote}</td><td>${f.suerte}</td><td>${f.actividad}</td><td>${f.cantProduccion}</td><td>${f.unidadProduccion}</td><td>${f.cantPago}</td><td>${f.unidadPago}</td><td>${f.insumo}</td><td>${f.cantInsumo} ${f.unidadInsumo}</td><td>${f.unidadInsumo}</td><td>$${f.tarifaProducto}</td><td style="font-weight:bold; color:var(--primary-dark)">$${f.costoInsumo?.toFixed(2) || '0.00'}</td></tr>`).join('');
      } else if (subTabActividades === 'nomina') {
        headers = ["Planta / Cliente", "Fecha", "Orden", "Sector", "Finca", "Lote", "Suerte", "Actividad", "Cant. Prod", "Un. Prod", "Cant. Pago", "Un. Pago", "Trabajador", "Tarifa", "Total"];
        rowsHtml = activFiltradas().map(f => `<tr><td>${f.planta}</td><td>${f.fecha}</td><td>${f.ordenCode}</td><td>${f.sector}</td><td>${f.finca}</td><td>${f.lote}</td><td>${f.suerte}</td><td>${f.actividad}</td><td>${f.cantProduccion}</td><td>${f.unidadProduccion}</td><td>${f.cantPagoTrab}</td><td>${f.unidadPagoTrab}</td><td>${f.trabajador}</td><td>$${f.tarifaTrab}</td><td style="font-weight:bold; color:var(--primary-dark)">$${f.totalPago?.toFixed(2) || '0.00'}</td></tr>`).join('');
      } else if (subTabActividades === 'maquinaria') {
        headers = ["Planta / Cliente", "Fecha", "Orden", "Sector", "Finca", "Lote", "Suerte", "Actividad", "Cant. Prod", "Un. Prod", "Cant. Pago", "Un. Pago", "Maquinaria", "Tarifa"];
        rowsHtml = activFiltradas().map(f => `<tr><td>${f.planta}</td><td>${f.fecha}</td><td>${f.ordenCode}</td><td>${f.sector}</td><td>${f.finca}</td><td>${f.lote}</td><td>${f.suerte}</td><td>${f.actividad}</td><td>${f.cantProduccion}</td><td>${f.unidadProduccion}</td><td>${f.cantPago}</td><td>${f.unidadPago}</td><td>${f.maquinariaNombre || f.maquinaria}</td><td>$${f.tarifaMaquinaria}</td></tr>`).join('');
      }
    }

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>${headers.map(h => `<th style="background-color: #2e7d32; color: #ffffff;">${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = fileName; link.click();
  };

  return (
    <div className="fade-in">
      <div className="header">
        <h1>Centro de Reportes</h1>
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        <button className={activeTab === 'actividades' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('actividades')}>Actividades</button>
        <button className={activeTab === 'monitoreo' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('monitoreo')}>Monitoreo</button>
        <button className={activeTab === 'inventario' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('inventario')}>Inventario Suertes</button>
        <button className={activeTab === 'rentabilidad' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('rentabilidad')}>💰 Rentabilidad</button>
        <button className={activeTab === 'kardex' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('kardex')}>📦 Kardex</button>
      </div>

      <div className="glass-card" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div className="grid-4" style={{ gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Sector</label>
            <select className="input-field" value={fSector} onChange={e => {setFSector(e.target.value); setFFincaCode(''); setFLote(''); setFSuerte('');}}>
              <option value="">Todos</option>
              {sectores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Finca (Código)</label>
            <select className="input-field" value={fFincaCode} onChange={e => {setFFincaCode(e.target.value); setFLote(''); setFSuerte('');}} disabled={!fSector}>
              <option value="">Todas</option>
              {fincasDisponibles.map(f => <option key={f.id} value={f.id}>{f.id} - {f.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Lote</label>
            <select className="input-field" value={fLote} onChange={e => {setFLote(e.target.value); setFSuerte('');}} disabled={!fFincaCode}>
              <option value="">Todos</option>
              {lotesDisponibles.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Suerte</label>
            <select className="input-field" value={fSuerte} onChange={e => setFSuerte(e.target.value)} disabled={!fLote}>
              <option value="">Todas</option>
              {suertesDisponibles.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Cultivo</label>
            <select className="input-field" value={fCultivo} onChange={e => setFCultivo(e.target.value)}>
              <option value="Todos">Todos</option>
              {cultivos.filter(c => c.estado !== 'Inactivo').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Fecha Desde</label>
            <input type="date" className="input-field" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Fecha Hasta</label>
            <input type="date" className="input-field" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Buscar Orden</label>
            <input className="input-field" value={searchOrden} onChange={e => setSearchOrden(e.target.value)} placeholder="Ej: M1" />
          </div>
          <button className="btn-primary" onClick={handleDownloadXLS} style={{height:'42px', alignSelf:'flex-end'}}>📊 DESCARGAR XLS</button>
        </div>
      </div>

      <div className="glass-card">
        {activeTab === 'inventario' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th>Planta / Cliente</th>
                <th>Sector</th>
                <th>Finca (Nombre)</th>
                <th>Lote</th>
                <th>Suerte</th>
                <th>Hectáreas</th>
              </tr>
            </thead>
            <tbody>
              {aplanarSuertes().map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{s.planta}</td>
                  <td>{s.sector}</td>
                  <td>{s.finca}</td>
                  <td>{s.lote}</td>
                  <td><strong>{s.id}</strong> - {s.name}</td>
                  <td>{s.hectareas} ha</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'rentabilidad' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th>Planta / Cliente</th>
                <th>Fecha</th>
                <th>Orden</th>
                <th>Suerte</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {aplanarRentabilidad().map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{r.planta}</td>
                  <td>{r.fecha}</td>
                  <td>{r.orden}</td>
                  <td>{r.suerte}</td>
                  <td style={{fontWeight:'bold', color:'var(--primary-dark)'}}>${r.costoTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'kardex' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cant.</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {aplanarKardex().map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{new Date(m.fecha).toLocaleString()}</td>
                  <td>{m.productoNombre}</td>
                  <td style={{color: m.tipo === 'Entrada' ? '#2e7d32' : '#d32f2f', fontWeight:'bold'}}>{m.tipo}</td>
                  <td>{m.cantidad} {m.unidad}</td>
                  <td>{m.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'monitoreo' && (() => {
          const registrosFiltrados = filterByDate(registrosControles);
          const variablesMetadata = getMonitoreoVariableMetadata(registrosFiltrados);
          return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th>Fecha</th>
                  <th>Sector</th>
                  <th>Finca</th>
                  <th>Lote</th>
                  <th>Suerte</th>
                  <th>Control</th>
                  {Array.from(variablesMetadata.values()).map(variable => (
                    <th key={variable.id}>{variable.tipo === 'numérico' ? `${variable.nombre} (Suma)` : variable.nombre}</th>
                  ))}
                  <th>Muestras</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td>{new Date(m.fecha).toLocaleDateString()}</td>
                    <td>{m.sectorNombre || 'N/A'}</td>
                    <td>{m.fincaNombre || 'N/A'}</td>
                    <td>{m.loteNombre || 'N/A'}</td>
                    <td><strong>{m.suerteNombre}</strong></td>
                    <td>{m.controlNombre}</td>
                    {Array.from(variablesMetadata.values()).map(variable => (
                      <td key={variable.id} style={{ fontWeight: 'bold', color: '#1976d2' }}>{getVariableDisplay(m, id, variable)}</td>
                    ))}
                    <td><span className="badge badge-info">{m.muestras?.length || 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}


        {activeTab === 'actividades' && (
          <>
            <div className="tabs-container" style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: '8px' }}>
              <button className={subTabActividades === 'insumos' ? 'btn-primary' : 'btn-secondary'} onClick={() => setSubTabActividades('insumos')} style={{fontSize:'0.7rem'}}>Insumos</button>
              <button className={subTabActividades === 'nomina' ? 'btn-primary' : 'btn-secondary'} onClick={() => setSubTabActividades('nomina')} style={{fontSize:'0.7rem'}}>Nómina</button>
              <button className={subTabActividades === 'maquinaria' ? 'btn-primary' : 'btn-secondary'} onClick={() => setSubTabActividades('maquinaria')} style={{fontSize:'0.7rem'}}>Maquinaria</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th>Planta / Cliente</th>
                  <th>Fecha</th>
                  <th>Orden</th>
                  <th>Sector</th>
                  <th>Finca</th>
                  <th>Lote</th>
                  <th>Suerte</th>
                  <th>Actividad</th>
                  {subTabActividades === 'insumos' && <>
                    <th>Cant. Prod</th>
                    <th>Un. Prod</th>
                    <th>Cant. Pago</th>
                    <th>Un. Pago</th>
                    <th>Insumo</th>
                    <th>Cant. Insumo</th>
                    <th>Un. Insumo</th>
                    <th>Tarifa</th>
                    <th>Costo</th>
                  </>}
                  {subTabActividades === 'nomina' && <>
                    <th>Cant. Prod</th>
                    <th>Un. Prod</th>
                    <th>Cant. Pago</th>
                    <th>Un. Pago</th>
                    <th>Trabajador</th>
                    <th>Tarifa</th>
                    <th>Total</th>
                  </>}
                  {subTabActividades === 'maquinaria' && <>
                    <th>Cant. Prod</th>
                    <th>Un. Prod</th>
                    <th>Cant. Pago</th>
                    <th>Un. Pago</th>
                    <th>Maquinaria</th>
                    <th>Tarifa</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {activFiltradas().map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td>{f.planta}</td>
                    <td>{f.fecha}</td>
                    <td>{f.ordenCode}</td>
                    <td>{f.sector}</td>
                    <td>{f.finca}</td>
                    <td>{f.lote}</td>
                    <td>{f.suerte}</td>
                    <td>{f.actividad}</td>
                    {subTabActividades === 'insumos' && <>
                      <td>{f.cantProduccion}</td>
                      <td>{f.unidadProduccion}</td>
                      <td>{f.cantPago}</td>
                      <td>{f.unidadPago}</td>
                      <td>{f.insumo}</td>
                      <td>{f.cantInsumo} {f.unidadInsumo}</td>
                      <td>{f.unidadInsumo}</td>
                      <td>${f.tarifaProducto}</td>
                      <td style={{fontWeight:'bold', color:'var(--primary-dark)'}}>${f.costoInsumo?.toFixed(2) || '0.00'}</td>
                    </>}
                    {subTabActividades === 'nomina' && <>
                      <td>{f.cantProduccion}</td>
                      <td>{f.unidadProduccion}</td>
                      <td>{f.cantPagoTrab}</td>
                      <td>{f.unidadPagoTrab}</td>
                      <td>{f.trabajador}</td>
                      <td>${f.tarifaTrab}</td>
                      <td style={{fontWeight:'bold', color:'var(--primary-dark)'}}>${f.totalPago?.toFixed(2) || '0.00'}</td>
                    </>}
                    {subTabActividades === 'maquinaria' && <>
                      <td>{f.cantProduccion}</td>
                      <td>{f.unidadProduccion}</td>
                      <td>{f.cantPago}</td>
                      <td>{f.unidadPago}</td>
                      <td>{f.maquinariaNombre || f.maquinaria}</td>
                      <td>${f.tarifaMaquinaria}</td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
