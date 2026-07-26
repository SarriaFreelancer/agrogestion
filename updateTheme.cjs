const fs = require('fs');
let content = fs.readFileSync('./src/context/AgroContext.jsx', 'utf8');

// Rename 'Azul Pizarra' to 'Tema Principal'
content = content.replace(/'Azul Pizarra'/g, "'Tema Principal'");

// Replace the fallback 'Verde Agro' with 'Tema Principal'
content = content.replace(/\|\| 'Verde Agro'/g, "|| 'Tema Principal'");
content = content.replace(/theme: 'Verde Agro'/g, "theme: 'Tema Principal'");
content = content.replace(/THEME_CONFIG\['Verde Agro'\]/g, "THEME_CONFIG['Tema Principal']");

fs.writeFileSync('./src/context/AgroContext.jsx', content, 'utf8');
console.log('AgroContext updated');
