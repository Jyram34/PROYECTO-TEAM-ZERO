import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, 'eventLogs.txt'); // Ruta del archivo de log

export function logEvent(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // Escribe el mensaje en un archivo de log
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error al escribir en el archivo de log:', err);
        }
    });

    console.log(logMessage); // También imprime el mensaje en la consola
}
