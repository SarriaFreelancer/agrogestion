import React from 'react';
import { useAgro } from '@/providers/AgroContext';
import { MapPin, Sprout } from 'lucide-react';

export default function ContextBar() {
  const { 
    globalPlanta, setGlobalPlanta, 
    globalCultivo, setGlobalCultivo, 
    plantas, cultivos 
  } = useAgro();

  // Filtrar cultivos que pertenecen a la planta seleccionada
  const cultivosFiltrados = globalPlanta === 'Todas' 
    ? cultivos 
    : cultivos.filter(c => c.plantaId === globalPlanta);

  // Si cambiamos de planta y el cultivo seleccionado ya no pertenece a ella, resetear cultivo a 'Todos'
  const handlePlantaChange = (e) => {
    const nuevaPlanta = e.target.value;
    setGlobalPlanta(nuevaPlanta);
    
    if (nuevaPlanta !== 'Todas' && globalCultivo !== 'Todos') {
      const cultivoAunValido = cultivos.find(c => c.id === globalCultivo && c.plantaId === nuevaPlanta);
      if (!cultivoAunValido) {
        setGlobalCultivo('Todos');
      }
    }
  };

  return (
    <div className="bg-surface border-b border-[var(--glass-border)] py-2 px-6 flex items-center justify-between shadow-sm z-10 sticky top-0 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-muted" />
          <span className="text-sm font-semibold text-muted">Planta Operativa:</span>
          <select 
            value={globalPlanta} 
            onChange={handlePlantaChange}
            className="bg-transparent border border-[var(--glass-border)] rounded-md text-sm px-2 py-1 text-contrast focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="Todas">Todas las Plantas</option>
            {plantas?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Sprout size={16} className="text-muted" />
          <span className="text-sm font-semibold text-muted">Cultivo:</span>
          <select 
            value={globalCultivo} 
            onChange={(e) => setGlobalCultivo(e.target.value)}
            className="bg-transparent border border-[var(--glass-border)] rounded-md text-sm px-2 py-1 text-contrast focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="Todos">Todos los Cultivos</option>
            {cultivosFiltrados?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="text-xs text-muted flex items-center gap-2 bg-[var(--glass-bg)] px-3 py-1 rounded-full border border-[var(--glass-border)]">
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        Datos filtrados por contexto
      </div>
    </div>
  );
}
