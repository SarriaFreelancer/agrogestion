import React, { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import HojaDeVida from '@/modules/farms/presentation/estructura/HojaDeVida';
import { 
  Network, 
  Home, 
  Package, 
  Sprout, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  MousePointerClick, 
  MoreVertical, 
  Trees, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck,
  Droplets,
  Layers,
  Search,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { notifySuccess } from '@/utils/swal';

export default function Estructura() {
  const { 
    globalPlanta, 
    globalCultivo, 
    cultivos, 
    sectores, 
    updateEstructura, 
    addSector, 
    addElementoEstructura, 
    configuraciones,
    calcTotalHa,
    calcLotesActivos
  } = useAgro();

  const [selectedNode, setSelectedNode] = useState(null); 
  const [creatingType, setCreatingType] = useState(null); 
  const [creatingParent, setCreatingParent] = useState(null);
  const [newElementName, setNewElementName] = useState('');
  const [newElementCode, setNewElementCode] = useState('');
  const [newElementHa, setNewElementHa] = useState('');
  const [newElementCultivo, setNewElementCultivo] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({ 'ZON-01': true, 'SEC-01': true, 'FIN-01': true, 'LOT-01': true });
  const [treeSearch, setTreeSearch] = useState('');

  const filterByGlobal = (suertes) => {
    if (!suertes) return [];
    if (globalCultivo === 'Todos') return suertes;
    return suertes.filter(s => s.cultivo === globalCultivo);
  };

  const sectoresFiltrados = globalPlanta === 'Todas' ? sectores : sectores.filter(s => s.plantaId === globalPlanta);

  const findNodeByIdAndType = (nodes, id, searchType) => {
    if (!id || !nodes) return null;

    for (const node of nodes) {
      if (node.id === id && (!searchType || node.type === searchType)) return node;
      
      if (node.sectores) {
        const f = findNodeByIdAndType(node.sectores, id, searchType);
        if (f) return f;
      }
      if (node.fincas) {
        const f = findNodeByIdAndType(node.fincas, id, searchType);
        if (f) return f;
      }
      if (node.lotes) {
        const f = findNodeByIdAndType(node.lotes, id, searchType);
        if (f) return f;
      }
      if (node.suertes) {
        const f = findNodeByIdAndType(node.suertes, id, searchType);
        if (f) return f;
      }
      if (node.surcos) {
        const f = findNodeByIdAndType(node.surcos, id, searchType);
        if (f) return f;
      }
    }
    return null;
  };

  const activeNode = findNodeByIdAndType(sectores, selectedNode?.id, selectedNode?.type) || selectedNode;

  const levelLabels = [
    configuraciones?.estructuraNivelNombres?.nivel1 || 'Zona / Región',
    configuraciones?.estructuraNivelNombres?.nivel2 || 'Sector',
    configuraciones?.estructuraNivelNombres?.nivel3 || 'Finca / Hacienda',
    configuraciones?.estructuraNivelNombres?.nivel4 || 'Lote / Bloque',
    configuraciones?.estructuraNivelNombres?.nivel5 || 'Suerte / Tablón',
    configuraciones?.estructuraNivelNombres?.nivel6 || 'Surco / Sección'
  ];

  const labelForType = (type) => {
    if (type === 'Zona') return levelLabels[0];
    if (type === 'Sector') return levelLabels[1];
    if (type === 'Finca') return levelLabels[2];
    if (type === 'Lote') return levelLabels[3];
    if (type === 'Suerte') return levelLabels[4];
    if (type === 'Surco' || type === 'Seccion') return levelLabels[5];
    return type;
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id) => Boolean(expandedNodes[id]);

  const handleOpenCreateChild = (parent, nextType) => {
    setCreatingParent(parent);
    setCreatingType(nextType);
    setNewElementName('');
    setNewElementCode(`${nextType.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`);
    setNewElementHa('');
    setNewElementCultivo(cultivos?.[0]?.name || 'Caña de Azúcar');
  };

  const handleSaveNewElement = () => {
    if (!newElementName.trim()) return;

    if (creatingType === 'Sector' && !creatingParent) {
      addSector({
        id: newElementCode || `SEC-${Date.now().toString().slice(-4)}`,
        name: newElementName,
        type: 'Sector',
        plantaCliente: globalPlanta !== 'Todas' ? globalPlanta : 'PLN-01',
        fincas: []
      });
    } else if (creatingParent) {
      addElementoEstructura(creatingParent.id, creatingParent.type, {
        id: newElementCode || `${creatingType.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        name: newElementName,
        type: creatingType,
        hectareas: Number(newElementHa || 0),
        cultivo: newElementCultivo,
        estado: 'Activo'
      });
    }

    notifySuccess(`${creatingType} creado exitosamente`);
    setCreatingType(null);
    setCreatingParent(null);
  };

  // Node Renderers across 6 Levels
  const renderSurcoItem = (surco) => (
    <div key={surco.id} className="flex items-center gap-2 mb-1.5 ml-8">
      <button
        onClick={() => setSelectedNode({ ...surco, type: 'Surco' })}
        className={`flex-1 flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
          activeNode?.id === surco.id ? 'bg-primary/20 border-primary text-white font-bold' : 'bg-white/[0.02] border-[var(--glass-border)] text-[var(--text-contrast)] hover:bg-white/[0.05]'
        }`}
      >
        <div className="flex items-center gap-2">
          <Droplets size={13} className="text-cyan-400" />
          <span>{surco.name}</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono">{surco.hectareas || 0} Ha</span>
      </button>
    </div>
  );

  const renderSuerteNode = (suerte) => {
    const suerteExpanded = isExpanded(suerte.id);
    const hasSurcos = suerte.surcos && suerte.surcos.length > 0;

    return (
      <div key={suerte.id} className="mb-2 ml-6">
        <div className="flex items-center gap-2">
          {hasSurcos ? (
            <button 
              onClick={() => toggleNode(suerte.id)} 
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-white"
            >
              {suerteExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <button
            onClick={() => setSelectedNode({ ...suerte, type: 'Suerte' })}
            className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
              activeNode?.id === suerte.id && activeNode?.type === 'Suerte'
                ? 'bg-primary/20 border-primary text-white font-bold'
                : 'bg-white/[0.02] border-[var(--glass-border)] text-[var(--text-contrast)] hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sprout size={13} />
              </div>
              <span className="font-bold">{suerte.id} - {suerte.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-mono font-bold">{suerte.hectareas || 0} Ha</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenCreateChild(suerte, 'Surco'); }}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-[var(--text-muted)] hover:text-white"
                title="Agregar Válvula/Surco"
              >
                <Plus size={12} />
              </button>
            </div>
          </button>
        </div>

        {suerteExpanded && hasSurcos && (
          <div className="mt-1.5 space-y-1">
            {suerte.surcos.map(renderSurcoItem)}
          </div>
        )}
      </div>
    );
  };

  const renderLoteNode = (lote) => {
    const loteSuertes = filterByGlobal(lote.suertes || []);
    const loteExpanded = isExpanded(lote.id);
    const hasChildren = loteSuertes.length > 0;

    return (
      <div key={lote.id} className="mb-2 ml-4">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button 
              onClick={() => toggleNode(lote.id)} 
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-white"
            >
              {loteExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <button
            onClick={() => setSelectedNode({ ...lote, type: 'Lote' })}
            className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
              activeNode?.id === lote.id && activeNode?.type === 'Lote'
                ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                : 'bg-white/[0.02] border-[var(--glass-border)] text-[var(--text-contrast)] hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Package size={13} />
              </div>
              <span className="font-bold">{lote.id} - {lote.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)]">{loteSuertes.length} suertes</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenCreateChild(lote, 'Suerte'); }}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-[var(--text-muted)] hover:text-white"
                title="Agregar Suerte"
              >
                <Plus size={12} />
              </button>
            </div>
          </button>
        </div>

        {loteExpanded && hasChildren && (
          <div className="mt-1.5 space-y-1">
            {loteSuertes.map(renderSuerteNode)}
          </div>
        )}
      </div>
    );
  };

  const renderFincaNode = (finca) => {
    const fincaExpanded = isExpanded(finca.id);
    const hasLotes = finca.lotes && finca.lotes.length > 0;

    return (
      <div key={finca.id} className="mb-2.5 ml-2">
        <div className="flex items-center gap-2">
          {hasLotes ? (
            <button 
              onClick={() => toggleNode(finca.id)} 
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-white"
            >
              {fincaExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <button
            onClick={() => setSelectedNode({ ...finca, type: 'Finca' })}
            className={`flex-1 flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
              activeNode?.id === finca.id && activeNode?.type === 'Finca'
                ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                : 'bg-white/[0.03] border-[var(--glass-border)] text-[var(--text-contrast)] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Home size={14} />
              </div>
              <span className="font-extrabold text-sm">{finca.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)]">{finca.lotes?.length || 0} lotes</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenCreateChild(finca, 'Lote'); }}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-[var(--text-muted)] hover:text-white"
                title="Agregar Lote"
              >
                <Plus size={12} />
              </button>
            </div>
          </button>
        </div>

        {fincaExpanded && hasLotes && (
          <div className="mt-2 space-y-1">
            {finca.lotes.map(renderLoteNode)}
          </div>
        )}
      </div>
    );
  };

  const renderTopNode = (item) => {
    const isNodeExpanded = isExpanded(item.id);
    const hasSectoresOrFincas = (item.sectores && item.sectores.length > 0) || (item.fincas && item.fincas.length > 0);

    return (
      <div key={item.id} className="mb-4 glass-card !p-3 border-[var(--glass-border)]">
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleNode(item.id)} 
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-white"
            >
              {isNodeExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers size={16} />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[var(--text-contrast)]">{item.name}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{item.id} · {item.plantaCliente || 'General'}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => handleOpenCreateChild(item, 'Finca')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[var(--text-contrast)] flex items-center gap-1"
              title="Agregar Finca"
            >
              <Plus size={12} /> Finca
            </button>
          </div>
        </div>

        {isNodeExpanded && (
          <div className="space-y-2 pt-1">
            {item.sectores?.map(s => (
              <div key={s.id} className="ml-2 mb-2 border-l-2 border-primary/30 pl-2">
                <div className="font-bold text-xs text-primary mb-1">{s.name}</div>
                {s.fincas?.map(renderFincaNode)}
              </div>
            ))}
            {item.fincas?.map(renderFincaNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in p-5 lg:p-8 h-full w-full overflow-y-auto custom-scrollbar bg-transparent text-[var(--text-contrast)]">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Network size={15} />
            <span>Topología Jerárquica Agrícola</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-contrast)] mt-0.5">
            Estructura Agrícola en 6 Niveles
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Organización espacial: Zona → Sector → Finca → Lote → Suerte → Surco / Válvula de Riego.
          </p>
        </div>

        <button 
          onClick={() => handleOpenCreateChild(null, 'Sector')}
          className="btn-primary !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} />
          <span>Nueva Zona / Sector</span>
        </button>
      </div>

      {/* ── HIERARCHY PILLS ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] text-xs">
        <span className="font-bold text-[var(--text-muted)] mr-1">Jerarquía Activa:</span>
        {levelLabels.map((lbl, idx) => (
          <React.Fragment key={idx}>
            <span className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-[var(--glass-border)] font-semibold text-[var(--text-contrast)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>N{idx + 1}: {lbl}</span>
            </span>
            {idx < levelLabels.length - 1 && (
              <ChevronRight size={12} className="text-[var(--text-muted)]" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── MAIN LAYOUT: TREE & HOJA DE VIDA ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Tree (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[var(--text-contrast)] flex items-center gap-2">
              <Trees size={16} className="text-emerald-400" />
              Árbol de Ubicaciones
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-mono font-medium">
              {sectoresFiltrados?.length || 0} ramas principales
            </span>
          </div>

          <div className="space-y-3">
            {sectoresFiltrados.map(renderTopNode)}
          </div>
        </div>

        {/* Right Column: Node Details / Hoja de Vida (7 cols) */}
        <div className="lg:col-span-7">
          {activeNode ? (
            <HojaDeVida 
              node={activeNode} 
              onUpdate={(id, newProps, type) => updateEstructura(id, newProps, type)} 
            />
          ) : (
            <div className="glass-card !p-12 text-center border-[var(--glass-border)] space-y-3">
              <MousePointerClick size={40} className="mx-auto text-primary/60 animate-bounce" />
              <h3 className="text-base font-bold text-[var(--text-contrast)]">
                Seleccione un elemento del árbol
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Haga clic en cualquier Zona, Finca, Lote, Suerte o Válvula de la izquierda para ver su hoja de vida, coordenadas, topografía y métricas de producción.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── CREATE MODAL ──────────────────────────────────────────────── */}
      {creatingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card !p-6 max-w-md w-full border-[var(--glass-border)] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-contrast)]">
                Nuevo {labelForType(creatingType)}
              </h3>
              <span className="text-xs text-primary font-bold">
                {creatingParent ? `Padre: ${creatingParent.name}` : 'Nivel Superior'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="input-group">
                <label className="input-label">Código / Identificador</label>
                <input 
                  className="input-field" 
                  value={newElementCode} 
                  onChange={(e) => setNewElementCode(e.target.value)} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Nombre del {labelForType(creatingType)}</label>
                <input 
                  className="input-field" 
                  placeholder={`Ej: ${creatingType} 01`} 
                  value={newElementName} 
                  onChange={(e) => setNewElementName(e.target.value)} 
                />
              </div>

              {(creatingType === 'Suerte' || creatingType === 'Surco') && (
                <div className="input-group">
                  <label className="input-label">Área Neta (Hectáreas)</label>
                  <input 
                    type="number" 
                    step="any" 
                    className="input-field" 
                    placeholder="0.0" 
                    value={newElementHa} 
                    onChange={(e) => setNewElementHa(e.target.value)} 
                  />
                </div>
              )}

              {creatingType === 'Suerte' && (
                <div className="input-group">
                  <label className="input-label">Cultivo Asignado</label>
                  <select 
                    className="input-field" 
                    value={newElementCultivo} 
                    onChange={(e) => setNewElementCultivo(e.target.value)}
                  >
                    {(cultivos || []).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--glass-border)]">
              <button 
                type="button" 
                onClick={() => { setCreatingType(null); setCreatingParent(null); }} 
                className="btn-secondary !py-2 !px-4 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleSaveNewElement} 
                className="btn-primary !py-2 !px-5 text-xs font-bold"
              >
                Crear {creatingType}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
