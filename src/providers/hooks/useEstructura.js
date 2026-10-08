import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';

export function useEstructura(syncToDatabase) {
  const [sectores, setSectores] = useState([]);

  // Recursive Area Helpers across 6 Levels
  const calcSurcoHa = (surco) => Number(surco.hectareas || 0);
  const calcSuerteHa = (suerte) => {
    if (suerte.surcos && suerte.surcos.length > 0) {
      return suerte.surcos.reduce((acc, s) => acc + calcSurcoHa(s), 0);
    }
    return Number(suerte.hectareas || 0);
  };
  const calcLoteHa = (lote) => lote.suertes?.reduce((acc, s) => acc + calcSuerteHa(s), 0) || 0;
  const calcFincaHa = (finca) => finca.lotes?.reduce((acc, l) => acc + calcLoteHa(l), 0) || 0;
  const calcSectorHa = (sector) => {
    if (sector.fincas && sector.fincas.length > 0) {
      return sector.fincas.reduce((acc, f) => acc + calcFincaHa(f), 0);
    }
    if (sector.sectores && sector.sectores.length > 0) {
      return sector.sectores.reduce((acc, s) => acc + calcSectorHa(s), 0);
    }
    return 0;
  };
  const calcZonaHa = (zona) => (zona.sectores || zona.fincas || []).reduce((acc, item) => acc + (item.fincas ? calcSectorHa(item) : calcFincaHa(item)), 0);
  
  const calcTotalHa = () => sectores.reduce((acc, s) => acc + calcSectorHa(s), 0);
  
  const calcLotesActivos = () => {
    let activos = 0;
    const countLotes = (items) => {
      items?.forEach(item => {
        if (item.lotes) {
          item.lotes.forEach(l => {
            if (l.suertes?.some(s => s.estado === 'Activo' || !s.estado)) activos++;
          });
        }
        if (item.fincas) countLotes(item.fincas);
        if (item.sectores) countLotes(item.sectores);
      });
    };
    countLotes(sectores);
    return activos;
  };

  const updateNode = (nodes, id, newProps, type = null) => {
    return nodes.map(node => {
      if (node.id === id && (!type || node.type === type)) return { ...node, ...newProps };
      return {
        ...node,
        zonas: node.zonas ? updateNode(node.zonas, id, newProps, type) : undefined,
        sectores: node.sectores ? updateNode(node.sectores, id, newProps, type) : undefined,
        fincas: node.fincas ? updateNode(node.fincas, id, newProps, type) : undefined,
        lotes: node.lotes ? updateNode(node.lotes, id, newProps, type) : undefined,
        suertes: node.suertes ? updateNode(node.suertes, id, newProps, type) : undefined,
        surcos: node.surcos ? updateNode(node.surcos, id, newProps, type) : undefined
      };
    });
  };

  const updateEstructura = (id, newProps, type = null) => setSectores(updateNode(sectores, id, newProps, type));

  const addNode = (nodes, parentId, newNode, parentType) => {
    return nodes.map(node => {
      if (node.id === parentId && (!parentType || node.type === parentType)) {
        if (newNode.type === 'Surco' || newNode.type === 'Seccion') {
          return { ...node, surcos: [...(node.surcos || []), newNode] };
        }
        if (newNode.type === 'Suerte') {
          return { ...node, suertes: [...(node.suertes || []), { ...newNode, surcos: [] }] };
        }
        if (newNode.type === 'Lote') {
          return { ...node, lotes: [...(node.lotes || []), { ...newNode, suertes: [] }] };
        }
        if (newNode.type === 'Finca') {
          return { ...node, fincas: [...(node.fincas || []), { ...newNode, lotes: [] }] };
        }
        if (newNode.type === 'Sector') {
          return { ...node, sectores: [...(node.sectores || []), { ...newNode, fincas: [] }] };
        }
      }
      return {
        ...node,
        zonas: node.zonas ? addNode(node.zonas, parentId, newNode, parentType) : undefined,
        sectores: node.sectores ? addNode(node.sectores, parentId, newNode, parentType) : undefined,
        fincas: node.fincas ? addNode(node.fincas, parentId, newNode, parentType) : undefined,
        lotes: node.lotes ? addNode(node.lotes, parentId, newNode, parentType) : undefined,
        suertes: node.suertes ? addNode(node.suertes, parentId, newNode, parentType) : undefined
      };
    });
  };

  const addElementoEstructura = (parentId, parentType, elemento) => {
    const newNode = { ...elemento, id: elemento.id || Date.now().toString(), type: elemento.type };
    setSectores(addNode(sectores, parentId, newNode, parentType));
    
    if (newNode.type === 'Finca') {
      syncToDatabase('Finca', 'add', { id: newNode.id, sectorCodigo: parentId, nombre: newNode.name });
    } else if (newNode.type === 'Lote') {
      syncToDatabase('Lote', 'add', { id: newNode.id, fincaCodigo: parentId, nombre: newNode.name });
    } else if (newNode.type === 'Suerte') {
      syncToDatabase('Suerte', 'add', { id: newNode.id, loteCodigo: parentId, nombre: newNode.name, hectareas: newNode.hectareas || 0, plantas: newNode.plantas || 0, cultivo: newNode.cultivo || '', estado: newNode.estado || 'Activo' });
    } else if (newNode.type === 'Surco' || newNode.type === 'Seccion') {
      syncToDatabase('Surco', 'add', { id: newNode.id, suerteCodigo: parentId, nombre: newNode.name, hectareas: newNode.hectareas || 0 });
    }
  };

  const addSector = (sector) => {
    const s = { ...sector, id: sector.id || Date.now().toString(), type: 'Sector', plantaCliente: sector.plantaCliente || 'N/A', fincas: [], suertes: [], sectores: [] };
    setSectores([...sectores, s]);
    syncToDatabase('Sector', 'add', s);
  };

  const removeNode = (nodes, id, type = null) => {
    return nodes
      .filter(node => !(node.id === id && (!type || node.type === type)))
      .map(node => ({
        ...node,
        zonas: node.zonas ? removeNode(node.zonas, id, type) : undefined,
        sectores: node.sectores ? removeNode(node.sectores, id, type) : undefined,
        fincas: node.fincas ? removeNode(node.fincas, id, type) : undefined,
        lotes: node.lotes ? removeNode(node.lotes, id, type) : undefined,
        suertes: node.suertes ? removeNode(node.suertes, id, type) : undefined,
        surcos: node.surcos ? removeNode(node.surcos, id, type) : undefined
      }));
  };

  const deleteEstructura = async (id, type = null) => { 
    if (await confirmDialog('¿Eliminar este nivel y todos sus sub-elementos?', { title: 'Eliminar estructura' })) {
      setSectores(removeNode(sectores, id, type)); 
    }
  };

  return {
    sectores, setSectores, updateEstructura, addSector, addElementoEstructura, deleteEstructura,
    calcTotalHa, calcLotesActivos, calcLoteHa, calcFincaHa, calcSectorHa, calcZonaHa, calcSuerteHa
  };
}
