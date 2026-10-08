import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialUnidades } from '../../mocks';

export function useUnidades(syncToDatabase) {
  const [unidades, setUnidades] = useState(() => {
    try {
      const s = localStorage.getItem('agro_unidades');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialUnidades;
  });

  useEffect(() => {
    try {
      if (unidades?.length) localStorage.setItem('agro_unidades', JSON.stringify(unidades));
    } catch (e) {}
  }, [unidades]);

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
