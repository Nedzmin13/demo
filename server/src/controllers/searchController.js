import prisma from '../config/prismaClient.js';

export const globalSearch = async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json({ comuni: [], offers: [], itineraries: [], guides: [], howToArticles: [] });
    }

    try {
        const lowerQ = q.toLowerCase();

        const [comuni, offers, itineraries, guides, howToArticles] = await Promise.all([
            prisma.comune.findMany({ where: { name: { contains: q } }, take: 20, include: { province: true } }),
            prisma.offer.findMany({ where: { title: { contains: q } }, take: 5 }),
            prisma.itinerary.findMany({ where: { title: { contains: q } }, take: 5 }),
            prisma.Guide.findMany({ where: { title: { contains: q } }, take: 5 }),
            prisma.HowToArticle.findMany({ where: { title: { contains: q } }, take: 5 })
        ]);

        // Funzione di ordinamento che mette le corrispondenze esatte in cima
        const sortByExactMatch = (results, query) => {
            const exactMatches = [];
            const otherMatches = [];
            results.forEach(item => {
                if ((item.name || item.title).toLowerCase() === query.toLowerCase()) {
                    exactMatches.push(item);
                } else {
                    otherMatches.push(item);
                }
            });
            return [...exactMatches, ...otherMatches];
        };

        // Applica l'ordinamento a tutti i risultati
        const sortedComuni = sortByExactMatch(comuni, q).slice(0, 5);
        const sortedOffers = sortByExactMatch(offers, q);
        const sortedItineraries = sortByExactMatch(itineraries, q);
        const sortedGuides = sortByExactMatch(guides, q);
        const sortedHowToArticles = sortByExactMatch(howToArticles, q);

        res.json({
            comuni: sortedComuni,
            offers: sortedOffers,
            itineraries: sortedItineraries,
            guides: sortedGuides,
            howToArticles: sortedHowToArticles
        });

    } catch (error) {
        console.error("Errore nella ricerca globale:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};