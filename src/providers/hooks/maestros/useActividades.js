import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialActividades, initialGrupos } from '../../mocks';

export function useActividades(syncToDatabase) {
  const [actividades, setActividades] = useState(() => {
    try {
      const s = localStorage.getItem('agro_actividades');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialActividades;
  });

  const [gruposActividades, setGruposActividades] = useState(() => {
    try {
      const s = localStorage.getItem('agro_grupos');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialGrupos;
  });

  useEffect(() => {
    try {
      if (actividades?.length) localStorage.setItem('agro_actividades', JSON.stringify(actividades));
    } catch (e) {}
  }, [actividades]);

  useEffect(() => {
    try {
      if (gruposActividades?.length) localStorage.setItem('agro_grupos', JSON.stringify(gruposActividades));
    } catch (e) {}
  }, [gruposActividades]);

  // Actividades
  const addActividad = (act) => { 
    const n = { ...act, id: act.id || Date.now().toString() }; 
    setActividades([...actividades, n]); 
    syncToDatabase('Actividad', 'add', n); 
  };
  const editActividad = (id, newProps) => { 
    setActividades(actividades.map(a => a.id === id ? { ...a, ...newProps } : a)); 
    syncToDatabase('Actividad', 'edit', { id, ...newProps }); 
  };
  const deleteActividad = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar actividad' })) { 
      setActividades(actividades.filter(a => a.id !== id)); 
      syncToDatabase('Actividad', 'delete', { id }); 
    } 
  };

  // Grupos
  const addGrupo = (g) => { 
    const n = { ...g, id: g.id || Date.now().toString() }; 
    setGruposActividades([...gruposActividades, n]); 
    syncToDatabase('GrupoActividad', 'add', n); 
  };
  const editGrupo = (id, newProps) => { 
    setGruposActividades(gruposActividades.map(g => g.id === id ? { ...g, ...newProps } : g)); 
    syncToDatabase('GrupoActividad', 'edit', { id, ...newProps }); 
  };
  const deleteGrupo = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar grupo' })) { 
      setGruposActividades(gruposActividades.filter(g => g.id !== id)); 
      syncToDatabase('GrupoActividad', 'delete', { id }); 
    } 
  };

  return {
    actividades, setActividades, addActividad, editActividad, deleteActividad,
    gruposActividades, setGruposActividades, addGrupo, editGrupo, deleteGrupo
  };
}
