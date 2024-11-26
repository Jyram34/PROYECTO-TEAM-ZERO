<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header('Content-Type: application/json');
    require 'vendor/autoload.php';
    require_once 'myFirebase.php';
    require 'weebhook.php';
    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Slim\Factory\AppFactory;
   


    $app = AppFactory::create();
    // $app->setBasePath("/buap/webservices/practicas/p08");
    $app->addRoutingMiddleware();
    $errorMiddleware = $app->addErrorMiddleware(true, true, true);

    $firebase = new MyFirebase('suministros-225a6-default-rtdb');
    

    $app->get('/', function($request, $response, $args){
        $response->write('Estas dentro del API de Porveedores');
        return $response;
    });

    $app->get('/Proveedor', function (Request $request, Response $response, array $args) {
        global $firebase;

        $resultado = $firebase->envios();
        if ($resultado) {
            $response->getBody()->write(json_encode($resultado));
            return $response->withHeader('Content-Type', 'application/json');
        } else {
            $response->getBody()->write(json_encode(['error' => 'No data found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
    });

    $app->post("/Proveedor", function(Request $request, Response $response, array $args) {
        global $firebase; // Accede a la instancia global de Firebase
    
        // Obtén los datos enviados en el cuerpo de la solicitud
        $parsedBody = $request->getParsedBody();
    
        // Valida que el cuerpo de la solicitud contenga datos
        if (!$parsedBody || empty($parsedBody)) {
            return $response->withJson(['error' => 'No se enviaron datos'], 400);
        }
    
        // Llama al método crearEntrega del objeto Firebase
        $firebaseResponse = $firebase->crearEntrega($parsedBody);
        
        // Verifica si hubo un error al enviar los datos
        if (!$firebaseResponse || isset($firebaseResponse['error'])) {
            return $response->withJson(['error' => $firebaseResponse['error'] ?? 'Error desconocido'], 500);
        }
        enviarWebhook("Exito","Se agrego un nuevo envio");
        // Devuelve la respuesta de Firebase
        return $response->withJson($firebaseResponse, 201);
    });
    
    $app->put("/Proveedor/{idEntrega}", function($request, $response, $args) {
        global $firebase;
    
        // Obtén el ID de la entrega desde la URL
        $idEntrega = $args['idEntrega'];
    
        // Obtén los datos enviados en el cuerpo de la solicitud
        $dataJSON = $request->getParsedBody();
    
        // Llama a la función actualizarEntrega de tu clase Firebase
        $result = $firebase->actualizarEntrega($idEntrega, $dataJSON);
    
        // Si hubo un error, devuelves un código de error con el mensaje
        if (isset($result['error'])) {
            return $response->withJson($result, 400); // Código de error 400 si hay un problema
        }
        enviarWebhook("Exito","Se actualizo la entrega " . $idEntrega);
        // Si la actualización fue exitosa, devuelves la respuesta con éxito
        return $response->withJson($result, 200); // Código 200 para éxito
    });

    $app->delete("/Proveedor/{idEntrega}", function($request, $response, $args) {
        global $firebase;
    
        // Obtén el ID de la entrega desde la URL
        $idEntrega = $args['idEntrega'];
    
        // Llama a la función eliminarEntrega de tu clase Firebase
        $result = $firebase->eliminarEntrega($idEntrega);
    
        // Si hubo un error, devuelves un código de error con el mensaje
        if (isset($result['error'])) {
            return $response->withJson($result, 400); // Código de error 400 si hay un problema
        }
        enviarWebhook("Exito","Se elimino la entrega " . $idEntrega);
        // Si la eliminación fue exitosa, devuelves la respuesta con éxito
        return $response->withJson($result, 200); // Código 200 para éxito
    });
    

    $app->run();
?>