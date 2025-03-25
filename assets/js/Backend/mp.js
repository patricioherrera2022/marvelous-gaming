// filepath: c:\Users\Pato\OneDrive\Desktop\DESARROLLO\gaming\marvelous gaming\server.js
const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');

const app = express();

// Configuración de CORS y JSON
app.use(cors());
app.use(express.json());

// Configura tu Access Token de Mercado Pago
mercadopago.configure({
    access_token: 'APP_USR-3065767199282482-090311-b0fe2e924130f14ced6f6441f9114bc2-406725304'
});

// Endpoint para crear preferencia de pago
app.post('/create_preference', (req, res) => {
    const { items } = req.body;

    const preference = {
        items: items,
        back_urls: {
            success: "http://localhost:3000/success",
            failure: "http://localhost:3000/failure",
            pending: "http://localhost:3000/pending"
        },
        auto_return: "approved"
    };

    mercadopago.preferences.create(preference)
        .then(response => res.json({ id: response.body.id }))
        .catch(error => {
            console.error(error);
            res.status(500).send('Error al crear la preferencia');
        });
});

// Inicia el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});