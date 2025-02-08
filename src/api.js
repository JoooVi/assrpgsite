import axios from 'axios';

const api = axios.create({
  baseURL: 'https://assrpgsite.railway.internal/api', // Substitua pela URL do seu backend no Railway
});

export default api;