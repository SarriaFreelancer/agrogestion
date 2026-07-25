import React from 'react';
import SimpleCrudTab from '../shared/SimpleCrudTab';

export default function TiposTab({ data, onAdd, onEdit, onDelete }) {
  return (
    <SimpleCrudTab 
      title="Tipos de Maquinaria" 
      data={data} 
      onAdd={onAdd} 
      onEdit={onEdit} 
      onDelete={onDelete} 
      fields={[
        {key: 'id', label: 'Código'},
        {key: 'nombre', label: 'Nombre del Tipo'}
      ]} 
    />
  );
}

