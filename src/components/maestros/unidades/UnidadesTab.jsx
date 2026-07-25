import React from 'react';
import SimpleCrudTab from '../shared/SimpleCrudTab';

export default function UnidadesTab({ data, onAdd, onEdit, onDelete }) {
  return (
    <SimpleCrudTab 
      title="Maestro de Unidades" 
      data={data} 
      onAdd={onAdd} 
      onEdit={onEdit} 
      onDelete={onDelete} 
      fields={[
        {key: 'id', label: 'Código'},
        {key: 'name', label: 'Nombre de la Unidad'}
      ]} 
    />
  );
}
