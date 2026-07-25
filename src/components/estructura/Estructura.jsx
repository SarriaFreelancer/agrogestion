import { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import HojaDeVida from './HojaDeVida';

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
      style={{
        textAlign: 'left',
        padding: '0.4rem 0.7rem',
        borderRadius: '8px',
        background: activeNode?.id === suerte.id ? 'var(--primary-light)' : 'var(--input-bg)',
        color: activeNode?.id === suerte.id ? 'white' : 'var(--text-main)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        width: '100%'
      }}
    >
      🍃 <strong>{suerte.id}</strong> - {suerte.name}
    </button>
  );

  const renderLoteNode = (lote) => {
    const loteSuertes = filterByGlobal(lote.suertes);
    const loteExpanded = isExpanded(lote.id);

    return (
      <div key={lote.id} style={{ marginBottom: '0.45rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={() => setSelectedNode(lote)}
            style={{
              textAlign: 'left',
              flex: 1,
              padding: '0.45rem 0.7rem',
              borderRadius: '8px',
              background: activeNode?.id === lote.id ? 'var(--primary-light)' : 'var(--input-bg)',
              color: activeNode?.id === lote.id ? 'white' : 'var(--text-main)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer',
              fontSize: '0.82rem'
            }}
          >
            📦 <strong>{lote.id}</strong> - {lote.name}
          </button>
          {canRenderSuertes && loteSuertes.length > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => toggleNode(lote.id)}
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.72rem', minWidth: '88px' }}
            >
              {loteExpanded ? 'Ocultar' : `Ver ${loteSuertes.length}`}
            </button>
          )}
        </div>

        {canRenderSuertes && loteExpanded && loteSuertes.length > 0 && (
          <div style={{ paddingLeft: '1.5rem', marginTop: '0.45rem', display: 'grid', gap: '0.35rem' }}>
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
      <div key={finca.id} style={{ marginBottom: '0.55rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={() => setSelectedNode(finca)}
            style={{
              textAlign: 'left',
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              background: activeNode?.id === finca.id ? 'var(--primary-light)' : 'var(--input-bg)',
              color: activeNode?.id === finca.id ? 'white' : 'var(--text-main)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer',
              fontSize: '0.84rem'
            }}
          >
            🏠 <strong>{finca.id}</strong> - {finca.name}
          </button>
          {canRenderLotes && fincaLotes.length > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => toggleNode(finca.id)}
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.72rem', minWidth: '88px' }}
            >
              {fincaExpanded ? 'Ocultar' : `Ver ${fincaLotes.length}`}
            </button>
          )}
        </div>

        {canRenderLotes && fincaExpanded && fincaLotes.length > 0 && (
          <div style={{ paddingLeft: '1.5rem', marginTop: '0.45rem' }}>
            {fincaLotes.map(renderLoteNode)}
          </div>
        )}

        {structureLevelCount === 3 && canRenderSuertes && fincaExpanded && filterByGlobal(finca.suertes).length > 0 && (
          <div style={{ paddingLeft: '1.5rem', marginTop: '0.45rem', display: 'grid', gap: '0.35rem' }}>
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
      <div key={sector.id} style={{ marginBottom: '0.8rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'space-between'
          }}
        >
          <button
            style={{
              cursor: 'pointer',
              fontWeight: activeNode?.id === sector.id ? 'bold' : 'normal',
              color: activeNode?.id === sector.id ? 'var(--primary-color)' : 'var(--text-main)',
              textAlign: 'left',
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: activeNode?.id === sector.id ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--input-bg)'
            }}
            onClick={() => setSelectedNode(sector)}
          >
            📁 <strong>{sector.id}</strong> - {sector.name}
          </button>
          {(sectorFincas.length > 0 || (structureLevelCount === 2 && sectorSuertes.length > 0)) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => toggleNode(sector.id)}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', minWidth: '92px' }}
            >
              {sectorExpanded ? 'Ocultar' : 'Desglosar'}
            </button>
          )}
        </div>

        {sectorExpanded && (
          <div style={{ paddingLeft: '1.25rem', marginTop: '0.55rem', borderLeft: '2px dashed var(--glass-border)' }}>
            {structureLevelCount === 2 && sectorSuertes.length > 0 && (
              <div style={{ display: 'grid', gap: '0.35rem' }}>
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
    <div>
      <div className="header">
        <h1>Estructura Agrícola</h1>
        <p>Priorización de Código y Nombre en la jerarquía.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div className="glass-card" style={{ flex: '1 1 320px', minWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3>Jerarquía</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {structureLevelCount} niveles activos: {levelLabels.slice(0, structureLevelCount).join(' › ')}
              </p>
            </div>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setCreatingType('Sector')}>
              + Nuevo {levelLabels[0]}
            </button>
          </div>
          
          <div style={{ paddingLeft: '1rem', borderLeft: '2px dashed var(--glass-border)' }}>
            {sectores.map(renderSectorNode)}
          </div>
        </div>

        <div style={{ flex: '1.5 1 320px', minWidth: '320px' }}>
          {creatingType && (
            <div className="glass-card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary-light)' }}>
              <h3>Crear Nuevo {labelForType(creatingType)} {creatingType !== 'Sector' && `en ${activeNode?.name}`}</h3>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="grid-2" style={{gap:'1rem'}}>
                  <div className="input-group">
                    <label className="input-label">Código del {creatingType}</label>
                    <input className="input-field" value={newElementCode} onChange={e => setNewElementCode(e.target.value)} placeholder="Ej: FIN-01" autoFocus />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Nombre del {creatingType}</label>
                    <input className="input-field" value={newElementName} onChange={e => setNewElementName(e.target.value)} placeholder="Ej: Finca La Esperanza" />
                  </div>
                </div>
                
                {creatingType === 'Sector' && (
                  <div className="input-group">
                    <label className="input-label">Planta o Cliente</label>
                    <input className="input-field" value={newSectorPlant} onChange={e => setNewSectorPlant(e.target.value)} placeholder="Ej: Ingenio Central" />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" onClick={handleCreate}>✓ Crear {creatingType}</button>
                  <button className="btn-secondary" onClick={() => setCreatingType(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {activeNode ? (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {canCreateChild(activeNode.type) && (
                  <button className="btn-secondary" onClick={() => setCreatingType(typeForNextChild(activeNode.type))}>
                    + Agregar {labelForType(typeForNextChild(activeNode.type))}
                  </button>
                )}
              </div>
              <HojaDeVida key={activeNode.id} node={activeNode} onUpdate={handleUpdate} />
            </>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
              Selecciona un elemento de la jerarquía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
