import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  for (const rep of replacements) {
    if (rep.regex) {
      content = content.replace(rep.regex, rep.replacement);
    } else if (rep.search) {
      content = content.split(rep.search).join(rep.replacement);
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Corregido: ${filePath}`);
  }
}

// 1. Configuraciones.jsx
replaceInFile('./src/components/configuraciones/Configuraciones.jsx', [
  { search: 'key={cultivo.id}', replacement: 'key={section.id}' },
  { search: 'isOpen ? null : id', replacement: 'isOpen ? null : section.id' },
  { search: 'id === \'insumos\'', replacement: 'section.id === \'insumos\'' },
  { search: 'id === \'maquinaria\'', replacement: 'section.id === \'maquinaria\'' },
  { search: 'id === \'manoObra\'', replacement: 'section.id === \'manoObra\'' },
  { search: 'id === \'monitoreo\'', replacement: 'section.id === \'monitoreo\'' },
  { search: 'id === \'estructura\'', replacement: 'section.id === \'estructura\'' },
  { search: 'id === \'maestros\'', replacement: 'section.id === \'maestros\'' },
  { search: 'id === \'apariencia\'', replacement: 'section.id === \'apariencia\'' },
  { search: 'id === \'instancia\'', replacement: 'section.id === \'instancia\'' },
  { regex: /configuraciones\[id\]/g, replacement: 'configuraciones[rule.id]' },
  { regex: /handleToggle\(id\)/g, replacement: 'handleToggle(rule.id)' },
  { search: 'configuraciones.maestrosHabilitados?.[id]', replacement: 'configuraciones.maestrosHabilitados?.[maestro.id]' },
  { search: '[id]: !(configuraciones.maestrosHabilitados?.[id] !== false)', replacement: '[maestro.id]: !(configuraciones.maestrosHabilitados?.[maestro.id] !== false)' }
]);

// 2. Maestros.jsx
replaceInFile('./src/components/maestros/Maestros.jsx', [
  { search: 'configuraciones.maestrosHabilitados?.[id]', replacement: 'configuraciones.maestrosHabilitados?.[m.id]' }
]);

// 3. Monitoreo.jsx
replaceInFile('./src/components/monitoreo/Monitoreo.jsx', [
  { search: 'mainValores[id]', replacement: 'mainValores[v.id]' },
  { search: '...mainValores, [id]:', replacement: '...mainValores, [v.id]:' },
  { search: 'currentMuestraValores[id]', replacement: 'currentMuestraValores[v.id]' },
  { search: '...currentMuestraValores, [id]:', replacement: '...currentMuestraValores, [v.id]:' },
  { search: 'm.valores[id]', replacement: 'm.valores[v.id]' },
  { search: 'getSumByVariable(id)', replacement: 'getSumByVariable(v.id)' },
  { search: 'getSumByVariable(.id)', replacement: 'getSumByVariable(v.id)' }
]);

console.log("Correcciones de referencias locales ('id' indefinido) completadas. El navegador ya debería mostrar contenido.");
