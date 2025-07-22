// client/src/pages/attractions/AttractionRegionsPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import RegionsListPage from '../RegionsListPage'; // Riutilizziamo la pagina esistente

function AttractionRegionsPage() {
    return (
        <>
            <Helmet><title>Scegli una Regione - Cosa Vedere</title></Helmet>
            {/*
              Anche qui, per semplicità, riutilizziamo la pagina RegionsListPage.
              L'utente cliccherà su una regione e verrà portato a /viaggio/nome-regione,
              dove troverà i bottoni per continuare il flusso "Cosa Vedere".
            */}
            <RegionsListPage />
        </>
    );
}

export default AttractionRegionsPage;