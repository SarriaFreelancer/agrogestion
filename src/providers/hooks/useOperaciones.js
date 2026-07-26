import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useOperaciones(syncToDatabase, productos, setProductos) {
  const [planificaciones, setPlanificaciones] = useState([]);
  const [movimientosInventario, setMovimientosInventario] = useState([]);

  // Planificación
  const addPlanificacion = (plan) => { 
    setPlanificaciones(prev => [...prev, plan]); 
    syncToDatabase('Planificacion', 'add', plan); 
  };
  const editPlanificacion = (id, newProps) => { 
    setPlanificaciones(prev => prev.map(p => p.id === id ? { ...p, ...newProps } : p)); 
    syncToDatabase('Planificacion', 'edit', { id, ...newProps }); 
  };
  const deletePlanificacion = async (id) => { 
    if (await confirmDialog('¿Eliminar planificación?')) { 
      setPlanificaciones(prev => prev.filter(p => p.id !== id)); 
      syncToDatabase('Planificacion', 'delete', { id }); 
    } 
  };

  const generarOrden = (id) => { 
    const newCode = `OT-${Date.now().toString().slice(-6)}`; 
    setPlanificaciones(prev => prev.map(p => p.id === id ? { ...p, ordenCode: newCode, estado: 'Orden Generada' } : p)); 
    syncToDatabase('Planificacion', 'edit', { id, ordenCode: newCode, estado: 'Orden Generada' }); 
    return newCode; 
  };

  const desvincularOrden = (id) => { 
    setPlanificaciones(prev => prev.map(p => p.id === id ? { ...p, ordenCode: null, estado: 'Borrador' } : p)); 
    syncToDatabase('Planificacion', 'edit', { id, ordenCode: null, estado: 'Borrador' }); 
  };

  // Inventario
  const ajustarStock = (prodId, cantidad, tipo = 'Salida', ref = '') => {
    let cantNum = parseFloat(cantidad) || 0;
    if (tipo === 'Salida') cantNum = -cantNum;

    setProductos(prev => prev.map(p => {
      if (p.id === prodId || p.nombre === prodId) {
        return { ...p, stockActual: Math.max(0, (p.stockActual || 0) + cantNum) };
      }
      return p;
    }));

    const mov = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      productoId: prodId,
      tipo,
      cantidad: Math.abs(cantNum),
      referencia: ref
    };
    setMovimientosInventario(prev => [mov, ...prev]);
    // Optionally sync inventory movement here
  };

  const ejecutarPlanificacion = (planId, extraData = {}) => {
    setPlanificaciones(prev => prev.map(p => {
      if (p.id === planId) {
        const has = parseFloat(extraData.haEjecutadas) || 0;
        const yaEjecutadas = p.hectareasEjecutadas || 0;
        const nuevasHaEjecutadas = yaEjecutadas + has;
        const nuevoEstado = nuevasHaEjecutadas >= p.hectareas ? 'Finalizado' : 'En Ejecución';

        const nuevaEjecucion = {
          id: `EJEC-${Date.now()}`,
          fecha: new Date().toISOString().split('T')[0],
          haAgregadas: has,
          observaciones: extraData.observaciones || ''
        };

        if (extraData.insumos?.length > 0) {
          extraData.insumos.forEach(ins => {
            if (ins.id || ins.nombre) ajustarStock(ins.id || ins.nombre, ins.cantidad, 'Salida', `OT ${p.ordenCode}`);
          });
        }

        try {
          syncToDatabase('Planificacion', 'edit', { id: planId, estado: nuevoEstado, hectareasEjecutadas: nuevasHaEjecutadas });
          syncToDatabase('Ejecucion', 'add', { id: nuevaEjecucion.id, planificacionCodigo: p.id, fecha: nuevaEjecucion.fecha, hectareasEjecutadas: nuevasHaEjecutadas, observaciones: extraData.observaciones || '' });
          
          if (extraData.insumos) {
            extraData.insumos.forEach((ins, idx) => syncToDatabase('EjecucionInsumo', 'add', { id: `${nuevaEjecucion.id}-ins-${idx}`, ejecucionCodigo: nuevaEjecucion.id, productoCodigo: ins.id || ins.nombre, cantidad: ins.cantidad, costoUnitario: ins.costoUnitario || 0 }));
          }
          if (extraData.maquinariaId && extraData.horasMaquina) {
            const horas = parseFloat(extraData.horasMaquina);
            const costoMaq = parseFloat(extraData.costoMaquinaria) || 0;
            syncToDatabase('EjecucionMaquinaria', 'add', { id: `${nuevaEjecucion.id}-maq`, ejecucionCodigo: nuevaEjecucion.id, maquinariaCodigo: extraData.maquinariaId, horas, tarifa: horas > 0 ? costoMaq / horas : 0 });
          }
          if (extraData.labores) {
            extraData.labores.forEach((l, idx) => {
              syncToDatabase('EjecucionManoObra', 'add', { id: `${nuevaEjecucion.id}-mo-${idx}`, ejecucionCodigo: nuevaEjecucion.id, trabajadorCodigo: l.trabajadorId || 'N/A', labor: l.labor || '', cantidad: l.cantidad || 0, tarifa: l.tarifa || 0 });
            });
          }
        } catch (e) {
          console.error("Error syncing execution:", e);
        }

        return {
          ...p,
          estado: nuevoEstado,
          hectareasEjecutadas: nuevasHaEjecutadas,
          ejecuciones: [...(p.ejecuciones || []), nuevaEjecucion]
        };
      }
      return p;
    }));
  };

  return {
    planificaciones, setPlanificaciones, addPlanificacion, editPlanificacion, deletePlanificacion, generarOrden, desvincularOrden, ejecutarPlanificacion,
    movimientosInventario, setMovimientosInventario, ajustarStock
  };
}
