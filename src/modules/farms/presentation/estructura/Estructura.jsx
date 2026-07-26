import { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import HojaDeVida from '@/modules/farms/presentation/estructura/HojaDeVida';
import { Network, Folder, Home, Package, Sprout, Plus, ChevronRight, ChevronDown, MousePointerClick } from 'lucide-react';

export default function Estructura() {
  const { globalCultivo, cultivos, sectores, updateEstructura, addSector, addElementoEstructura, configuraciones } = useAgro();
  const [selectedNode, setSelectedNode] = useState(null); 
  const [creatingType, setCreatingType] = useState(null); 
  const [newElementName, setNewElementName] = useState('');
  const [newElementCode, setNewElementCode] = useState('');
  const [newSectorPlant, setNewSectorPlant] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});

  const filterByGlobal = (suertes) => {
    if (!suertes) return [];
    if (globalCultivo === 'Todos') return suertes;
    return suertes.filter(s => s.cultivo === globalCultivo);
  };

  const findNodeById = (nodes, id) => {
    if (!id) return null;

    for (const node of nodes) {
      if (node.id === id) return node;

      const childCollections = [node.fincas, node.lotes, node.suertes].filter(Boolean);
      for (const children of childCollections) {
        const found = findNodeById(children, id);
        if (found) return found;
      }
    }

    return null;
  };

  const activeNode = findNodeById(sectores, selectedNode?.id) || selectedNode;
  const structureLevelCount = Math.min(4, Math.max(2, configuraciones?.estructuraNiveles || 4));
  const levelLabels = [
    configuraciones?.estructuraNivelNombres?.nivel1 || 'Sector',
    configuraciones?.estructuraNivelNombres?.nivel2 || 'Finca',
    configuraciones?.estructuraNivelNombres?.nivel3 || 'Lote',
    configuraciones?.estructuraNivelNombres?.nivel4 || 'Suerte',
    configuraciones?.estructuraNivelNombres?.nivel5 || 'Nivel 5',
    configuraciones?.estructuraNivelNombres?.nivel6 || 'Nivel 6'
  ];

  const labelForType = (type) => {
    if (type === 'Sector') return levelLabels[0];
    if (type === 'Finca') return levelLabels[1];
    if (type === 'Lote') return levelLabels[2];
    if (type === 'Suerte') return levelLabels[3];
    return type;
  };

  const canRenderFincas = structureLevelCount >= 2;
  const canRenderLotes = structureLevelCount >= 3;
  const canRenderSuertes = structureLevelCount >= 4;

  const canCreateChild = (nodeType) => {
    if (nodeType === 'Sector') return structureLevelCount >= 2;
    if (nodeType === 'Finca') return structureLevelCount >= 3;
    if (nodeType === 'Lote') return structureLevelCount >= 4;
    return false;
  };

  const typeForNextChild = (nodeType) => {
    if (structureLevelCount === 2) {
      if (nodeType === 'Sector') return 'Suerte';
    } else if (structureLevelCount === 3) {
      if (nodeType === 'Sector') return 'Finca';
      if (nodeType === 'Finca') return 'Suerte';
    } else {
      if (nodeType === 'Sector') return 'Finca';
      if (nodeType === 'Finca') return 'Lote';
      if (nodeType === 'Lote') return 'Suerte';
    }
    return null;
  };

  const activeNodeLabel = activeNode ? labelForType(activeNode.type) : '';

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id) => Boolean(expandedNodes[id]);

  const renderSuerteItem = (suerte) => (
    <button
      key={suerte.id}
      onClick={() => setSelectedNode(suerte)}
      className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 text-xs font-semibold !m-0 ${activeNode?.id === suerte.id ? 'bg-primary/20 border-primary text-primary-light shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-white/[0.02] border-white/10 text-[var(--text-muted)] hover:bg-white/[0.05]'}`}
    >
      <Sprout size={14} className="text-primary-light flex-shrink-0" />
      <span className="truncate"><strong>{suerte.id}</strong> - {suerte.name}</span>
    </button>
  );

  const renderLoteNode = (lote) => {
    const loteSuertes = filterByGlobal(lote.suertes);
    const loteExpanded = isExpanded(lote.id);

    return (
      <div key={lote.id} className="space-y-1.5 mb-2">
        <div className="flex items-center gap-2 justify-between">
          <button
            onClick={() => setSelectedNode(lote)}
            className={`flex-1 text-left p-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 text-xs font-semibold !m-0 ${activeNode?.id === lote.id ? 'bg-primary/20 border-primary text-primary-light' : 'bg-white/[0.02] border-white/10 text-[var(--text-muted)] hover:bg-white/[0.05]'}`}
          >
            <Package size={15} className="text-blue-400 flex-shrink-0" />
            <span className="truncate"><strong>{lote.id}</strong> - {lote.name}</span>
          </button>
          {canRenderSuertes && loteSuertes.length > 0 && (
            <button
              type="button"
              className="btn-secondary !p-1.5 !px-2.5 !m-0 text-[11px]"
              onClick={() => toggleNode(lote.id)}
            >
              {loteExpanded ? 'Ocultar' : `Ver (${loteSuertes.length})`}
            </button>
          )}
        </div>

        {canRenderSuertes && loteExpanded && loteSuertes.length > 0 && (
          <div className="pl-4 border-l border-white/10 space-y-1.5 ml-2 mt-1.5">
            {loteSuertes.map(renderSuerteItem)}
          </div>
        )}
      </div>
    );
  };

  const renderFincaNode = (finca) => {
    const fincaExpanded = isExpanded(finca.id);
    const fincaLotes = finca.lotes || [];

    return (
      <div key={finca.id} className="space-y-2 mb-3">
        <div className="flex items-center gap-2 justify-between">
          <button
            onClick={() => setSelectedNode(finca)}
            className={`flex-1 text-left p-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 text-xs font-semibold !m-0 ${activeNode?.id === finca.id ? 'bg-primary/20 border-primary text-primary-light' : 'bg-white/[0.03] border-white/10 text-gray-200 hover:bg-white/[0.06]'}`}
          >
            <Home size={16} className="text-amber-400 flex-shrink-0" />
            <span className="truncate"><strong>{finca.id}</strong> - {finca.name}</span>
          </button>
          {canRenderLotes && fincaLotes.length > 0 && (
            <button
              type="button"
              className="btn-secondary !p-1.5 !px-2.5 !m-0 text-[11px]"
              onClick={() => toggleNode(finca.id)}
            >
              {fincaExpanded ? 'Ocultar' : `Ver (${fincaLotes.length})`}
            </button>
          )}
        </div>

        {canRenderLotes && fincaExpanded && fincaLotes.length > 0 && (
          <div className="pl-4 border-l border-white/10 space-y-1.5 ml-2 mt-1.5">
            {fincaLotes.map(renderLoteNode)}
          </div>
        )}

        {structureLevelCount === 3 && canRenderSuertes && fincaExpanded && filterByGlobal(finca.suertes).length > 0 && (
          <div className="pl-4 border-l border-white/10 space-y-1.5 ml-2 mt-1.5">
            {filterByGlobal(finca.suertes).map(renderSuerteItem)}
          </div>
        )}
      </div>
    );
  };

  const renderSectorNode = (sector) => {
    const sectorExpanded = isExpanded(sector.id);
    const sectorFincas = sector.fincas || [];
    const sectorSuertes = filterByGlobal(sector.suertes);

    return (
      <div key={sector.id} className="space-y-2 mb-4">
        <div className="flex items-center gap-2 justify-between">
          <button
            className={`flex-1 text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-2.5 text-xs font-bold !m-0 ${activeNode?.id === sector.id ? 'bg-primary/20 border-primary text-[var(--text-contrast)] shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'bg-white/[0.04] border-white/10 text-gray-100 hover:bg-white/[0.08]'}`}
            onClick={() => setSelectedNode(sector)}
          >
            <Folder size={17} className="text-primary-light flex-shrink-0" />
            <span className="truncate"><strong>{sector.id}</strong> - {sector.name}</span>
          </button>
          {(sectorFincas.length > 0 || (structureLevelCount === 2 && sectorSuertes.length > 0)) && (
            <button
              type="button"
              className="btn-secondary !p-2 !px-3 !m-0 text-xs"
              onClick={() => toggleNode(sector.id)}
            >
              {sectorExpanded ? 'Ocultar' : 'Desglosar'}
            </button>
          )}
        </div>

        {sectorExpanded && (
          <div className="pl-4 border-l-2 border-dashed border-white/15 space-y-2 ml-2 mt-2">
            {structureLevelCount === 2 && sectorSuertes.length > 0 && (
              <div className="space-y-1.5">
                {sectorSuertes.map(renderSuerteItem)}
              </div>
            )}

            {canRenderFincas && sectorFincas.length > 0 && (
              <div>
                {sectorFincas.map(renderFincaNode)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleUpdate = (id, newProps) => {
    updateEstructura(id, newProps);
    if(activeNode && activeNode.id === id) {
      setSelectedNode({ ...activeNode, ...newProps });
    }
  };

  const handleCreate = () => {
    if (!newElementName.trim() || !newElementCode.trim()) return alert("Debe ingresar Código y Nombre");
    
    const nodeData = { 
      name: newElementName, id: newElementCode, 
      type: creatingType 
    };

    if (creatingType === 'Sector') {
      addSector({ ...nodeData, plantaCliente: newSectorPlant });
    } else {
      if (creatingType === 'Suerte') {
        nodeData.hectareas = 0;
        nodeData.cultivo = globalCultivo !== 'Todos' ? globalCultivo : (cultivos[0]?.name || '');
        nodeData.estado = 'Activo';
      }
      addElementoEstructura(activeNode.id, activeNode.type, nodeData);
    }

    setCreatingType(null);
    setNewElementName('');
    setNewElementCode('');
    setNewSectorPlant('');
  };

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-contrast)] tracking-tight">Estructura Agrícola</h1>
            <span className="badge badge-active text-[11px]">{structureLevelCount} Niveles</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Organización y jerarquía territorial del sistema agrícola
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Panel Izquierdo: Árbol Jerárquico */}
        <div className="glass-card !p-6 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-[var(--text-contrast)] text-base">Jerarquía Activa</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {levelLabels.slice(0, structureLevelCount).join(' › ')}
              </p>
            </div>
            <button className="btn-primary !m-0 !text-xs !py-2" onClick={() => setCreatingType('Sector')}>
              <Plus size={15} />
              <span>Nuevo {levelLabels[0]}</span>
            </button>
          </div>
          
          <div className="pt-2">
            {sectores.map(renderSectorNode)}
          </div>
        </div>

        {/* Panel Derecho: Detalle o Creación */}
        <div className="lg:col-span-7 space-y-6">
          {creatingType && (
            <div className="glass-card !p-6 border-2 border-primary/50 space-y-4 fade-in">
              <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
                <Plus size={18} className="text-primary-light" />
                <span>Crear Nuevo {labelForType(creatingType)} {creatingType !== 'Sector' && `en ${activeNode?.name}`}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group !mb-0">
                  <label className="input-label">Código del {creatingType}</label>
                  <input className="input-field" value={newElementCode} onChange={e => setNewElementCode(e.target.value)} placeholder="Ej: FIN-01" autoFocus />
                </div>
                <div className="input-group !mb-0">
                  <label className="input-label">Nombre del {creatingType}</label>
                  <input className="input-field" value={newElementName} onChange={e => setNewElementName(e.target.value)} placeholder="Ej: Finca La Esperanza" />
                </div>
              </div>
              
              {creatingType === 'Sector' && (
                <div className="input-group !mb-0">
                  <label className="input-label">Planta o Cliente</label>
                  <input className="input-field" value={newSectorPlant} onChange={e => setNewSectorPlant(e.target.value)} placeholder="Ej: Ingenio Central" />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button className="btn-primary !m-0" onClick={handleCreate}>✓ Crear {creatingType}</button>
                <button className="btn-secondary !m-0" onClick={() => setCreatingType(null)}>Cancelar</button>
              </div>
            </div>
          )}

          {activeNode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {canCreateChild(activeNode.type) && (
                  <button className="btn-secondary !m-0" onClick={() => setCreatingType(typeForNextChild(activeNode.type))}>
                    <Plus size={16} />
                    <span>Agregar {labelForType(typeForNextChild(activeNode.type))}</span>
                  </button>
                )}
              </div>
              <HojaDeVida key={activeNode.id} node={activeNode} onUpdate={handleUpdate} />
            </div>
          ) : (
            <div className="glass-card !p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light mb-4">
                <MousePointerClick size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-contrast)] mb-2">Seleccione un elemento de la jerarquía</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
                Haga clic en cualquier Sector, Finca, Lote o Suerte del árbol para ver y editar su Hoja de Vida.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
