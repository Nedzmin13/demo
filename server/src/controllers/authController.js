// server/src/controllers/authController.js
import prisma from '../config/prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc   Autentica un admin e restituisce il token
// @route  POST /api/auth/login
// @access Public
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Per favore, inserisci email e password.' });
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });

        if (admin && (await bcrypt.compare(password, admin.password))) {
            // Utente trovato e password corretta
            const token = jwt.sign(
                { id: admin.id, email: admin.email }, // Payload del token
                process.env.JWT_SECRET, // Chiave segreta dal .env
                { expiresIn: '8h' } // Scadenza del token
            );

            res.status(200).json({
                id: admin.id,
                email: admin.email,
                token: token,
            });
        } else {
            // Credenziali non valide
            res.status(401).json({ message: 'Credenziali non valide.' });
        }
    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

export { loginAdmin };