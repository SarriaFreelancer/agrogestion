import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api.service';
import { useTenant } from '../../providers/TenantProvider';

/**
 * Hook para cargar datos genéricos desde la base de datos del cliente
 * @param {string} modelName - El nombre de la tabla/modelo (ej. 'cultivos', 'actividades')
 */
export const useLoadData = (modelName) => {
  const { currentClient } = useTenant();

  return useQuery({
    queryKey: [modelName, currentClient?.id],
    queryFn: async () => {
      if (!currentClient || !currentClient.databaseEngine) {
        throw new Error("No hay cliente seleccionado o configuración de BD");
      }
      
      const response = await apiService.loadData(
        currentClient.databaseEngine, 
        currentClient.connectionData, 
        modelName
      );
      
      return response.data || [];
    },
    // Solo ejecutamos la query si hay un cliente seleccionado
    enabled: !!currentClient && !!currentClient.databaseEngine,
  });
};

/**
 * Hook genérico para mutar datos (Crear, Actualizar, Borrar)
 */
export const useSyncData = () => {
  const { currentClient } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload }) => {
      if (!currentClient || !currentClient.databaseEngine) {
        throw new Error("No hay cliente seleccionado");
      }
      return apiService.syncData(
        currentClient.databaseEngine,
        currentClient.connectionData,
        payload
      );
    },
    onSuccess: (data, variables) => {
      // Invalidar cache de las tablas afectadas para forzar refetch
      const modelsAffected = Object.keys(variables.payload).filter(key => key !== 'deletedRows');
      modelsAffected.forEach(model => {
        queryClient.invalidateQueries({ queryKey: [model, currentClient?.id] });
      });
      
      // Invalidar tablas con borrados
      if (variables.payload.deletedRows) {
        Object.keys(variables.payload.deletedRows).forEach(model => {
           queryClient.invalidateQueries({ queryKey: [model, currentClient?.id] });
        });
      }
    }
  });
};
