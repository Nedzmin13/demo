// server/src/controllers/comuniController.js

import prisma from '../config/prismaClient.js';

// @desc   Recupera un singolo comune e i suoi punti di interesse
// @route  GET /api/comuni/:slug
// @access Public
const getComuneBySlug = async (req, res) => {
    try {
        const comuneSlug = req.params.slug;

        const comune = await prisma.comune.findUnique({
            where: {
                slug: comuneSlug,
            },
            include: {
                province: {
                    include: {
                        region: true
                    }
                },
                pointofinterest: {
                    orderBy: {
                        name: 'asc'
                    }
                    // 'images' non va qui, perché appartiene al comune, non ai POI
                },
                // --- CORREZIONE QUI ---
                // 'images' va a questo livello, come fratello di 'province' e 'pointofinterest'
                images: true
            }
        });

        if (!comune) {
            return res.status(404).json({ message: 'Comune non trovato' });
        }

        res.status(200).json(comune);
    } catch (error) {
        console.error(`Errore nel recuperare il comune ${req.params.slug}:`, error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const getAllComuniForAdmin = async (req, res) => {
    try {
        // Prendiamo i parametri dalla query string.
        // Se non vengono forniti, usiamo dei valori di default.
        const { search = '', page = 1, limit = 25 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum; // Calcola quanti record saltare

        const whereClause = {
            OR: [
                { name: { contains: search } },
                { province: { name: { contains: search } } },
                { province: { sigla: { contains: search } } },
            ],
        };

        // Eseguiamo due query in parallelo: una per i dati della pagina, una per il conteggio totale
        const [comuni, totalComuni] = await prisma.$transaction([
            prisma.comune.findMany({
                where: whereClause,
                skip: skip,
                take: limitNum, // Prendi solo 'limit' record
                include: {
                    province: {
                        select: { name: true, sigla: true }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            prisma.comune.count({ where: whereClause })
        ]);

        res.status(200).json({
            data: comuni,
            pagination: {
                total: totalComuni,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalComuni / limitNum)
            }
        });
    } catch (error) {
        console.error("Errore nel recuperare i comuni per l'admin:", error);
        res.status(500).json({ message: "Errore del server." });
    }
};

const getComuneByIdForAdmin = async (req, res) => {
    try {
        const comuneId = parseInt(req.params.id);
        const comune = await prisma.comune.findUnique({
            where: {
                id: comuneId,
            },
            include: {
                pointofinterest: { // Nome corretto dal nostro schema
                    orderBy: { name: 'asc' }
                }
            }
        });

        if (!comune) {
            return res.status(404).json({ message: "Comune non trovato" });
        }

        res.status(200).json(comune);
    } catch (error) {
        console.error(`Errore nel recuperare il comune con ID ${req.params.id}:`, error);
        res.status(500).json({ message: "Errore del server." });
    }
};

const updateComune = async (req, res) => {
    const id = parseInt(req.params.id);
    const { description } = req.body;
    try {
        const comune = await prisma.comune.update({
            where: { id },
            data: { description }
        });
        res.json(comune);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

const addComuneImages = async (req, res) => {
    const id = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nessun file fornito.' });
    }
    try {
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_comuni" });
            await prisma.comuneImage.create({
                data: { url: result.secure_url, comuneId: id }
            });
        }
        res.status(201).json({ message: "Immagini aggiunte" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

const deleteComuneImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.comuneImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: "Immagine eliminata" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export {
    getComuneBySlug, getAllComuniForAdmin, getComuneByIdForAdmin,
    updateComune, addComuneImages, deleteComuneImage
};