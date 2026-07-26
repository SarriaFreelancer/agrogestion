import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useUnidades(syncToDatabase) {
  const [unidades, setUnidades] = useState([]);

  const addUnidad = (u) => { 
    const n = { ...u, id: u.id || Date.now().toString() }; 
    setUnidades([...unidades, n]); 
    syncToDatabase('Unidad', 'add', n); 
  };
  const editUnidad = (id, newProps) => { 
    setUnidades(unidades.map(u => u.id === id ? { ...u, ...newProps } : u)); 
    syncToDatabase('Unidad', 'edit', { id, ...newProps }); 
  };
  const deleteUnidad = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar unidad' })) { 
      setUnidades(unidades.filter(u => u.id !== id)); 
      syncToDatabase('Unidad', 'delete', { id }); 
    } 
  };

  return {
    unidades, setUnidades, addUnidad, editUnidad, deleteUnidad
  };
}
