// client/src/pages/services/ServiceRegionsPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import RegionsListPage from '../RegionsListPage'; // Riutilizziamo la logica e la UI

function ServiceRegionsPage() {
    return (
        <>
            <Helmet><title>Scegli una Regione - Servizi Essenziali</title></Helmet>
            {/*
              Per ora riutilizziamo l'intera pagina, anche se i link puntano
              al flusso di navigazione standard. In un refactor futuro, potremmo
              passare un prop a RegionsListPage per cambiare i link.
              Per ora, questo ci permette di andare avanti velocemente.
            */}
            <RegionsListPage />
        </>
    );
}

export default ServiceRegionsPage;