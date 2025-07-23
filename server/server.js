// server/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './src/config/prismaClient.js';

// Importa le nostre nuove rotte
import regionRoutes from './src/routes/regionRoutes.js';
import provinceRoutes from "./src/routes/provinceRoutes.js";
import comuneRoutes from "./src/routes/comuneRoutes.js";
import offerRoutes from "./src/routes/offerRoutes.js";
import poiRoutes from "./src/routes/poiRoutes.js";
import itineraryRoutes from "./src/routes/itineraryRoutes.js";
import destinationRoutes from "./src/routes/destinationRoutes.js";
import bonusRoutes from "./src/routes/bonusRoutes.js";
import utilityRoutes from "./src/routes/utilityRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import newsRoutes from "./src/routes/newsRoutes.js";
import strikeRoutes from "./src/routes/strikeRoutes.js";
import trafficRoutes from "./src/routes/trafficRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Rotte API ---
// "Monta" le rotte delle regioni sul percorso /api/regions
app.use('/api/regions', regionRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/comuni', comuneRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/pois', poiRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/strikes', strikeRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/search', searchRoutes);

app.use(express.json()); // Per leggere il JSON nel body
app.use(express.urlencoded({ extended: true })); // Per leggere i dati da form HTML (utile in generale)


// --- Rotte di base e test (possiamo tenerle per ora) ---
app.get('/api/test-db', async (req, res) => {
    try {
        const regionCount = await prisma.region.count();
        res.json({
            message: 'Connessione al database riuscita!',
            numeroDiRegioniTrovate: regionCount
        });
    } catch (error) {
        console.error("Errore di connessione al DB:", error);
        res.status(500).json({ message: 'Errore durante la connessione al database.' });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Benvenuto nell\'API di FastInfo!' });
});


app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});