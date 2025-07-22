// client/src/components/NewsPreviewCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function NewsPreviewCard({ imageUrl, title }) {
    // Immagine placeholder se l'URL non è fornito
    const displayImage = imageUrl || 'https://via.placeholder.com/400x250/e2e8f0/94a3b8?text=Notizia';

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
        >
            <Link to="#"> {/* Il link punterà all'articolo completo */}
                <img src={displayImage} alt={title} className="w-full h-40 object-cover" />
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 hover:text-sky-600 transition-colors">
                        {title}
                    </h3>
                </div>
            </Link>
        </motion.div>
    );
}

export default NewsPreviewCard;