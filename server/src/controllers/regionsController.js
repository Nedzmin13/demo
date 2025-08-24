import prisma from '../config/prismaClient.js';

// --- Funzioni Pubbliche ---

const getAllRegions = async (req, res) => {
    try {
        const regions = await prisma.region.findMany({
            orderBy: { name: 'asc' },
            include: {
                // Includiamo solo l'ID delle province, ci serve per il conteggio
                province: {
                    select: { id: true }
                }
            }
        });
        res.status(200).json(regions);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server.' });
    }
};
const getRegionByName = async (req, res) => {
    try {
        const regionNameFromUrl = req.params.name;
        if (!regionNameFromUrl || typeof regionNameFromUrl !== 'string' || regionNameFromUrl.length === 0) {
            return res.status(400).json({ message: 'Nome regione non valido.' });
        }
        const capitalizedRegionName = regionNameFromUrl.charAt(0).toUpperCase() + regionNameFromUrl.slice(1).toLowerCase();

        const region = await prisma.region.findFirst({
            where: { name: { equals: capitalizedRegionName } },
            include: { province: { orderBy: { name: 'asc' } } }
        });

        if (!region) {
            return res.status(404).json({ message: 'Regione non trovata' });
        }
        res.status(200).json(region);
    } catch (error) {
        res.status(500).json({ message: 'Errore del server.' });
    }
};


// --- Funzioni Admin ---

const getAllRegionsForAdmin = async (req, res) => {
    try {
        const regions = await prisma.region.findMany({ orderBy: { name: 'asc' } });
        res.json(regions);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

const updateRegion = async (req, res) => {
    const { name, description, imageUrl, population, attractions, main_cities } = req.body;
    try {
        const region = await prisma.region.update({
            where: { id: parseInt(req.params.id) },
            data: { name, description, imageUrl, population, attractions, main_cities }
        });
        res.json(region);
    } catch (error) {
        console.error("Errore aggiornamento regione:", error);
        res.status(500).json({ message: "Errore server" });
    }
};


// --- UNICO BLOCCO DI EXPORT ---
export {
    getAllRegions,
    getRegionByName,
    getAllRegionsForAdmin,
    updateRegion
};