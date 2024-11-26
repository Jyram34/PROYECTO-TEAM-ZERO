<?php

function enviarWebhook($tipo, $mensaje) {
    // URL de destino para la solicitud
    $url = "http://localhost:3000/api/webhook/event";
    
    // Datos que se enviarán en el cuerpo de la solicitud (formato JSON)
    $data = array(
        "tipo" => $tipo,
        "mensaje" => $mensaje
    );
    
    // Inicializa cURL
    $ch = curl_init($url);
    
    // Configura las opciones de cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Para obtener la respuesta
    curl_setopt($ch, CURLOPT_POST, true);            // Especifica que es una solicitud POST
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data)); // Convierte el array a JSON
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',  // Indicamos que el cuerpo de la solicitud es JSON
    ));
    
    // Ejecuta la solicitud cURL y obtiene la respuesta
    $response = curl_exec($ch);
    
    // Verifica si hubo algún error en la solicitud cURL
    if(curl_errno($ch)) {
        echo 'Error en la solicitud cURL: ' . curl_error($ch);
    } else {
        // Decodifica la respuesta JSON
        $result = json_decode($response, true);
        // Muestra la respuesta del servidor
        print_r($result);
    }
    
    // Cierra la conexión cURL
    curl_close($ch);
}
