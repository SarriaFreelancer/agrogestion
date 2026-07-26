import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useCultivos(syncToDatabase) {
  const [cultivos, setCultivos] = useState([]);

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
