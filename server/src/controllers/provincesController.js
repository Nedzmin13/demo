import prisma from '../config/prismaClient.js';

// --- Funzioni Pubbliche ---

const getProvinceBySigla = async (req, res) => {
    try {
        const provinceSigla = req.params.sigla.toUpperCase();

        const province = await prisma.province.findUnique({
            where: { sigla: provinceSigla },
            include: { comune: { orderBy: { name: 'asc' } } }
        });

        if (!province) {
            return res.status(404).json({ message: 'Provincia non trovata' });
        }
        res.status(200).json(province);
    } catch (error) {
        console.error(`Errore nel recuperare la provincia ${req.params.sigla}:`, error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};


// --- Funzioni Admin ---

const getAllProvincesForAdmin = async (req, res) => {
    const { page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const [provinces, total] = await prisma.$transaction([
            prisma.province.findMany({
                skip: skip,
                take: parseInt(limit),
                orderBy: { name: 'asc' }
            }),
            prisma.province.count()
        ]);
        res.json({ data: provinces, total });
    } catch (error) {
        console.error("Errore nel recuperare le province:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const updateProvince = async (req, res) => {
    const { name, sigla, population, description, toSee } = req.body;
    try {
        const province = await prisma.province.update({
            where: { id: parseInt(req.params.id) },
            data: { name, sigla, population, description, toSee }
        });
        res.json(province);
    } catch (e) {
        console.error("Errore nell'aggiornare la provincia:", e);
        res.status(500).json({ message: "Errore durante l'aggiornamento." });
    }
};


// --- UNICO BLOCCO DI EXPORT ---
export {
    getProvinceBySigla,
    getAllProvincesForAdmin,
    updateProvince
};