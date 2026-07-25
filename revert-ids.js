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
if (fs.existsSync('./prisma/schema.prisma')) files.push('./prisma/schema.prisma');
if (fs.existsSync('./server.js')) files.push('./server.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Fix the syntax errors created by regex replacing `id` with `.codigo`
  content = content.replace(/([^\w])\.codigo([^\w])/g, (match, p1, p2) => {
    return `${p1}id${p2}`;
  });

  // 2. Undo duplicate `codigo: '...', codigo:` in objects (like in AgroContext initialData)
  // We'll replace the first `codigo:` in a sequence with `id:` if there's another `codigo:` nearby.
  content = content.replace(/codigo(\s*:\s*['"][^'"]+['"]\s*,\s*)codigo(\s*:)/g, 'id$1codigo$2');

  // 3. Revert exact patterns from fix-ids.js
  content = content.replace(/\(codigo\)\s*=>/g, '(id) =>');
  content = content.replace(/\(codigo,/g, '(id,');
  content = content.replace(/\bcodigo\s*===/g, 'id ===');
  content = content.replace(/\bcodigo\s*!==/g, 'id !==');
  content = content.replace(/\{\s*codigo\s*:/g, '{ id:');
  content = content.replace(/,\s*codigo\s*:/g, ', id:');
  content = content.replace(/\{\s*codigo\s*\}/g, '{ id }');
  content = content.replace(/\bconst\s+codigo\s*=/g, 'const id =');
  content = content.replace(/\blet\s+codigo\s*=/g, 'let id =');
  
  // 4. Revert property access .codigo -> .id
  // This is risky if they were originally .codigo, but since the user requested 
  // "Deja el ID como estaba en todos los archivos", we revert all of it.
  content = content.replace(/\b([a-zA-Z_]\w*)\.codigo\b/g, '$1.id');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Revertido: ${file}`);
  }
});

console.log("¡Reversión completada! Por favor revisa si la app ya compila.");
