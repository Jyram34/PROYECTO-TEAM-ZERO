import express from 'express';
import bodyParser from 'body-parser';
import { PORT } from './config/serverConfig.js';
import eventsRouter from './routes/eventsRoutes.js';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('client')); // Sirve archivos desde la carpeta cliente

// Ruta WEBHOOK
app.use('/api', eventsRouter);

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
