const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configura Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-4783138741128440-032613-e8fa0578f780e2f1489ad1ab7348769a-406725304' // Reemplaza con tu Access Token de Mercado Pago
});

app.post('/create_preference', async (req, res) => {
    try {
        const { items } = req.body;

        console.log("Items recibidos en el servidor:", items);

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Los items enviados no son válidos." });
        }

        const preference = {
            items: items.map(item => ({
                title: item.title || "Producto sin nombre",
                unit_price: parseFloat(item.unit_price) || 0,
                quantity: parseInt(item.quantity, 10) || 1
            })),
            back_urls: {
                success: "http://localhost:3001/success",
                failure: "http://localhost:3001/failure",
                pending: "http://localhost:3001/pending"
            },
            auto_return: "approved"
        };

        const preferenceClient = new Preference(client);
        const result = await preferenceClient.create(preference);

        console.log("Preferencia creada:", result.body);
        res.json({ id: result.body.id });
    } catch (error) {
        console.error("Error al crear la preferencia:", error); // Muestra el error completo
        res.status(500).json({ error: "Error al crear la preferencia", details: error.message });
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


// const express = require('express');
// const { MercadoPagoConfig, Preference } = require('mercadopago');
// const cors = require('cors');
// const path = require('path');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname)));

// // Configura Mercado Pago con la nueva sintaxis
// const client = new MercadoPagoConfig({
//     accessToken: 'APP_USR-3065767199282482-090311-b0fe2e924130f14ced6f6441f9114bc2-406725304'
// });

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });


// app.post('/create_preference', async (req, res) => {
//     try {
//         const { items } = req.body;
        
//         const preference = {
//             items: items,
//             back_urls: {
//                 success: "http://localhost:3001/success",
//                 failure: "http://localhost:3001/failure",
//                 pending: "http://localhost:3001/pending"
//             },
//             auto_return: "approved"
//         };

//         const preferenceClient = new Preference(client);
//         const result = await preferenceClient.create(preference);
        
//         res.json({ id: result.id });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error al crear la preferencia');
//     }
// });


// app.get('/success', (req, res) => {
//     res.sendFile(path.join(__dirname, 'success.html'));
// });

// app.get('/failure', (req, res) => {
//     res.sendFile(path.join(__dirname, 'failure.html'));
// });

// app.get('/pending', (req, res) => {
//     res.sendFile(path.join(__dirname, 'pending.html'));
// });

// const PORT = 3001;
// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });