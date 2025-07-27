import prisma from '../config/prismaClient.js';

export const globalSearch = async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 3) {
        return res.json({
            comuni: [],
            offers: [],
            itineraries: [],
            guides: [],          // Aggiunto array vuoto
            howToArticles: []    // Aggiunto array vuoto
        });
    }

    try {
        const [comuni, offers, itineraries, guides, howToArticles] = await prisma.$transaction([
            // La tua ricerca esistente e funzionante
            prisma.comune.findMany({
                where: { name: { contains: q } },
                take: 5,
                include: { province: true }
            }),
            prisma.offer.findMany({
                where: { title: { contains: q } },
                take: 5
            }),
            prisma.itinerary.findMany({
                where: { title: { contains: q } },
                take: 5
            }),

            // --- INIZIO NUOVA LOGICA ---
            prisma.Guide.findMany({
                where: { title: { contains: q } }, // Cerca solo nel titolo
                take: 5
            }),
            prisma.HowToArticle.findMany({
                where: { title: { contains: q } }, // Cerca solo nel titolo
                take: 5
            })
            // --- FINE NUOVA LOGICA ---
        ]);

        res.json({ comuni, offers, itineraries, guides, howToArticles });

    } catch (error) {
        console.error("Errore nella ricerca globale:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};