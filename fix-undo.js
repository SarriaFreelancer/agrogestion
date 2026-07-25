import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.prisma')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.push('./prisma/schema.prisma');
files.push('./server.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Restauraciones generales basadas en el contexto donde falta el objeto:

  // 1. En funciones flecha con un solo parámetro, e.g. .map(c => .codigo === id)
  // Restaurar a c => c.codigo
  content = content.replace(/([a-zA-Z_]\w*)\s*=>\s*\.codigo\b/g, '$1 => $1.codigo');
  content = content.replace(/([a-zA-Z_]\w*)\s*=>\s*([^.]*?)\.codigo\b/g, (match, param, middle) => {
      if (middle.trim() === '') return `${param} => ${param}.codigo`;
      if (middle.includes(param)) return match; // already fixed or not broken
      return `${param} => ${middle}${param}.codigo`; // fixes c => c.someProp === .codigo -> c => c.someProp === c.codigo
  });

  // 2. Fix servidor server.js (filteredData.codigo = filteredData.code || .codigo;)
  content = content.replace(/filteredData\.code\s*\|\|\s*\.codigo/g, 'filteredData.code || filteredData.codigo');
  content = content.replace(/planificacionCodigo:\s*\.codigo/g, 'planificacionCodigo: p.codigo');

  // 3. Casos de currentClient.codigo en toda la app
  content = content.replace(/`agroData_\$\{\.codigo\}`/g, '`agroData_${currentClient.codigo}`');
  content = content.replace(/`\$\{\.codigo\}_user`/g, '`${currentClient.codigo}_user`');
  content = content.replace(/if\s*\(\.codigo\s*===\s*\.codigo\)/g, 'if (currentClient.codigo === client.codigo)');
  content = content.replace(/clients\[([a-zA-Z_]\w*)\]\.codigo\s*===\s*\.codigo/g, 'clients[$1].codigo === currentClient.codigo');
  content = content.replace(/ID Instancia:\s*\{\.codigo\}/g, 'ID Instancia: {currentClient.codigo}');
  
  // 4. Casos de syncToDatabase en AgroContext
  content = content.replace(/syncToDatabase\('Cliente',\s*'edit',\s*\{\s*codigo:\s*\.codigo/g, "syncToDatabase('Cliente', 'edit', { codigo: updatedClient.codigo");
  content = content.replace(/syncToDatabase\('Ejecucion',\s*'add',\s*\{\s*codigo:\s*\.codigo/g, "syncToDatabase('Ejecucion', 'add', { codigo: nuevaEjecucion.codigo");
  content = content.replace(/ejecucionCodigo:\s*\.codigo/g, 'ejecucionCodigo: nuevaEjecucion.codigo');
  content = content.replace(/productoCodigo:\s*\.codigo/g, 'productoCodigo: ins.codigo');
  content = content.replace(/`\$\{\.codigo\}-ins-\$\{idx\}`/g, '`${nuevaEjecucion.codigo}-ins-${idx}`');
  content = content.replace(/`\$\{\.codigo\}-maq`/g, '`${nuevaEjecucion.codigo}-maq`');
  content = content.replace(/`\$\{\.codigo\}-mo-\$\{idx\}`/g, '`${nuevaEjecucion.codigo}-mo-${idx}`');

  // 5. Casos puntuales de props como value={.codigo} o key={.codigo}
  content = content.replace(/key=\{\.codigo\}/g, 'key={cultivo.codigo}'); 
  content = content.replace(/value=\{\.codigo\}/g, 'value={cultivo.codigo}');
  content = content.replace(/codigo:\s*\.codigo,\s*fecha:\s*nuevo\.fecha/g, 'codigo: nuevo.codigo, fecha: nuevo.fecha');
  
  // 6. Fix para MapaCalor y similares
  content = content.replace(/([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)\s*===\s*\.codigo/g, '$1.$2 === $1.codigo');
  
  // 7. Reparación general final: si quedó un .codigo solo, lo mapeamos al id que venía en los props
  // Esto cubrirá r => r.controlId === .codigo -> r.controlId === control.codigo (o el id de turno). 
  // En React, suele ser 'codigo' el nombre local del parámetro
  content = content.replace(/\s===\s\.codigo/g, ' === codigo');
  content = content.replace(/\s!==\s\.codigo/g, ' !== codigo');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Corregido: ${file}`);
  }
});

console.log("¡Reparación PROFUNDA de variables completada!");
