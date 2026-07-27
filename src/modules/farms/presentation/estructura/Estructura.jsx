import { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import HojaDeVida from '@/modules/farms/presentation/estructura/HojaDeVida';
import { Network, Home, Package, Sprout, Plus, ChevronRight, ChevronDown, MousePointerClick, MoreVertical, Trees, CheckCircle2, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';

export default function Estructura() {
  const { globalPlanta, globalCultivo, cultivos, sectores, updateEstructura, addSector, addElementoEstructura, configuraciones } = useAgro();
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

  const sectoresFiltrados = globalPlanta === 'Todas' ? sectores : sectores.filter(s => s.plantaId === globalPlanta);

  const findNodeByIdAndType = (nodes, id, searchType, currentLevel = 'Sector') => {
    if (!id || !nodes) return null;

    for (const node of nodes) {
      const nodeType = node.type || currentLevel;
      if (node.id === id && (!searchType || nodeType === searchType)) {
        return { ...node, type: nodeType };
      }

      const foundInFincas = findNodeByIdAndType(node.fincas, id, searchType, 'Finca');
      if (foundInFincas) return foundInFincas;

      const foundInLotes = findNodeByIdAndType(node.lotes, id, searchType, 'Lote');
      if (foundInLotes) return foundInLotes;

      const foundInSuertes = findNodeByIdAndType(node.suertes, id, searchType, 'Suerte');
      if (foundInSuertes) return foundInSuertes;
    }

    return null;
  };

  const activeNode = findNodeByIdAndType(sectores, selectedNode?.id, selectedNode?.type) || selectedNode;
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
    <div key={suerte.id} className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 flex-shrink-0"></div>
      <button
        onClick={() => setSelectedNode({ ...suerte, type: 'Suerte' })}
        className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${(activeNode?.id === suerte.id && activeNode?.type === 'Suerte') ? 'bg-[var(--glass-bg)] border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb)/0.15)]' : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-primary/30 shadow-sm'}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sprout size={16} className="text-primary" />
          </div>
          <span className="text-[13px] font-bold text-[var(--text-contrast)] truncate">{suerte.id} - {suerte.name}</span>
        </div>
        <div className="w-7 h-7 rounded-full hover:bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)] transition-colors">
          <MoreVertical size={15} />
        </div>
      </button>
    </div>
  );

  const renderLoteNode = (lote) => {
    const loteSuertes = filterByGlobal(lote.suertes);
    const loteExpanded = isExpanded(lote.id);
    const hasChildren = canRenderSuertes && loteSuertes.length > 0;

    return (
      <div key={lote.id} className="mb-2">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button className="w-7 h-7 flex-shrink-0 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary/30 shadow-sm transition-colors" onClick={() => toggleNode(lote.id)}>
              {loteExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <div className="w-7 h-7 flex-shrink-0" />}
          
          <button
            onClick={() => setSelectedNode({ ...lote, type: 'Lote' })}
            className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${(activeNode?.id === lote.id && activeNode?.type === 'Lote') ? 'bg-[var(--glass-bg)] border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb)/0.15)]' : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-primary/30 shadow-sm'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-primary" />
              </div>
              <span className="text-[13px] font-bold text-[var(--text-contrast)] truncate">{lote.id} - {lote.name}</span>
            </div>
            <div className="w-7 h-7 rounded-full hover:bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)] transition-colors">
              <MoreVertical size={15} />
            </div>
          </button>
        </div>

        {hasChildren && loteExpanded && (
          <div className="pl-[13px] border-l-2 border-[var(--glass-border)] ml-3.5 mt-2 mb-2 space-y-2">
            {loteSuertes.map(renderSuerteItem)}
          </div>
        )}
      </div>
    );
  };

  const renderFincaNode = (finca) => {
    const fincaExpanded = isExpanded(finca.id);
    const fincaLotes = finca.lotes || [];
    const hasLotes = canRenderLotes && fincaLotes.length > 0;
    const hasSuertesDirect = structureLevelCount === 3 && canRenderSuertes && filterByGlobal(finca.suertes).length > 0;
    const hasChildren = hasLotes || hasSuertesDirect;

    return (
      <div key={finca.id} className="mb-2">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button className="w-7 h-7 flex-shrink-0 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary/30 shadow-sm transition-colors" onClick={() => toggleNode(finca.id)}>
              {fincaExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <div className="w-7 h-7 flex-shrink-0" />}
          
          <button
            onClick={() => setSelectedNode({ ...finca, type: 'Finca' })}
            className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${(activeNode?.id === finca.id && activeNode?.type === 'Finca') ? 'bg-[var(--glass-bg)] border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb)/0.15)]' : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-primary/30 shadow-sm'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Home size={16} className="text-primary" />
              </div>
              <span className="text-[13px] font-bold text-[var(--text-contrast)] truncate">{finca.id} - {finca.name}</span>
            </div>
            <div className="w-7 h-7 rounded-full hover:bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)] transition-colors">
              <MoreVertical size={15} />
            </div>
          </button>
        </div>

        {hasChildren && fincaExpanded && (
          <div className="pl-[13px] border-l-2 border-[var(--glass-border)] ml-3.5 mt-2 mb-2 space-y-2">
            {hasLotes && fincaLotes.map(renderLoteNode)}
            {hasSuertesDirect && filterByGlobal(finca.suertes).map(renderSuerteItem)}
          </div>
        )}
      </div>
    );
  };

  const renderSectorNode = (sector) => {
    const sectorExpanded = isExpanded(sector.id);
    const sectorFincas = sector.fincas || [];
    const sectorSuertes = filterByGlobal(sector.suertes);
    const hasFincas = sectorFincas.length > 0;
    const hasSuertesDirect = structureLevelCount === 2 && sectorSuertes.length > 0;
    const hasChildren = hasFincas || hasSuertesDirect;

    return (
      <div key={sector.id} className="mb-3">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button className="w-7 h-7 flex-shrink-0 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-contrast)] opacity-70 hover:opacity-100 hover:text-primary hover:border-primary/30 shadow-sm transition-colors" onClick={() => toggleNode(sector.id)}>
              {sectorExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <div className="w-7 h-7 flex-shrink-0" />}
          
          <button
            onClick={() => setSelectedNode({ ...sector, type: 'Sector' })}
            className={`flex-1 flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${(activeNode?.id === sector.id && activeNode?.type === 'Sector') ? 'bg-[var(--glass-bg)] border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb)/0.15)]' : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-primary/30 shadow-sm'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Trees size={16} className="text-primary" />
              </div>
              <span className="text-[14px] font-bold text-[var(--text-contrast)] truncate">{sector.id} - {sector.name}</span>
            </div>
            <div className="w-7 h-7 rounded-full hover:bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)] transition-colors">
              <MoreVertical size={16} />
            </div>
          </button>
        </div>

        {hasChildren && sectorExpanded && (
          <div className="pl-[13px] border-l-2 border-[var(--glass-border)] ml-3.5 mt-2 mb-2 space-y-2">
            {hasSuertesDirect && sectorSuertes.map(renderSuerteItem)}
            {hasFincas && sectorFincas.map(renderFincaNode)}
          </div>
        )}
      </div>
    );
  };

  const handleUpdate = (id, newProps) => {
    updateEstructura(id, newProps, activeNode?.type);
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
      addSector({ ...nodeData, plantaId: newSectorPlant || globalPlanta || 'General', });
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
    <div className="space-y-6 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4">
        <div className="w-12 h-12 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center shadow-sm">
          <Sprout size={24} className="text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-contrast)] tracking-tight">Estructura Agrícola</h1>
            <span className="bg-primary text-primary-light px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">{structureLevelCount} NIVELES</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Organización y jerarquía territorial del sistema agrícola
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Panel Izquierdo: Árbol Jerárquico */}
        <div className="glass-card !p-5 lg:col-span-5 flex flex-col max-h-[800px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <Network className="text-primary flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-[var(--text-contrast)] text-base">Jerarquía Activa</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {levelLabels.slice(0, structureLevelCount).join(' › ')}
                </p>
              </div>
            </div>
            <button className="bg-primary text-primary-light font-bold text-xs px-3 py-2 rounded-lg hover:brightness-110 flex items-center gap-1.5 shadow-sm transition-all" onClick={() => setCreatingType('Sector')}>
              <Plus size={15} />
              <span>Nuevo {levelLabels[0]}</span>
            </button>
          </div>
          
          {/* Tree */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
            {sectoresFiltrados.map(renderSectorNode)}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <Trees size={15} className="text-primary" />
               <span className="text-[11px] font-semibold text-[var(--text-muted)]">Sector</span>
            </div>
            <div className="flex items-center gap-2">
               <Home size={15} className="text-primary" />
               <span className="text-[11px] font-semibold text-[var(--text-muted)]">Finca</span>
            </div>
            <div className="flex items-center gap-2">
               <Package size={15} className="text-primary" />
               <span className="text-[11px] font-semibold text-[var(--text-muted)]">Lote</span>
            </div>
            <div className="flex items-center gap-2">
               <Sprout size={15} className="text-primary" />
               <span className="text-[11px] font-semibold text-[var(--text-muted)]">Suerte</span>
            </div>
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
                  <label className="input-label">ID de Planta</label>
                  <input className="input-field" value={newSectorPlant} onChange={e => setNewSectorPlant(e.target.value)} placeholder="Ej: PLN-01" />
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
                  <button className="bg-primary text-primary-light font-bold text-sm px-4 py-2 rounded-lg hover:brightness-110 flex items-center gap-2 shadow-sm transition-all" onClick={() => setCreatingType(typeForNextChild(activeNode.type))}>
                    <Plus size={16} />
                    <span>Agregar {labelForType(typeForNextChild(activeNode.type))}</span>
                  </button>
                )}
              </div>
              <HojaDeVida key={activeNode.id} node={activeNode} onUpdate={handleUpdate} onDelete={(id) => deleteEstructura(id, activeNode.type)} />
            </div>
          ) : (
            <div className="glass-card !p-0 h-full flex flex-col justify-between overflow-hidden relative">
              <div className="p-12 flex-1 flex flex-col items-center justify-center text-center z-10 min-h-[400px]">
                
                <div className="w-48 h-48 rounded-full bg-gradient-to-b from-primary/5 to-[var(--glass-bg)] flex flex-col items-center justify-end mb-8 border-[6px] border-[var(--glass-bg)] shadow-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10"></div>
                   <Trees size={72} className="text-primary mb-4 relative z-10" />
                   <div className="w-full h-1/4 bg-primary/20 rounded-t-full relative z-10 blur-sm"></div>
                </div>

                <h3 className="text-2xl font-extrabold text-[var(--text-contrast)] mb-3">Seleccione un elemento de la jerarquía</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
                  Haga clic en cualquier Sector, Finca, Lote o Suerte del árbol para ver y editar su Hoja de Vida.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 z-10 bg-gradient-to-t from-[var(--glass-bg)] via-[var(--glass-bg)] to-transparent pt-12">
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex items-start gap-3 shadow-sm hover:-translate-y-1 transition-transform">
                  <Network className="text-primary mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-contrast)]">Organización</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Estructura clara</p>
                  </div>
                </div>
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex items-start gap-3 shadow-sm hover:-translate-y-1 transition-transform">
                  <ShieldCheck className="text-primary mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-contrast)]">Trazabilidad</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Control y seguimiento</p>
                  </div>
                </div>
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex items-start gap-3 shadow-sm hover:-translate-y-1 transition-transform">
                  <BarChart3 className="text-primary mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-contrast)]">Eficiencia</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Mejores decisiones</p>
                  </div>
                </div>
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex items-start gap-3 shadow-sm hover:-translate-y-1 transition-transform">
                  <TrendingUp className="text-primary mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-contrast)]">Productividad</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Resultados sostenibles</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
