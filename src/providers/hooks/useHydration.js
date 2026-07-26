import { useEffect, useRef, useState } from 'react';
import { apiService } from '@/shared/services';
import { DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, GLOBAL_CONFIG_DEFAULTS } from '../mocks';

const cloneValue = (val) => JSON.parse(JSON.stringify(val));

const mapLoadedModelRows = (modelName, rows) => {
  return rows.map(row => {
    switch(modelName) {
      case 'ConfiguracionGlobal': return { id: row.id, key: row.key, value: row.value };
      case 'Cultivo': return { id: row.codigo || row.id, name: row.nombre, estado: row.estado };
      case 'GrupoActividad': return { id: row.codigo || row.id, name: row.nombre };
      case 'Actividad': return { id: row.codigo || row.id, code: row.codigo || row.id, name: row.nombre, groupId: row.grupoCodigo, cultivo: row.cultivo, tipo: row.tipo, clasificacion: row.clasificacion, unidadProduccion: row.unidadProduccion, unidadMedida: row.unidadMedida, tarifaBase: parseFloat(row.tarifaBase) || 0, productosEstandar: [] };
      case 'Trabajador': return { id: row.codigo || row.id, identificacion: row.identificacion || row.codigo, nombre: row.nombre, apellido: row.apellido, cargo: row.cargo, estado: row.estado, cuadrillaId: row.cuadrillaCodigo };
      case 'Proveedor': return { id: row.codigo || row.id, nombre: row.nombre, tipo: row.tipo, contacto: row.contacto, telefono: row.telefono, email: row.email, estado: row.estado };
      case 'Cuadrilla': return { id: row.codigo || row.id, nombre: row.nombre, jefe: row.jefeCodigo };
      case 'Unidad': return { id: row.codigo || row.id, name: row.nombre };
      case 'TipoProducto': return { id: row.codigo || row.id, nombre: row.nombre };
      case 'TipoMaquinaria': return { id: row.codigo || row.id, nombre: row.nombre };
      case 'Maquinaria': return { id: row.codigo || row.id, name: row.nombre, tipoId: row.tipoCodigo, status: row.estado, propiaAlquilada: row.propiaAlquilada, tarifa: parseFloat(row.tarifa) || 0, horometroActual: parseFloat(row.horometroActual) || 0 };
      case 'Producto': return { id: row.codigo || row.id, nombre: row.nombre, tipoId: row.tipoCodigo, unidadMedida: row.unidadMedida, stockActual: parseFloat(row.stockActual) || 0, costoUnitario: parseFloat(row.costoUnitario) || 0 };
      case 'ControlesAgro': return { id: row.id || row.codigo, nombre: row.nombre, variables: [] };
      case 'Usuario': return { id: row.id, codigo: row.codigo, nombre: row.nombre, email: row.email, rol: row.rol, estado: row.estado };
      case 'CategoriaAcceso': return { id: row.id || row.codigo, code: row.codigo, name: row.nombre, descripcion: row.descripcion, permisos: {}, modulos: [] };
      default: return row;
    }
  });
};

export function useHydration(currentClient, setters) {
  const [isHydrating, setIsHydrating] = useState(true);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      setIsHydrating(true);
      isHydratingRef.current = true;

      const connectionData = currentClient?.connectionData || {};
      if (!currentClient?.databaseEngine || !Object.keys(connectionData).length) {
        setIsHydrating(false);
        isHydratingRef.current = false;
        return;
      }

      const models = [
        'ConfiguracionGlobal', 'Cultivo', 'GrupoActividad', 'Actividad',
        'Trabajador', 'Proveedor', 'Cuadrilla', 'Unidad', 'TipoProducto',
        'TipoMaquinaria', 'Maquinaria', 'Producto', 'ControlesAgro',
        'Usuario', 'CategoriaAcceso'
      ];

      const results = await Promise.all(models.map(async (model) => {
        try {
          const result = await apiService.loadData(currentClient.databaseEngine, connectionData, model);
          return [model, result.success ? result.data : []];
        } catch (error) {
          console.error(`Error cargando ${model} desde BD:`, error);
          return [model, []];
        }
      }));

      if (cancelled) return;

      const snapshot = {};

      results.forEach(([model, rows]) => {
        const mapped = mapLoadedModelRows(model, rows);
        switch (model) {
          case 'ConfiguracionGlobal':
            const loadedConfig = {};
            mapped.forEach(r => {
                try { loadedConfig[r.key] = JSON.parse(r.value); } 
                catch { loadedConfig[r.key] = r.value; }
            });
            snapshot.configuraciones = { ...GLOBAL_CONFIG_DEFAULTS, ...loadedConfig };
            break;
          case 'Cultivo': snapshot.cultivos = mapped; break;
          case 'GrupoActividad': snapshot.gruposActividades = mapped; break;
          case 'Actividad': snapshot.actividades = mapped; break;
          case 'Trabajador': snapshot.trabajadores = mapped; break;
          case 'Proveedor': snapshot.proveedores = mapped; break;
          case 'Cuadrilla': snapshot.cuadrillas = mapped; break;
          case 'Unidad': snapshot.unidades = mapped; break;
          case 'TipoProducto': snapshot.tiposProductos = mapped; break;
          case 'TipoMaquinaria': snapshot.tiposMaquinaria = mapped; break;
          case 'Maquinaria': snapshot.maquinarias = mapped; break;
          case 'Producto': snapshot.productos = mapped; break;
          case 'ControlesAgro': snapshot.controlesAgro = mapped; break;
          case 'Usuario': snapshot.usuarios = mapped; break;
          case 'CategoriaAcceso': snapshot.categoriasAcceso = mapped; break;
          default: break;
        }
      });

      if (!snapshot.categoriasAcceso?.length) snapshot.categoriasAcceso = DEFAULT_ACCESS_CATEGORIES(currentClient.id);
      if (!snapshot.usuarios?.length) snapshot.usuarios = DEFAULT_USERS(currentClient.id);

      // Apply to all setters
      if (snapshot.configuraciones) setters.setConfiguraciones(snapshot.configuraciones);
      if (snapshot.cultivos) setters.setCultivos(snapshot.cultivos);
      if (snapshot.gruposActividades) setters.setGruposActividades(snapshot.gruposActividades);
      if (snapshot.actividades) setters.setActividades(snapshot.actividades);
      if (snapshot.trabajadores) setters.setTrabajadores(snapshot.trabajadores);
      if (snapshot.proveedores) setters.setProveedores(snapshot.proveedores);
      if (snapshot.cuadrillas) setters.setCuadrillas(snapshot.cuadrillas);
      if (snapshot.unidades) setters.setUnidades(snapshot.unidades);
      if (snapshot.tiposProductos) setters.setTiposProductos(snapshot.tiposProductos);
      if (snapshot.tiposMaquinaria) setters.setTiposMaquinaria(snapshot.tiposMaquinaria);
      if (snapshot.maquinarias) setters.setMaquinarias(snapshot.maquinarias);
      if (snapshot.productos) setters.setProductos(snapshot.productos);
      if (snapshot.controlesAgro) setters.setControlesAgro(snapshot.controlesAgro);
      if (snapshot.usuarios) setters.setUsuarios(snapshot.usuarios);
      if (snapshot.categoriasAcceso) setters.setCategoriasAcceso(snapshot.categoriasAcceso);

      setTimeout(() => {
        setIsHydrating(false);
        isHydratingRef.current = false;
      }, 0);
    };

    hydrate();

    return () => { cancelled = true; };
  }, [currentClient]);

  return { isHydrating, isHydratingRef };
}
