import { useState, useEffect } from 'react';
import { confirmDialog } from '@/utils/swal';
import { initialEmpresas } from '../mocks';
import { apiUrl } from '@/utils/api';

export function useEmpresas(syncToDatabase) {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    fetch(apiUrl('/api/clientes'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmpresas(data.data);
        } else {
          setEmpresas([...initialEmpresas]); // Fallback
        }
      })
      .catch(err => {
        console.error('Error fetching empresas:', err);
        setEmpresas([...initialEmpresas]);
      });
  }, []);

  const addEmpresa = async (empresa) => {
    try {
      const response = await fetch(apiUrl('/api/clientes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa)
      });
      const data = await response.json();
      if (data.success) {
        setEmpresas(prev => [...prev, { ...empresa, id: data.data.id }]);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const editEmpresa = async (id, newProps) => {
    try {
      const response = await fetch(apiUrl(`/api/clientes/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProps)
      });
      const data = await response.json();
      if (data.success) {
        setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ...newProps } : e));
      } else {
        alert('Error: ' + data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEmpresa = async (id) => {
    if (await confirmDialog('¿Eliminar esta empresa?', { title: 'Eliminar empresa' })) {
      try {
        const response = await fetch(apiUrl(`/api/clientes/${id}`), {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          setEmpresas(prev => prev.filter(e => e.id !== id));
        } else {
          alert('Error: ' + data.message);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return {
    empresas, setEmpresas,
    addEmpresa, editEmpresa, deleteEmpresa
  };
}
