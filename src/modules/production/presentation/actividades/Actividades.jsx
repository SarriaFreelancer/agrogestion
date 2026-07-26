import React, { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';

export default function Actividades() {
  const { gruposActividades, actividades } = useAgro();
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [filtroCultivo, setFiltroCultivo] = useState('Todos');

  const actividadesFiltradas = actividades.filter(a => {
    const matchGrupo = filtroGrupo === 'Todos' || a.groupId === filtroGrupo;
    const matchCultivo = filtroCultivo === 'Todos' || a.cultivo === filtroCultivo;
    return matchGrupo && matchCultivo;
  });

  return (
    <div>
      <div className="header">
        <h1>Maestro de Actividades</h1>
        <p>Catálogo de actividades y grupos por cultivo</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3>Grupos de Actividades</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {gruposActividades.map(g => (
            <div key={g.id} className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              {g.name}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Catálogo de Actividades</h3>
          <button className="btn-primary">+ Nueva Actividad</button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="input-label">Filtrar por Grupo</label>
            <select className="input-field" value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}>
              <option value="Todos">Todos</option>
              {gruposActividades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Filtrar por Cultivo</label>
            <select className="input-field" value={filtroCultivo} onChange={e => setFiltroCultivo(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Caña">Caña</option>
              <option value="Mango">Mango</option>
              <option value="Naranja">Naranja</option>
            </select>
          </div>
        </div>
        
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead>
            <tr style={{borderBottom: '2px solid var(--primary-light)', color: 'var(--primary-dark)'}}>
              <th style={{padding: '0.8rem 0.5rem'}}>Código</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Actividad</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Grupo</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Cultivo</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {actividadesFiltradas.length > 0 ? actividadesFiltradas.map(act => (
              <tr key={act.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '0.8rem 0.5rem', fontWeight: 'bold'}}>{act.code}</td>
                <td style={{padding: '0.8rem 0.5rem'}}>{act.name}</td>
                <td style={{padding: '0.8rem 0.5rem'}}>
                  {gruposActividades.find(g => g.id === act.groupId)?.name}
                </td>
                <td style={{padding: '0.8rem 0.5rem'}}>{act.cultivo}</td>
                <td style={{padding: '0.8rem 0.5rem'}}>{act.tipo}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{padding: '1rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                  No se encontraron actividades con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
