import axios from 'axios';

const api = axios.create({
  baseURL: 'https://assrpgsite.railway.iassrpgsite-be-production.up.railway.app/api', // Substitua pela URL do seu backend no Railway
});

export default api;