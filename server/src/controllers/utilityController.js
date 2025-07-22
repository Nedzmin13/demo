// server/src/controllers/utilityController.js
import prisma from '../config/prismaClient.js';

export const getUtilityInfo = async (req, res) => {
    try {
        // Usiamo Promise.all per eseguire le query in parallelo
        const [trafficAlerts, transportStrikes, emergencyNumbers] = await Promise.all([
            // NOME MODELLO CORRETTO (probabilmente tutto minuscolo)
            prisma.trafficalert.findMany({
                orderBy: { createdAt: 'desc' }
            }),
            // NOME MODELLO CORRETTO
            prisma.transportstrike.findMany({
                orderBy: { date: 'asc' }
            }),
            // NOME MODELLO CORRETTO
            prisma.emergencynumber.findMany({
                orderBy: { order: 'asc' }
            })
        ]);

        res.status(200).json({
            traffic: trafficAlerts,
            strikes: transportStrikes,
            emergency: emergencyNumbers
        });

    } catch (error) {
        console.error('Errore nel recuperare le notizie utili:', error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};