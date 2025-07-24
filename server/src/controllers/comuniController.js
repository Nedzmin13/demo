import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// Funzione di utilità per l'upload su Cloudinary
const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_comuni" });
};


// =======================================================
// ---                ROTTE PUBBLICHE                  ---
// =======================================================

const getComuneBySlug = async (req, res) => {
    try {
        const comune = await prisma.comune.findUnique({
            where: { slug: req.params.slug },
            include: {
                province: true,
                images: true,
                pointofinterest: {
                    orderBy: { name: 'asc' }
                }
            }
        });
        if (!comune) {
            return res.status(404).json({ message: "Comune non trovato" });
        }
        res.status(200).json(comune);
    } catch (error) {
        console.error("Errore nel recuperare il comune:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};


// =======================================================
// ---                 ROTTE ADMIN                     ---
// =======================================================

const getAllComuniForAdmin = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 25 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const whereClause = {
            OR: [
                { name: { contains: search } },
                { province: { name: { contains: search } } },
                { province: { sigla: { contains: search } } },
            ],
        };

        const [comuni, totalComuni] = await prisma.$transaction([
            prisma.comune.findMany({
                where: whereClause,
                skip: skip,
                take: limitNum,
                include: {
                    province: { select: { name: true, sigla: true } }
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
        const comune = await prisma.comune.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                province: true,
                images: true,
                pointofinterest: { orderBy: { name: 'asc' } }
            }
        });
        if (!comune) {
            return res.status(404).json({ message: "Comune non trovato" });
        }
        res.status(200).json(comune);
    } catch (error) {
        console.error(`Errore nel recuperare il comune con ID ${req.params.id}:`, error);
        res.status(500).json({ message: "Errore del server" });
    }
};

const updateComune = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    try {
        const updatedComune = await prisma.$transaction(async (tx) => {
            await tx.comune.update({
                where: { id },
                data: { name, description }
            });

            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.comuneImage.createMany({
                    data: uploadResults.map(result => ({
                        url: result.secure_url,
                        comuneId: id
                    }))
                });
            }

            return tx.comune.findUnique({
                where: { id },
                include: { images: true, province: true, pointofinterest: true }
            });
        });

        res.status(200).json(updatedComune);
    } catch (error) {
        console.error("Errore aggiornamento comune:", error);
        res.status(500).json({ message: "Errore durante l'aggiornamento del comune." });
    }
};

const deleteComuneImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        const image = await prisma.comuneImage.findUnique({ where: { id: imageId } });
        if (!image) {
            return res.status(404).json({ message: "Immagine non trovata" });
        }
        await prisma.comuneImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: "Immagine eliminata con successo" });
    } catch (error) {
        console.error(`Errore nell'eliminare l'immagine con ID ${imageId}:`, error);
        res.status(500).json({ message: "Errore del server durante l'eliminazione dell'immagine." });
    }
};

// --- BLOCCO EXPORT CORRETTO ---
export {
    getComuneBySlug, // <-- AGGIUNTO L'EXPORT MANCANTE
    getAllComuniForAdmin,
    getComuneByIdForAdmin,
    updateComune,
    deleteComuneImage
};