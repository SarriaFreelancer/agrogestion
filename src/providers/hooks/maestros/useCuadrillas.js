import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useCuadrillas(syncToDatabase) {
  const [cuadrillas, setCuadrillas] = useState([]);

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
