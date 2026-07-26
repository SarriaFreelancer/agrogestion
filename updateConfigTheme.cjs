const fs = require('fs');
let content = fs.readFileSync('./src/components/configuraciones/Configuraciones.jsx', 'utf8');

content = content.replace(/'Azul Pizarra'/g, "'Tema Principal'");
content = content.replace(/label: 'Azul Pizarra'/g, "label: 'Tema Principal'");

fs.writeFileSync('./src/components/configuraciones/Configuraciones.jsx', content, 'utf8');
console.log('Renamed Tema Principal in Configuraciones');
