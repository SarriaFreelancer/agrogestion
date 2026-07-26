import app from './src/backend/app.js';

const START_PORT = 3000;
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`El puerto ${port} está ocupado, intentando con el ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(START_PORT);
