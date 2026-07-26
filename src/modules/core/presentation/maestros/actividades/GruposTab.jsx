import React from 'react';
import SimpleCrudTab from '../../../../../shared/components/ui/SimpleCrudTab';

export default function GruposTab({ data, onAdd, onEdit, onDelete }) {
  return (
    <SimpleCrudTab 
      title="Grupos de Actividades" 
      data={data} 
      onAdd={onAdd} 
      onEdit={onEdit} 
      onDelete={onDelete} 
      fields={[
        {key: 'id', label: 'Código'},
        {key: 'name', label: 'Nombre del Grupo'}
      ]} 
    />
  );
}
