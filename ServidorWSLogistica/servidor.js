const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*', // Permitir todas las solicitudes
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
}));

app.use(bodyParser.json());

const WSDL_URL = 'http://localhost:50171/WSLogistica.svc?singleWsdl';

app.post('/api/logistica/crearOrden', (req, res) => {
    soap.createClient(WSDL_URL, (err, client) => {
        if (err) return res.status(500).send(err);
        const args = { productos: req.body.productos, detalles: req.body.detalles };
        client.CrearOrden(args, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

app.put('/api/logistica/actualizarEstadoOrden', (req, res) => {
    soap.createClient(WSDL_URL, (err, client) => {
        if (err) return res.status(500).send(err);
        const args = { id: req.body.id, estado: req.body.estado };
        client.EstadoOrden(args, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

app.put('/api/logistica/actualizarOrden', (req, res) => {
    soap.createClient(WSDL_URL, (err, client) => {
        if (err) return res.status(500).send(err);
        const args = { id: req.body.id, detalles: req.body.detalles };
        client.ActualizarOrden(args, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

app.delete('/api/logistica/eliminarOrden/:id', (req, res) => {
    soap.createClient(WSDL_URL, (err, client) => {
        if (err) return res.status(500).send(err);
        const args = { id: req.params.id }; // Obtén el id desde la URL
        client.EliminarOrden(args, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

app.get('/api/logistica/obtenerOrden/:id', (req, res) => {
    soap.createClient(WSDL_URL, (err, client) => {
        if (err) return res.status(500).send(err);
        const args = { id: req.params.id };
        client.verOrden(args, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

app.get('/api/logistica/listarOrdenes', (req, res) => {
    soap.createClient(WSDL_URL, (err, client) => {
        if (err) return res.status(500).send(err);
        client.ListarOrdenes({}, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

// Servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
