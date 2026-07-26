import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useProductos(syncToDatabase) {
  const [productos, setProductos] = useState([]);
  const [tiposProductos, setTiposProductos] = useState([]);

  // Productos
  const addProducto = (p) => { 
    const n = { ...p, id: p.id || Date.now().toString() }; 
    setProductos([...productos, n]); 
    syncToDatabase('Producto', 'add', n); 
  };
  const editProducto = (id, newProps) => { 
    setProductos(productos.map(p => p.id === id ? { ...p, ...newProps } : p)); 
    syncToDatabase('Producto', 'edit', { id, ...newProps }); 
  };
  const deleteProducto = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar producto' })) { 
      setProductos(productos.filter(p => p.id !== id)); 
      syncToDatabase('Producto', 'delete', { id }); 
    } 
  };

  // Tipos Productos
  const addTipoProducto = (tp) => { 
    const n = { ...tp, id: tp.id || Date.now().toString() }; 
    setTiposProductos([...tiposProductos, n]); 
    syncToDatabase('TipoProducto', 'add', n); 
  };
  const editTipoProducto = (id, newProps) => { 
    setTiposProductos(tiposProductos.map(tp => tp.id === id ? { ...tp, ...newProps } : tp)); 
    syncToDatabase('TipoProducto', 'edit', { id, ...newProps }); 
  };
  const deleteTipoProducto = async (id) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar tipo de producto' })) { 
      setTiposProductos(tiposProductos.filter(tp => tp.id !== id)); 
      syncToDatabase('TipoProducto', 'delete', { id }); 
    } 
  };

  return {
    productos, setProductos, addProducto, editProducto, deleteProducto,
    tiposProductos, setTiposProductos, addTipoProducto, editTipoProducto, deleteTipoProducto
  };
}
