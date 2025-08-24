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
export const fetchItineraries = (params) => API.get('/itineraries', { params });
export const fetchItineraryById = (id) => API.get(`/itineraries/${id}`);
export const fetchDestinationsBySeason = (season) => API.get('/destinations', { params: { season } });
export const fetchDestinationById = (id) => API.get(`/destinations/${id}`);
export const fetchBonuses = (params) => API.get('/bonuses', { params });
export const fetchBonusById = (id) => API.get(`/bonuses/${id}`);
export const fetchUtilityInfo = () => API.get('/utility/all');
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);
export const fetchNews = (params) => API.get('/news', { params });
export const fetchNewsById = (id) => API.get(`/news/${id}`);
export const globalSearch = (query) => API.get('/search', { params: { q: query } });
export const geoSearch = (query) => API.get('/geo-search', { params: { q: query } });
export const fetchPoiById = (id) => API.get(`/pois/${id}`);
// Guide (Pubblico)
export const fetchAllGuides = () => API.get('/guides');
export const fetchAllCategoriesWithGuides = () => API.get('/categories');
export const fetchGuideBySlug = (slug) => API.get(`/guides/${slug}`);
export const fetchGuidesByCategory = (categorySlug) => API.get(`/guides/category/${categorySlug}`);
// Come Fare (Pubblico)
export const fetchHowToCategoriesWithArticles = () => API.get('/howto-articles');
export const fetchHowToArticlesByCategory = (categorySlug) => API.get(`/howto-articles/category/${categorySlug}`);
export const fetchHowToArticleBySlug = (slug) => API.get(`/howto-articles/${slug}`);

// --- API Private (Admin) ---

// Comuni & POI
export const fetchAllComuniForAdmin = (params) => PrivateAPI.get('/comuni/admin', { params });
export const fetchComuneByIdForAdmin = (id) => PrivateAPI.get(`/comuni/admin/${id}`);
export const createPoi = (formData) => PrivateAPI.post('/pois', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchPoiDetails = (id) => PrivateAPI.get(`/pois/${id}/details`);
export const updatePoi = (id, data) => PrivateAPI.put(`/pois/${id}`, data);
export const deletePoi = (id) => PrivateAPI.delete(`/pois/${id}`);
export const addImagesToPoi = (poiId, formData) => PrivateAPI.post(`/pois/${poiId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (imageId) => PrivateAPI.delete(`/pois/images/${imageId}`);
export const updateComune = (id, formData) => PrivateAPI.put(`/comuni/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteComuneImage = (imageId) => PrivateAPI.delete(`/comuni/admin/images/${imageId}`);
export const updateComuneImage = (imageId, data) => PrivateAPI.put(`/comuni/admin/images/${imageId}`, data);


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
export const fetchDestinationsForAdmin = (params) => PrivateAPI.get('/destinations/admin', { params });
export const createDestination = (formData) => PrivateAPI.post('/destinations/admin', formData);
export const updateDestination = (id, data) => PrivateAPI.put(`/destinations/admin/${id}`, data);
export const deleteDestination = (id) => PrivateAPI.delete(`/destinations/admin/${id}`);
export const addImagesToDestination = (id, formData) => PrivateAPI.post(`/destinations/admin/${id}/images`, formData);
export const deleteDestinationImage = (id) => PrivateAPI.delete(`/destinations/admin/images/${id}`);

// Itinerari
export const fetchItinerariesForAdmin = (params) => PrivateAPI.get('/itineraries/admin/list', { params });
export const createItinerary = (formData) => PrivateAPI.post('/itineraries/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateItinerary = (id, formData) => PrivateAPI.put(`/itineraries/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteItinerary = (id) => PrivateAPI.delete(`/itineraries/admin/${id}`);
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

// --- SEZIONE GUIDE E CATEGORIE ---
// Category (Admin)
export const fetchCategoriesForAdmin = () => PrivateAPI.get('/categories/admin');
export const createCategory = (data) => PrivateAPI.post('/categories/admin', data);
export const updateCategory = (id, data) => PrivateAPI.put(`/categories/admin/${id}`, data);
export const deleteCategory = (id) => PrivateAPI.delete(`/categories/admin/${id}`);

// Guide (Admin)
export const fetchGuidesByCategoryIdAdmin = (categoryId) => PrivateAPI.get('/guides/admin', { params: { categoryId } });
export const fetchGuideByIdAdmin = (id) => PrivateAPI.get(`/guides/admin/${id}`);
export const createGuide = (formData) => PrivateAPI.post('/guides/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateGuide = (id, formData) => PrivateAPI.put(`/guides/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteGuide = (id) => PrivateAPI.delete(`/guides/admin/${id}`);
export const addGuideImages = (guideId, formData) => PrivateAPI.post(`/guides/admin/${guideId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteGuideImage = (imageId) => PrivateAPI.delete(`/guides/admin/images/${imageId}`);

// Come Fare - Categorie (Admin)
export const fetchHowToCategoriesForAdmin = () => PrivateAPI.get('/howto-categories/admin');
export const createHowToCategory = (data) => PrivateAPI.post('/howto-categories/admin', data);
export const updateHowToCategory = (id, data) => PrivateAPI.put(`/howto-categories/admin/${id}`, data);
export const deleteHowToCategory = (id) => PrivateAPI.delete(`/howto-categories/admin/${id}`);

// Come Fare - Articoli (Admin)
export const fetchHowToArticlesByCategoryIdAdmin = (categoryId) => PrivateAPI.get('/howto-articles/admin', { params: { categoryId } });
export const fetchHowToArticleByIdAdmin = (id) => PrivateAPI.get(`/howto-articles/admin/${id}`);
export const createHowToArticle = (data) => PrivateAPI.post('/howto-articles/admin', data);
export const updateHowToArticle = (id, data) => PrivateAPI.put(`/howto-articles/admin/${id}`, data);
export const deleteHowToArticle = (id) => PrivateAPI.delete(`/howto-articles/admin/${id}`);
export const addHowToArticleImages = (articleId, formData) => PrivateAPI.post(`/howto-articles/admin/${articleId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteHowToArticleImage = (imageId) => PrivateAPI.delete(`/howto-articles/admin/images/${imageId}`);

export const uploadEditorImage = (formData) => PrivateAPI.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});