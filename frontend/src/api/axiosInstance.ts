import axios from 'axios';

/**
 * Global Axios Instance for API requests.
 * Pre-configured with the backend Base URL and default JSON headers.
 * 
 * Base URL: http://localhost:8080/api
 */
const api = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
