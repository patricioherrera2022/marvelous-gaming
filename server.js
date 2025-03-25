const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configura Mercado Pago con la nueva sintaxis
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-3065767199282482-090311-b0fe2e924130f14ced6f6441f9114bc2-406725304'
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para crear preferencia
app.post('/create_preference', async (req, res) => {
    try {
        const { items } = req.body;
        
        const preference = {
            items: items,
            back_urls: {
                success: "http://localhost:3001/success",
                failure: "http://localhost:3001/failure",
                pending: "http://localhost:3001/pending"
            },
            auto_return: "approved"
        };

        const preferenceClient = new Preference(client);
        const result = await preferenceClient.create(preference);
        
        res.json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la preferencia');
    }
});

// Rutas para manejar el retorno de Mercado Pago
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

app.get('/failure', (req, res) => {
    res.sendFile(path.join(__dirname, 'failure.html'));
});

app.get('/pending', (req, res) => {
    res.sendFile(path.join(__dirname, 'pending.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});