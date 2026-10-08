import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialMaquinaria, emptyTiposMaquinaria } from '../../mocks';

export function useMaquinarias(syncToDatabase) {
  const [maquinarias, setMaquinarias] = useState(() => {
    try {
      const s = localStorage.getItem('agro_maquinarias');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialMaquinaria;
  });

  const [tiposMaquinaria, setTiposMaquinaria] = useState(() => {
    try {
      const s = localStorage.getItem('agro_tipos_maquinaria');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return emptyTiposMaquinaria;
  });

  useEffect(() => {
    try {
      if (maquinarias?.length) localStorage.setItem('agro_maquinarias', JSON.stringify(maquinarias));
    } catch (e) {}
  }, [maquinarias]);

  useEffect(() => {
    try {
      if (tiposMaquinaria?.length) localStorage.setItem('agro_tipos_maquinaria', JSON.stringify(tiposMaquinaria));
    } catch (e) {}
  }, [tiposMaquinaria]);

  // Maquinarias
  const addMaquinaria = (m) => { 
    const n = { ...m, id: m.id || Date.now().toString() }; 
    setMaquinarias([...maquinarias, n]); 
    syncToDatabase('Maquinaria', 'add', n); 
  };
  const editMaquinaria = (id, newProps) => { 
    setMaquinarias(maquinarias.map(m => m.id === id ? { ...m, ...newProps } : m)); 
    syncToDatabase('Maquinaria', 'edit', { id, ...newProps }); 
  };
  const deleteMaquinaria = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar maquinaria' })) { 
      setMaquinarias(maquinarias.filter(m => m.id !== id)); 
      syncToDatabase('Maquinaria', 'delete', { id }); 
    } 
  };

  // Tipos Maquinaria
  const addTipoMaquinaria = (t) => { 
    const n = { ...t, id: t.id || Date.now().toString() }; 
    setTiposMaquinaria([...tiposMaquinaria, n]); 
    syncToDatabase('TipoMaquinaria', 'add', n); 
  };
  const editTipoMaquinaria = (id, newProps) => { 
    setTiposMaquinaria(tiposMaquinaria.map(t => t.id === id ? { ...t, ...newProps } : t)); 
    syncToDatabase('TipoMaquinaria', 'edit', { id, ...newProps }); 
  };
  const deleteTipoMaquinaria = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar tipo de maquinaria' })) { 
      setTiposMaquinaria(tiposMaquinaria.filter(t => t.id !== id)); 
      syncToDatabase('TipoMaquinaria', 'delete', { id }); 
    } 
  };

  return {
    maquinarias, setMaquinarias, addMaquinaria, editMaquinaria, deleteMaquinaria,
    tiposMaquinaria, setTiposMaquinaria, addTipoMaquinaria, editTipoMaquinaria, deleteTipoMaquinaria
  };
}
