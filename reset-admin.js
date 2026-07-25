const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function resetAdmin() {
  try {
    const db = await open({
      filename: './global_registry.db',
      driver: sqlite3.Database
    });

    const correo = 'admin@sarriatech.com';
    const nuevaClave = 'Admin123';

    await db.run(`UPDATE usuarios_clientes SET contrasena = ? WHERE correo = ?`, [nuevaClave, correo]);
    
    console.log(`\n✅ La contraseña para el Super Admin (${correo}) ha sido restablecida exitosamente a: ${nuevaClave}\n`);
    
    await db.close();
  } catch (error) {
    console.error('Error restableciendo la contraseña:', error);
  }
}

resetAdmin();
