import prisma from '../config/prismaClient.js';

// @desc   Ricerca globale in più modelli
// @route  GET /api/search?q=termine
// @access Public
const globalSearch = async (req, res) => {
    const { q } = req.query;

    // Restituisce un array vuoto se la ricerca è troppo corta
    if (!q || q.length < 3) {
        return res.json({ comuni: [], offers: [], itineraries: [] });
    }

    try {
        const [comuni, offers, itineraries] = await prisma.$transaction([
            prisma.comune.findMany({
                // --- CORREZIONE QUI: RIMOSSO mode: 'insensitive' ---
                where: { name: { contains: q } },
                take: 5,
                include: { province: true }
            }),
            prisma.offer.findMany({
                // --- CORREZIONE QUI: RIMOSSO mode: 'insensitive' ---
                where: { title: { contains: q } },
                take: 5
            }),
            prisma.itinerary.findMany({
                // --- CORREZIONE QUI: RIMOSSO mode: 'insensitive' ---
                where: { title: { contains: q } },
                take: 5
            })
        ]);

        res.json({ comuni, offers, itineraries });
    } catch (error) {
        console.error("Errore ricerca globale:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

export { globalSearch };