import SimpleCrudTab from '../../../../../shared/components/ui/SimpleCrudTab';

export default function CultivosTab({ data, onAdd, onEdit, onDelete }) {
  return (
    <SimpleCrudTab
      title="Cultivos"
      data={data}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      fields={[
        { key: 'id', label: 'Código' },
        { key: 'name', label: 'Nombre' },
        { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }
      ]}
    />
  );
}
