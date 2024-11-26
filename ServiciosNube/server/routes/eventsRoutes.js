import express from 'express';
import { handleWebhookEvent } from '../controllers/eventController.js';
import { setClient } from '../sse/serverSentEvents.js';

const router = express.Router();

// Ruta del webhook para recibir eventos
router.post('/webhook/event', handleWebhookEvent);

// Ruta SSE para la conexión del cliente web
router.get('/events/stream', (req, res) => {
    setClient(req, res);
});

export default router;
