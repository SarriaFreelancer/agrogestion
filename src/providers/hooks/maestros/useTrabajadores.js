import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialTrabajadores } from '../../mocks';

export function useTrabajadores(syncToDatabase) {
  const [trabajadores, setTrabajadores] = useState(() => {
    try {
      const s = localStorage.getItem('agro_trabajadores');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialTrabajadores;
  });

  useEffect(() => {
    try {
      if (trabajadores?.length) localStorage.setItem('agro_trabajadores', JSON.stringify(trabajadores));
    } catch (e) {}
  }, [trabajadores]);

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
