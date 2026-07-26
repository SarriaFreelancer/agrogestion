import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useActividades(syncToDatabase) {
  const [actividades, setActividades] = useState([]);
  const [gruposActividades, setGruposActividades] = useState([]);

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
