const fs = require('fs');
let content = fs.readFileSync('./src/components/configuraciones/Configuraciones.jsx', 'utf8');
const lines = content.split('\n');
for(let i=485; i<510; i++) {
  console.log((i+1) + ': ' + lines[i]);
}
