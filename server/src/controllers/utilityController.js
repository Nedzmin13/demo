import prisma from '../config/prismaClient.js';

export const getUtilityInfo = async (req, res) => {
    try {
        // Aggiungiamo 'news' alla lista delle query parallele
        const [trafficAlerts, transportStrikes, emergencyNumbers, news] = await Promise.all([
            prisma.trafficalert.findMany({
                orderBy: { createdAt: 'desc' },
                take: 4 // Prendiamo solo le ultime 4 allerte traffico
            }),
            prisma.transportstrike.findMany({
                orderBy: { date: 'asc' },
                take: 4 // Prendiamo solo i prossimi 4 scioperi
            }),
            prisma.emergencynumber.findMany({
                orderBy: { order: 'asc' }
            }),
            // --- NUOVA QUERY ---
            prisma.news.findMany({
                orderBy: { publishedAt: 'desc' },
                take: 6 // Prendiamo le ultime 6 notizie
            })
        ]);

        res.status(200).json({
            traffic: trafficAlerts,
            strikes: transportStrikes,
            emergency: emergencyNumbers,
            news: news // --- AGGIUNGIAMO LE NOTIZIE ALLA RISPOSTA ---
        });

    } catch (error) {
        console.error('Errore nel recuperare le notizie utili:', error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};