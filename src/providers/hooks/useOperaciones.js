import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';

export const initialPlanificaciones = [
  {
    id: 'PLAN-01',
    ordenCode: 'OT-104928',
    actividadId: 'LAB-PREP-01',
    actividadNombre: 'Corte y Cosecha Mecanizada de Caña',
    cultivo: 'Caña de Azúcar',
    fincaId: 'FIN-01',
    fincaNombre: 'Hacienda El Paraíso',
    loteId: 'LOT-01',
    loteNombre: 'Lote 01 (Variedad CC 01-1938)',
    suerteId: 'SUE-01',
    suerteNombre: 'Suerte A-01 (Tablón Principal)',
    trabajadorId: 'TRAB-2', // Heriberto Caicedo
    trabajadores: ['TRAB-2'],
    cuadrillaId: 'CUA-1',
    hectareas: 15.5,
    hectareasEjecutadas: 11.2,
    estado: 'En Ejecución',
    fecha: new Date().toISOString().split('T')[0]
  },
  {
    id: 'PLAN-02',
    ordenCode: 'OT-104929',
    actividadId: 'LAB-FITO-01',
    actividadNombre: 'Evaluación y Muestreo Fitosanitario de Barrenador',
    cultivo: 'Caña de Azúcar',
    fincaId: 'FIN-01',
    fincaNombre: 'Hacienda El Paraíso',
    loteId: 'LOT-01',
    loteNombre: 'Lote 01 (Variedad CC 01-1938)',
    suerteId: 'SUE-01',
    suerteNombre: 'Suerte A-01 (Tablón Principal)',
    trabajadorId: 'TRAB-1', // Mauricio Valencia
    trabajadores: ['TRAB-1'],
    cuadrillaId: 'CUA-1',
    hectareas: 15.5,
    hectareasEjecutadas: 15.5,
    estado: 'En Ejecución',
    fecha: new Date().toISOString().split('T')[0]
  },
  {
    id: 'PLAN-03',
    ordenCode: 'OT-104930',
    actividadId: 'LAB-RIEGO-01',
    actividadNombre: 'Inspección de Válvulas y Regulación de Riego',
    cultivo: 'Caña de Azúcar',
    fincaId: 'FIN-01',
    fincaNombre: 'Hacienda El Paraíso',
    loteId: 'LOT-01',
    loteNombre: 'Lote 01 (Variedad CC 01-1938)',
    suerteId: 'SUE-02',
    suerteNombre: 'Suerte A-02 (Tablón Ribera)',
    trabajadorId: 'TRAB-3', // Julián Rendón
    trabajadores: ['TRAB-3'],
    cuadrillaId: 'CUA-2',
    hectareas: 12.0,
    hectareasEjecutadas: 8.5,
    estado: 'En Ejecución',
    fecha: new Date().toISOString().split('T')[0]
  },
  {
    id: 'PLAN-04',
    ordenCode: 'OT-104931',
    actividadId: 'LAB-RECOL-01',
    actividadNombre: 'Recolección y Manejo de Frente de Corte',
    cultivo: 'Caña de Azúcar',
    fincaId: 'FIN-01',
    fincaNombre: 'Hacienda El Paraíso',
    loteId: 'LOT-01',
    loteNombre: 'Lote 01 (Variedad CC 01-1938)',
    suerteId: 'SUE-02',
    suerteNombre: 'Suerte A-02 (Tablón Ribera)',
    trabajadorId: 'TRAB-4', // Rosa Guerrero
    trabajadores: ['TRAB-4'],
    cuadrillaId: 'CUA-3',
    hectareas: 12.0,
    hectareasEjecutadas: 6.0,
    estado: 'En Ejecución',
    fecha: new Date().toISOString().split('T')[0]
  },
  {
    id: 'PLAN-05',
    ordenCode: 'OT-104932',
    actividadId: 'LAB-PULV-01',
    actividadNombre: 'Fumigación y Aspersión Aérea con Dron',
    cultivo: 'Caña de Azúcar',
    fincaId: 'FIN-01',
    fincaNombre: 'Hacienda El Paraíso',
    loteId: 'LOT-01',
    loteNombre: 'Lote 01 (Variedad CC 01-1938)',
    suerteId: 'SUE-01',
    suerteNombre: 'Suerte A-01 (Tablón Principal)',
    trabajadorId: 'TRAB-5', // Alonso Morales
    trabajadores: ['TRAB-5'],
    cuadrillaId: 'CUA-2',
    hectareas: 15.5,
    hectareasEjecutadas: 14.0,
    estado: 'En Ejecución',
    fecha: new Date().toISOString().split('T')[0]
  }
];

export function useOperaciones(syncToDatabase, productos, setProductos) {
  const [planificaciones, setPlanificaciones] = useState(() => {
    try {
      const s = localStorage.getItem('agro_planificaciones');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialPlanificaciones;
  });

  const [movimientosInventario, setMovimientosInventario] = useState(() => {
    try {
      const s = localStorage.getItem('agro_movimientos_inventario');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p)) return p;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      if (planificaciones?.length) localStorage.setItem('agro_planificaciones', JSON.stringify(planificaciones));
    } catch (e) {}
  }, [planificaciones]);

  useEffect(() => {
    try {
      localStorage.setItem('agro_movimientos_inventario', JSON.stringify(movimientosInventario));
    } catch (e) {}
  }, [movimientosInventario]);

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

    if (setProductos) {
      setProductos(prev => prev.map(p => {
        if (p.id === prodId || p.nombre === prodId) {
          return { ...p, stockActual: Math.max(0, (p.stockActual || 0) + cantNum) };
        }
        return p;
      }));
    }

    const mov = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      productoId: prodId,
      tipo,
      cantidad: Math.abs(cantNum),
      referencia: ref
    };
    setMovimientosInventario(prev => [mov, ...prev]);
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
