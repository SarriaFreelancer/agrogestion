import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useTrabajadores(syncToDatabase) {
  const [trabajadores, setTrabajadores] = useState([]);

  const addTrabajador = (t) => { 
    const n = { ...t, id: t.id || Date.now().toString() }; 
    setTrabajadores([...trabajadores, n]); 
    syncToDatabase('Trabajador', 'add', n); 
  };
  const editTrabajador = (id, newProps) => { 
    setTrabajadores(trabajadores.map(t => t.id === id ? { ...t, ...newProps } : t)); 
    syncToDatabase('Trabajador', 'edit', { id, ...newProps }); 
  };
  const deleteTrabajador = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar trabajador' })) { 
      setTrabajadores(trabajadores.filter(t => t.id !== id)); 
      syncToDatabase('Trabajador', 'delete', { id }); 
    } 
  };

  return {
    trabajadores, setTrabajadores, addTrabajador, editTrabajador, deleteTrabajador
  };
}
