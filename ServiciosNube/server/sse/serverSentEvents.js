let client = null; // Variable para guardar la única conexión SSE

// Agrega el cliente (tu aplicación web) a la conexión SSE
export function setClient(req, res) {
    // Configura el encabezado para Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Envia headers inmediatos para iniciar la conexión SSE

    client = res; // Guarda la conexión SSE en la variable client

    // Remueve la conexión cuando el cliente se desconecte
    req.on('close', () => {
        client = null;
    });
}

// Envía un mensaje al cliente conectado
export function sendMessage(data) {
    if (client) {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
}
