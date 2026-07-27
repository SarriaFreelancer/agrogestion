import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useEstructura(syncToDatabase) {
  const [sectores, setSectores] = useState([]);
  // Helpers
  const calcLoteHa = (lote) => lote.suertes?.reduce((acc, s) => acc + (s.hectareas || 0), 0) || 0;
  const calcFincaHa = (finca) => finca.lotes?.reduce((acc, l) => acc + calcLoteHa(l), 0) || 0;
  const calcSectorHa = (sector) => sector.fincas?.reduce((acc, f) => acc + calcFincaHa(f), 0) || 0;
  const calcTotalHa = () => sectores.reduce((acc, s) => acc + calcSectorHa(s), 0);
  
  const calcLotesActivos = () => {
    let activos = 0;
    sectores.forEach(s => {
      s.fincas?.forEach(f => {
        f.lotes?.forEach(l => {
          if (l.suertes?.some(s => s.estado === 'Activo')) activos++;
        });
      });
    });
    return activos;
  };

  const updateNode = (nodes, id, newProps, type = null) => {
    return nodes.map(node => {
      if (node.id === id && (!type || node.type === type)) return { ...node, ...newProps };
      if (node.fincas) return { ...node, fincas: updateNode(node.fincas, id, newProps, type) };
      if (node.lotes) return { ...node, lotes: updateNode(node.lotes, id, newProps, type) };
      if (node.suertes) return { ...node, suertes: updateNode(node.suertes, id, newProps, type) };
      return node;
    });
  };

  const updateEstructura = (id, newProps, type = null) => setSectores(updateNode(sectores, id, newProps, type));

  const addElementoEstructura = (parentId, parentType, elemento) => {
    const newNode = { ...elemento, id: elemento.id || Date.now().toString(), type: elemento.type };
    setSectores(addNode(sectores, parentId, newNode, parentType));
    
    if (newNode.type === 'Finca') {
        syncToDatabase('Finca', 'add', { id: newNode.id, sectorCodigo: parentId, nombre: newNode.name });
    } else if (newNode.type === 'Lote') {
        syncToDatabase('Lote', 'add', { id: newNode.id, fincaCodigo: parentId, nombre: newNode.name });
    } else if (newNode.type === 'Suerte') {
        syncToDatabase('Suerte', 'add', { id: newNode.id, loteCodigo: parentId, nombre: newNode.name, hectareas: newNode.hectareas || 0, plantas: newNode.plantas || 0, cultivo: newNode.cultivo || '', estado: newNode.estado || 'Activo' });
    }
  };

  const addSector = (sector) => {
    const s = { ...sector, id: sector.id || Date.now().toString(), type: 'Sector', plantaCliente: sector.plantaCliente || 'N/A', fincas: [], suertes: [] };
    setSectores([...sectores, s]);
    syncToDatabase('Sector', 'add', s);
  };

  const addNode = (nodes, parentId, newNode, parentType) => {
    return nodes.map(node => {
      if (node.id === parentId && (!parentType || node.type === parentType)) {
        if (newNode.type === 'Suerte') return { ...node, suertes: [...(node.suertes || []), newNode] };
        if (newNode.type === 'Finca') return { ...node, fincas: [...(node.fincas || []), { ...newNode, lotes: [], suertes: [] }] };
        if (newNode.type === 'Lote') return { ...node, lotes: [...(node.lotes || []), { ...newNode, suertes: [] }] };
      }
      if (node.fincas) return { ...node, fincas: addNode(node.fincas, parentId, newNode, parentType) };
      if (node.lotes) return { ...node, lotes: addNode(node.lotes, parentId, newNode, parentType) };
      return node;
    });
  };

  const removeNode = (nodes, id, type = null) => nodes.filter(node => !(node.id === id && (!type || node.type === type))).map(node => ({ ...node, fincas: node.fincas ? removeNode(node.fincas, id, type) : undefined, lotes: node.lotes ? removeNode(node.lotes, id, type) : undefined, suertes: node.suertes ? removeNode(node.suertes, id, type) : undefined }));
  const deleteEstructura = async (id, type = null) => { 
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar estructura' })) {
        setSectores(removeNode(sectores, id, type)); 
    }
  };

  return {
    sectores, setSectores, updateEstructura, addSector, addElementoEstructura, deleteEstructura,
    calcTotalHa, calcLotesActivos, calcLoteHa, calcFincaHa, calcSectorHa
  };
}
