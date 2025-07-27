import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// GET /api/news (Pubblico)
export const getAllNews = async (req, res) => {
    try {
        const news = await prisma.news.findMany({
            orderBy: { publishedAt: 'desc' },
            take: 10 // Limita a 10 notizie per la pagina pubblica
        });
        res.json(news);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// GET /api/news/admin (Admin)
export const getAllNewsForAdmin = async (req, res) => {
    try {
        const news = await prisma.news.findMany({ orderBy: { publishedAt: 'desc' } });
        res.json(news);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// POST /api/news/admin (Admin)
export const createNews = async (req, res) => {
    const { title, content, excerpt, category, location } = req.body;
    let imageUrl = '';
    try {
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_news" });
            imageUrl = result.secure_url;
        }
        const newArticle = await prisma.news.create({
            data: { title, content, excerpt, category, location, imageUrl, publishedAt: new Date() }
        });
        res.status(201).json(newArticle);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// PUT /api/news/admin/:id (Admin)
export const updateNews = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, content, excerpt, category, location, existingImageUrl } = req.body;
    let imageUrl = existingImageUrl;
    try {
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_news" });
            imageUrl = result.secure_url;
        }
        const updatedArticle = await prisma.news.update({
            where: { id },
            data: { title, content, excerpt, category, location, imageUrl }
        });
        res.json(updatedArticle);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// DELETE /api/news/admin/:id (Admin)
export const deleteNews = async (req, res) => {
    try {
        await prisma.news.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Notizia eliminata" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const getNewsById = async (req, res) => {
    try {
        const news = await prisma.news.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!news) return res.status(404).json({ message: "Notizia non trovata" });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: "Errore del server" });
    }
};