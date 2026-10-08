import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialCultivos } from '../../mocks';

export function useCultivos(syncToDatabase) {
  const [cultivos, setCultivos] = useState(() => {
    try {
      const s = localStorage.getItem('agro_cultivos');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialCultivos;
  });

  useEffect(() => {
    try {
      if (cultivos?.length) localStorage.setItem('agro_cultivos', JSON.stringify(cultivos));
    } catch (e) {}
  }, [cultivos]);

  const addCultivo = (c) => { 
    const n = { ...c, id: c.id || Date.now().toString() }; 
    setCultivos([...cultivos, n]); 
    syncToDatabase('Cultivo', 'add', n); 
  };
  const editCultivo = (id, newProps) => { 
    setCultivos(cultivos.map(c => c.id === id ? { ...c, ...newProps } : c)); 
    syncToDatabase('Cultivo', 'edit', { id, ...newProps }); 
  };
  const deleteCultivo = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar cultivo' })) { 
      setCultivos(cultivos.filter(c => c.id !== id)); 
      syncToDatabase('Cultivo', 'delete', { id }); 
    } 
  };

  return {
    cultivos, setCultivos, addCultivo, editCultivo, deleteCultivo
  };
}
