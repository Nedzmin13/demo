import axios from 'axios';
import useAuthStore from '../store/authStore';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
const PrivateAPI = axios.create({ baseURL: 'http://localhost:5000/api' });

PrivateAPI.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- API Pubbliche ---
export const fetchRegions = () => API.get('/regions');
export const fetchRegionByName = (name) => API.get(`/regions/${name}`);
export const fetchProvinceBySigla = (sigla) => API.get(`/provinces/${sigla}`);
export const fetchComuneBySlug = (slug) => API.get(`/comuni/${slug}`);
export const fetchOffers = (params) => API.get('/offers', { params });
export const fetchOfferById = (id) => API.get(`/offers/${id}`);
export const fetchFeaturedPoisByProvince = (provinceId, type) => API.get(`/pois/featured-by-province/${provinceId}`, { params: { type } });
export const fetchItineraries = () => API.get('/itineraries');
export const fetchItineraryById = (id) => API.get(`/itineraries/${id}`);
export const fetchDestinationsBySeason = (season) => API.get('/destinations', { params: { season } });
export const fetchDestinationById = (id) => API.get(`/destinations/${id}`);
export const fetchBonuses = (params) => API.get('/bonuses', { params });
export const fetchUtilityInfo = () => API.get('/utility/all');
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);
export const fetchNews = (params) => API.get('/news', { params });
export const globalSearch = (query) => API.get('/search', { params: { q: query } });
export const fetchPoiById = (id) => API.get(`/pois/${id}`);

// --- API Private (Admin) ---

// Comuni & POI
export const fetchAllComuniForAdmin = (params) => PrivateAPI.get('/comuni/admin', { params });
export const fetchComuneByIdForAdmin = (id) => PrivateAPI.get(`/comuni/admin/${id}`);
export const createPoi = (formData) => PrivateAPI.post('/pois', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchPoiDetails = (id) => PrivateAPI.get(`/pois/${id}/details`);
export const updatePoi = (id, formData) => PrivateAPI.put(`/pois/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});export const deletePoi = (id) => PrivateAPI.delete(`/pois/${id}`);
export const addImagesToPoi = (poiId, formData) => PrivateAPI.post(`/pois/${poiId}/images`, formData);
export const deleteImage = (imageId) => PrivateAPI.delete(`/pois/images/${imageId}`);
export const updateComune = (id, formData) => PrivateAPI.put(`/comuni/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteComuneImage = (imageId) => PrivateAPI.delete(`/comuni/admin/images/${imageId}`);

// Offerte
export const fetchOffersForAdmin = () => PrivateAPI.get('/offers/admin');
export const createOffer = (formData) => PrivateAPI.post('/offers/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateOffer = (id, data) => PrivateAPI.put(`/offers/admin/${id}`, data);
export const deleteOffer = (id) => PrivateAPI.delete(`/offers/admin/${id}`);
export const addOfferImages = (id, formData) => PrivateAPI.post(`/offers/admin/${id}/images`, formData);
export const deleteOfferImage = (imageId) => PrivateAPI.delete(`/offers/admin/images/${imageId}`);

// Bonus
export const fetchBonusesForAdmin = () => PrivateAPI.get('/bonuses');
export const createBonus = (data) => PrivateAPI.post('/bonuses/admin', data);
export const updateBonus = (id, data) => PrivateAPI.put(`/bonuses/admin/${id}`, data);
export const deleteBonus = (id) => PrivateAPI.delete(`/bonuses/admin/${id}`);

// Destinazioni
export const fetchDestinationsForAdmin = () => PrivateAPI.get('/destinations/admin');
export const createDestination = (formData) => PrivateAPI.post('/destinations/admin', formData);
export const updateDestination = (id, data) => PrivateAPI.put(`/destinations/admin/${id}`, data);
export const deleteDestination = (id) => PrivateAPI.delete(`/destinations/admin/${id}`);
export const addImagesToDestination = (id, formData) => PrivateAPI.post(`/destinations/admin/${id}/images`, formData);
export const deleteDestinationImage = (id) => PrivateAPI.delete(`/destinations/admin/images/${id}`);

// Itinerari
export const fetchItinerariesForAdmin = () => PrivateAPI.get('/itineraries/admin/all');
export const createItinerary = (data) => PrivateAPI.post('/itineraries/admin', data);
export const updateItinerary = (id, data) => PrivateAPI.put(`/itineraries/admin/${id}`, data);
export const deleteItinerary = (id) => PrivateAPI.delete(`/itineraries/admin/${id}`);
export const addItineraryImages = (id, formData) => PrivateAPI.post(`/itineraries/admin/${id}/images`, formData);
export const deleteItineraryImage = (imageId) => PrivateAPI.delete(`/itineraries/admin/images/${imageId}`);

// Notizie
export const fetchNewsForAdmin = () => PrivateAPI.get('/news/admin');
export const createNews = (formData) => PrivateAPI.post('/news/admin', formData);
export const updateNews = (id, formData) => PrivateAPI.put(`/news/admin/${id}`, formData);
export const deleteNews = (id) => PrivateAPI.delete(`/news/admin/${id}`);

// Scioperi e Traffico
export const fetchStrikesForAdmin = () => PrivateAPI.get('/strikes');
export const createStrike = (data) => PrivateAPI.post('/strikes/admin', data);
export const updateStrike = (id, data) => PrivateAPI.put(`/strikes/admin/${id}`, data);
export const deleteStrike = (id) => PrivateAPI.delete(`/strikes/admin/${id}`);
export const fetchTrafficAlertsForAdmin = () => PrivateAPI.get('/traffic');
export const createTrafficAlert = (data) => PrivateAPI.post('/traffic/admin', data);
export const updateTrafficAlert = (id, data) => PrivateAPI.put(`/traffic/admin/${id}`, data);
export const deleteTrafficAlert = (id) => PrivateAPI.delete(`/traffic/admin/${id}`);

// Regioni e Province
export const fetchProvincesForAdmin = (page = 1, limit = 25) => PrivateAPI.get('/provinces/admin', { params: { page, limit } });
export const updateProvince = (id, data) => PrivateAPI.put(`/provinces/admin/${id}`, data);
export const fetchRegionsForAdmin = () => PrivateAPI.get('/regions/admin');
export const updateRegion = (id, data) => PrivateAPI.put(`/regions/admin/${id}`, data);