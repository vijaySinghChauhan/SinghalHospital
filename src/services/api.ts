import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '../config';

const api = axios.create({
  baseURL: Config.baseURL,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
