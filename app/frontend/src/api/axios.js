import axios from 'axios';

// Храним ссылку на getter токена (устанавливается из AuthProvider)
let getToken = () => null;

export const setTokenGetter = (fn) => {
  getToken = fn;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
});

// Добавляем JWT к каждому запросу
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обрабатываем ошибки ответа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized — токен устарел или отсутствует');
    }
    return Promise.reject(error);
  }
);

export default api;
