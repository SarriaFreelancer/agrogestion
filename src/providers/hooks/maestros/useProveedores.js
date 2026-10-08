import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialProveedores } from '../../mocks';

export function useProveedores(syncToDatabase) {
  const [proveedores, setProveedores] = useState(() => {
    try {
      const s = localStorage.getItem('agro_proveedores');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return initialProveedores;
  });

  useEffect(() => {
    try {
      if (proveedores?.length) localStorage.setItem('agro_proveedores', JSON.stringify(proveedores));
    } catch (e) {}
  }, [proveedores]);

  const addProveedor = (p) => { 
    const n = { ...p, id: p.id || Date.now().toString() }; 
    setProveedores([...proveedores, n]); 
    syncToDatabase('Proveedor', 'add', n); 
  };
  const editProveedor = (id, newProps) => { 
    setProveedores(proveedores.map(p => p.id === id ? { ...p, ...newProps } : p)); 
    syncToDatabase('Proveedor', 'edit', { id, ...newProps }); 
  };
  const deleteProveedor = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar proveedor' })) { 
      setProveedores(proveedores.filter(p => p.id !== id)); 
      syncToDatabase('Proveedor', 'delete', { id }); 
    } 
  };

  return {
    proveedores, setProveedores, addProveedor, editProveedor, deleteProveedor
  };
}
