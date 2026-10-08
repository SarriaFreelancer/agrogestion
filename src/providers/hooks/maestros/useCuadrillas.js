import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialCuadrillas } from '../../mocks';

export function useCuadrillas(syncToDatabase) {
  const [cuadrillas, setCuadrillas] = useState(() => {
    try {
      const s = localStorage.getItem('agro_cuadrillas');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialCuadrillas;
  });

  useEffect(() => {
    try {
      if (cuadrillas?.length) localStorage.setItem('agro_cuadrillas', JSON.stringify(cuadrillas));
    } catch (e) {}
  }, [cuadrillas]);

  const addCuadrilla = (c) => { 
    const n = { ...c, id: c.id || Date.now().toString() }; 
    setCuadrillas([...cuadrillas, n]); 
    syncToDatabase('Cuadrilla', 'add', n); 
  };
  const editCuadrilla = (id, newProps) => { 
    setCuadrillas(cuadrillas.map(c => c.id === id ? { ...c, ...newProps } : c)); 
    syncToDatabase('Cuadrilla', 'edit', { id, ...newProps }); 
  };
  const deleteCuadrilla = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar cuadrilla' })) { 
      setCuadrillas(cuadrillas.filter(c => c.id !== id)); 
      syncToDatabase('Cuadrilla', 'delete', { id }); 
    } 
  };

  return {
    cuadrillas, setCuadrillas, addCuadrilla, editCuadrilla, deleteCuadrilla
  };
}
