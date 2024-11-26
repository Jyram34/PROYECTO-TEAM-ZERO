// Conexión SSE
const eventSource = new EventSource('/api/events/stream');

// Escucha los mensajes del servidor
eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Evento recibido:", data);

    // Muestra la notificación en la interfaz
    displayNotification(data);
};

// Función para mostrar notificaciones en la interfaz
function displayNotification(data) {
    const notificationBar = document.getElementById('barra-notificaciones');
    const newNotification = document.createElement('div');
    newNotification.innerHTML = `<p><span>Tipo:</span> ${data.tipo} <br/></p>
                                <p><span>Mensaje:</span> ${data.mensaje}</p>`;
	newNotification.classList.add('data-event');
    notificationBar.appendChild(newNotification);
}
