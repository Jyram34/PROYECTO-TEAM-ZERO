<?php

class MyFirebase {
    private $project;

    public function __construct($project) {
        $this->project = $project;
    }
    
    // Ejecuta una llamada cURL a Firebase
    private function runCurl($url, $method, $data = null) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    
        // Si se proporcionan datos, los enviamos como JSON
        if ($data) {
            $jsonData = json_encode($data);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($jsonData)
            ]);
        } else {
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
        }
    
        $response = curl_exec($ch);
    
        // Manejo de errores
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            return ['error' => $error_msg];
        }
    
        curl_close($ch);
    
        // Decodificar la respuesta JSON
        return json_decode($response, true);
    }
    

    // Trae los datos de la coleccion Proveedor
    public function envios() {
        
        $url = "https://{$this->project}.firebaseio.com/Proveedor.json";
        $response = $this->runCurl($url, 'GET');
        return $response;
    }

    // Obtiene la contraseña de un usuario
    public function crearEntrega($dataJSON) {
        // Verifica si se han enviado datos
        if (empty($dataJSON)) {
            return ['error' => 'No data supplied.'];
        }
    
        // Obtiene la clave del primer nivel del array como el ID (Ej: 'ENT006')
        $customId = key($dataJSON);
    
        // Estructura el cuerpo de la solicitud con el ID personalizado como clave
        $dataWithCustomId = $dataJSON;
    
        // URL de la base de datos Firebase para la colección Productos
        $urlProductos = "https://{$this->project}.firebaseio.com/Productos/{$dataJSON[$customId]['producto']}.json";
        
        // Verifica si el producto existe en la colección Productos
        $responseProducto = $this->runCurl($urlProductos, 'GET');
    
        // Verifica que la respuesta del producto sea válida
        if ($responseProducto && isset($responseProducto['stock'])) {
            // Actualiza el stock del producto con la cantidad recibida
            $newStock = $responseProducto['stock'] + $dataJSON[$customId]['cantidad'];
    
            // Crea el cuerpo de la actualización
            $dataToUpdate = [
                'stock' => $newStock
            ];
    
            // URL de la base de datos Firebase para actualizar el producto
            $urlUpdateProducto = "https://{$this->project}.firebaseio.com/Productos/{$dataJSON[$customId]['producto']}.json";
    
            // Envia la actualización al endpoint de Firebase
            $responseUpdate = $this->runCurl($urlUpdateProducto, 'PATCH', $dataToUpdate);
    
            // Verifica si la actualización fue exitosa
            if (!isset($responseUpdate)) {
                return ['error' => 'Error al actualizar el stock del producto.'];
            }
    
            // Ahora, agregamos la entrega a la colección Proveedor
            $urlProveedor = "https://{$this->project}.firebaseio.com/Proveedor.json";
    
            // Envia los datos de la nueva entrega a Firebase
            $responseProveedor = $this->runCurl($urlProveedor, 'PATCH', $dataWithCustomId);
    
            // Verifica si la entrega fue registrada correctamente
            if (isset($responseProveedor) && !isset($responseProveedor['error'])) {
                return $responseProveedor; // Respuesta exitosa de Firebase
            } else {
                return ['error' => 'Error al agregar la entrega a Proveedor.'];
            }
        } else {
            // Si el producto no existe o no tiene stock, devuelve un error
            return ['error' => 'Producto no encontrado o no tiene un campo de stock válido.'];
        }
    }
    
    
    public function actualizarEntrega($idEntrega, $dataJSON) {
        // Verifica si se han enviado datos
        if (empty($dataJSON)) {
            return ['error' => 'No data supplied.'];
        }
    
        // URL de la base de datos Firebase para la colección de entregas
        $urlEntrega = "https://{$this->project}.firebaseio.com/Proveedor/{$idEntrega}.json";
    
        // Verifica si la entrega existe
        $responseEntrega = $this->runCurl($urlEntrega, 'GET');
    
        // Si la entrega existe, actualiza los datos de la entrega
        if ($responseEntrega) {
            // Obtiene la cantidad actual de la entrega
            $cantidadActual = isset($responseEntrega['cantidad']) ? $responseEntrega['cantidad'] : 0;
            // Obtiene la nueva cantidad que se quiere actualizar
            $nuevaCantidad = isset($dataJSON['cantidad']) ? $dataJSON['cantidad'] : 0;
    
            // Calcula la diferencia de cantidad
            $diferencia = $nuevaCantidad - $cantidadActual;
    
            // Si la diferencia es diferente a 0, actualiza el stock del producto
            if ($diferencia != 0) {
                // URL de la base de datos Firebase para la colección de productos
                $urlProducto = "https://{$this->project}.firebaseio.com/Productos/{$dataJSON['producto']}.json";
    
                // Verifica si el producto existe
                $responseProducto = $this->runCurl($urlProducto, 'GET');
    
                if ($responseProducto) {
                    // Actualiza el stock del producto con la diferencia
                    $nuevoStock = $responseProducto['stock'] + $diferencia;
    
                    // Crea el cuerpo de la actualización para el producto
                    $dataToUpdateProducto = ['stock' => $nuevoStock];
    
                    // Envia la actualización del stock del producto
                    $this->runCurl($urlProducto, 'PATCH', $dataToUpdateProducto);
                } else {
                    return ['error' => 'Producto no encontrado en la base de datos'];
                }
            }
    
            // Actualiza los datos de la entrega con la nueva cantidad
            $dataToUpdateEntrega = $dataJSON;
    
            // URL de la base de datos Firebase para actualizar la entrega
            $urlUpdateEntrega = "https://{$this->project}.firebaseio.com/Proveedor/{$idEntrega}.json";
    
            // Envia la actualización de la entrega
            $responseUpdate = $this->runCurl($urlUpdateEntrega, 'PATCH', $dataToUpdateEntrega);
    
            // Devuelve la respuesta o un error si no se pudo actualizar
            return isset($responseUpdate) ? $responseUpdate : ['error' => 'Error al actualizar la entrega'];
        } else {
            // Si la entrega no existe, devuelve un error
            return ['error' => 'Entrega no encontrada en la base de datos'];
        }
    }
    
    public function eliminarEntrega($idEntrega) {
        // URL de la base de datos Firebase para la colección de entregas
        $urlEntrega = "https://{$this->project}.firebaseio.com/Proveedor/{$idEntrega}.json";
    
        // Verifica si la entrega existe
        $responseEntrega = $this->runCurl($urlEntrega, 'GET');
    
        // Si la entrega existe, elimina los datos de la entrega
        if ($responseEntrega) {
            // Obtiene la cantidad de la entrega que se va a restar al stock del producto
            $cantidadEntrega = isset($responseEntrega['cantidad']) ? $responseEntrega['cantidad'] : 0;
            // Obtiene el ID del producto de la entrega
            $producto = isset($responseEntrega['producto']) ? $responseEntrega['producto'] : '';
    
            // Verifica si el producto existe en la base de datos
            if ($producto) {
                // URL de la base de datos Firebase para la colección de productos
                $urlProducto = "https://{$this->project}.firebaseio.com/Productos/{$producto}.json";
    
                // Obtiene los datos del producto
                $responseProducto = $this->runCurl($urlProducto, 'GET');
    
                if ($responseProducto) {
                    // Restamos la cantidad de la entrega al stock del producto
                    $nuevoStock = $responseProducto['stock'] - $cantidadEntrega;
    
                    // Crea el cuerpo de la actualización para el producto
                    $dataToUpdateProducto = ['stock' => $nuevoStock];
    
                    // Envia la actualización del stock del producto
                    $responseUpdateProducto = $this->runCurl($urlProducto, 'PATCH', $dataToUpdateProducto);
    
                    if (!$responseUpdateProducto) {
                        return ['error' => 'Error al actualizar el stock del producto'];
                    }
                } else {
                    return ['error' => 'Producto no encontrado en la base de datos'];
                }
            }
    
            // Elimina la entrega de la base de datos
            $responseDelete = $this->runCurl($urlEntrega, 'DELETE');
    
            // Verifica si la respuesta de DELETE es válida
            if ($responseDelete === null || $responseDelete === false) {
                // Si no hay respuesta o es false, lo interpretamos como éxito
                return ['success' => 'Entrega eliminada correctamente y stock actualizado.'];
            } else {
                // Si hay alguna respuesta inesperada, se muestra un error
                return ['error' => 'Error al eliminar la entrega'];
            }
        } else {
            // Si la entrega no existe, devuelve un error
            return ['error' => 'Entrega no encontrada en la base de datos'];
        }
    }
    
    
    
    
    
    

    

    

    

   

    

    // Función para enviar notificación al Webhook
    public function enviarNotificacionWebhook($data) {
    $webhookUrl = "http://localhost:3000/api/webhook/event";  // URL de tu Webhook
    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $response = curl_exec($ch);
    curl_close($ch);
}
}
