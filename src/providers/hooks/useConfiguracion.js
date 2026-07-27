import { useState } from 'react';
import { confirmDialog } from '@/utils/swal';
import { GLOBAL_CONFIG_DEFAULTS, initialPlantas } from '../mocks';

export function useConfiguracion(syncToDatabase) {
  const [globalPlanta, setGlobalPlanta] = useState('Todas');
  const [globalCultivo, setGlobalCultivo] = useState('Todos');
  const [plantas, setPlantas] = useState(initialPlantas);
  const [configuraciones, setConfiguraciones] = useState({ ...GLOBAL_CONFIG_DEFAULTS });
  const [categoriasAcceso, setCategoriasAcceso] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const updateConfiguracion = (key, value) => {
    const newVal = { ...configuraciones, [key]: value };
    setConfiguraciones(newVal);
    syncToDatabase('ConfiguracionGlobal', 'edit', {
      id: 'conf_1', key, value: String(value)
    });
  };

  const updateGlobalPlanta = (planta) => setGlobalPlanta(planta);
  const updateGlobalCultivo = (cultivo) => setGlobalCultivo(cultivo);

  const addCategoria = (cat) => {
    const n = { ...cat, id: cat.id || Date.now().toString() };
    setCategoriasAcceso([...categoriasAcceso, n]);
  };
  const editCategoria = (id, newProps) => setCategoriasAcceso(categoriasAcceso.map(c => c.id === id ? { ...c, ...newProps } : c));
  const deleteCategoria = async (id) => { if (await confirmDialog('¿Eliminar categoría?')) setCategoriasAcceso(categoriasAcceso.filter(c => c.id !== id)); };

  const addUsuario = (u) => {
    const normalized = {
      id: u.id || Date.now().toString(),
      nombre: u.name || u.nombre,
      email: u.email,
      role: u.role || 'Operador',
      estado: u.status || 'Activo',
      cedula: u.cedula || '',
      plantaId: u.plantaId || ''
    };
    setUsuarios([...usuarios, normalized]);
    syncToDatabase('Usuario', 'add', normalized);
  };

  const editUsuario = (id, newProps) => setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...newProps } : u));
  const deleteUsuario = async (id) => { if (await confirmDialog('¿Deshabilitar usuario?')) setUsuarios(usuarios.filter(u => u.id !== id)); };

  return {
    globalPlanta, setGlobalPlanta, updateGlobalPlanta,
    globalCultivo, setGlobalCultivo, updateGlobalCultivo,
    plantas, setPlantas,
    configuraciones, setConfiguraciones, updateConfiguracion,
    categoriasAcceso, setCategoriasAcceso, addCategoria, editCategoria, deleteCategoria,
    usuarios, setUsuarios, addUsuario, editUsuario, deleteUsuario
  };
}
