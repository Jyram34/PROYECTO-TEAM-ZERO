const soap = require('soap');
const util = require('util');

async function testListarOrdenes() {
    const wsdlUrl = 'http://localhost:50171/WSLogistica.svc?singleWsdl';

    try {
        // Crear cliente SOAP
        const client = await util.promisify(soap.createClient)(wsdlUrl);

        // Promisificar el método para usarlo como una función asíncrona
        const listarOrdenesAsync = util.promisify(client.ListarOrdenes.bind(client));

        // Llamar al método SOAP
        const result = await listarOrdenesAsync();
        
        console.log('Resultado de listarOrdenes:', result);
    } catch (error) {
        console.error('Error al probar listarOrdenes:', error);
    }
}

// Llamar a la función de prueba
testListarOrdenes();
