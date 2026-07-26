import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useProveedores(syncToDatabase) {
  const [proveedores, setProveedores] = useState([]);

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
