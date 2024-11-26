import { logEvent } from '../utils/logger.js';
import { sendMessage } from '../sse/serverSentEvents.js';

export const handleWebhookEvent = (req, res) => {
    const { tipo, mensaje } = req.body;

    // Registra el evento
    logEvent(`Evento recibido: Tipo: ${tipo}, Mensaje: ${mensaje}`);

    // Envía el evento al la aplicacion web
    sendMessage({ tipo, mensaje });

    res.status(200).send('Evento procesado exitosamente');
};
