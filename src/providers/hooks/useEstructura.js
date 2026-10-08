import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialData } from '../mocks';

export function useEstructura(syncToDatabase) {
  const [sectores, setSectores] = useState(() => {
    try {
      const saved = localStorage.getItem('agro_sectores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading agro_sectores from localStorage', e);
    }
    return initialData;
  });

  useEffect(() => {
    try {
      if (sectores && Array.isArray(sectores) && sectores.length > 0) {
        localStorage.setItem('agro_sectores', JSON.stringify(sectores));
      }
    } catch (e) {
      console.warn('Error saving agro_sectores to localStorage', e);
    }
  }, [sectores]);

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
      syncToDatabase('Suerte', 'add', { id: newNode.id, loteCodigo: parentId, nombre: newNode.name, hectareas: newNode.hectareas, cultivo: newNode.cultivo, geometria: newNode.geometria });
    }
  };

  const removeNode = (nodes, id) => {
    return nodes
      .filter(node => node.id !== id)
      .map(node => ({
        ...node,
        zonas: node.zonas ? removeNode(node.zonas, id) : undefined,
        sectores: node.sectores ? removeNode(node.sectores, id) : undefined,
        fincas: node.fincas ? removeNode(node.fincas, id) : undefined,
        lotes: node.lotes ? removeNode(node.lotes, id) : undefined,
        suertes: node.suertes ? removeNode(node.suertes, id) : undefined,
        surcos: node.surcos ? removeNode(node.surcos, id) : undefined
      }));
  };

  const deleteElementoEstructura = async (id, type) => {
    if (await confirmDialog(`¿Está seguro de eliminar este elemento (${type}) y todos sus descendientes?`, { title: 'Eliminar elemento' })) {
      setSectores(removeNode(sectores, id));
      if (type) syncToDatabase(type, 'delete', { id });
    }
  };

  return {
    sectores, setSectores,
    calcTotalHa, calcLotesActivos,
    updateEstructura, addElementoEstructura, deleteElementoEstructura
  };
}
