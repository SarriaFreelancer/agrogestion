import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useMonitoreo(syncToDatabase) {
  const [controlesAgro, setControlesAgro] = useState([]);
  const [registrosControles, setRegistrosControles] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);

  // Controles
  const addControl = (c) => {
    const n = { ...c, id: c.id || Date.now().toString() };
    setControlesAgro([...controlesAgro, n]);
    syncToDatabase('ControlesAgro', 'add', n);
  };
  const editControl = (id, newProps) => {
    setControlesAgro(controlesAgro.map(c => c.id === id ? { ...c, ...newProps } : c));
    syncToDatabase('ControlesAgro', 'edit', { id, ...newProps });
  };
  const deleteControl = async (id) => {
    if (await confirmDialog('¿Eliminar control?', { title: 'Eliminar control' })) {
      setControlesAgro(controlesAgro.filter(c => c.id !== id));
      syncToDatabase('ControlesAgro', 'delete', { id });
    }
  };

  // Registros de Control
  const addRegistroControl = (r) => {
    const nuevo = { ...r, id: `REG-${Date.now()}`, timestamp: new Date().toISOString() };
    setRegistrosControles([...registrosControles, nuevo]);
    syncToDatabase('Monitoreo', 'add', { id: nuevo.id, fecha: nuevo.fecha, sectorCodigo: nuevo.sectorId || 'N/A', tipo: nuevo.tipo || 'General', observaciones: nuevo.observaciones || '' });
  };
  const editRegistroControl = (id, updatedReg) => {
    setRegistrosControles(registrosControles.map(r => r.id === id ? { ...updatedReg, id } : r));
    syncToDatabase('Monitoreo', 'edit', { id: id, ...updatedReg });
  };
  const deleteRegistroControl = async (id) => {
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar registro de monitoreo' })) {
      setRegistrosControles(registrosControles.filter(r => r.id !== id));
      syncToDatabase('Monitoreo', 'delete', { id });
    }
  };

  // Mantenimientos
  const addMantenimiento = (m) => {
    const n = { ...m, id: m.id || Date.now().toString() };
    setMantenimientos([...mantenimientos, n]);
    // syncToDatabase('Mantenimiento', 'add', n); // If schema exists
  };
  const editMantenimiento = (id, newProps) => {
    setMantenimientos(mantenimientos.map(m => m.id === id ? { ...m, ...newProps } : m));
  };
  const deleteMantenimiento = async (id) => {
    if (await confirmDialog('¿Eliminar mantenimiento?')) {
      setMantenimientos(mantenimientos.filter(m => m.id !== id));
    }
  };

  return {
    controlesAgro, setControlesAgro, addControl, editControl, deleteControl,
    registrosControles, setRegistrosControles, addRegistroControl, editRegistroControl, deleteRegistroControl,
    mantenimientos, setMantenimientos, addMantenimiento, editMantenimiento, deleteMantenimiento
  };
}
