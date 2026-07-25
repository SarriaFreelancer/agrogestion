const fs = require('fs');
const path = require('path');

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
  const original = content;

  // 1. Quitar el id String @id en prisma
  content = content.replace(/id\s+String\s+@id\s+@default\(uuid\(\)\)\n/g, '');
  content = content.replace(/codigo\s+String\?/g, 'codigo String @id');
  content = content.replace(/codigo\s+String\n/g, 'codigo String @id\n');

  // 2. Reemplazos de Javascript
  // p.id -> p.codigo
  content = content.replace(/\b([a-zA-Z_]\w*)\.id\b/g, '$1.codigo');
  
  // { id: -> { codigo:
  content = content.replace(/\{\s*id\s*:/g, '{ codigo:');
  content = content.replace(/,\s*id\s*:/g, ', codigo:');
  
  // Parametros de funcion (id) -> (codigo)
  content = content.replace(/\(id\)\s*=>/g, '(codigo) =>');
  content = content.replace(/\(id,/g, '(codigo,');
  
  // Comparaciones
  content = content.replace(/\bid\s*===/g, 'codigo ===');
  content = content.replace(/\bid\s*!==/g, 'codigo !==');
  
  // Asignaciones
  content = content.replace(/\bconst\s+id\s*=/g, 'const codigo =');
  content = content.replace(/\blet\s+id\s*=/g, 'let codigo =');
  
  // Destructuracion { id } -> { codigo }
  content = content.replace(/\{\s*id\s*\}/g, '{ codigo }');
  
  // { id: id } -> { codigo: codigo }
  content = content.replace(/\bid\s*:\s*id\b/g, 'codigo: codigo');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Modificado: ${file}`);
  }
});

console.log("¡Reemplazo masivo de 'id' a 'codigo' completado!");
