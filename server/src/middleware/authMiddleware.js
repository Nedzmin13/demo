// server/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';

const protect = async (req, res, next) => {
    let token;

    // Il token viene inviato nell'header 'Authorization' come "Bearer TOKEN"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Estrai il token
            token = req.headers.authorization.split(' ')[1];

            // Verifica il token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Trova l'utente admin dal DB usando l'ID nel token
            // e attaccalo all'oggetto 'req' per usarlo nelle rotte successive
            req.admin = await prisma.admin.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true } // Non includere la password
            });

            if (!req.admin) {
                return res.status(401).json({ message: 'Utente non trovato.' });
            }

            next(); // Passa al prossimo middleware o alla rotta
        } catch (error) {
            console.error('Errore di autenticazione:', error);
            res.status(401).json({ message: 'Token non valido o scaduto.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Accesso negato, nessun token fornito.' });
    }
};

export { protect };